import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  Zap,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../ThemeContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/map', icon: Map, label: 'Map View' },
  { to: '/alerts', icon: AlertTriangle, label: 'Alerts' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { isLight, toggleTheme } = useTheme();

  return (
    <aside
      className={`hidden md:flex fixed top-0 left-0 h-screen z-40 flex-col transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        bg-surface-950/80 backdrop-blur-2xl border-r border-surface-800/50`}
    >
      {/* ─── Logo ─── */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-800/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-300 to-blue-800 flex items-center justify-center flex-shrink-0 shadow-lg shadow-danger-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
              LineGuard
            </h1>
            <p className="text-[10px] text-surface-500 font-medium tracking-widest uppercase">
              Jabalpur Area
            </p>
          </div>
        )}
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 py-4 px-2.5 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || 
            (to !== '/' && location.pathname.startsWith(to));

          return (
            <NavLink
              key={to}
              to={to}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-brand-600/15 text-brand-400 shadow-sm shadow-brand-500/10'
                  : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/50'
                }
                ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon
                className={`w-[18px] h-[18px] flex-shrink-0 transition-colors duration-200
                  ${isActive ? 'text-brand-400' : 'text-surface-500 group-hover:text-surface-300'}`}
              />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ─── Bottom Section ─── */}
      <div className="px-2.5 pb-4 space-y-2">
        {/* Theme toggle & Collapse */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-surface-500 hover:text-surface-300 hover:bg-surface-800/50 rounded-xl transition-all duration-200"
            title="Toggle Theme"
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggle}
            className="flex-[2] flex items-center justify-center gap-2 py-2 text-surface-500 hover:text-surface-300 hover:bg-surface-800/50 rounded-xl transition-all duration-200"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
