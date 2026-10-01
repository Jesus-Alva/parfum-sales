"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";

type Coordinates = { latitude: number; longitude: number };
type Props = {
  latitude?: number | null;
  longitude?: number | null;
  initialCenter?: Coordinates;
  label?: string;
  onChange?: (latitude: number, longitude: number) => void;
  className?: string;
};

const DEFAULT_CENTER = { latitude: 19.4326, longitude: -99.1332 };

export default function InteractiveMap({ latitude, longitude, initialCenter = DEFAULT_CENTER, label = "Ubicación seleccionada", onChange, className = "" }: Props) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const hasPosition = latitude != null && longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude);
  const positionRef = useRef({ latitude, longitude, initialCenter, hasPosition, label });

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  positionRef.current = { latitude, longitude, initialCenter, hasPosition, label };

  useEffect(() => {
    let cancelled = false;
    let removeHandlers: (() => void) | undefined;

    import("leaflet").then((leaflet) => {
      if (cancelled || !elementRef.current) return;
      const current = positionRef.current;
      const center: [number, number] = current.hasPosition ? [current.latitude!, current.longitude!] : [current.initialCenter.latitude, current.initialCenter.longitude];
      const map = leaflet.map(elementRef.current, { zoomControl: true, attributionControl: true }).setView(center, current.hasPosition ? 16 : 13);
      leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
      }).addTo(map);

      const icon = leaflet.divIcon({
        className: "scentia-map-marker",
        html: '<span aria-hidden="true"></span>',
        iconSize: [28, 38],
        iconAnchor: [14, 36],
      });
      const marker = leaflet.marker(center, { draggable: Boolean(onChangeRef.current), icon, title: current.label, alt: current.label }).addTo(map);
      const emitMarker = () => {
        const point = marker.getLatLng();
        onChangeRef.current?.(point.lat, point.lng);
      };
      const setMarker = (event: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng(event.latlng);
        onChangeRef.current?.(event.latlng.lat, event.latlng.lng);
      };
      marker.on("dragend", emitMarker);
      map.on("click", setMarker);
      mapRef.current = map;
      markerRef.current = marker;
      removeHandlers = () => { marker.off("dragend", emitMarker); map.off("click", setMarker); };

      requestAnimationFrame(() => map.invalidateSize());
    });

    return () => {
      cancelled = true;
      removeHandlers?.();
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  // The map instance is initialized once; later coordinate changes are handled below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const point: [number, number] = hasPosition ? [latitude!, longitude!] : [initialCenter.latitude, initialCenter.longitude];
    markerRef.current.setLatLng(point);
    mapRef.current.setView(point, hasPosition ? 16 : 13, { animate: true });
  }, [latitude, longitude, initialCenter.latitude, initialCenter.longitude, hasPosition]);

  return (
    <div className={`overflow-hidden rounded-xl border border-scentia-border bg-scentia-card ${className}`}>
      <div ref={elementRef} role="application" aria-label={`${label}. Arrastra el pin o toca el mapa para ajustar la ubicación.`} className="h-64 w-full" />
      <p className="border-t border-scentia-border px-3 py-2 text-xs text-scentia-muted">Arrastra el pin o toca el mapa para ajustar la ubicación · © OpenStreetMap contributors</p>
    </div>
  );
}
