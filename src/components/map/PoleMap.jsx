import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup } from 'react-leaflet';
import { formatDateTime, getCurrentLoss } from '../../utils/dataUtils';
import StatusBadge from '../ui/StatusBadge';
import { useNavigate } from 'react-router-dom';

export default function PoleMap({ poles, center, zoom = 12 }) {
  const navigate = useNavigate();

  if (!poles || poles.length === 0) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center justify-center h-[500px] text-surface-500 text-sm">
          No pole data available
        </div>
      </div>
    );
  }

  // Calculate center from data if not provided
  const mapCenter = center || [
    poles.reduce((sum, p) => sum + p.latitude, 0) / poles.length,
    poles.reduce((sum, p) => sum + p.longitude, 0) / poles.length,
  ];

  return (
    <div className="glass-card overflow-hidden animate-in">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '560px', width: '100%' }}
        className="rounded-2xl"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {poles.map((pole) => {
          const isTheft = pole.theft;
          const loss = getCurrentLoss(pole.input, pole.output);

          let poleColor = '#22c55e'; // Normal / Resolved = Green
          if (isTheft) {
            if (pole.status === 'Investigating') poleColor = '#eab308'; // Yellow
            else if (!pole.status || pole.status === 'Pending') poleColor = '#ef4444'; // Red
          }

          return (
            <React.Fragment key={pole.poleId}>
              <CircleMarker
                center={[pole.latitude, pole.longitude]}
                radius={isTheft ? 5 : 4}
                pathOptions={{
                  color: poleColor,
                  fillColor: poleColor,
                  fillOpacity: 0.9,
                  weight: 1.5,
                }}
              >
              <Popup>
                <div className="min-w-[200px] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-white">
                      {pole.poleId}
                    </span>
                    <StatusBadge theft={pole.theft} />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-surface-400">Address</span>
                      <span className="text-surface-200 text-right max-w-[140px]">
                        {pole.address}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-400">Input</span>
                      <span className="text-surface-200">{pole.input} A</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-400">Output</span>
                      <span className="text-surface-200">{pole.output} A</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-400">Loss</span>
                      <span className={`font-semibold ${isTheft ? 'text-danger-400' : 'text-success-400'}`}>
                        {loss}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-surface-700/50">
                      <span className="text-surface-400">Last updated:</span>
                      <span className="text-surface-300">{formatDateTime(pole.createdAt)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/pole/${pole.poleId}`)}
                    className="w-full mt-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                  >
                    View Details →
                  </button>
                </div>
              </Popup>
            </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
