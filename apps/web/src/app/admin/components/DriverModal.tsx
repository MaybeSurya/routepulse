"use client";

import React, { useState } from "react";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Input
} from "@heroui/react";
import { User, Mail, Phone, Lock, CreditCard } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";

interface DriverModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
}

export function DriverModal({ isOpen, onOpenChange }: DriverModalProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [driverId, setDriverId] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const createDriverMutation = useMutation(trpc.admin.createDriver.mutationOptions({
    onSuccess: () => {
      toast.success("Driver onboarded successfully");
      queryClient.invalidateQueries({ queryKey: trpc.admin.listDrivers.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.admin.listAllUsers.queryKey() });
      queryClient.invalidateQueries({ queryKey: trpc.admin.getSystemAnalytics.queryKey() });
      resetForm();
      onOpenChange();
    },
    onError: (err: any) => toast.error(err.message),
  }));

  const resetForm = () => {
    setEmail("");
    setPhone("");
    setPin("");
    setDriverId("");
    setLicenseNumber("");
  };

  const handleSubmit = async () => {
    if (!driverId || !licenseNumber || !pin) {
      return toast.error("Driver ID, License, and PIN are required");
    }
    
    await createDriverMutation.mutateAsync({
      email: email || undefined,
      phone: phone || undefined,
      pin,
      driverId,
      licenseNumber,
    });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="xl" placement="center">
      <ModalContent className="bg-zinc-950 border border-zinc-900 shadow-2xl">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-indigo-200">Personnel Onboarding</h2>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Register new operational driver</p>
            </ModalHeader>
            <ModalBody className="py-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <Input
                    label="Email (Optional)"
                    placeholder="driver@routepulse.com"
                    labelPlacement="outside"
                    variant="bordered"
                    value={email || ""}
                    onValueChange={setEmail}
                    startContent={<Mail size={18} className="text-zinc-600" />}
                    classNames={{ 
                      inputWrapper: "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all",
                      label: "text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 !static !transform-none !mb-1"
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Input
                    label="Phone (Optional)"
                    placeholder="+254..."
                    labelPlacement="outside"
                    variant="bordered"
                    value={phone || ""}
                    onValueChange={setPhone}
                    startContent={<Phone size={18} className="text-zinc-600" />}
                    classNames={{ 
                      inputWrapper: "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all",
                      label: "text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 !static !transform-none !mb-1"
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <Input
                    label="Driver ID"
                    placeholder="DRV-001"
                    labelPlacement="outside"
                    variant="bordered"
                    value={driverId || ""}
                    onValueChange={setDriverId}
                    startContent={<User size={18} className="text-zinc-600" />}
                    classNames={{ 
                      inputWrapper: "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all",
                      label: "text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 !static !transform-none !mb-1"
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Input
                    label="License Number"
                    placeholder="DL-84729"
                    labelPlacement="outside"
                    variant="bordered"
                    value={licenseNumber || ""}
                    onValueChange={setLicenseNumber}
                    startContent={<CreditCard size={18} className="text-zinc-600" />}
                    classNames={{ 
                      inputWrapper: "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all",
                      label: "text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 !static !transform-none !mb-1"
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Input
                  label="Driver PIN"
                  placeholder="4-6 digits"
                  labelPlacement="outside"
                  type="password"
                  variant="bordered"
                  value={pin || ""}
                  onValueChange={setPin}
                  startContent={<Lock size={18} className="text-zinc-600" />}
                  description="Secure PIN for in-bus tablet login"
                  classNames={{ 
                    inputWrapper: "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all",
                    label: "text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 pb-1"
                  }}
                />
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-zinc-900">
              <Button aria-label="Abort driver onboarding" variant="light" onPress={onClose} className="font-bold uppercase tracking-widest text-[10px]">
                Abort
              </Button>
              <Button 
                aria-label="Authorize driver personnel"
                className="kinetic-gradient text-indigo-950 font-black uppercase tracking-widest text-[10px] px-8" 
                onPress={handleSubmit}
                isLoading={createDriverMutation.isPending}
              >
                Authorize Personnel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
