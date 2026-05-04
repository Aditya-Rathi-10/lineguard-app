import axios from 'axios';

const API_BASE_URL = 'https://esp-server-2yyj.onrender.com';

const API_URL = API_BASE_URL;

/**
 * Fetch all pole records from the real backend.
 */
export async function fetchAllRecords() {
  try {
    const response = await axios.get(`${API_URL}/theft-data`);
    const data = response.data;
    console.log("das", data)
    
    let recordsArray = data;
    if (data && typeof data === 'object' && Array.isArray(data.data)) {
      recordsArray = data.data;
    }

    // Check if the endpoint returned an array
    if (!Array.isArray(recordsArray)) {
      console.warn("Backend didn't return an array of records", recordsArray);
      return [];
    }

    // Normalize fields to match frontend expectations
    const normalizedData = recordsArray.map(record => ({
      ...record,
      input: Number(record.inCurrent !== undefined ? record.inCurrent : (record.input || 0)),
      output: Number(record.outCurrent !== undefined ? record.outCurrent : (record.output || 0)),
      createdAt: record.createdAt || record.timestamp || new Date().toISOString()
    }));

    // Sort newest-first based on createdAt
    return normalizedData.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } catch (error) {
    console.error('Error fetching theft data from backend:', error);
    throw error;
  }
}

/**
 * Update the status of multiple records
 */
export async function updateRecordStatuses(updates) {
  try {
    const response = await axios.post(`${API_URL}/update-status`, { poles: updates });
    return response.data;
  } catch (error) {
    console.error('Error updating statuses:', error);
    throw error;
  }
}

/**
 * Fetch records for a specific pole.
 */
export async function fetchPoleRecords(poleId) {
  const all = await fetchAllRecords();
  return all.filter((r) => r.poleId === poleId);
}
