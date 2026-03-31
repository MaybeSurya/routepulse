"use client";

import React from "react";
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Button,
  cn
} from "@heroui/react";
import { 
  MoreVertical, 
  ShieldAlert, 
  Trash2, 
  ShieldCheck, 
  UserMinus,
  AlertTriangle
} from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { showErrorToast } from "@/utils/toast";

interface UserActionsProps {
  user: any;
}

export function UserActions({ user }: UserActionsProps) {
  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation(trpc.admin.updateUserRole.mutationOptions({
    onSuccess: () => {
      toast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: trpc.admin.listAllUsers.queryKey() });
    },
    onError: (err: any) => showErrorToast(err.message),
  }));

  const deleteMutation = useMutation(trpc.admin.deleteUser.mutationOptions({
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: trpc.admin.listAllUsers.queryKey() });
    },
    onError: (err: any) => showErrorToast(err.message),
  }));

  const handleUpdateRole = async (role: string) => {
    await updateRoleMutation.mutateAsync({ id: user.id, role: role as any });
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to PERMANENTLY delete user ${user.email}? This action cannot be undone.`)) {
      await deleteMutation.mutateAsync({ id: user.id });
    }
  };

  const isSuperAdmin = user.role === "super_admin";

  return (
    <Dropdown 
      classNames={{
        content: "bg-zinc-950 border border-zinc-800 shadow-2xl p-1",
      }}
    >
      <DropdownTrigger>
        <Button aria-label={`Open actions for user ${user.email}`} isIconOnly size="sm" variant="light" radius="full" className="text-zinc-500 hover:text-white transition-colors">
          <MoreVertical size={18} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="User Actions"
        disabledKeys={isSuperAdmin ? ["demote", "delete"] : []}
      >
        <DropdownItem
          key="promote"
          startContent={<ShieldCheck size={16} />}
          onClick={() => handleUpdateRole("super_admin")}
          className={cn(user.role === "super_admin" && "hidden")}
        >
          Promote to Super Admin
        </DropdownItem>
        <DropdownItem
          key="demote"
          startContent={<ShieldAlert size={16} />}
          onClick={() => handleUpdateRole("transport_admin")}
          className={cn(user.role === "transport_admin" && "hidden", "text-warning")}
        >
          Assign Transport Admin
        </DropdownItem>
        <DropdownItem
          key="driver"
          startContent={<UserMinus size={16} />}
          onClick={() => handleUpdateRole("driver")}
          className={cn(user.role === "driver" && "hidden")}
        >
          Convert to Driver
        </DropdownItem>
        <DropdownItem
          key="student"
          startContent={<UserMinus size={16} />}
          onClick={() => handleUpdateRole("student")}
          className={cn(user.role === "student" && "hidden")}
        >
          Convert to Student
        </DropdownItem>
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          startContent={<Trash2 size={16} />}
          onClick={handleDelete}
        >
          Terminate Access
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
