import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import AlertsPage from './pages/AlertsPage';
import PoleDetailPage from './pages/PoleDetailPage';
import AreaDetailPage from './pages/AreaDetailPage';
import { usePollingData } from './hooks/usePollingData';
import { ThemeProvider } from './ThemeContext';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const {
    records,
    loading,
    secondsAgo,
    newRecordTimestamps,
    refresh,
    updateStatus,
  } = usePollingData(8000);

  return (
    <ThemeProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#1e293b',
            },
          },
        }}
      />
      <Layout secondsAgo={secondsAgo} onRefresh={refresh}>
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                records={records}
                loading={loading}
                newRecordTimestamps={newRecordTimestamps}
              />
            }
          />
          <Route
            path="/map"
            element={<MapPage records={records} loading={loading} />}
          />
          <Route
            path="/alerts"
            element={<AlertsPage records={records} loading={loading} updateStatus={updateStatus} />}
          />
          <Route
            path="/pole/:poleId"
            element={<PoleDetailPage records={records} loading={loading} updateStatus={updateStatus} />}
          />
          <Route
            path="/area/:areaId"
            element={<AreaDetailPage records={records} loading={loading} updateStatus={updateStatus} />}
          />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}
