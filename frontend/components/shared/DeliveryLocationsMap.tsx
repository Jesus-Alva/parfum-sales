"use client";

import { useEffect, useRef } from "react";
import type { CircleMarker, LayerGroup, Map as LeafletMap } from "leaflet";

type DeliveryLocation = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

type Props = {
  locations: DeliveryLocation[];
  selectedLocationId: string;
  initialCenter: { latitude: number; longitude: number };
  onSelect: (locationId: string) => void;
};

export default function DeliveryLocationsMap({ locations, selectedLocationId, initialCenter, onSelect }: Props) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  const locationsRef = useRef(locations);
  const selectedIdRef = useRef(selectedLocationId);

  onSelectRef.current = onSelect;
  locationsRef.current = locations;
  selectedIdRef.current = selectedLocationId;

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((leaflet) => {
      if (cancelled || !elementRef.current) return;
      const map = leaflet.map(elementRef.current, { zoomControl: true }).setView([initialCenter.latitude, initialCenter.longitude], 12);
      leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
      }).addTo(map);
      mapRef.current = map;
      markersRef.current = leaflet.layerGroup().addTo(map);
      requestAnimationFrame(() => map.invalidateSize());
      renderMarkers(leaflet, map, markersRef.current);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      if (mapRef.current && markersRef.current) renderMarkers(leaflet, mapRef.current, markersRef.current);
    });
  }, [locations, selectedLocationId]);

  function renderMarkers(leaflet: typeof import("leaflet"), map: LeafletMap, layer: LayerGroup) {
    layer.clearLayers();
    const points: [number, number][] = [];
    locationsRef.current.forEach((location) => {
      const point: [number, number] = [location.latitude, location.longitude];
      points.push(point);
      const selected = String(location.id) === selectedIdRef.current;
      const marker: CircleMarker = leaflet.circleMarker(point, {
        radius: selected ? 10 : 8,
        color: "#171717",
        weight: 2,
        fillColor: selected ? "#d4af37" : "#f8f5eb",
        fillOpacity: 1,
      }).addTo(layer);
      const label = document.createElement("span");
      label.textContent = `${location.name} · ${location.address}`;
      marker.bindTooltip(label, { direction: "top", offset: [0, -8] });
      marker.on("click", () => onSelectRef.current(String(location.id)));
    });

    if (selectedLocationId) {
      const selected = locationsRef.current.find((location) => String(location.id) === selectedLocationId);
      if (selected) map.setView([selected.latitude, selected.longitude], 15, { animate: true });
    } else if (points.length > 1) {
      map.fitBounds(leaflet.latLngBounds(points), { padding: [24, 24], maxZoom: 14 });
    } else if (points.length === 1) {
      map.setView(points[0], 14);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-scentia-border bg-scentia-card">
      <div ref={elementRef} role="application" aria-label="Puntos de entrega disponibles. Selecciona un marcador para elegirlo." className="h-64 w-full" />
      <p className="border-t border-scentia-border px-3 py-2 text-xs text-scentia-muted">Selecciona un marcador para elegir tu punto de entrega · © OpenStreetMap contributors</p>
    </div>
  );
}
