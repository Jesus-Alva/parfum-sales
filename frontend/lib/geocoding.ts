type Coordinates = { latitude: number; longitude: number };

let nextPhotonRequestAt = 0;

function abortableDelay(delayMs: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Request aborted", "AbortError"));
    const timer = setTimeout(resolve, delayMs);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Request aborted", "AbortError"));
    }, { once: true });
  });
}

export async function geocodeWithPhoton(query: string, focus?: Coordinates, signal?: AbortSignal): Promise<Coordinates | null> {
  const startsAt = Math.max(Date.now(), nextPhotonRequestAt);
  nextPhotonRequestAt = startsAt + 1100;
  const waitMs = startsAt - Date.now();
  if (waitMs > 0) await abortableDelay(waitMs, signal);
  if (signal?.aborted) throw new DOMException("Request aborted", "AbortError");

  const params = new URLSearchParams({ q: query, limit: "1", lang: "es" });
  if (focus) {
    params.set("lat", String(focus.latitude));
    params.set("lon", String(focus.longitude));
    params.set("zoom", "12");
  }
  const response = await fetch(`https://photon.komoot.io/api/?${params}`, { signal, headers: { "Accept-Language": "es" } });
  if (!response.ok) throw new Error("No se pudo encontrar la dirección en el mapa");
  const result = await response.json();
  const coordinates = result.features?.[0]?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  return { latitude: Number(coordinates[1]), longitude: Number(coordinates[0]) };
}
