export default function AlertMessage({ type = "error", text, className = "" }) {
  if (!text) return null;

  const styles =
    type === "ok"
      ? "border-green-200 bg-green-50 text-green-700"
      : type === "info"
      ? "border-brand-lavender bg-brand-lavenderSoft text-brand-text"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${styles} ${className}`}>
      {text}
    </div>
  );
}