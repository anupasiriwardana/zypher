export function Card({ className, children }) {
  return <div className={`rounded-xl hover:border-[var(--brand-yellow)] shadow-md ${className}`}>{children}</div>;
}

export function CardContent({ className, children }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
