"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Phone, 
  Hash, 
  Shield, 
  Key, 
  ArrowLeft,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  CloudUpload,
  Zap,
  Award,
  Lock,
  Loader2
} from "lucide-react";
import { 
  Button, 
  Input, 
  Avatar, 
  Card, 
  CardBody, 
  Divider,
  Chip,
  Tooltip
} from "@heroui/react";

import { useAuthStore } from "@/store/auth";
import { trpc } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getGravatarUrl } from "@/utils/user";
import { showErrorToast } from "@/utils/toast";

// --- Components ---

// Safe special character allowlist — excludes SQL/XSS vectors (' " ; < > & /)
const SAFE_SPECIAL = /[@#$%^*!_\-]/;

const PASSWORD_CRITERIA = [
  { id: "upper",   label: "Uppercase letter (A-Z)",         test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower",   label: "Lowercase letter (a-z)",         test: (p: string) => /[a-z]/.test(p) },
  { id: "number",  label: "Number (0-9)",                   test: (p: string) => /[0-9]/.test(p) },
  { id: "special", label: "Special char (@#$%^*!_-)",       test: (p: string) => SAFE_SPECIAL.test(p) },
  { id: "length",  label: "Minimum 8 characters",           test: (p: string) => p.length >= 8 },
];

export function getPasswordStrengthScore(p: string): number {
  return PASSWORD_CRITERIA.filter(c => c.test(p)).length;
}

export function isPasswordValid(p: string): boolean {
  return getPasswordStrengthScore(p) === PASSWORD_CRITERIA.length;
}

const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;

  const met = PASSWORD_CRITERIA.map(c => ({ ...c, passed: c.test(password) }));
  const score = met.filter(c => c.passed).length;
  const barColors = ["bg-red-600", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="space-y-3 mt-3">
      {/* Bar */}
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-500 ${i <= score ? barColors[score - 1] ?? 'bg-zinc-800' : 'bg-zinc-800'}`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Security Pulse</span>
        <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${score === 5 ? 'text-green-400' : score >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
          {labels[score - 1] ?? 'None'}
        </span>
      </div>
      {/* Criteria checklist */}
      <div className="grid grid-cols-1 gap-1">
        {met.map(c => (
          <div key={c.id} className={`flex items-center gap-2 text-[10px] font-medium transition-colors ${c.passed ? 'text-green-400' : 'text-zinc-600'}`}>
            <div className={`w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${c.passed ? 'bg-green-500 border-green-500' : 'border-zinc-700'}`}>
              {c.passed && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
            </div>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const CreatorBadge = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative group cursor-default"
  >
    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
    <Chip
      variant="shadow"
      classNames={{
        base: "bg-zinc-950 border border-white/10 px-4 h-8 shadow-2xl",
        content: "font-black italic uppercase text-[10px] tracking-widest text-white flex items-center gap-2"
      }}
      startContent={<Zap size={14} className="text-yellow-400 fill-yellow-400 animate-pulse" />}
    >
      Premium Special Creator
    </Chip>
  </motion.div>
);

export default function ProfilePage() {
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    setIsMounted(true);
    if (!accessToken) router.push("/auth/login");
  }, [accessToken, router]);

  const { data: profileData, refetch } = useQuery(
    trpc.user.getProfile.queryOptions(undefined, { enabled: !!accessToken })
  );

  const uploadMutation = useMutation(trpc.uploads.uploadAvatar.mutationOptions({
    onSuccess: (res) => {
      toast.success("Profile picture updated securely");
      if (res.avatarUrl) setLocalAvatarUrl(res.avatarUrl); // Optimistic display
      refetch();
    },
    onError: (err) => showErrorToast(err.message)
  }));

  const passwordMutation = useMutation(trpc.user.changePassword.mutationOptions({
    onSuccess: () => {
      toast.success("Security credentials updated");
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (err) => showErrorToast(err.message)
  }));

  if (!isMounted || !accessToken) return null;

  const isSuperAdminCreator = profileData?.user?.role === "super_admin" && profileData?.user?.email === "suryamods@gmail.com";
  const displayAvatarUrl = localAvatarUrl || profileData?.user?.avatarUrl || getGravatarUrl(profileData?.user?.email, 400);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast("File exceeds 5MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      uploadMutation.mutate({ base64Image: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = () => {
    if (!passData.currentPassword || !passData.newPassword) {
      showErrorToast("Please fill required fields");
      return;
    }
    if (!isPasswordValid(passData.newPassword)) {
      showErrorToast("Password Too Weak", "Must include uppercase, lowercase, number, and a special character (@#$%^*!_-)  — min 8 chars.");
      return;
    }
    if (passData.newPassword !== passData.confirmPassword) {
      showErrorToast("Passwords do not match");
      return;
    }
    passwordMutation.mutate({
      currentPassword: passData.currentPassword,
      newPassword: passData.newPassword
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-primary/30 overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 p-6 lg:p-12 pb-24">
        {/* Navigation */}
        <div className="max-w-4xl mx-auto mb-12 flex justify-between items-center">
          <Button 
            variant="flat" 
            className="bg-zinc-900 border border-white/5 rounded-2xl h-12 px-6 group"
            onClick={() => router.back()}
            startContent={<ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />}
          >
            <span className="font-bold uppercase text-[10px] tracking-widest">Back</span>
          </Button>
          
          <div className="text-right">
             <h4 className="text-sm font-black italic uppercase tracking-tighter">Terminal ID</h4>
             <p className="text-[10px] font-mono text-zinc-600 uppercase">{profileData?.user?.id?.substring(0, 12)}</p>
          </div>
        </div>

        <main className="max-w-3xl mx-auto">
          
          {/* Section 1: Hero Identity */}
          <section className="text-center space-y-8 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="relative inline-block group">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="relative p-2 rounded-[40px] bg-gradient-to-br from-white/10 to-transparent border border-white/10"
                >
                  <Avatar 
                    src={displayAvatarUrl} 
                    className="w-40 h-40 rounded-[32px] shadow-huge ring-4 ring-zinc-950 object-cover" 
                  />
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="absolute -bottom-2 -right-2 p-4 bg-white text-zinc-950 rounded-2xl shadow-huge border-4 border-zinc-950 hover:bg-zinc-200 transition-all group/btn"
                  >
                    {uploadMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                    <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                       <div className="bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border border-white/5 whitespace-nowrap shadow-huge">
                          Secure R2 Upload
                       </div>
                    </div>
                  </button>
                </motion.div>
             </div>

             <div className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                   <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">
                     {profileData?.user?.firstName} {profileData?.user?.lastName}
                   </h1>
                   <div className="flex items-center gap-3">
                     <Chip 
                       variant="flat" 
                       className="bg-primary/10 text-primary border border-primary/20 px-4 h-7"
                       classNames={{ content: "font-black uppercase text-[9px] tracking-widest italic" }}
                     >
                       {profileData?.user?.role?.replace("_", " ")}
                     </Chip>
                     {isSuperAdminCreator && <CreatorBadge />}
                   </div>
                </div>

                <div className="flex flex-wrap justify-center gap-6 pt-4">
                   <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 rounded-xl border border-white/5">
                      <Hash size={14} className="text-zinc-600" />
                      <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">{profileData?.user?.erpId || "NO-ERP"}</span>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 rounded-xl border border-white/5">
                      <Mail size={14} className="text-zinc-600" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{profileData?.user?.email}</span>
                   </div>
                   {profileData?.user?.phone && (
                     <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 rounded-xl border border-white/5">
                        <Phone size={14} className="text-zinc-600" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{profileData?.user?.phone}</span>
                     </div>
                   )}
                </div>
             </div>
          </section>

          <Divider className="my-16 bg-white/5" />

          {/* Section 2: Security & Identity Authorization */}
          <section className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
             <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tighter">Security & Identity</h3>
                   <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Authorize system-wide credential updates</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600">
                   <Shield size={22} />
                </div>
             </div>

             <Card className="bg-zinc-900/30 border border-white/5 rounded-[32px] shadow-huge backdrop-blur-xl">
                <CardBody className="p-8 lg:p-10 space-y-10">
                   {/* Current Credential */}
                   <div className="space-y-4">
                      <Input 
                        label={user?.role === "driver" ? "Current System PIN" : "Current Matrix Password"} 
                        labelPlacement="outside"
                        type={showPass.current ? "text" : "password"}
                        placeholder="••••••••" 
                        value={passData.currentPassword}
                        onValueChange={(v) => setPassData(prev => ({ ...prev, currentPassword: v }))}
                        variant="bordered"
                        endContent={
                          <button onClick={() => setShowPass(p => ({ ...p, current: !p.current }))} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                            {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        }
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                      {/* New Credential */}
                      <div className="space-y-4">
                         <Input 
                           label={user?.role === "driver" ? "New Security PIN" : "New Secure Password"} 
                           labelPlacement="outside"
                           type={showPass.new ? "text" : "password"}
                           placeholder={user?.role === "driver" ? "4-6 Digital Bits" : "Min 6 Alpha-Numeric"} 
                           value={passData.newPassword}
                           onValueChange={(v) => setPassData(prev => ({ ...prev, newPassword: v }))}
                           variant="bordered"
                           endContent={
                             <button onClick={() => setShowPass(p => ({ ...p, new: !p.new }))} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                               {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                             </button>
                           }
                         />
                         <PasswordStrength password={passData.newPassword} />
                      </div>

                      {/* Confirm Credential */}
                      <div className="space-y-4 flex flex-col justify-between">
                         <Input 
                           label="Authorize Confirmation" 
                           labelPlacement="outside"
                           type={showPass.confirm ? "text" : "password"}
                           placeholder="Re-enter for verification" 
                           value={passData.confirmPassword}
                           onValueChange={(v) => setPassData(prev => ({ ...prev, confirmPassword: v }))}
                           variant="bordered"
                           endContent={
                             <button onClick={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                               {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                             </button>
                           }
                         />
                         
                         <div className="hidden md:flex items-center gap-3 p-3 bg-zinc-950/40 rounded-2xl border border-white/5 border-dashed">
                            <Lock size={14} className="text-zinc-700" />
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none">Encrypted Hash Injection</span>
                         </div>
                      </div>
                   </div>

                   <Divider className="bg-white/5 mt-4" />

                   <div className="flex flex-col lg:flex-row gap-6 pt-4">
                      <Button 
                        className="flex-[2] bg-white text-zinc-950 font-black italic uppercase h-16 rounded-2xl text-md shadow-huge hover:bg-zinc-200 transition-all"
                        onClick={handleChangePassword}
                        isLoading={passwordMutation.isPending}
                        startContent={!passwordMutation.isPending && <CheckCircle2 size={20} />}
                      >
                        Authorize Credential Update
                      </Button>
                      
                      <div className="flex-1 p-4 bg-zinc-950/40 rounded-2xl border border-white/5 flex flex-col justify-center">
                         <div className="flex items-center gap-2 mb-1">
                            <Shield size={12} className="text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Protection</span>
                         </div>
                         <p className="text-[10px] font-medium text-zinc-600 leading-tight">
                           Authentication protocols enforced for unauthorized access prevention.
                         </p>
                      </div>
                   </div>
                </CardBody>
             </Card>
          </section>

          {/* Footer Notice */}
          <footer className="mt-20 text-center opacity-30 select-none">
             <p className="text-[9px] font-bold uppercase tracking-[0.4em]">RoutePulse Protocol v2.5 / Secure-Identity-Module</p>
          </footer>

        </main>
      </div>

    </div>
  );
}
