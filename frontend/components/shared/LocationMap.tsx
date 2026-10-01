type LocationMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  label?: string;
  className?: string;
};

export default function LocationMap({ latitude, longitude, label = "Ubicación", className = "" }: LocationMapProps) {
  if (latitude == null || longitude == null || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return <div className={`flex items-center justify-center rounded-xl border border-scentia-border bg-scentia-card/70 p-6 text-sm text-scentia-muted ${className}`}>Agrega las coordenadas para mostrar el mapa.</div>;
  }

  const delta = 0.008;
  const bbox = [longitude - delta, latitude - delta, longitude + delta, latitude + delta].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
  const link = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;

  return (
    <div className={`overflow-hidden rounded-xl border border-scentia-border bg-scentia-card ${className}`}>
      <iframe title={`Mapa: ${label}`} src={src} className="h-64 w-full border-0" loading="lazy" />
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-scentia-muted">
        <span>© OpenStreetMap contributors</span>
        <a className="text-scentia-gold hover:underline" href={link} target="_blank" rel="noreferrer">Abrir mapa</a>
      </div>
    </div>
  );
}
