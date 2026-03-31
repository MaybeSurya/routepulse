"use client";

import React from "react";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  User,
  Chip,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { MoreVertical, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { showErrorToast } from "@/utils/toast";

export function ComplaintsTable({ complaints }: { complaints: any[] }) {
  const queryClient = useQueryClient();
  const resolveMutation = useMutation(trpc.admin.updateComplaint.mutationOptions());

  const handleUpdateStatus = async (id: string, status: any) => {
    try {
      await resolveMutation.mutateAsync({ id, status });
      toast.success(`Complaint marked as ${status}`);
      queryClient.invalidateQueries({ queryKey: trpc.admin.listComplaints.queryKey() });
    } catch (err: any) {
      showErrorToast(err.message);
    }
  };

  const statusColorMap: Record<string, "default" | "warning" | "success" | "danger" | "primary" | "secondary"> = {
    open: "warning",
    in_review: "primary",
    resolved: "success",
    closed: "default",
  };

  return (
    <div className="bg-content1 rounded-2xl border border-default-100 shadow-2xl overflow-hidden">
      <Table aria-label="Complaints Table" removeWrapper className="bg-transparent">
        <TableHeader>
          <TableColumn className="uppercase text-[10px] font-black tracking-widest text-default-400">Student</TableColumn>
          <TableColumn className="uppercase text-[10px] font-black tracking-widest text-default-400">Subject</TableColumn>
          <TableColumn className="uppercase text-[10px] font-black tracking-widest text-default-400">Status</TableColumn>
          <TableColumn className="uppercase text-[10px] font-black tracking-widest text-default-400">Date</TableColumn>
          <TableColumn className="uppercase text-[10px] font-black tracking-widest text-default-400 text-right">Actions</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No reports found. System is stable.">
          {complaints.map((c) => (
            <TableRow key={c.id} className="hover:bg-content2/50 transition-colors">
              <TableCell>
                <User
                  name={c.user.email}
                  description={`ID: ${c.user.id.substring(0, 8)}`}
                  avatarProps={{
                    src: `https://i.pravatar.cc/150?u=${c.user.id}`,
                    size: "sm",
                  }}
                />
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">{c.subject}</span>
                  <span className="text-xs text-default-500 line-clamp-1">{c.description}</span>
                </div>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat" color={statusColorMap[c.status]} className="font-bold uppercase text-[10px]">
                  {c.status.replace("_", " ")}
                </Chip>
              </TableCell>
              <TableCell>
                <span className="text-xs font-medium text-default-500">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Dropdown 
                  classNames={{
                    content: "bg-zinc-950 border border-zinc-800 shadow-2xl p-1",
                  }}
                >
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Complaint Actions">
                    <DropdownItem 
                      key="review" 
                      startContent={<Clock size={16} />}
                      onClick={() => handleUpdateStatus(c.id, "in_review")}
                    >
                      In Review
                    </DropdownItem>
                    <DropdownItem 
                      key="resolve" 
                      color="success"
                      className="text-success"
                      startContent={<CheckCircle2 size={16} />}
                      onClick={() => handleUpdateStatus(c.id, "resolved")}
                    >
                      Resolve
                    </DropdownItem>
                    <DropdownItem 
                      key="close" 
                      color="danger"
                      className="text-danger"
                      startContent={<AlertCircle size={16} />}
                      onClick={() => handleUpdateStatus(c.id, "closed")}
                    >
                      Close Reject
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
