type ToastProps = {
  message: string | null;
  variant?: "success" | "error";
  onClose: () => void;
};

export function Toast({ message, variant = "success", onClose }: ToastProps) {
  if (!message) {
    return null;
  }

  return (
    <div className={`toast toast--${variant}`} role="status" aria-live="polite">
      <span>{message}</span>

      <button type="button" onClick={onClose} aria-label="Cerrar mensaje">
        ×
      </button>
    </div>
  );
}