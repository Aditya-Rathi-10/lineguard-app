import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, AlertTriangle } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/alerts', icon: AlertTriangle, label: 'Alerts' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-950/90 backdrop-blur-2xl border-t border-surface-800/50 flex items-center justify-around px-2 z-40">
      {navItems.map(({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

        return (
          <NavLink
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors
              ${isActive ? 'text-brand-400' : 'text-surface-500 hover:text-surface-300'}`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : ''}`} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
