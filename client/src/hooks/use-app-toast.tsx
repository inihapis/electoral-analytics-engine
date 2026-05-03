import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import React from "react";
import { Copy, Check } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface AppToastOptions {
  title?: string;
  description: string;
  duration?: number;
  showCopy?: boolean;
  type?: ToastType;
  action?: React.ReactElement; // Tambahkan properti action
}

export function useAppToast() {
  const { toast } = useToast();

  const showToast = ({
    title,
    description,
    duration = 5000,
    showCopy = false,
    type = "info",
    action, // Terima properti action
  }: AppToastOptions) => {
    let variant: "default" | "destructive" | "success" = "default";
    if (type === "error") {
      variant = "destructive";
    } else if (type === "success") {
      variant = "success";
    }

    const finalAction = showCopy ? (
      <ToastCopyAction message={description} />
    ) : action; // Gunakan action kustom jika ada, jika tidak gunakan copyAction

    toast({
      title: title || type.charAt(0).toUpperCase() + type.slice(1),
      description,
      duration,
      variant,
      action: finalAction, // Teruskan finalAction
    });
  };

  const success = (description: string, title?: string, duration?: number) => {
    // console.log('✅ SUCCESS TOAST:', { title: title || 'Success', description, duration });
    return showToast({ title, description, duration, type: "success" });
  };
  const error = (description: string, title?: string, duration?: number, showCopy: boolean = true) => {
    // console.log('❌ ERROR TOAST:', { title: title || 'Error', description, duration, showCopy });
    return showToast({ title, description, duration, showCopy, type: "error" });
  };
  const warning = (description: string, title?: string, duration?: number) =>
    showToast({ title, description, duration, type: "warning" });
  const info = (description: string, title?: string, duration?: number) =>
    showToast({ title, description, duration, type: "info" });

  return {
    success,
    error,
    warning,
    info,
    showToast,
  };
}

interface ToastCopyActionProps {
  message: string;
}

const ToastCopyAction: React.FC<ToastCopyActionProps> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleCopy}
      className="text-xs font-bold"
      title="Copy message"
    >
      {copied ? (
        <Check className="w-4 h-4 mr-2" />
      ) : (
        <Copy className="w-4 h-4 mr-2" />
      )}
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
};
