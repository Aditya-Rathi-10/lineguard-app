import { useState } from 'react';

export default function StatusDropdown({ currentStatus, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const statuses = ['Pending', 'Investigating', 'Resolved'];

  let colorClass = '';
  const normalizedStatus = (currentStatus || '').toLowerCase();
  
  switch (normalizedStatus) {
    case 'pending': colorClass = 'text-danger-400 bg-danger-500/10 border-danger-500/20'; break;
    case 'investigating':
    case 'investigation': colorClass = 'text-warning-400 bg-warning-500/10 border-warning-500/20'; break;
    case 'resolved': colorClass = 'text-success-400 bg-success-500/10 border-success-500/20'; break;
    default: colorClass = 'text-surface-400 bg-surface-800/50 border-surface-700'; break;
  }

  const displayStatus = currentStatus === (currentStatus || '').toUpperCase()
    ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1).toLowerCase()
    : currentStatus;

  return (
    <div className="flex items-center gap-2 justify-center">
      <div className="relative inline-block text-left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${colorClass} hover:opacity-80 flex items-center gap-1.5`}
        >
          {displayStatus}
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-1 w-32 rounded-xl bg-surface-800 border border-surface-700 shadow-xl shadow-black/50 z-50 overflow-hidden">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onChange(s);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-surface-700 transition-colors ${
                    s === currentStatus ? 'text-white font-medium bg-surface-700/50' : 'text-surface-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
