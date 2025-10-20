export function Badge({ className = "", children }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`}
    >
      {children}
    </span>
  );
}
