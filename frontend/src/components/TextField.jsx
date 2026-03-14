export default function TextField({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  min,
  max,
  readOnly = false,
}) {
  return (
    <div>
      {label && <label className="app-label">{label}</label>}

      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        readOnly={readOnly}
        className={[
          "mt-1 app-input",
          readOnly ? "cursor-default bg-gray-50 text-brand-muted" : "",
        ].join(" ")}
      />
    </div>
  );
}