"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Bus, MapPin, Navigation } from "lucide-react";

interface MapProps {
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number]; // [lat, lng]
    label: string;
    type: "bus" | "stop";
    isNext?: boolean; // Highlight as next destination
  }>;
  route?: Array<[number, number]>;
  polyline?: string; // stringified [lng, lat] JSON
  onMapClick?: (lat: number, lng: number) => void;
  pickerMode?: boolean;
  followMode?: boolean; // Auto-pan to first bus marker
}

export default function MapComponent({
  center = [30.3837, 77.9330],
  zoom = 13,
  markers = [],
  route = [],
  polyline,
  onMapClick,
  pickerMode = false,
  followMode = false,
}: MapProps) {
  const [viewState, setViewState] = useState({
    longitude: center[1],
    latitude: center[0],
    zoom: zoom,
  });

  // When followMode is on, track the bus marker
  useEffect(() => {
    if (followMode) {
      const busMarker = markers.find(m => m.type === "bus");
      if (busMarker) {
        setViewState(vs => ({
          ...vs,
          longitude: busMarker.position[1],
          latitude: busMarker.position[0],
        }));
      }
    }
  }, [markers, followMode]);

  const handleClick = useCallback((evt: any) => {
    if (onMapClick && evt.lngLat) {
      onMapClick(evt.lngLat.lat, evt.lngLat.lng);
    }
  }, [onMapClick]);

  const geojsonRoute = useMemo(() => {
    let coords: [number, number][] = [];
    if (polyline) {
      try { coords = JSON.parse(polyline); } catch {}
    } else if (route?.length > 0) {
      coords = route.map(c => [c[1], c[0]]);
    }
    if (!coords.length) return null;
    return {
      type: "Feature" as const,
      properties: {},
      geometry: { type: "LineString" as const, coordinates: coords },
    };
  }, [route, polyline]);

  const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

  if (!geoapifyKey) {
    return (
      <div className="w-full h-full bg-slate-900 rounded-3xl flex items-center justify-center border border-white/10 text-white/50 text-sm">
        Geoapify API Key not configured.
      </div>
    );
  }

  const mapStyle = `https://maps.geoapify.com/v1/styles/dark-matter/style.json?apiKey=${geoapifyKey}`;

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-inner border border-white/10 relative">
      <Map
        {...viewState}
        onMove={(evt: any) => setViewState(evt.viewState)}
        onClick={handleClick}
        mapStyle={mapStyle}
        attributionControl={false}
        cursor={pickerMode ? "crosshair" : "grab"}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Route trail */}
        {geojsonRoute && (
          <Source id="route-source" type="geojson" data={geojsonRoute}>
            <Layer
              id="route-layer"
              type="line"
              paint={{
                "line-color": "#8083ff",
                "line-width": 4,
                "line-opacity": 0.8,
                "line-dasharray": [2, 0],
              }}
              layout={{ "line-join": "round", "line-cap": "round" }}
            />
          </Source>
        )}

        {/* Markers */}
        {markers.map((m) => (
          <Marker key={m.id} longitude={m.position[1]} latitude={m.position[0]}>
            {m.type === "bus" ? (
              <div className="relative group cursor-pointer flex flex-col items-center">
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap pointer-events-none">
                  {m.label}
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping" />
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(128,131,255,0.6)] border-2 border-background relative z-10">
                    <Bus size={18} fill="currentColor" />
                  </div>
                </div>
              </div>
            ) : m.isNext ? (
              // Next stop — pulsing accent
              <div className="relative group cursor-pointer flex flex-col items-center">
                <div className="absolute -top-8 bg-indigo-950/90 backdrop-blur-md text-indigo-300 text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-indigo-500/30">
                  {m.label}
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/50 rounded-full animate-ping" />
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.7)] border-2 border-background relative z-10">
                    <Navigation size={14} className="text-white" fill="currentColor" />
                  </div>
                </div>
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-1 bg-black/60 px-1 rounded">NEXT</span>
              </div>
            ) : (
              // Regular stop
              <div className="relative group cursor-pointer flex flex-col items-center">
                <div className="absolute -top-8 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {m.label}
                </div>
                <div className="w-5 h-5 bg-zinc-700 rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                </div>
              </div>
            )}
          </Marker>
        ))}
      </Map>
    </div>
  );
}
