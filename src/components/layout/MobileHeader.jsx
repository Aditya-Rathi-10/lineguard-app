import { Zap, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../ThemeContext';

export default function MobileHeader() {
  const { isLight, toggleTheme } = useTheme();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface-950/80 backdrop-blur-2xl border-b border-surface-800/50 flex items-center justify-between px-4 z-40">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-warning-400 to-danger-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-danger-500/20">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
            LineGuard
          </h1>
          <p className="text-[10px] text-surface-500 font-medium tracking-widest uppercase">
            Jabalpur Area
          </p>
        </div>
      </div>
      <button
        onClick={toggleTheme}
        className="p-2 text-surface-400 hover:text-surface-100 bg-surface-800/30 hover:bg-surface-800/60 rounded-xl transition-all"
        title="Toggle Theme"
      >
        {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>
    </header>
  );
}
