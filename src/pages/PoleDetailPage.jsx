import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Hash, Navigation, Zap, AlertTriangle, X } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import StatusDropdown from '../components/ui/StatusDropdown';
import PoleTheftScatterChart from '../components/charts/PoleTheftScatterChart';
import { SkeletonChart, SkeletonList } from '../components/ui/Skeletons';
import { getPoleHistory, formatDateTime, getCurrentLoss, formatDate, timeAgo } from '../utils/dataUtils';

export default function PoleDetailPage({ records, loading, updateStatus }) {
  const { poleId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [draftStatuses, setDraftStatuses] = useState({});

  const handleUpdateAll = async () => {
    const updates = Object.entries(draftStatuses).map(([id, status]) => ({ id, _id: id, status }));
    try {
      await updateStatus(updates); // now this expects an array of updates
      setDraftStatuses({});
    } catch (e) {
      console.error('Update failed:', e);
    }
  };

  const poleRecords = useMemo(() => getPoleHistory(records, poleId), [records, poleId]);
  const latest = poleRecords[0];

  const displayRecords = useMemo(() => {
    if (!selectedDate) return poleRecords;
    return poleRecords.filter((r) => {
      if (!r.createdAt) return false;
      const rDate = new Date(r.createdAt);
      const localDateStr = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}-${String(rDate.getDate()).padStart(2, '0')}`;
      return localDateStr === selectedDate;
    });
  }, [poleRecords, selectedDate]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Pole Detail" />
        <div className="space-y-6"><SkeletonChart /><SkeletonList rows={5} /></div>
      </div>
    );
  }

  if (!latest) {
    return (
      <div>
        <PageHeader title="Pole Not Found">
          <button onClick={() => navigate('/')} className="btn-ghost text-sm flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </PageHeader>
        <div className="glass-card p-12 text-center">
          <p className="text-surface-400">No records found for pole <span className="font-mono text-white">{poleId}</span></p>
        </div>
      </div>
    );
  }

  const loss = getCurrentLoss(latest.input, latest.output);
  const diff = Math.round((latest.input - latest.output) * 100) / 100;

  return (
    <div>
      <PageHeader title={poleId} subtitle={latest.address}>
        <button onClick={() => navigate(-1)} className="btn-ghost text-sm flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </PageHeader>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 animate-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-brand-500/10"><Hash className="w-4 h-4 text-brand-400" /></div>
            <span className="text-xs text-surface-400 font-medium uppercase">Pole Info</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-surface-500">ID</span><span className="font-mono text-surface-200">{latest.poleId}</span></div>
            <div className="flex justify-between"><span className="text-surface-500">Number</span><span className="text-surface-200">{latest.poleNumber}</span></div>
            <div className="flex justify-between"><span className="text-surface-500">Area</span><span className="text-surface-200">{latest.area}</span></div>
          </div>
        </div>

        <div className="glass-card p-4 animate-in-delay-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-success-500/10"><MapPin className="w-4 h-4 text-success-400" /></div>
            <span className="text-xs text-surface-400 font-medium uppercase">Location</span>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-surface-200 text-xs leading-relaxed">{latest.address}</p>
            <div className="flex justify-between"><span className="text-surface-500">Lat</span><span className="font-mono text-xs text-surface-300">{latest.latitude.toFixed(4)}</span></div>
            <div className="flex justify-between"><span className="text-surface-500">Lng</span><span className="font-mono text-xs text-surface-300">{latest.longitude.toFixed(4)}</span></div>
          </div>
        </div>

        <div className="glass-card p-4 animate-in-delay-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-warning-500/10"><Zap className="w-4 h-4 text-warning-400" /></div>
            <span className="text-xs text-surface-400 font-medium uppercase">Current</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-surface-500">Input</span><span className="text-surface-200 font-semibold">{latest.input} A</span></div>
            <div className="flex justify-between"><span className="text-surface-500">Output</span><span className="text-surface-200 font-semibold">{latest.output} A</span></div>
            <div className="flex justify-between"><span className="text-surface-500">Difference</span><span className={`font-bold ${latest.theft ? 'text-danger-400' : 'text-success-400'}`}>{diff} A</span></div>
          </div>
        </div>

        <div className={`glass-card p-4 animate-in-delay-3 flex flex-col ${latest.theft ? 'border-danger-500/30' : 'border-success-500/30'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${latest.theft ? 'bg-danger-500/10' : 'bg-success-500/10'}`}>
                <AlertTriangle className={`w-4 h-4 ${latest.theft ? 'text-danger-400' : 'text-success-400'}`} />
              </div>
              <span className="text-xs text-surface-400 font-medium uppercase">Status</span>
            </div>
            <StatusBadge theft={latest.theft} status={latest.status} />
          </div>
          
          <div className="flex-1 flex flex-col justify-end space-y-2">
            <p className="text-xs text-surface-400">
              Last updated {timeAgo(latest.createdAt)}
            </p>

            <div className="flex justify-between text-sm mt-2 pt-3 border-t border-surface-800/50">
              <span className="text-surface-500">Loss</span>
              <span className={`font-bold ${loss > 10 ? 'text-danger-400' : 'text-success-400'}`}>{loss}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-8">
        <PoleTheftScatterChart 
          records={poleRecords} 
          selectedDate={selectedDate}
          onPointClick={(date) => setSelectedDate(date === selectedDate ? null : date)}
        />
      </div>

      {/* History Table */}
      <div className="glass-card animate-in-delay-3">
        <div className="flex items-center justify-between p-5 pb-0">
          <div>
            <h3 className="text-sm font-semibold text-surface-300">History</h3>
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
                  <th className="text-left py-3 px-3 font-medium">Timestamp</th>
                  <th className="text-right py-3 px-3 font-medium">Input (A)</th>
                  <th className="text-right py-3 px-3 font-medium">Output (A)</th>
                  <th className="text-right py-3 px-3 font-medium">Diff (A)</th>
                  <th className="text-right py-3 px-3 font-medium">Loss %</th>
                  <th className="text-center py-3 px-3 font-medium min-w-[180px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayRecords.map((r, idx) => {
                  const rLoss = getCurrentLoss(r.input, r.output);
                  return (
                    <tr key={idx} className="border-b border-surface-800/30 hover:bg-surface-800/20 transition-colors">
                      <td className="py-3 px-3 text-surface-300">{formatDateTime(r.createdAt)}</td>
                      <td className="py-3 px-3 text-right text-surface-200">{r.input}</td>
                      <td className="py-3 px-3 text-right text-surface-200">{r.output}</td>
                      <td className="py-3 px-3 text-right font-mono text-surface-300">
                        {(r.input - r.output).toFixed(1)}
                      </td>
                      <td className={`py-3 px-3 text-right font-semibold ${rLoss > 10 ? 'text-danger-400' : 'text-success-400'}`}>{rLoss}%</td>
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
