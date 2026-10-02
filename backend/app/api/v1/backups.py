import os
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from sqlalchemy.engine import make_url

from app.api.deps import get_current_admin
from app.config import settings
from app.models.user import User

router = APIRouter()


def remove_backup(path: str) -> None:
    try:
        os.unlink(path)
    except FileNotFoundError:
        pass


@router.get("/database")
def download_database_backup(_: User = Depends(get_current_admin)):
    database_url = make_url(settings.DATABASE_URL)
    if database_url.get_backend_name() != "postgresql":
        raise HTTPException(status_code=501, detail="El respaldo solo está configurado para PostgreSQL")

    backup_path = ""
    try:
        with tempfile.NamedTemporaryFile(prefix="scentia-db-", suffix=".dump", delete=False) as backup_file:
            backup_path = backup_file.name
            command = [
                "pg_dump",
                "--no-password",
                "--format=custom",
                "--no-owner",
                "--no-acl",
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
            result = subprocess.run(
                command,
                stdout=backup_file,
                stderr=subprocess.PIPE,
                env=env,
                timeout=300,
                check=False,
            )
        if result.returncode != 0:
            raise RuntimeError("pg_dump terminó con error")
    except subprocess.TimeoutExpired as exc:
        if backup_path:
            remove_backup(backup_path)
        raise HTTPException(status_code=504, detail="El respaldo excedió el tiempo permitido") from exc
    except (OSError, RuntimeError) as exc:
        if backup_path:
            remove_backup(backup_path)
        raise HTTPException(status_code=500, detail="No se pudo generar el respaldo de la base de datos") from exc

    filename = f"scentia-backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}.dump"
    return FileResponse(
        path=Path(backup_path),
        media_type="application/octet-stream",
        filename=filename,
        background=BackgroundTask(remove_backup, backup_path),
    )
