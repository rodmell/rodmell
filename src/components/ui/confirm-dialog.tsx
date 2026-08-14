import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirmar eliminación",
  description,
  onConfirm,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border-[#222] text-white sm:max-w-md rounded-xl shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center pt-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-zinc-400 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-6 w-full">
          <Button
            variant="outline"
            className="flex-1 bg-transparent border-[#333] text-zinc-300 hover:text-white hover:bg-[#222]"
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
          <Button
            className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
