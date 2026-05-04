import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  AlertTriangle,
  MapPin,
  Clock,
  ChevronRight,
  Filter,
  TrendingUp,
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import PageHeader from '../components/ui/PageHeader';
import TheftBarChart from '../components/charts/TheftBarChart';
import AreaTheftChart from '../components/charts/AreaTheftChart';
import { SkeletonCard, SkeletonList, SkeletonChart } from '../components/ui/Skeletons';
import {
  getUniquePoles,
  getTheftCountToday,
  getAreasAffected,
  getLastUpdated,
  getTheftsByDate,
  getStatsByArea,
  timeAgo,
  formatDateTime,
  getCurrentLoss,
  estimateFinancialLoss,
} from '../utils/dataUtils';

export default function Dashboard({ records, loading, newRecordTimestamps }) {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState('');

  // ─── Filter records by date ───
  const dateFilteredRecords = useMemo(() => {
    if (!dateFilter) return records;
    return records.filter((r) => {
      if (!r.createdAt) return false;
      const rDate = new Date(r.createdAt);
      const localDateStr = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}-${String(rDate.getDate()).padStart(2, '0')}`;
      return localDateStr === dateFilter;
    });
  }, [records, dateFilter]);
  // ─── Derived data ───
  const uniquePoles = useMemo(() => getUniquePoles(dateFilteredRecords), [dateFilteredRecords]);
  const theftToday = useMemo(() => getTheftCountToday(dateFilteredRecords), [dateFilteredRecords]);
  const areasAffected = useMemo(() => getAreasAffected(dateFilteredRecords), [dateFilteredRecords]);
  const lastUpdated = useMemo(() => getLastUpdated(dateFilteredRecords), [dateFilteredRecords]);
  const theftsByDate = useMemo(() => getTheftsByDate(dateFilteredRecords), [dateFilteredRecords]);
  const areaStats = useMemo(() => getStatsByArea(dateFilteredRecords), [dateFilteredRecords]);


  const recentEvents = useMemo(() => {
    return dateFilteredRecords.filter((r) => r.theft).slice(0, 5);
  }, [dateFilteredRecords]);

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          subtitle="Electricity Theft Detection System"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonList rows={6} />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Electricity Theft Detection System — Overview"
      >
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field text-sm py-2 px-3 w-40"
            title="Filter by Date"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="btn-ghost text-xs px-2 py-2"
            >
              Clear
            </button>
          )}
        </div>
      </PageHeader>

      {/* ─── Summary Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Poles"
          value={uniquePoles.length}
          subtitle="Monitored poles"
          icon={Zap}
          variant="brand"
        />
        <StatCard
          title="Theft Events Today"
          value={theftToday}
          subtitle={theftToday > 0 ? 'Requires attention' : 'All clear'}
          icon={AlertTriangle}
          variant={theftToday > 0 ? 'danger' : 'success'}
        />
        <StatCard
          title="Last Theft Time"
          value={lastUpdated ? timeAgo(lastUpdated) : '—'}
          subtitle={lastUpdated ? formatDateTime(lastUpdated) : 'No data'}
          icon={Clock}
          variant="brand"
        />
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-8">
        {/* Recent Events */}
        <div className="xl:col-span-2 glass-card animate-in-delay-1">
          <div className="flex items-center justify-between p-5 pb-0">
            <div>
              <h3 className="text-sm font-semibold text-surface-300">
                Recent Events
              </h3>
              <p className="text-xs text-surface-500 mt-0.5">Latest theft alerts</p>
            </div>
            <button
              onClick={() => navigate('/alerts')}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 space-y-1">
            {recentEvents.map((event, idx) => {
              const key = event.poleId + event.createdAt;
              const isNew = newRecordTimestamps?.has(key);

              return (
                <button
                  key={key + idx}
                  onClick={() => navigate(`/pole/${event.poleId}`)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-surface-800/50 group text-left
                    ${isNew ? 'highlight-new' : ''}`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                      ${event.theft
                        ? 'bg-danger-500/10 text-danger-400'
                        : 'bg-success-500/10 text-success-400'
                      }`}
                  >
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-medium text-surface-200 group-hover:text-white transition-colors">
                        {event.poleId}
                      </span>
                      <StatusBadge theft={event.theft} status={event.status} />
                    </div>
                    <p className="text-xs text-surface-500 truncate mt-0.5">
                      {event.area || 'Jabalpur'} · {timeAgo(event.createdAt)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-surface-600 group-hover:text-surface-400 transition-colors flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Theft Bar Chart */}
        <div className="xl:col-span-3">
          <TheftBarChart data={theftsByDate} />
        </div>
      </div>

      {/* ─── Area Stats Section ─── */}
      <div className="glass-card animate-in-delay-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 pb-0 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-surface-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-surface-500" />
              Area-wise Statistics
            </h3>
            <p className="text-xs text-surface-500 mt-0.5">
              Theft distribution across areas
            </p>
          </div>
        </div>

        <div className="p-5">
          <AreaTheftChart data={areaStats} />
        </div>
      </div>
    </div>
  );
}
