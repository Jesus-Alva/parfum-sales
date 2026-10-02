import os
import re
import subprocess
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.config import settings
from app.database import get_db
from app.models.user import User

router = APIRouter()
BACKUP_DIR = Path(os.getenv("BACKUP_DIR", str(Path(__file__).resolve().parents[4] / "backups")))
BACKUP_NAME_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*\.dump$")


class RestoreResult(BaseModel):
    message: str


def database_connection_args() -> tuple[list[str], dict[str, str]]:
    database_url = make_url(settings.DATABASE_URL)
    if database_url.get_backend_name() != "postgresql":
        raise HTTPException(status_code=501, detail="El respaldo solo está configurado para PostgreSQL")
    command = [
        "--no-password",
        "--host", database_url.host or "localhost",
        "--port", str(database_url.port or 5432),
        "--username", database_url.username or "",
        "--dbname", database_url.database or "",
    ]
    env = os.environ.copy()
    if database_url.password:
        env["PGPASSWORD"] = database_url.password
    sslmode = database_url.query.get("sslmode")
    if sslmode:
        env["PGSSLMODE"] = str(sslmode)
    return command, env


def create_backup(name_prefix: str = "scentia-backup") -> Path:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    destination = BACKUP_DIR / f"{name_prefix}-{timestamp}.dump"
    partial = BACKUP_DIR / f".{destination.name}.{uuid.uuid4().hex}.partial"
    connection_args, env = database_connection_args()
    try:
        with partial.open("wb") as output:
            result = subprocess.run(
                ["pg_dump", *connection_args, "--format=custom", "--no-owner", "--no-acl"],
                stdout=output,
                stderr=subprocess.PIPE,
                env=env,
                timeout=300,
                check=False,
            )
        if result.returncode != 0:
            raise RuntimeError("pg_dump terminó con error")
        partial.replace(destination)
        return destination
    except (OSError, RuntimeError, subprocess.TimeoutExpired) as exc:
        partial.unlink(missing_ok=True)
        raise exc


def backup_file(filename: str) -> Path:
    if not BACKUP_NAME_PATTERN.fullmatch(filename):
        raise HTTPException(status_code=400, detail="Nombre de respaldo no válido")
    path = BACKUP_DIR / filename
    if not path.is_file() or path.is_symlink() or path.resolve().parent != BACKUP_DIR.resolve():
        raise HTTPException(status_code=404, detail="No se encontró el respaldo solicitado")
    return path


@router.get("")
def list_database_backups(_: User = Depends(get_current_admin)):
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    backups = [
        {
            "filename": path.name,
            "size": path.stat().st_size,
            "created_at": datetime.fromtimestamp(path.stat().st_mtime).isoformat(),
            "is_safety_backup": "safety" in path.name,
        }
        for path in BACKUP_DIR.glob("*.dump")
        if path.is_file() and not path.is_symlink() and BACKUP_NAME_PATTERN.fullmatch(path.name)
    ]
    backups.sort(key=lambda item: item["created_at"], reverse=True)
    return backups


@router.get("/database")
def download_database_backup(_: User = Depends(get_current_admin)):
    try:
        path = create_backup()
    except subprocess.TimeoutExpired as exc:
        raise HTTPException(status_code=504, detail="El respaldo excedió el tiempo permitido") from exc
    except (OSError, RuntimeError) as exc:
        raise HTTPException(status_code=500, detail="No se pudo generar el respaldo de la base de datos") from exc
    return FileResponse(
        path=path,
        media_type="application/octet-stream",
        filename=path.name,
    )


@router.get("/files/{filename}")
def export_database_backup(filename: str, _: User = Depends(get_current_admin)):
    path = backup_file(filename)
    return FileResponse(path=path, media_type="application/octet-stream", filename=path.name)


@router.delete("/files/{filename}")
def delete_database_backup(filename: str, _: User = Depends(get_current_admin)):
    path = backup_file(filename)
    path.unlink()
    return {"message": "Respaldo eliminado", "filename": filename}


@router.post("/restore/{filename}", response_model=RestoreResult)
def restore_database_backup(
    filename: str,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    source = backup_file(filename)
    # Release the request's read connection so PostgreSQL can replace objects safely.
    db.close()
    try:
        connection_args, env = database_connection_args()
        result = subprocess.run(
            [
                "pg_restore",
                *connection_args,
                "--clean",
                "--if-exists",
                "--single-transaction",
                "--exit-on-error",
                "--no-owner",
                "--no-acl",
                str(source),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            env=env,
            timeout=600,
            check=False,
        )
        if result.returncode != 0:
            raise RuntimeError("pg_restore terminó con error")
    except subprocess.TimeoutExpired as exc:
        raise HTTPException(
            status_code=504,
            detail="La restauración excedió el tiempo permitido.",
        ) from exc
    except (OSError, RuntimeError) as exc:
        raise HTTPException(
            status_code=500,
            detail="Falló la restauración.",
        ) from exc

    return RestoreResult(message="Base de datos restaurada correctamente")
