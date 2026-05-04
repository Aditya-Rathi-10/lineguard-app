import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight, Search, Filter, Zap } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { SkeletonList } from '../components/ui/Skeletons';
import { getTheftAlerts, timeAgo, getCurrentLoss } from '../utils/dataUtils';
import StatusDropdown from '../components/ui/StatusDropdown';

export default function AlertsPage({ records, loading, updateStatus }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [draftStatuses, setDraftStatuses] = useState({});

  const handleUpdateAll = async () => {
    const updates = Object.entries(draftStatuses).map(([id, status]) => ({ id, _id: id, status }));
    try {
      await updateStatus(updates);
      setDraftStatuses({});
    } catch (e) {
      console.error('Update failed:', e);
    }
  };

  const theftAlerts = useMemo(() => getTheftAlerts(records), [records]);
  const areas = useMemo(() => [...new Set(theftAlerts.map((r) => r.area))].sort(), [theftAlerts]);

  const filteredAlerts = useMemo(() => {
    let filtered = theftAlerts;
    if (areaFilter !== 'all') filtered = filtered.filter((r) => r.area === areaFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) => r.poleId.toLowerCase().includes(q) || r.area.toLowerCase().includes(q) || r.address.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [theftAlerts, areaFilter, searchQuery]);

  if (loading) {
    return (<div><PageHeader title="Alerts" subtitle="Theft detection alerts" /><SkeletonList rows={8} /></div>);
  }

  return (
    <div>
      <PageHeader title="Alerts" subtitle={`${theftAlerts.length} theft events detected`}>
        <div className="flex items-center gap-3">
          <div className="badge-danger text-xs"><AlertTriangle className="w-3.5 h-3.5" />{theftAlerts.length} Active</div>
          {Object.keys(draftStatuses).length > 0 && (
            <button 
              onClick={handleUpdateAll}
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-lg shadow-brand-500/20 transition-all animate-in"
            >
              {Object.keys(draftStatuses).length === 1 ? 'Update Selection' : 'Update Selections'}
            </button>
          )}
        </div>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input type="text" placeholder="Search by pole ID, area, or address..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10 text-sm" id="alerts-search" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-surface-500" />
          <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="input-field text-sm py-2.5 w-48" id="alerts-area-filter">
            <option value="all">All Areas</option>
            {areas.map((area) => (<option key={area} value={area}>{area}</option>))}
          </select>
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-400 font-medium">No alerts found</p>
          <p className="text-sm text-surface-600 mt-1">{searchQuery || areaFilter !== 'all' ? 'Try adjusting your filters' : 'No theft events detected'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAlerts.map((alert, idx) => {
            const diff = Math.round((alert.input - alert.output) * 100) / 100;
            const loss = getCurrentLoss(alert.input, alert.output);
            return (
              <button key={alert.poleId + alert.createdAt + idx} onClick={() => navigate(`/pole/${alert.poleId}`)} className="w-full glass-card-hover p-4 flex items-center gap-4 text-left group">
                <div className="w-11 h-11 rounded-xl bg-danger-500/10 flex items-center justify-center flex-shrink-0 border border-danger-500/20">
                  <Zap className="w-5 h-5 text-danger-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-sm text-white">{alert.poleId}</span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <StatusDropdown 
                        currentStatus={draftStatuses[alert._id] || alert.status || (alert.theft ? 'Pending' : 'Normal')} 
                        onChange={(newStatus) => {
                          if (newStatus === (alert.status || (alert.theft ? 'Pending' : 'Normal'))) {
                            const newDrafts = { ...draftStatuses };
                            delete newDrafts[alert._id];
                            setDraftStatuses(newDrafts);
                          } else {
                            setDraftStatuses(prev => ({ ...prev, [alert._id]: newStatus }));
                          }
                        }} 
                      />
                    </div>
                  </div>
                  <p className="text-xs text-surface-400 truncate">{alert.area} · {alert.address}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                  <div className="text-right"><p className="text-xs text-surface-500">Current Diff</p><p className="text-sm font-bold text-danger-400">{diff} A</p></div>
                  <div className="text-right"><p className="text-xs text-surface-500">Loss</p><p className="text-sm font-bold text-danger-400">{loss}%</p></div>
                  <div className="text-right min-w-[100px]"><p className="text-xs text-surface-500">Time</p><p className="text-xs text-surface-300">{timeAgo(alert.createdAt)}</p></div>
                </div>
                <ChevronRight className="w-4 h-4 text-surface-600 group-hover:text-surface-400 transition-colors flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
