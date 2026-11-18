"use client";

import { FormEvent, useEffect, useState } from "react";
import { KeyRound, Search, Shield, Users } from "lucide-react";
import { api } from "@/lib/api";

type User = {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Record<number, boolean>>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [password, setPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const loadUsers = async () => {
    const response = await api.get<User[]>("/users/");
    setUsers(response.data);
    setRoles(Object.fromEntries(response.data.map((user) => [user.id, user.is_admin])));
  };

  useEffect(() => {
    loadUsers().catch((err) => setError(err?.response?.data?.detail || "No se pudieron cargar los usuarios."))
      .finally(() => setLoading(false));
  }, []);

  const saveRole = async (user: User) => {
    setError("");
    setNotice("");
    try {
      await api.patch(`/users/${user.id}/role`, { is_admin: roles[user.id] });
      await loadUsers();
      setNotice(`Rol actualizado para ${user.full_name}.`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "No se pudo actualizar el rol.");
      setRoles((current) => ({ ...current, [user.id]: user.is_admin }));
    }
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordUser) return;
    setSavingPassword(true);
    setError("");
    setNotice("");
    try {
      await api.put(`/users/${passwordUser.id}/password`, { password });
      setNotice(`Contraseña actualizada para ${passwordUser.full_name}.`);
      setPasswordUser(null);
      setPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "No se pudo cambiar la contraseña.");
    } finally {
      setSavingPassword(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.full_name} ${user.email}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  );
  const inputClass = "rounded-lg border border-scentia-border bg-scentia-bg px-3 py-2 text-sm focus:border-scentia-gold focus:outline-none";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-gradient-gold">Usuarios</h1>
        <p className="mt-1 text-sm text-scentia-muted">Consulta las cuentas registradas, administra sus roles y establece una contraseña nueva.</p>
      </header>

      {error && <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
      {notice && <div role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</div>}

      <section className="glass overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-4 border-b border-scentia-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-scentia-gold" size={21} />
            <h2 className="font-display text-xl">Cuentas registradas <span className="text-sm text-scentia-muted">({users.length})</span></h2>
          </div>
          <label className="relative block sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-scentia-muted" />
            <input aria-label="Buscar usuarios" className={`${inputClass} w-full pl-9`} placeholder="Buscar por nombre o correo" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
        </div>

        {loading ? <p className="p-5 text-sm text-scentia-muted">Cargando usuarios…</p> : filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-sm text-scentia-muted">{users.length ? "No hay usuarios que coincidan con la búsqueda." : "Aún no hay usuarios registrados."}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-scentia-border text-xs uppercase tracking-wide text-scentia-muted">
                <tr><th className="px-5 py-3 font-medium">Usuario</th><th className="px-5 py-3 font-medium">Registro</th><th className="px-5 py-3 font-medium">Estado</th><th className="px-5 py-3 font-medium">Rol</th><th className="px-5 py-3 text-right font-medium">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-scentia-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-4"><div className="font-medium">{user.full_name}</div><div className="mt-1 text-xs text-scentia-muted">{user.email}</div></td>
                    <td className="px-5 py-4 text-scentia-muted">{new Date(user.created_at).toLocaleDateString("es-MX")}</td>
                    <td className="px-5 py-4"><span className={user.is_active ? "text-emerald-300" : "text-red-300"}>{user.is_active ? "Activo" : "Inactivo"}</span></td>
                    <td className="px-5 py-4">
                      <label className="sr-only" htmlFor={`role-${user.id}`}>Rol de {user.full_name}</label>
                      <select id={`role-${user.id}`} className={inputClass} value={roles[user.id] ? "admin" : "customer"} onChange={(event) => setRoles((current) => ({ ...current, [user.id]: event.target.value === "admin" }))}>
                        <option value="customer">Cliente</option><option value="admin">Administrador</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {roles[user.id] !== user.is_admin && <button type="button" onClick={() => saveRole(user)} className="rounded-lg bg-scentia-gold px-3 py-2 text-xs font-semibold text-black">Guardar rol</button>}
                        <button type="button" onClick={() => { setPasswordUser(user); setPassword(""); }} className="inline-flex items-center gap-1.5 rounded-lg border border-scentia-border px-3 py-2 text-xs hover:border-scentia-gold/50 hover:text-scentia-gold"><KeyRound size={14} />Contraseña</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !savingPassword) setPasswordUser(null); }}>
          <form onSubmit={changePassword} className="glass w-full max-w-md space-y-4 rounded-2xl border border-scentia-border p-6" role="dialog" aria-modal="true" aria-labelledby="password-title">
            <div className="flex items-start gap-3"><Shield className="mt-1 text-scentia-gold" size={20} /><div><h2 id="password-title" className="font-display text-xl">Cambiar contraseña</h2><p className="mt-1 text-sm text-scentia-muted">Para {passwordUser.full_name} ({passwordUser.email})</p></div></div>
            <div><label htmlFor="new-user-password" className="mb-1 block text-sm">Nueva contraseña</label><input id="new-user-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required className={`${inputClass} w-full`} value={password} onChange={(event) => setPassword(event.target.value)} /><p className="mt-1 text-xs text-scentia-muted">Usa al menos 8 caracteres.</p></div>
            <div className="flex justify-end gap-2"><button type="button" disabled={savingPassword} onClick={() => setPasswordUser(null)} className="rounded-lg border border-scentia-border px-4 py-2 text-sm">Cancelar</button><button disabled={savingPassword} className="rounded-lg bg-gradient-to-r from-scentia-gold to-scentia-gold-soft px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">{savingPassword ? "Guardando…" : "Actualizar contraseña"}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
