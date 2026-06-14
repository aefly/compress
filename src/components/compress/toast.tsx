"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { AlertCircle, X } from "lucide-react";

export interface Toast {
  id: string;
  message: string;
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);
  const onDismissRef = useRef(onDismiss);
  const toastIdRef = useRef(toast.id);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const dismiss = useCallback(() => {
    setIsExiting(true);
  }, []);

  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - step;
        if (next <= 0) {
          clearInterval(progressTimer);
          return 0;
        }
        return next;
      });
    }, interval);

    const autoDismissTimer = setTimeout(() => {
      dismiss();
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(autoDismissTimer);
    };
  }, [dismiss]);

  useEffect(() => {
    if (!isExiting) return;
    const timer = setTimeout(() => {
      onDismissRef.current(toastIdRef.current);
    }, 300);
    return () => clearTimeout(timer);
  }, [isExiting]);

  return (
    <div
      className={`w-80 overflow-hidden rounded-xl border border-destructive/20 bg-card/95 backdrop-blur-xl shadow-2xl shadow-destructive/10 ${
        isExiting ? "animate-toast-exit" : "animate-toast-enter"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
        </div>
        <p className="flex-1 min-w-0 pt-1.5 text-sm font-medium text-foreground leading-tight break-words">
          {toast.message}
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="h-1 bg-destructive/5">
        <div
          className="h-full bg-gradient-to-l from-destructive to-destructive/60 transition-all duration-50 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
