import { useMemo, useState } from 'react';
import { Map as MapIcon, Filter } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import PoleMap from '../components/map/PoleMap';
import { SkeletonMap } from '../components/ui/Skeletons';
import { getUniquePoles } from '../utils/dataUtils';

export default function MapPage({ records, loading }) {
  const [areaFilter, setAreaFilter] = useState('all');

  const uniquePoles = useMemo(() => getUniquePoles(records), [records]);

  const areas = useMemo(() => {
    return [...new Set(records.map((r) => r.area || r.poleId))].sort();
  }, [records]);

  const filteredPoles = useMemo(() => {
    if (areaFilter === 'all') return uniquePoles;
    return uniquePoles.filter((p) => (p.area || p.poleId) === areaFilter);
  }, [uniquePoles, areaFilter]);

  const theftCount = filteredPoles.filter((p) => p.theft).length;

  if (loading) {
    return (
      <div>
        <PageHeader title="Map View" subtitle="Geographic pole distribution" />
        <SkeletonMap />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Map View"
        subtitle="Geographic distribution of all monitored poles"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-surface-500" />
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="input-field text-xs py-1.5 w-48"
            id="map-area-filter"
          >
            <option value="all">All Areas</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      </PageHeader>

      {/* Legend / Stats strip */}
      <div className="flex items-center gap-6 mb-4 px-1">
        <div className="flex items-center gap-2 text-xs text-surface-400">
          <span className="w-3 h-3 rounded-full bg-danger-500" />
          <span>Theft Detected ({theftCount})</span>
        </div>
        <span className="text-xs text-surface-600">
          {filteredPoles.length} poles shown
        </span>
      </div>

      <PoleMap poles={filteredPoles} />
    </div>
  );
}
