import React from 'react';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ title, subtitle, action, children, className = '' }: SectionCardProps) {
  return (
    <section className={`rounded-4xl border border-ice bg-cream p-4 shadow-soft ${className}`}>
      {(title || action) &&
      <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-base font-semibold text-ink">{title}</h2>}
            {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      }
      {children}
    </section>);

}