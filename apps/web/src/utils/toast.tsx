import { toast } from "sonner";
import { Copy, Terminal, CheckCircle2 } from "lucide-react";

/**
 * Enhanced toast utility for error reporting with copy-to-clipboard functionality.
 * This ensures users can easily capture technical errors for development relay.
 */
export const showErrorToast = (message: string, description?: string) => {
  const toastId = toast.error(message, {
    description: description || "Technical anomaly detected. Copy credentials for relay.",
    duration: 6000,
    action: {
      label: "Copy Link", // Not actually used by our custom render below but required for types sometimes
      onClick: () => {}
    },
    // We use a custom render for the premium tactical look
    cancel: {
      label: "Dismiss",
      onClick: () => {}
    },
    // Adding custom functionality via action buttons
    onAutoClose: () => {},
    onDismiss: () => {},
  });

  // Since sonner's toast.error returns a string/number ID, 
  // we could potentially use toast.custom, but it's easier to use the standard 
  // toast.error and just append the action if possible.
  
  // Actually, let's use toast.custom for the full redesign as requested.
  toast.dismiss(toastId);
  
  toast.custom((t) => (
    <div className="w-full max-w-[350px] bg-zinc-950 border border-red-500/20 rounded-2xl shadow-huge p-4 flex flex-col gap-3 animate-in slide-in-from-right-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
          <Terminal size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase italic tracking-tighter text-red-500">System Error</p>
          <p className="text-[11px] font-bold text-zinc-100 mt-1 leading-relaxed break-words line-clamp-3">
            {message}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 pt-1">
        <button 
          onClick={() => {
            navigator.clipboard.writeText(message);
            toast.success("Error copied to matrix buffer", {
              icon: <CheckCircle2 size={14} className="text-primary" />,
              className: "bg-zinc-950 border border-primary/20 text-zinc-100 font-bold uppercase text-[10px] tracking-widest",
              duration: 2000
            });
          }}
          className="flex-1 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 flex items-center justify-center gap-2 transition-all group"
        >
          <Copy size={14} className="text-zinc-500 group-hover:text-primary transition-colors" />
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-100">Copy Trace</span>
        </button>
        <button 
          onClick={() => toast.dismiss(t)}
          className="px-4 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-all"
        >
          Dismiss
        </button>
      </div>
    </div>
  ), {
    duration: 8000,
    position: "top-right"
  });
};
