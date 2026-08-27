export default function Eyebrow({ children, className = "" }: { children: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="h-px w-7 bg-accent" />
      <p className="eyebrow">{children}</p>
    </div>
  );
}
