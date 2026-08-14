import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { sampleLocations } from "../lib/api";

// CARTO basemaps (CDN-backed, theme-matched). More reliable at a booth than the
// public OSM tile servers, and there's a native dark variant so the map matches
// the app's light/dark theme instead of a filtered hack.
const TILES = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// An actual map (Leaflet) of where the dataset has dishes. We sample the
// collection server-side and plot the coverage as dots, so the preview is
// honest: you click a spot that actually has data. Uses circle markers only
// (no image assets), so nothing breaks when Vite bundles it.
function LocationMap({ location, onPick, theme, results }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tileRef = useRef(null);
  const selectionRef = useRef(null); // { marker, circle }
  const resultsRef = useRef(null); // layer of markers for the current results
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  // Init the map once.
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    let cancelled = false;

    const map = L.map(containerRef.current, {
      worldCopyJump: true,
      scrollWheelZoom: false, // don't hijack page scroll; users zoom with +/- or double-click
    }).setView([50, 12], 4);
    mapRef.current = map;

    tileRef.current = L.tileLayer(theme === "dark" ? TILES.dark : TILES.light, {
      attribution: TILE_ATTR,
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (e) => onPickRef.current?.(e.latlng.lat, e.latlng.lng));

    // Leaflet miscalculates size when its container animates/lays out late.
    setTimeout(() => map.invalidateSize(), 0);

    // Load and plot the coverage dots.
    sampleLocations()
      .then(({ points = [] }) => {
        if (cancelled || mapRef.current !== map || !points.length) return;
        const layer = L.layerGroup();
        const latlngs = [];
        for (const p of points) {
          latlngs.push([p.lat, p.lon]);
          L.circleMarker([p.lat, p.lon], {
            radius: Math.min(3 + Math.log2(p.count + 1), 10),
            color: "#ec4899",
            weight: 0,
            fillColor: "#ec4899",
            fillOpacity: 0.55,
            interactive: false,
          }).addTo(layer);
        }
        layer.addTo(map);
        if (latlngs.length) {
          map.fitBounds(L.latLngBounds(latlngs).pad(0.15), { maxZoom: 6 });
        }
      })
      .catch((err) => console.error("coverage sample failed", err));

    return () => {
      cancelled = true;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Swap the basemap when the app theme changes.
  useEffect(() => {
    if (tileRef.current) {
      tileRef.current.setUrl(theme === "dark" ? TILES.dark : TILES.light);
    }
  }, [theme]);

  // Plot the current search results so the map visibly reacts to each search.
  // Amber markers (distinct from the pink coverage dots and the blue pin).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (resultsRef.current) {
      map.removeLayer(resultsRef.current);
      resultsRef.current = null;
    }

    const layer = L.layerGroup();
    const latlngs = [];
    for (const r of results || []) {
      const loc = r.restaurant && r.restaurant.location;
      const lat = loc && loc.latitude;
      const lon = loc && loc.longitude;
      if (typeof lat !== "number" || typeof lon !== "number") continue;
      latlngs.push([lat, lon]);
      L.circleMarker([lat, lon], {
        radius: 6,
        color: "#ffffff",
        weight: 1.5,
        fillColor: "#f59e0b",
        fillOpacity: 0.95,
      })
        .bindTooltip(r.restaurant.name ? `${r.name} · ${r.restaurant.name}` : r.name)
        .addTo(layer);
    }
    if (!latlngs.length) return;
    layer.addTo(map);
    resultsRef.current = layer;

    // Pan/zoom to the results, unless a location pin already controls the view.
    if (!location) {
      map.fitBounds(L.latLngBounds(latlngs).pad(0.25), { maxZoom: 11 });
    }
  }, [results, location]);

  // Reflect the selected location: a pin + its search radius.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!location) {
      if (selectionRef.current) {
        map.removeLayer(selectionRef.current.marker);
        map.removeLayer(selectionRef.current.circle);
        selectionRef.current = null;
      }
      return;
    }

    const latlng = [location.latitude, location.longitude];
    const meters = (location.radius_km || 25) * 1000;

    if (!selectionRef.current) {
      const marker = L.circleMarker(latlng, {
        radius: 7,
        color: "#2563eb",
        weight: 2,
        fillColor: "#2563eb",
        fillOpacity: 0.9,
      }).addTo(map);
      const circle = L.circle(latlng, {
        radius: meters,
        color: "#2563eb",
        weight: 1,
        fillColor: "#2563eb",
        fillOpacity: 0.08,
      }).addTo(map);
      selectionRef.current = { marker, circle };
    } else {
      selectionRef.current.marker.setLatLng(latlng);
      selectionRef.current.circle.setLatLng(latlng).setRadius(meters);
    }
    map.setView(latlng, Math.max(map.getZoom(), 8));
  }, [location]);

  return (
    <div
      className={`location-map ${theme}`}
      ref={containerRef}
      role="application"
      aria-label="Map of where dishes are available. Click to search near a spot"
    />
  );
}

export default LocationMap;
