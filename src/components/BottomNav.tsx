import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarHeartIcon, GamepadIcon, GlobeIcon, HomeIcon, SunMoonIcon } from 'lucide-react';

const items = [
  { to: '/', label: 'Cocon', Icon: HomeIcon },
  { to: '/rituels', label: 'Rituels', Icon: SunMoonIcon },
  { to: '/arcade', label: 'Arcade', Icon: GamepadIcon },
  { to: '/agenda', label: 'Agenda', Icon: CalendarHeartIcon },
  { to: '/nous', label: 'Nous deux', Icon: GlobeIcon },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Navigation principale"
      className="sticky bottom-0 z-30 border-t border-ice bg-cream/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="flex items-stretch justify-between">
        {items.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className="relative flex flex-col items-center gap-1 rounded-2xl px-1 py-2.5 text-[11px] font-semibold text-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral aria-[current=page]:text-coral">
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-x-2 inset-y-1 -z-10 rounded-2xl bg-blush/60"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }} />
                  )}
                  <Icon size={20} strokeWidth={2.1} aria-hidden="true" />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
