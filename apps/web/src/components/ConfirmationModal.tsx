"use client";

import React from "react";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button 
} from "@heroui/react";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmationModal({ 
  isOpen, 
  onOpenChange, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = "Confirm Action", 
  isDestructive = true,
  isLoading = false
}: ConfirmationModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange} 
      backdrop="blur" 
      size="md"
      placement="center"
      classNames={{
        backdrop: "bg-zinc-950/60 backdrop-blur-md",
        base: "bg-zinc-950 border border-zinc-900 shadow-huge",
        header: "border-b border-zinc-900 pb-4",
        footer: "border-t border-zinc-900 pt-4"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDestructive ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-primary/10 text-primary'}`}>
                <AlertTriangle size={20} fill="currentColor" fillOpacity={0.1} />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-black uppercase italic tracking-tighter text-zinc-100">{title}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Authority Authorization Required</p>
              </div>
            </ModalHeader>
            <ModalBody className="py-8">
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                {message}
              </p>
              {isDestructive && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle size={14} className="text-red-500" />
                    <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">System Warning</span>
                  </div>
                  <p className="text-[11px] text-red-400 font-bold uppercase tracking-wider leading-tight">
                    This action is permanent and cannot be reversed.
                  </p>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button 
                variant="flat" 
                onPress={onClose} 
                className="font-bold uppercase text-[10px] tracking-widest"
              >
                Abort
              </Button>
              <Button 
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
                isLoading={isLoading}
                className={`font-black uppercase italic text-[10px] tracking-widest px-8 h-12 rounded-2xl transition-all duration-300 ${
                  isDestructive 
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20" 
                    : "bg-primary hover:bg-primary-container text-zinc-950 shadow-lg shadow-primary/20"
                }`}
                startContent={!isLoading && (isDestructive ? <Trash2 size={16} /> : null)}
              >
                {confirmLabel}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
