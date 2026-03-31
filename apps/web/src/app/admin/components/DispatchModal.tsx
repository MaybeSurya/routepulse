"use client";

import React, { useState } from "react";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Select, 
  SelectItem,
  Chip,
  Card,
  CardBody
} from "@heroui/react";
import { Send, Bus, Route as RouteIcon, AlertCircle } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { showErrorToast } from "@/utils/toast";

interface DispatchModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
}

export function DispatchModal({ isOpen, onOpenChange }: DispatchModalProps) {
  const queryClient = useQueryClient();
  const [selectedBusId, setSelectedBusId] = useState<string>("");
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");

  const busesRes = useQuery(trpc.admin.listBuses.queryOptions({ status: "inactive" }));
  const routesRes = useQuery(trpc.admin.getRoutes.queryOptions());

  const dispatchMutation = useMutation(trpc.admin.dispatchBus.mutationOptions({
    onSuccess: () => {
      toast.success("Unit dispatched successfully");
      queryClient.invalidateQueries({ queryKey: trpc.admin.listBuses.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.admin.getSystemAnalytics.queryKey() });
      onOpenChange();
    },
    onError: (err: any) => showErrorToast(err.message),
  }));

  const handleDispatch = async () => {
    if (!selectedBusId || !selectedRouteId) {
      showErrorToast("Incomplete Parameters", "Please select both a unit and a route for strategic deployment.");
      return;
    }
    
    await dispatchMutation.mutateAsync({
      busId: selectedBusId,
      routeId: selectedRouteId,
    });
  };

  const availableBuses = (busesRes.data as any)?.data || [];
  const availableRoutes = (routesRes.data as any)?.data || [];

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="2xl" placement="center">
      <ModalContent className="bg-zinc-950 border border-zinc-900 shadow-2xl">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Send size={18} className="text-indigo-400" />
                </div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-indigo-200">Strategic Dispatch</h2>
              </div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Orchestrate fleet deployment and route assignments</p>
            </ModalHeader>
            <ModalBody className="py-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Unit Selection */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Select
                      label="Operational Unit"
                      labelPlacement="outside"
                      placeholder="Select available bus"
                      variant="bordered"
                      selectedKeys={selectedBusId ? [selectedBusId] : []}
                      onSelectionChange={(keys) => setSelectedBusId(Array.from(keys)[0] as string)}
                      startContent={<Bus size={18} className="text-zinc-600" />}
                      classNames={{ 
                        trigger: "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all text-white min-h-[48px]",
                        label: "text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 !static !transform-none !mb-1",
                        mainWrapper: "pt-1"
                      }}
                      popoverProps={{
                        classNames: {
                          content: "bg-zinc-950 border border-zinc-800 shadow-2xl min-w-[200px]"
                        }
                      }}
                    >
                      {availableBuses.map((bus: any) => (
                        <SelectItem key={bus.id} textValue={bus.plateNumber}>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{bus.plateNumber}</span>
                            <span className="text-[10px] text-zinc-500 uppercase font-medium">{bus.model || "Standard Unit"}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {selectedBusId && (
                    <Card className="bg-zinc-900/50 border border-zinc-800 shadow-none">
                      <CardBody className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">Unit Status</span>
                          <Chip color="success" variant="flat" size="sm" className="text-[9px] uppercase font-black">Ready</Chip>
                        </div>
                      </CardBody>
                    </Card>
                  )}
                </div>

                {/* Route Selection */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Select
                      label="Strategic Route"
                      labelPlacement="outside"
                      placeholder="Assign operational path"
                      variant="bordered"
                      selectedKeys={selectedRouteId ? [selectedRouteId] : []}
                      onSelectionChange={(keys) => setSelectedRouteId(Array.from(keys)[0] as string)}
                      startContent={<RouteIcon size={18} className="text-zinc-600" />}
                      classNames={{ 
                        trigger: "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all text-white min-h-[48px]",
                        label: "text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 !static !transform-none !mb-1",
                        mainWrapper: "pt-1"
                      }}
                      popoverProps={{
                        classNames: {
                          content: "bg-zinc-950 border border-zinc-800 shadow-2xl min-w-[200px]"
                        }
                      }}
                    >
                      {availableRoutes.map((route: any) => (
                        <SelectItem key={route.id} textValue={route.name}>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{route.name}</span>
                            <span className="text-[10px] text-zinc-500 uppercase font-medium">{route.stops?.length || 0} Strategic Nodes</span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {selectedRouteId && (
                    <div className="p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <AlertCircle size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Deployment active upon authorization</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-zinc-900">
              <Button variant="light" onPress={onClose} className="font-bold uppercase tracking-widest text-[10px]">
                Abort
              </Button>
              <Button 
                className="kinetic-gradient text-indigo-950 font-black uppercase tracking-widest text-[10px] px-8" 
                onPress={handleDispatch}
                isLoading={dispatchMutation.isPending}
                startContent={!dispatchMutation.isPending && <Send size={18} />}
              >
                Authorize Deployment
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
