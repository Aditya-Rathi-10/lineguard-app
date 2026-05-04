/**
 * Data utility functions for aggregating and transforming pole records.
 * All functions are pure — no side effects.
 */

/**
 * Get unique poles from all records (latest record per pole).
 */
export function getUniquePoles(records) {
  const poleMap = new Map();
  // Records should be sorted newest-first
  for (const record of records) {
    if (!poleMap.has(record.poleId)) {
      poleMap.set(record.poleId, record);
    }
  }
  return Array.from(poleMap.values());
}

/**
 * Count theft events that occurred today.
 */
export function getTheftCountToday(records) {
  const todayDate = new Date();
  const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  
  return records.filter((r) => {
    if (!r.theft || !r.createdAt) return false;
    const rDate = new Date(r.createdAt);
    const rStr = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}-${String(rDate.getDate()).padStart(2, '0')}`;
    return rStr === todayStr;
  }).length;
}

/**
 * Get unique areas (now poles) that have theft events (latest data).
 */
export function getAreasAffected(records) {
  const poles = new Set();
  for (const r of records) {
    if (r.theft) {
      poles.add(r.poleId);
    }
  }
  return poles.size;
}

/**
 * Get the most recent timestamp from all records.
 */
export function getLastUpdated(records) {
  if (records.length === 0) return null;
  return records.reduce((latest, r) =>
    new Date(r.createdAt) > new Date(latest.createdAt) ? r : latest
  ).createdAt;
}

/**
 * Group theft events by date for the bar chart.
 * Returns sorted array: [{ date, thefts, total }]
 */
export function getTheftsByDate(records) {
  const dateMap = new Map();

  for (const r of records) {
    if (!r.createdAt) continue;
    const rDate = new Date(r.createdAt);
    // Group by local date string YYYY-MM-DD
    const date = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}-${String(rDate.getDate()).padStart(2, '0')}`;
    
    if (!dateMap.has(date)) {
      dateMap.set(date, { date, thefts: 0, total: 0 });
    }
    const entry = dateMap.get(date);
    entry.total += 1;
    if (r.theft) {
      entry.thefts += 1;
    }
  }

  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
}

/**
 * Group records by pole with theft counts (since schema has no area).
 * Returns sorted array (highest theft first): [{ area, thefts, total }]
 */
export function getStatsByArea(records) {
  const areaMap = new Map();

  for (const r of records) {
    // Fallback to poleId for grouping if area is missing
    const areaKey = r.area || r.poleId;
    if (!areaMap.has(areaKey)) {
      areaMap.set(areaKey, { area: areaKey, thefts: 0, total: 0 });
    }
    const entry = areaMap.get(areaKey);
    entry.total += 1;
    if (r.theft) {
      entry.thefts += 1;
    }
  }

  return Array.from(areaMap.values()).sort((a, b) => b.thefts - a.thefts);
}

/**
 * Get all theft records sorted by most recent.
 */
export function getTheftAlerts(records) {
  return records
    .filter((r) => r.theft)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Get records for a specific pole, sorted by most recent.
 */
export function getPoleHistory(records, poleId) {
  return records
    .filter((r) => r.poleId === poleId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Format a timestamp to a human-friendly relative time.
 */
export function timeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  let seconds = Math.floor((now - then) / 1000);
  
  if (seconds < 0) seconds = 0; // Prevent future times from showing up as negative

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  const day = String(then.getDate()).padStart(2, '0');
  const month = String(then.getMonth() + 1).padStart(2, '0');
  const year = then.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Format a timestamp to a readable date-time string.
 */
export function formatDateTime(timestamp) {
  const d = new Date(timestamp);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

/**
 * Format only the date portion.
 */
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Get bar color based on theft count intensity.
 */
export function getTheftIntensityColor(count) {
  if (count <= 2) return '#22c55e';    // green
  if (count <= 5) return '#fbbf24';    // yellow
  return '#ef4444';                     // red
}

/**
 * Calculate current difference percentage.
 */
export function getCurrentLoss(input, output) {
  if (input === 0) return 0;
  return Math.round(((input - output) / input) * 10000) / 100;
}

/**
 * Estimate financial loss in INR based on current difference.
 * Assume 1A loss roughly equates to ₹46/day.
 */
export function estimateFinancialLoss(records) {
  let totalLossA = 0;
  for (const r of records) {
    if (r.theft) {
      totalLossA += (r.input - r.output);
    }
  }
  return Math.round(totalLossA * 46);
}

/**
 * Calculate a predictive risk score (0-100) based on theft frequency and severity.
 */
export function calculateRiskScore(poleRecords) {
  if (!poleRecords || poleRecords.length === 0) return 0;
  
  let score = 10; // Base score
  // Frequency impact
  score += poleRecords.length * 15;
  
  // Severity impact (from latest record)
  const latest = poleRecords[0];
  if (latest) {
    const lossPct = getCurrentLoss(latest.input, latest.output);
    score += lossPct * 2;
  }
  
  return Math.min(Math.round(score), 100);
}
