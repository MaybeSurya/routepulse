"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input, Listbox, ListboxItem, ScrollShadow, Spinner } from "@heroui/react";
import { Search, MapPin } from "lucide-react";

interface StopSearchProps {
  onSelect: (result: { name: string; lat: number; lng: number }) => void;
  placeholder?: string;
}

export function StopSearch({ onSelect, placeholder = "Search for a location..." }: StopSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 3 || !geoapifyKey) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // Geoapify Search API with proximity bias to DBUU (77.9330, 30.3837)
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
            query
          )}&apiKey=${geoapifyKey}&limit=5&bias=proximity:77.9330,30.3837`
        );
        const data = await res.json();
        setResults(data.features || []);
        setIsOpen(true);
      } catch (err) {
        console.error("Geocoding error:", err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, geoapifyKey]);

  const handleSelect = (feature: any) => {
    const [lng, lat] = feature.geometry.coordinates;
    const name = feature.properties.name || feature.properties.formatted.split(",")[0];
    
    onSelect({
      name,
      lat,
      lng,
    });
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        aria-label="Location search"
        placeholder={placeholder}
        value={query}
        onValueChange={setQuery}
        variant="bordered"
        startContent={loading ? <Spinner size="sm" color="current" /> : <Search size={18} className="text-zinc-500" />}
        classNames={{
          inputWrapper: "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all h-12",
        }}
      />

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ScrollShadow className="max-h-[250px]">
            <Listbox aria-label="Search results" variant="flat" className="p-2">
              {results.map((r, idx) => {
                const mainText = r.properties.name || r.properties.formatted.split(",")[0];
                const subText = r.properties.formatted;
                
                return (
                  <ListboxItem
                    key={r.properties.place_id || idx}
                    textValue={subText}
                    onClick={() => handleSelect(r)}
                    startContent={<MapPin size={16} className="text-indigo-500" />}
                    className="py-3 px-3 hover:bg-zinc-900 rounded-xl transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-100">{mainText}</span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-tighter line-clamp-1">{subText}</span>
                    </div>
                  </ListboxItem>
                );
              })}
            </Listbox>
          </ScrollShadow>
        </div>
      )}
    </div>
  );
}
