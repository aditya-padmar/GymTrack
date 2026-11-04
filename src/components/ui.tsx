import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export function Button({ className, variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  const styles = {
    primary: 'bg-lime text-ink hover:bg-lime/90 shadow-[0_0_24px_rgba(200,245,58,.16)]',
    secondary: 'border border-line bg-panel text-white hover:border-lime/50',
    ghost: 'text-muted hover:bg-white/5 hover:text-white',
    danger: 'border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20',
  };
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50', styles[variant], className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('w-full rounded-xl border border-line bg-ink/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-muted/70 focus:border-lime/70 focus:ring-2 focus:ring-lime/10', className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('w-full rounded-xl border border-line bg-ink/70 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-lime/70 focus:ring-2 focus:ring-lime/10', className)} {...props}>{children}</select>;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('w-full resize-none rounded-xl border border-line bg-ink/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-muted/70 focus:border-lime/70 focus:ring-2 focus:ring-lime/10', className)} {...props} />;
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-line bg-panel/80', className)} {...props}>{children}</div>;
}

export function SectionTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-lime">{eyebrow}</div><h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>{description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}</div>{action}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line bg-panel/40 px-6 py-12 text-center"><div className="mx-auto mb-3 h-2 w-2 rounded-full bg-lime shadow-[0_0_16px_#c8f53a]" /><h3 className="font-semibold text-white">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

export function StatusPill({ children, tone = 'lime' }: { children: ReactNode; tone?: 'lime' | 'muted' | 'amber' | 'red' }) {
  const tones = { lime: 'bg-lime/10 text-lime', muted: 'bg-white/5 text-muted', amber: 'bg-amber-400/10 text-amber-300', red: 'bg-red-400/10 text-red-300' };
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider', tones[tone])}>{children}</span>;
}
