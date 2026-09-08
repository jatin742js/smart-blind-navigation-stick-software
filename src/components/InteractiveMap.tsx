import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Crosshair, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { LocationPoint } from '../types';

interface InteractiveMapProps {
  currentLocation: LocationPoint | null;
  locationTrail?: LocationPoint[];
  isLiveTrackingActive?: boolean;
  onToggleLiveTracking?: () => void;
  heightClass?: string;
  zoomLevel?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  currentLocation,
  locationTrail = [],
  isLiveTrackingActive = true,
  onToggleLiveTracking,
  heightClass = 'h-[420px]',
  zoomLevel = 16,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const initialLat = currentLocation?.latitude || 30.3165;
    const initialLng = currentLocation?.longitude || 78.0322;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: zoomLevel,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark-themed OpenStreetMap tiles (CartoDB dark or standard OSM)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    mapInstanceRef.current = map;

    // ResizeObserver to ensure Leaflet recalculates dimensions when container resizes or device rotates
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Marker, Accuracy, and Trail Polyline when location changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!currentLocation || currentLocation.latitude === null || currentLocation.longitude === null) {
      return;
    }

    const lat = currentLocation.latitude;
    const lng = currentLocation.longitude;
    const accuracy = currentLocation.accuracyMeters || 5;

    // Custom pulsing SVG icon for the Smart Stick
    const customIcon = L.divIcon({
      className: 'smartstick-marker-container',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-amber-500/30 animate-ping"></div>
          <div class="relative w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-slate-950 font-bold text-[11px]">
            🦯
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      markerRef.current.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #1e293b;">
          <strong>🦯 ESP32 Smart Stick</strong><br/>
          Accuracy: ±${accuracy}m<br/>
          Time: ${new Date(currentLocation.recordedAt).toLocaleTimeString()}
        </div>
      `);
    }

    // Update accuracy radius circle
    if (circleRef.current) {
      circleRef.current.setLatLng([lat, lng]);
      circleRef.current.setRadius(accuracy);
    } else {
      circleRef.current = L.circle([lat, lng], {
        radius: accuracy,
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.15,
        weight: 1.5,
      }).addTo(map);
    }

    // Pan map to latest coordinate if live tracking active
    if (isLiveTrackingActive) {
      map.panTo([lat, lng], { animate: true, duration: 0.8 });
    }

    // Update historical breadcrumbs trail
    if (locationTrail.length > 1) {
      const latlngs: [number, number][] = locationTrail
        .filter(pt => pt.latitude !== null && pt.longitude !== null)
        .map(pt => [pt.latitude, pt.longitude]);

      if (polylineRef.current) {
        polylineRef.current.setLatLngs(latlngs);
      } else {
        polylineRef.current = L.polyline(latlngs, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.75,
          dashArray: '4, 8',
        }).addTo(map);
      }
    }
  }, [currentLocation, locationTrail, isLiveTrackingActive]);

  const handleCenter = () => {
    if (mapInstanceRef.current && currentLocation) {
      mapInstanceRef.current.setView([currentLocation.latitude, currentLocation.longitude], 17, {
        animate: true,
      });
    }
  };

  const hasCoordinates = currentLocation && currentLocation.latitude !== null && currentLocation.longitude !== null;
  const googleMapsLink = hasCoordinates
    ? `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`
    : 'https://www.google.com/maps';

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
      
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Live Status Badge */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur border border-slate-200 text-xs shadow-md">
          <span className={`w-2.5 h-2.5 rounded-full ${isLiveTrackingActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <span className="font-semibold text-slate-800">
            {isLiveTrackingActive ? 'LIVE GPS ACTIVE' : 'LIVE GPS PAUSED'}
          </span>
          {onToggleLiveTracking && (
            <button
              onClick={onToggleLiveTracking}
              className="ml-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-amber-700 border border-slate-300 transition"
            >
              {isLiveTrackingActive ? 'Pause' : 'Resume'}
            </button>
          )}
        </div>

        {/* Center & External Link buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={handleCenter}
            title="Recenter Map on Smart Stick"
            className="p-2 rounded-xl bg-white/95 hover:bg-slate-50 backdrop-blur border border-slate-200 text-slate-700 shadow-md transition"
          >
            <Crosshair className="w-4 h-4 text-amber-600" />
          </button>

          <a
            href={googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Maps"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-slate-50 backdrop-blur border border-slate-200 text-xs font-semibold text-slate-700 shadow-md transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Google Maps</span>
          </a>
        </div>

      </div>

      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} z-0`} />

      {/* Bottom Telemetry Overlay */}
      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 z-[1000] pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur border border-slate-200 p-2 sm:p-3 rounded-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              {hasCoordinates ? (
                <>
                  <p className="font-semibold text-slate-800 text-[11px] sm:text-xs truncate">
                    Lat: {currentLocation.latitude.toFixed(5)}, Lng: {currentLocation.longitude.toFixed(5)}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">
                    ±{currentLocation.accuracyMeters ?? 4.5}m • {currentLocation.speedKmh ?? 0} km/h
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-1 text-amber-800 font-semibold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">GPS location unavailable</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right text-[10px] sm:text-[11px] text-slate-500 font-mono">
            <span>Sync: </span>
            <strong className="text-slate-800">
              {currentLocation ? new Date(currentLocation.recordedAt).toLocaleTimeString() : 'Waiting for GPS...'}
            </strong>
          </div>

        </div>
      </div>

    </div>
  );
};
