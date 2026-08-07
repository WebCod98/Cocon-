import { motion } from 'framer-motion';

interface GaugeProps {
  label: string;
  emoji: string;
  value: number;
  color: string;
}

export function Gauge({ label, emoji, value, color }: GaugeProps) {
  return (
    <div className="flex-1">
      <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-muted">
        <span className="flex items-center gap-1">
          <span aria-hidden="true">{emoji}</span>
          {label}
        </span>
        <span className="tabular-nums">{Math.round(value)}%</span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-ice"
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}>
        
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
        
      </div>
    </div>);

}