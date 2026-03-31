"use client";

import React, { useState } from "react";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Input, 
  Select, 
  SelectItem 
} from "@heroui/react";
import { Bus, Hash, Users, Navigation } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { showErrorToast } from "@/utils/toast";

interface BusModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
}

export function BusModal({ isOpen, onOpenChange }: BusModalProps) {
  const queryClient = useQueryClient();
  const [plateNumber, setPlateNumber] = useState("");
  const [capacity, setCapacity] = useState("40");
  const [model, setModel] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  const routesRes = useQuery(trpc.admin.getRoutes.queryOptions({ includeBuses: false }, { enabled: isOpen }));
  const driversRes = useQuery(trpc.admin.listDrivers.queryOptions(undefined, { enabled: isOpen }));

  const createMutation = useMutation(trpc.admin.createBus.mutationOptions({
    onSuccess: () => {
      toast.success("Bus registered successfully");
      queryClient.invalidateQueries({ queryKey: trpc.admin.listBuses.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.admin.getSystemAnalytics.queryKey() });
      resetForm();
      onOpenChange();
    },
    onError: (err: any) => showErrorToast(err.message),
  }));

  const resetForm = () => {
    setPlateNumber("");
    setCapacity("40");
    setModel("");
    setSelectedRouteId("");
    setSelectedDriverId("");
  };

  const handleSubmit = async () => {
    if (!plateNumber) return showErrorToast("Parameter Violation", "Plate number is required for unit identification.");
    
    await createMutation.mutateAsync({
      plateNumber,
      capacity: parseInt(capacity),
      model,
      routeId: selectedRouteId || undefined,
      driverId: selectedDriverId || undefined,
    });
  };

  const routes = routesRes.data?.success ? (routesRes.data.data as any[]) : [];
  const drivers = driversRes.data?.success ? (driversRes.data.data as any[]) : [];

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange} 
      backdrop="blur" 
      size="xl" 
      placement="center"
    >
      <ModalContent className="bg-zinc-950 border border-zinc-900 shadow-2xl">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-indigo-200">Register New Vessel</h2>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Enter fleet unit specifications</p>
            </ModalHeader>
            <ModalBody className="py-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <Input
                    label="Plate Number"
                    placeholder="KCX 452G"
                    labelPlacement="outside"
                    variant="bordered"
                    value={plateNumber || ""}
                    onValueChange={setPlateNumber}
                    startContent={<Hash size={18} className="text-zinc-600" />}
                    classNames={{ 
                      inputWrapper: "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all",
                      label: "text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 !static !transform-none !mb-1"
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Input
                    label="Capacity"
                    type="number"
                    placeholder="40"
                    labelPlacement="outside"
                    variant="bordered"
                    value={capacity || ""}
                    onValueChange={setCapacity}
                    startContent={<Users size={18} className="text-zinc-600" />}
                    classNames={{ 
                      inputWrapper: "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all",
                      label: "text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 !static !transform-none !mb-1"
                    }}
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <Input
                  label="Bus Model"
                  placeholder="Isuzu FRR / Mercedes-Benz"
                  labelPlacement="outside"
                  variant="bordered"
                  value={model || ""}
                  onValueChange={setModel}
                  startContent={<Bus size={18} className="text-zinc-600" />}
                  classNames={{ 
                    inputWrapper: "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all",
                    label: "text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 pb-1"
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <Select
                    label="Assign Route"
                    placeholder="Select a route"
                    labelPlacement="outside"
                    variant="bordered"
                    selectedKeys={selectedRouteId ? [selectedRouteId] : []}
                    onSelectionChange={(keys) => setSelectedRouteId(Array.from(keys)[0] as string)}
                    startContent={<Navigation size={18} className="text-zinc-600" />}
                    classNames={{ 
                      trigger: "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all text-white",
                      label: "text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 !static !transform-none !mb-1"
                    }}
                    popoverProps={{
                      classNames: {
                        content: "bg-zinc-950 border border-zinc-800 shadow-2xl min-w-[200px]"
                      }
                    }}
                  >
                    {routes.map((route: any) => (
                      <SelectItem key={route.id} textValue={route.name}>
                        {route.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Select
                    label="Assign Driver"
                    placeholder="Select a driver"
                    labelPlacement="outside"
                    variant="bordered"
                    selectedKeys={selectedDriverId ? [selectedDriverId] : []}
                    onSelectionChange={(keys) => setSelectedDriverId(Array.from(keys)[0] as string)}
                    startContent={<Users size={18} className="text-zinc-600" />}
                    classNames={{ 
                      trigger: "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all text-white",
                      label: "text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 !static !transform-none !mb-1"
                    }}
                    popoverProps={{
                      classNames: {
                        content: "bg-zinc-950 border border-zinc-800 shadow-2xl min-w-[200px]"
                      }
                    }}
                  >
                    {drivers.map((driver: any) => (
                      <SelectItem key={driver.id} textValue={driver.user?.email || driver.driverId}>
                        {driver.user?.email || driver.driverId}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-zinc-900">
              <Button aria-label="Abort bus registration" variant="light" onPress={onClose} className="font-bold uppercase tracking-widest text-[10px]">
                Abort
              </Button>
              <Button 
                aria-label="Engage unit into fleet"
                className="kinetic-gradient text-indigo-950 font-black uppercase tracking-widest text-[10px] px-8" 
                onPress={handleSubmit}
                isLoading={createMutation.isPending}
              >
                Engage Unit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
