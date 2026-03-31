"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Input, 
  Textarea,
  Divider,
  ScrollShadow,
  Tabs,
  Tab,
  Card,
  CardBody,
  Chip
} from "@heroui/react";
import { Plus, Trash2, MapPin, Navigation, Info, Truck, Search } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { StopSearch } from "./StopSearch";

interface Stop {
  name: string;
  landmark?: string;
  lat: number;
  lng: number;
}

interface RouteModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  route?: any; // If provided, we are editing
}

export function RouteModal({ isOpen, onOpenChange, route }: RouteModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedBusIds, setSelectedBusIds] = useState<string[]>([]);

  // Sub-queries
  const busesRes = useQuery(trpc.admin.listBuses.queryOptions(undefined, { enabled: isOpen }));
  const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
  const mapStyle = `https://maps.geoapify.com/v1/styles/dark-matter/style.json?apiKey=${geoapifyKey}`;

  // Mutations
  const createMutation = useMutation(trpc.admin.createRoute.mutationOptions({
    onSuccess: () => {
      toast.success("Strategic route deployed");
      queryClient.invalidateQueries({ queryKey: trpc.admin.getRoutes.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.admin.listBuses.queryKey() });
      onOpenChange();
    },
    onError: (err: any) => toast.error(err.message),
  }));

  const updateMutation = useMutation(trpc.admin.updateRoute.mutationOptions({
    onSuccess: () => {
      toast.success("Route intelligence updated");
      queryClient.invalidateQueries({ queryKey: trpc.admin.getRoutes.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.admin.listBuses.queryKey() });
      onOpenChange();
    },
    onError: (err: any) => toast.error(err.message),
  }));

  useEffect(() => {
    if (route) {
      setName(route.name || "");
      setDescription(route.description || "");
      setColor(route.color || "#6366f1");
      setStops(route.stops || []);
      setSelectedBusIds(route.buses?.map((b: any) => b.id) || []);
    } else {
      setName("");
      setDescription("");
      setColor("#6366f1");
      setStops([]);
      setSelectedBusIds([]);
    }
    setActiveTab("general");
  }, [route, isOpen]);

  const handleAddStopAtCoords = useCallback((lat: number, lng: number, stopName?: string) => {
    setStops(prev => [...prev, { 
      name: stopName || `Node ${prev.length + 1}`, 
      lat, 
      lng 
    }]);
    toast.info("Transit node dropped on map");
  }, []);

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleStopChange = (index: number, field: keyof Stop, value: string | number) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], [field]: value };
    setStops(newStops);
  };

  const toggleBusAssignment = (busId: string) => {
    setSelectedBusIds(prev => 
      prev.includes(busId) ? prev.filter(id => id !== busId) : [...prev, busId]
    );
  };

  const handleSubmit = async () => {
    if (!name) return toast.error("Route designation required");
    if (stops.length < 2) return toast.error("Deployment requires at least 2 nodes");

    const payload = { 
      name, 
      description, 
      color, 
      stops,
      busIds: selectedBusIds 
    };

    if (route?.id) {
      await updateMutation.mutateAsync({ id: route.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const buses = busesRes.data?.success ? (busesRes.data.data as any[]) : [];

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      size="5xl"
      scrollBehavior="inside"
      placement="center"
      classNames={{
        base: "bg-zinc-950 border border-zinc-900 shadow-2xl max-h-[90vh]",
        header: "border-b border-zinc-900",
        footer: "border-t border-zinc-900",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Navigation className="text-indigo-500" size={24} />
                <div>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter text-indigo-200">
                    {route ? "Reconfigure Route" : "Establish Strategic Route"}
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
                    Network Orchestration Interface v3.5
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="p-0">
              <Tabs 
                aria-label="Route options" 
                selectedKey={activeTab} 
                onSelectionChange={(k) => setActiveTab(k as string)}
                variant="underlined"
                classNames={{
                  tabList: "px-6 border-b border-zinc-900 w-full bg-zinc-950 sticky top-0 z-10",
                  cursor: "bg-indigo-500",
                  tabContent: "group-data-[selected=true]:text-indigo-400 font-bold uppercase text-[10px] tracking-widest",
                }}
              >
                <Tab key="general" title="General Specs" className="p-6">
                  <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2 space-y-6">
                      <div className="flex flex-col gap-1.5">
                        <Input
                          label="Route Designation"
                          labelPlacement="outside"
                          placeholder="e.g. ALPHA-1 CIRCULAR"
                          variant="bordered"
                          value={name}
                          onValueChange={setName}
                          classNames={{ 
                            inputWrapper: "border-zinc-800 bg-zinc-900/50 h-12",
                            label: "text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 !static !transform-none !mb-1"
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Textarea
                          label="Strategic Description"
                          labelPlacement="outside"
                          placeholder="Operational parameters and service goals..."
                          variant="bordered"
                          value={description}
                          onValueChange={setDescription}
                          minRows={4}
                          classNames={{ 
                            inputWrapper: "border-zinc-800 bg-zinc-900/50",
                            label: "text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 !static !transform-none !mb-1"
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex flex-col gap-1.5">
                        <Input
                          label="Identification Color"
                          labelPlacement="outside"
                          type="color"
                          variant="bordered"
                          value={color}
                          onValueChange={setColor}
                          classNames={{ 
                            inputWrapper: "border-zinc-800 bg-zinc-900/50 h-12 p-1",
                            label: "text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 pb-1"
                          }}
                        />
                      </div>
                      <Card className="bg-zinc-900/50 border border-zinc-800 shadow-none">
                        <CardBody className="p-4 space-y-3">
                          <div className="flex items-center gap-2 text-indigo-400">
                            <Info size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Network Status</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                            Setting a distinct color helps students distinguish between overlapping routes in high-density zones.
                          </p>
                        </CardBody>
                      </Card>
                    </div>
                  </div>
                </Tab>

                <Tab key="stations" title="Transit Nodes" className="p-0">
                  <div className="flex h-[550px]">
                    {/* Left: Input List */}
                    <div className="w-1/3 border-r border-zinc-900 flex flex-col">
                      <div className="p-4 border-b border-zinc-900 bg-zinc-950/50 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-[10px] font-black uppercase italic text-zinc-400 tracking-widest">Topology sequence</h3>
                          <Chip size="sm" variant="flat" color="primary" className="text-[9px] font-bold uppercase">{stops.length} Nodes</Chip>
                        </div>
                        <StopSearch 
                          onSelect={(res) => handleAddStopAtCoords(res.lat, res.lng, res.name)} 
                          placeholder="Add node by address..." 
                        />
                      </div>
                      <ScrollShadow className="flex-1 p-4 space-y-3">
                        {stops.map((stop, index) => (
                          <div key={index} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 group relative">
                            <div className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0 mt-1">
                                {index + 1}
                              </div>
                              <div className="flex-1 space-y-1">
                                <Input
                                  aria-label={`Designation for node ${index + 1}`}
                                  size="sm"
                                  variant="underlined"
                                  className="h-6"
                                  value={stop.name}
                                  onValueChange={(v) => handleStopChange(index, "name", v)}
                                  classNames={{ input: "text-[12px] font-bold h-6" }}
                                />
                                <div className="flex gap-2 text-[9px] font-mono text-zinc-600">
                                  <span>{stop.lat.toFixed(4)}</span>
                                  <span>{stop.lng.toFixed(4)}</span>
                                </div>
                              </div>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveStop(index)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </ScrollShadow>
                    </div>

                    {/* Right: Map */}
                    <div className="flex-1 bg-zinc-900 relative">
                      {geoapifyKey ? (
                        <Map
                          initialViewState={{
                            longitude: stops[0]?.lng || 90.4125,
                            latitude: stops[0]?.lat || 23.8103,
                            zoom: 13
                          }}
                          mapStyle={mapStyle}
                          onClick={(e) => handleAddStopAtCoords(e.lngLat.lat, e.lngLat.lng)}
                          style={{ width: "100%", height: "100%" }}
                        >
                          <NavigationControl position="top-right" />
                          {stops.map((stop, idx) => (
                            <Marker 
                              key={idx} 
                              latitude={stop.lat} 
                              longitude={stop.lng} 
                              anchor="bottom"
                            >
                              <div className="flex flex-col items-center">
                                <div className="bg-zinc-950 border border-indigo-500 px-2 py-0.5 rounded text-[9px] font-bold text-white mb-1 shadow-2xl">
                                  {idx + 1}. {stop.name}
                                </div>
                                <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.5)] border-2 border-white">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                </div>
                              </div>
                            </Marker>
                          ))}
                          <div className="absolute bottom-4 left-4 bg-zinc-950/80 backdrop-blur-md p-2 rounded-lg border border-zinc-800 text-[9px] font-bold text-zinc-400 uppercase tracking-widest grayscale opacity-50 pointer-events-none">
                            Click anywhere to drop transit node
                          </div>
                        </Map>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 uppercase text-[10px] font-bold tracking-widest text-center px-4">
                          Geoapify key not detected. Mapping nodes disabled.
                        </div>
                      )}
                    </div>
                  </div>
                </Tab>

                <Tab key="fleet" title="Fleet Assignment" className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-black uppercase italic text-zinc-400 tracking-widest">Active unit deployment</h3>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase italic tracking-tighter">Buses assigned to this route prioritize its schedule</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {buses.map((bus) => {
                        const isAssignedToThis = selectedBusIds.includes(bus.id);
                        const isAssignedElsewhere = bus.routeId && bus.routeId !== route?.id;
                        
                        return (
                          <div 
                            key={bus.id}
                            onClick={() => toggleBusAssignment(bus.id)}
                            className={`
                              p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group
                              ${isAssignedToThis 
                                ? "bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.1)]" 
                                : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"}
                            `}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`
                                w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                                ${isAssignedToThis ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700"}
                              `}>
                                <Truck size={20} />
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-zinc-100">{bus.plateNumber}</h4>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                                  {bus.driver?.user?.email || "No Driver Assigned"}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <Chip 
                                size="sm" 
                                variant="dot" 
                                className="text-[9px] uppercase font-bold"
                                color={isAssignedToThis ? "primary" : isAssignedElsewhere ? "warning" : "default"}
                              >
                                {isAssignedToThis ? "Deployed" : isAssignedElsewhere ? "Occupied" : "Standby"}
                              </Chip>
                              {isAssignedElsewhere && (
                                <span className="text-[8px] text-zinc-600 uppercase font-black italic">
                                  Moved from {bus.route?.name}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {buses.length === 0 && (
                        <div className="col-span-2 py-10 text-center border-2 border-dashed border-zinc-900 rounded-3xl">
                          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">No fleet units recognized in system</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} className="font-bold uppercase tracking-widest text-[10px]">
                Abort
              </Button>
              <Button 
                className="kinetic-gradient text-indigo-950 font-black uppercase tracking-widest text-[10px] px-10 h-11" 
                onPress={handleSubmit}
                isLoading={isLoading}
              >
                {route ? "Finalize Upgrade" : "Initialize Route"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
