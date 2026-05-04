import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertTriangle, Hash, Clock, X } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import StatusDropdown from '../components/ui/StatusDropdown';
import PoleTheftScatterChart from '../components/charts/PoleTheftScatterChart';
import { SkeletonChart, SkeletonList } from '../components/ui/Skeletons';
import { formatDateTime, getCurrentLoss, formatDate, timeAgo } from '../utils/dataUtils';

export default function AreaDetailPage({ records, loading, updateStatus }) {
  const { areaId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
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

  const areaRecords = useMemo(() => {
    return records
      // In MongoDB, area isn't natively there, we grouped by poleId but if area is missing, let's use poleId
      .filter((r) => (r.area || r.poleId) === areaId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [records, areaId]);

  const uniquePolesInArea = useMemo(() => {
    return new Set(areaRecords.map(r => r.poleId)).size;
  }, [areaRecords]);

  const latest = areaRecords[0];

  const displayRecords = useMemo(() => {
    if (!selectedDate) return areaRecords;
    return areaRecords.filter(r => {
      if (!r.createdAt) return false;
      const rDate = new Date(r.createdAt);
      const localDateStr = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}-${String(rDate.getDate()).padStart(2, '0')}`;
      return localDateStr === selectedDate;
    });
  }, [areaRecords, selectedDate]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Area Detail" />
        <div className="space-y-6"><SkeletonChart /><SkeletonList rows={5} /></div>
      </div>
    );
  }

  if (!latest) {
    return (
      <div>
        <PageHeader title="Area Not Found">
          <button onClick={() => navigate('/')} className="btn-ghost text-sm flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </PageHeader>
        <div className="glass-card p-12 text-center">
          <p className="text-surface-400">No records found for area <span className="font-mono text-white">{areaId}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={areaId} subtitle="Area Statistics & History">
        <button onClick={() => navigate(-1)} className="btn-ghost text-sm flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </PageHeader>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 animate-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-brand-500/10"><MapPin className="w-4 h-4 text-brand-400" /></div>
            <span className="text-xs text-surface-400 font-medium uppercase">Area Info</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-surface-500">Name</span><span className="font-medium text-surface-200">{areaId}</span></div>
            <div className="flex justify-between"><span className="text-surface-500">Total Poles</span><span className="text-surface-200">{uniquePolesInArea}</span></div>
          </div>
        </div>

        <div className="glass-card p-4 animate-in-delay-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-danger-500/10"><AlertTriangle className="w-4 h-4 text-danger-400" /></div>
            <span className="text-xs text-surface-400 font-medium uppercase">Thefts</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-surface-500">Total Alerts</span><span className="text-danger-400 font-bold">{areaRecords.length}</span></div>
            <div className="flex justify-between"><span className="text-surface-500">Since</span><span className="text-surface-200">{formatDate(areaRecords[areaRecords.length - 1]?.createdAt)}</span></div>
          </div>
        </div>

        <div className="glass-card p-4 animate-in-delay-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-warning-500/10"><Clock className="w-4 h-4 text-warning-400" /></div>
            <span className="text-xs text-surface-400 font-medium uppercase">Latest Activity</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-surface-500">Time</span><span className="text-surface-200">{timeAgo(latest.createdAt)}</span></div>
            <div className="flex justify-between"><span className="text-surface-500">At Pole</span><span className="font-mono text-xs text-surface-300">{latest.poleNumber || latest.poleId}</span></div>
          </div>
        </div>

        <div className="glass-card p-4 animate-in-delay-3 border-danger-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-danger-500/10">
              <AlertTriangle className="w-4 h-4 text-danger-400" />
            </div>
            <span className="text-xs text-surface-400 font-medium uppercase">Status</span>
          </div>
          <div className="space-y-2">
            <StatusBadge theft={true} status={latest.status} />
            <p className="text-xs text-surface-500 mt-2">Active monitoring</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-8">
        <PoleTheftScatterChart 
          records={areaRecords} 
          selectedDate={selectedDate}
          onPointClick={(date) => setSelectedDate(date === selectedDate ? null : date)}
        />
      </div>

      {/* History Table */}
      <div className="glass-card animate-in-delay-3">
        <div className="flex items-center justify-between p-5 pb-0">
          <div>
            <h3 className="text-sm font-semibold text-surface-300">History in {areaId}</h3>
            <p className="text-xs text-surface-500 mt-0.5">
              {selectedDate ? `Records for ${formatDate(selectedDate)}` : `Last ${Math.min(displayRecords.length, 20)} records`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate(null)}
                className="text-xs flex items-center gap-1 text-surface-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear Filter
              </button>
            )}
            {Object.keys(draftStatuses).length > 0 && (
              <button 
                onClick={handleUpdateAll}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-lg shadow-brand-500/20 transition-all animate-in"
              >
                {Object.keys(draftStatuses).length === 1 ? 'Update Selection' : 'Update Selections'}
              </button>
            )}
          </div>
        </div>
        <div className="p-5 overflow-x-auto">
          {displayRecords.length === 0 ? (
            <div className="text-center py-8 text-surface-500 text-sm">No records found for this date.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-surface-500 uppercase tracking-wider">
                  <th className="text-left py-3 px-3 font-medium">Pole ID</th>
                  <th className="text-left py-3 px-3 font-medium">Timestamp</th>
                  <th className="text-right py-3 px-3 font-medium">Input (A)</th>
                  <th className="text-right py-3 px-3 font-medium">Output (A)</th>
                  <th className="text-right py-3 px-3 font-medium">Diff (A)</th>
                  <th className="text-right py-3 px-3 font-medium">Loss %</th>
                  <th className="text-center py-3 px-3 font-medium min-w-[180px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayRecords.slice(0, 20).map((r, i) => {
                  const rDiff = Math.round((r.input - r.output) * 100) / 100;
                  const rLoss = getCurrentLoss(r.input, r.output);
                  return (
                    <tr key={i} className="table-row">
                      <td className="py-3 px-3 text-surface-200 font-mono text-xs font-semibold">{r.poleNumber || r.poleId}</td>
                      <td className="py-3 px-3 text-surface-300 font-mono text-xs">{formatDateTime(r.createdAt)}</td>
                      <td className="py-3 px-3 text-right text-surface-200">{r.input}</td>
                      <td className="py-3 px-3 text-right text-surface-200">{r.output}</td>
                      <td className="py-3 px-3 text-right font-semibold text-danger-400">{rDiff}</td>
                      <td className="py-3 px-3 text-right font-semibold text-danger-400">{rLoss}%</td>
                      <td className="py-3 px-3 text-center">
                        <StatusDropdown 
                          currentStatus={draftStatuses[r._id] || r.status || (r.theft ? 'Pending' : 'Normal')} 
                          onChange={(newStatus) => {
                            if (newStatus === (r.status || (r.theft ? 'Pending' : 'Normal'))) {
                              const newDrafts = { ...draftStatuses };
                              delete newDrafts[r._id];
                              setDraftStatuses(newDrafts);
                            } else {
                              setDraftStatuses(prev => ({ ...prev, [r._id]: newStatus }));
                            }
                          }} 
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
