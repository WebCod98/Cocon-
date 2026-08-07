import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppHeader } from './components/AppHeader';
import { BottomNav } from './components/BottomNav';
import { Confetti } from './components/Confetti';
import { Sheet } from './components/Sheet';
import { CoupleProvider, useCouple, useSession } from './state/CoupleContext';
import { useDemoPartner } from './state/useDemoPartner';
import { useNow } from './hooks/useNow';
import { milestones } from './data/seed';
import { loveDuration } from './utils/time';
import { vibrate } from './lib/haptics';
import { Onboarding } from './pages/Onboarding';
import { Adoption } from './pages/Adoption';
import { Home } from './pages/Home';

const Rituals = lazy(() => import('./pages/Rituals').then((m) => ({ default: m.Rituals })));
const PolaroidPage = lazy(() => import('./pages/PolaroidPage').then((m) => ({ default: m.PolaroidPage })));
const Agenda = lazy(() => import('./pages/Agenda').then((m) => ({ default: m.Agenda })));
const Together = lazy(() => import('./pages/Together').then((m) => ({ default: m.Together })));
const Surprises = lazy(() => import('./pages/Surprises').then((m) => ({ default: m.Surprises })));
const Shop = lazy(() => import('./pages/Shop').then((m) => ({ default: m.Shop })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const Arcade = lazy(() => import('./pages/Arcade').then((m) => ({ default: m.Arcade })));
const GameRoute = lazy(() => import('./pages/GameRoute').then((m) => ({ default: m.GameRoute })));

export function App() {
  return (
    <CoupleProvider>
      <Gate />
    </CoupleProvider>
  );
}

/**
 * Trois portes successives : creer/rejoindre un couple, adopter le compagnon
 * ensemble, puis l'application elle-meme.
 */
function Gate() {
  const { ready, doc, settings } = useSession();
  useDemoPartner();

  if (!ready) return <Splash />;
  // Le document existe des la creation du couple, mais on reste dans le
  // parcours d'inscription tant que les autorisations n'ont pas ete vues.
  if (!doc || !settings.onboarded) return <Onboarding />;
  if (!doc.companion) return <Adoption />;

  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}

function Splash() {
  return (
    <div className="flex min-h-full items-center justify-center bg-frost">
      <motion.div
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="text-5xl">
        💞
      </motion.div>
    </div>
  );
}

function Shell() {
  const now = useNow(1000);
  const location = useLocation();

  return (
    <div className="flex min-h-full w-full justify-center bg-frost">
      <div className="flex min-h-screen w-full max-w-md flex-col bg-frost shadow-lift">
        <AppHeader now={now} />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}>
                <Routes location={location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/rituels" element={<Rituals />} />
                  <Route path="/polaroid" element={<PolaroidPage />} />
                  <Route path="/arcade" element={<Arcade />} />
                  <Route path="/arcade/:gameId" element={<GameRoute />} />
                  <Route path="/agenda" element={<Agenda />} />
                  <Route path="/nous" element={<Together />} />
                  <Route path="/surprises" element={<Surprises />} />
                  <Route path="/boutique" element={<Shop />} />
                  <Route path="/reglages" element={<Settings />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>
        <BottomNav />
        <ThoughtOverlay />
        <MilestoneWatcher />
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-muted" role="status">
      Un instant…
    </div>
  );
}

/** Le Bouton Pensee de l'autre : plein ecran, avec vibration en battement. */
function ThoughtOverlay() {
  const { doc, settings, seeThoughts, them } = useCouple();
  const [shown, setShown] = useState<string | null>(null);

  const pending = doc.thoughts.find((item) => item.from !== settings.slot && !item.seen);

  useEffect(() => {
    if (!pending || shown === pending.id) return undefined;
    setShown(pending.id);
    vibrate('heartbeat');
    const id = window.setTimeout(() => {
      seeThoughts();
      setShown(null);
    }, 2200);
    return () => window.clearTimeout(id);
  }, [pending, shown, seeThoughts]);

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-night/60"
          aria-live="polite">
          <motion.span
            initial={{ scale: 0.4 }}
            animate={{ scale: [0.4, 1.2, 1, 1.12, 1] }}
            transition={{ duration: 1.4 }}
            className="text-7xl">
            💞
          </motion.span>
          <p className="text-sm font-semibold text-paper">{them.name} pense à toi</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Detecte les jalons (100 jours, 1 an, 1000 jours…) et les celebre. */
function MilestoneWatcher() {
  const { doc, markMilestoneSeen } = useCouple();
  const [celebrating, setCelebrating] = useState<(typeof milestones)[number] | null>(null);
  const [burst, setBurst] = useState(0);

  const totalDays = loveDuration(doc.since).totalDays;
  const reached = milestones.filter(
    (item) => totalDays >= item.days && !doc.milestonesSeen.includes(item.id)
  );
  const next = reached[reached.length - 1] ?? null;

  useEffect(() => {
    if (!next || celebrating) return;
    setCelebrating(next);
    setBurst((value) => value + 1);
    vibrate('success');
  }, [next, celebrating]);

  const close = () => {
    // On solde tous les jalons atteints d'un coup : pas de celebrations en file.
    reached.forEach((item) => markMilestoneSeen(item.id));
    setCelebrating(null);
  };

  return (
    <>
      <Confetti trigger={burst} />
      <Sheet
        open={Boolean(celebrating)}
        title={`${celebrating?.emoji ?? '🎉'} ${celebrating?.label ?? ''} ensemble`}
        subtitle="Un jalon de votre histoire"
        onClose={close}>
        <div className="text-center">
          <p className="font-display text-3xl font-semibold text-coral">{totalDays} jours</p>
          <p className="mt-2 text-sm leading-snug text-muted">
            Vous venez de franchir le cap des <strong className="text-ink">{celebrating?.label}</strong>. Ce
            badge rejoint vos souvenirs — il reste affiché dans l’Agenda.
          </p>
          <button
            type="button"
            onClick={close}
            className="mt-4 w-full rounded-full bg-coral py-3 text-sm font-semibold text-paper">
            Garder ce souvenir
          </button>
        </div>
      </Sheet>
    </>
  );
}
