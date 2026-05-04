import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAllRecords, updateRecordStatuses } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Custom hook that polls the API at a given interval and tracks data freshness.
 * @param {number} intervalMs - Polling interval in milliseconds (default 8000)
 */
export function usePollingData(intervalMs = 8000) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const prevRecordsRef = useRef([]);

  const [statusOverrides, setStatusOverrides] = useState({});

  const updateStatus = useCallback(async (updatesArray) => {
    // Optimistic update
    setStatusOverrides((prev) => {
      const next = { ...prev };
      updatesArray.forEach(u => { next[u.id] = u.status; });
      return next;
    });
    
    // Call backend API
    try {
      await updateRecordStatuses(updatesArray);
      toast.success(
        updatesArray.length === 1 
          ? `Status updated successfully` 
          : `${updatesArray.length} statuses updated successfully`
      );
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Unknown error";
      toast.error(`Failed to update status: ${errorMessage}`);
      throw err;
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchAllRecords();
      prevRecordsRef.current = records;
      setRecords(data);
      setLastFetch(new Date());
      setSecondsAgo(0);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [records]);

  // Initial fetch + polling
  useEffect(() => {
    loadData();
    const poller = setInterval(loadData, intervalMs);
    return () => clearInterval(poller);
  }, [loadData, intervalMs]);

  // Seconds-ago ticker
  useEffect(() => {
    const ticker = setInterval(() => {
      setSecondsAgo((prev) => prev + 60);
    }, 60000);
    return () => clearInterval(ticker);
  }, []);

  const processedRecords = records.map((r) => {
    if (statusOverrides[r._id]) {
      return { ...r, status: statusOverrides[r._id] };
    }
    return r;
  });

  // Detect new record IDs (by comparing timestamps)
  const newRecordTimestamps = new Set();
  if (prevRecordsRef.current.length > 0) {
    const prevTimestamps = new Set(prevRecordsRef.current.map((r) => r.poleId + r.createdAt));
    for (const r of processedRecords) {
      const key = r.poleId + r.createdAt;
      if (!prevTimestamps.has(key)) {
        newRecordTimestamps.add(key);
      }
    }
  }

  return {
    records: processedRecords,
    loading,
    error,
    lastFetch,
    secondsAgo,
    newRecordTimestamps,
    refresh: loadData,
    updateStatus,
  };
}
