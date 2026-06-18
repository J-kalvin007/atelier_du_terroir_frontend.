"use client";

import { useCallback, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export type ConfirmOptions = {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
};

const DEFAULT_OPTIONS: ConfirmOptions = {
  description: "",
};

export function useConfirmDialog() {
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>(DEFAULT_OPTIONS);

  const confirm = useCallback((nextOptions: ConfirmOptions): Promise<boolean> => {
    setOptions(nextOptions);
    setOpen(true);

    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    setOpen(false);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }, []);

  const confirmDialog = (
    <ConfirmDialog
      open={open}
      title={options.title ?? "Confirmer l'action"}
      description={options.description}
      confirmLabel={options.confirmLabel}
      cancelLabel={options.cancelLabel}
      variant={options.variant ?? "danger"}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  );

  return { confirm, confirmDialog };
}
