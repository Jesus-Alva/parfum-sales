"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { api } from "@/lib/api";
import { getToken, updateCachedFullName } from "@/lib/auth";

type Address = {
  street: string;
  number: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  references: string;
  latitude: number | null;
  longitude: number | null;
};

const emptyAddress: Address = { street: "", number: "", city: "", state: "", postal_code: "", country: "México", references: "", latitude: null, longitude: null };
const inputClass = "mt-1 w-full rounded-lg border border-scentia-border bg-scentia-card px-3 py-2.5 text-sm text-scentia-text focus:border-scentia-gold focus:outline-none";

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ full_name: "", phone: "", address: emptyAddress });
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api.get("/users/me")
      .then(({ data }) => {
        setEmail(data.email);
        setHasSavedAddress(Boolean(data.address));
        setForm({ full_name: data.full_name || "", phone: data.phone || "", address: { ...emptyAddress, ...(data.address || {}), latitude: data.address?.latitude ?? null, longitude: data.address?.longitude ?? null } });
      })
      .catch(() => setError("No pudimos cargar tus datos. Vuelve a iniciar sesión e inténtalo de nuevo."))
      .finally(() => setLoading(false));
  }, [router]);

  const updateAddress = (key: keyof Address, value: string) => setForm((current) => ({ ...current, address: { ...current.address, [key]: value } }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    const addressStarted = Boolean(form.address.street.trim() || form.address.city.trim() || form.address.number.trim() || form.address.postal_code.trim());
    if (addressStarted && (!form.address.street.trim() || !form.address.city.trim())) {
      setError("Para guardar la dirección, completa al menos la calle y el municipio.");
      return;
    }

    const payload: { full_name: string; phone: string | null; address?: Address | null } = {
      full_name: form.full_name,
      phone: form.phone.trim() || null,
      ...(addressStarted ? { address: form.address } : hasSavedAddress ? { address: null } : {}),
    };

    setSaving(true);
    try {
      const { data } = await api.patch("/users/me", payload);
      setForm((current) => ({ ...current, full_name: data.full_name, phone: data.phone || "", address: { ...emptyAddress, ...(data.address || {}) } }));
      setHasSavedAddress(Boolean(data.address));
      updateCachedFullName(data.full_name);
      setNotice("Tus datos se guardaron correctamente.");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "No se pudieron guardar tus datos.");
    } finally {
      setSaving(false);
    }
  };

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(""); setPasswordNotice("");
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setSavingPassword(true);
    try {
      await api.put("/users/me/password", { current_password: passwordForm.current_password, new_password: passwordForm.new_password });
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      setPasswordNotice("Tu contraseña se actualizó correctamente.");
    } catch (e: any) {
      setPasswordError(e?.response?.data?.detail || "No se pudo actualizar la contraseña.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <main className="mx-auto min-h-[65vh] max-w-3xl px-6 py-10 md:py-14">
      <div className="mb-8 flex items-center gap-3">
        <UserRound className="text-scentia-gold" size={28} />
        <div><p className="text-xs uppercase tracking-[0.25em] text-scentia-muted">Tu cuenta</p><h1 className="font-display text-3xl text-gradient-gold">Mi perfil</h1></div>
      </div>

      {loading ? <p className="text-scentia-muted">Cargando tus datos…</p> : <form onSubmit={submit} className="glass space-y-6 rounded-2xl p-5 md:p-7">
        {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        {notice && <p role="status" className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-3 text-sm text-emerald-200">{notice}</p>}

        <section className="space-y-4">
          <div><h2 className="font-display text-xl text-scentia-gold">Datos personales</h2><p className="mt-1 text-xs text-scentia-muted">Mantén tus datos al día para agilizar tus pedidos.</p></div>
          <label className="block text-sm text-scentia-muted">Nombre completo<input className={inputClass} autoComplete="name" maxLength={255} required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-scentia-muted">Correo de la cuenta<input className={`${inputClass} opacity-70`} type="email" value={email} readOnly aria-describedby="email-help" /><span id="email-help" className="mt-1 block text-xs">Se usa para iniciar sesión y recuperar tu contraseña.</span></label>
            <label className="block text-sm text-scentia-muted">Teléfono<input className={inputClass} type="tel" autoComplete="tel" maxLength={30} placeholder="+52 55 1234 5678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          </div>
        </section>

        <section className="space-y-4 border-t border-scentia-border pt-5">
          <div><h2 className="font-display text-xl text-scentia-gold">Dirección guardada</h2><p className="mt-1 text-xs text-scentia-muted">Se usará para completar tus próximos pedidos. Puedes dejarla vacía si aún no quieres guardarla.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-scentia-muted sm:col-span-2">Calle<input className={inputClass} autoComplete="address-line1" maxLength={255} value={form.address.street} onChange={(e) => updateAddress("street", e.target.value)} /></label>
            <label className="block text-sm text-scentia-muted">Número<input className={inputClass} autoComplete="address-line2" maxLength={50} value={form.address.number} onChange={(e) => updateAddress("number", e.target.value)} /></label>
            <label className="block text-sm text-scentia-muted">Código postal<input className={inputClass} autoComplete="postal-code" maxLength={20} value={form.address.postal_code} onChange={(e) => updateAddress("postal_code", e.target.value)} /></label>
            <label className="block text-sm text-scentia-muted">Municipio<input className={inputClass} autoComplete="address-level2" maxLength={150} value={form.address.city} onChange={(e) => updateAddress("city", e.target.value)} /></label>
            <label className="block text-sm text-scentia-muted">Estado<input className={inputClass} autoComplete="address-level1" maxLength={150} value={form.address.state} onChange={(e) => updateAddress("state", e.target.value)} /></label>
            <label className="block text-sm text-scentia-muted">País<input className={inputClass} autoComplete="country-name" maxLength={100} value={form.address.country} onChange={(e) => updateAddress("country", e.target.value)} /></label>
            <label className="block text-sm text-scentia-muted sm:col-span-2">Referencias<textarea className={inputClass} rows={3} maxLength={500} placeholder="Colonia, entre calles, indicaciones para la entrega" value={form.address.references} onChange={(e) => updateAddress("references", e.target.value)} /></label>
          </div>
        </section>

        <button disabled={saving} className="w-full rounded-lg bg-gradient-to-r from-scentia-gold to-scentia-gold-soft px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50">{saving ? "Guardando…" : "Guardar cambios"}</button>
      </form>}

      {!loading && <form onSubmit={submitPassword} className="glass mt-5 space-y-4 rounded-2xl p-5 md:p-7">
        <div><h2 className="font-display text-xl text-scentia-gold">Cambiar contraseña</h2><p className="mt-1 text-xs text-scentia-muted">Confirma tu contraseña actual para proteger tu cuenta.</p></div>
        {passwordError && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{passwordError}</p>}
        {passwordNotice && <p role="status" className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-3 text-sm text-emerald-200">{passwordNotice}</p>}
        <label className="block text-sm text-scentia-muted">Contraseña actual<input className={inputClass} type="password" autoComplete="current-password" required value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm text-scentia-muted">Nueva contraseña<input className={inputClass} type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} /></label><label className="block text-sm text-scentia-muted">Confirmar contraseña<input className={inputClass} type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} /></label></div>
        <button disabled={savingPassword} className="rounded-lg border border-scentia-gold/40 px-5 py-2.5 text-sm font-semibold text-scentia-gold transition hover:bg-scentia-gold/10 disabled:opacity-50">{savingPassword ? "Actualizando…" : "Actualizar contraseña"}</button>
      </form>}
    </main>
  );
}
