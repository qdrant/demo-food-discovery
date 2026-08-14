import { useEffect, useState } from "react";

import "./App.css";

import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import DiscoveryGrid from "./components/DiscoveryGrid";
import LoadingState from "./components/LoadingState";
import EmptyState from "./components/EmptyState";
import Footer from "./components/Footer";
import HowItWorksModal from "./components/HowItWorksModal";
import FoodDetailModal from "./components/FoodDetailModal";
import LocationMap from "./components/LocationMap";

import { search } from "./lib/api";

const EXAMPLES = ["sushi", "pizza", "vegan salad", "burger", "ramen", "dessert"];

// Cities present in the Wolt dataset, ordered west -> east (the western ones
// are the closest to the US, so they lead and the "Near me" fallback favors them).
const CITIES = [
  { name: "Cologne", lat: 50.9375, lon: 6.9603 },
  { name: "Hamburg", lat: 53.5511, lon: 9.9937 },
  { name: "Oslo", lat: 59.9139, lon: 10.7522 },
  { name: "Berlin", lat: 52.52, lon: 13.405 },
  { name: "Prague", lat: 50.0755, lon: 14.4378 },
  { name: "Budapest", lat: 47.4979, lon: 19.0402 },
  { name: "Athens", lat: 37.9838, lon: 23.7275 },
  { name: "Tel Aviv", lat: 32.0853, lon: 34.7818 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
];
const RADII = [10, 25, 50];

function App() {
  const [theme, setTheme] = useState("light");
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState([]);
  // Keep the full items (not just ids) so likes/dislikes can be shown + removed.
  const [likedItems, setLikedItems] = useState([]);
  const [dislikedItems, setDislikedItems] = useState([]);
  const [newStrategy, setNewStrategy] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isHowOpen, setIsHowOpen] = useState(false);
  const [detailFood, setDetailFood] = useState(null);
  const [location, setLocation] = useState(null); // { name, latitude, longitude, radius_km } | null
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState("");
  const [error, setError] = useState("");

  async function runSearch(liked, disliked, text, strategy, loc = location) {
    setLoading(true);
    setHasSearched(true);
    setError("");
    try {
      const results = await search({
        positive: liked.map((f) => f.id),
        negative: disliked.map((f) => f.id),
        queries: text && text.trim() ? [text.trim()] : [],
        strategy: strategy ? "best_score" : "average_vector",
        location: loc
          ? { latitude: loc.latitude, longitude: loc.longitude, radius_km: loc.radius_km }
          : null,
      });
      setFoods(results);
    } catch (err) {
      console.error(err);
      // Without this the previous results stay on screen and a dead backend
      // looks like a working demo showing stale cards.
      setError("Search is unavailable right now. Check the API and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch([], [], "", newStrategy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A spot the user clicked on the map. Snap the name to the nearest covered
  // city so the label reads sensibly ("near Berlin") instead of raw coordinates.
  function pickLocation(lat, lon) {
    const near = nearestCity(lat, lon);
    const loc = {
      name: near.city.name,
      latitude: lat,
      longitude: lon,
      radius_km: location?.radius_km || 25,
    };
    setLocation(loc);
    setLocationNote(
      near.km > 60
        ? `Nearest covered area is ${near.city.name} (~${near.km} km away). You may see few or no dishes here.`
        : ""
    );
    runSearch(likedItems, dislikedItems, query, newStrategy, loc);
  }

  function clearLocation() {
    setLocation(null);
    runSearch(likedItems, dislikedItems, query, newStrategy, null);
  }

  function changeRadius(km) {
    if (!location) return;
    const loc = { ...location, radius_km: km };
    setLocation(loc);
    runSearch(likedItems, dislikedItems, query, newStrategy, loc);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationNote("Geolocation isn't available in this browser.");
      return;
    }
    setLocating(true);
    setLocationNote("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        // Snap straight to the closest covered area (the dataset has no US data),
        // so the user always gets results instead of an empty "near me".
        const near = nearestCity(pos.coords.latitude, pos.coords.longitude);
        const c = near.city;
        const loc = {
          name: c.name,
          latitude: c.lat,
          longitude: c.lon,
          radius_km: location?.radius_km || 25,
        };
        setLocation(loc);
        setLocationNote(
          near.km > 150
            ? `${c.name} is the closest covered area to you (~${near.km} km away).`
            : ""
        );
        runSearch(likedItems, dislikedItems, query, newStrategy, loc);
      },
      () => {
        setLocating(false);
        setLocationNote("Couldn't get your location. Pick a city.");
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }

  // Nearest covered city to a point (haversine), for the empty-results hint.
  function nearestCity(lat, lon) {
    const rad = (d) => (d * Math.PI) / 180;
    let best = null;
    let bestD = Infinity;
    for (const c of CITIES) {
      const dLat = rad(c.lat - lat);
      const dLon = rad(c.lon - lon);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(lat)) * Math.cos(rad(c.lat)) * Math.sin(dLon / 2) ** 2;
      const d = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    return { city: best, km: Math.round(bestD) };
  }

  function handleReaction(food, reaction) {
    const liked = likedItems.filter((f) => f.id !== food.id);
    const disliked = dislikedItems.filter((f) => f.id !== food.id);
    if (reaction === "like") liked.unshift(food);
    if (reaction === "dislike") disliked.unshift(food);
    setLikedItems(liked);
    setDislikedItems(disliked);
    runSearch(liked, disliked, query, newStrategy);
  }

  // Remove a single liked/disliked dish from the taste profile.
  function removeTaste(id) {
    const liked = likedItems.filter((f) => f.id !== id);
    const disliked = dislikedItems.filter((f) => f.id !== id);
    setLikedItems(liked);
    setDislikedItems(disliked);
    runSearch(liked, disliked, query, newStrategy);
  }

  function onTextSearch(text = query) {
    setQuery(text);
    runSearch(likedItems, dislikedItems, text, newStrategy);
  }

  function toggleStrategy() {
    const next = !newStrategy;
    setNewStrategy(next);
    runSearch(likedItems, dislikedItems, query, next);
  }

  function reset() {
    setLikedItems([]);
    setDislikedItems([]);
    setQuery("");
    setLocation(null);
    runSearch([], [], "", newStrategy, null);
  }

  const likedIds = likedItems.map((f) => f.id);
  const dislikedIds = dislikedItems.map((f) => f.id);
  const tasteCount = likedItems.length + dislikedItems.length;
  // A match score only means something when there's an actual request driving it
  // (a text query or a like/dislike). The default/random browse grid has no query,
  // so its scores are meaningless "1.000"s — hide the badge there.
  const scored = Boolean(query.trim() || tasteCount > 0);

  return (
    <main className={`app ${theme}`}>
      <Header
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onOpenHowItWorks={() => setIsHowOpen(true)}
      />

      <section className="page">
        <div className="search-panel">
          <div className="eyebrow">Vector food discovery</div>

          <h1>Food Discovery</h1>

          <p>
            Search by craving, then like or dislike dishes. Qdrant's
            Recommendation API refines results from your likes and dislikes in
            real time.
          </p>

          <SearchBar
            query={query}
            setQuery={setQuery}
            onSearch={() => onTextSearch(query)}
            onExampleSearch={onTextSearch}
            loading={loading}
            examples={EXAMPLES}
          />

          <div className="location-row">
            <span className="location-label">Near</span>
            <div className="location-chips">
              <button
                className={!location ? "active" : ""}
                onClick={clearLocation}
              >
                Anywhere
              </button>
              <button onClick={useMyLocation} disabled={locating}>
                {locating ? "Locating…" : "📍 Near me"}
              </button>
            </div>
            {location && (
              <select
                className="radius-select"
                value={location.radius_km}
                onChange={(e) => changeRadius(Number(e.target.value))}
              >
                {RADII.map((km) => (
                  <option key={km} value={km}>
                    within {km} km
                  </option>
                ))}
              </select>
            )}
          </div>

          <LocationMap
            location={location}
            onPick={pickLocation}
            theme={theme}
            results={foods}
          />
          <p className="map-hint">
            {location
              ? `Searching within ${location.radius_km} km of ${location.name}. Amber points are your results.`
              : "Amber points are your current results; pink dots show the wider dataset. Click the map to search near a spot."}
          </p>

          {locationNote && <p className="location-note">{locationNote}</p>}

          <div className="discovery-controls">
            <label className="strategy-toggle">
              <input
                type="checkbox"
                checked={newStrategy}
                onChange={toggleStrategy}
              />
              <span>Best-score strategy</span>
            </label>

            {tasteCount > 0 && (
              <button className="reset-button" onClick={reset}>
                Reset taste
              </button>
            )}
          </div>

          {tasteCount > 0 && (
            <div className="taste-lists">
              {likedItems.length > 0 && (
                <TasteRow label="Liked" tone="liked" items={likedItems} onRemove={removeTaste} />
              )}
              {dislikedItems.length > 0 && (
                <TasteRow label="Disliked" tone="disliked" items={dislikedItems} onRemove={removeTaste} />
              )}
            </div>
          )}
        </div>

        {error && <div className="error-state">{error}</div>}

        {foods.length > 0 ? (
          <div className={loading ? "is-loading" : ""}>
            <DiscoveryGrid
              foods={foods}
              likedIds={likedIds}
              dislikedIds={dislikedIds}
              onReaction={handleReaction}
              onOpenDetail={setDetailFood}
              scored={scored}
            />
          </div>
        ) : loading ? (
          <LoadingState />
        ) : (
          hasSearched && <EmptyState tasteCount={tasteCount} onReset={reset} />
        )}
      </section>

      <Footer theme={theme} />

      {isHowOpen && <HowItWorksModal onClose={() => setIsHowOpen(false)} />}

      {detailFood && (
        <FoodDetailModal
          food={detailFood}
          onClose={() => setDetailFood(null)}
          onReaction={handleReaction}
          scored={scored}
        />
      )}
    </main>
  );
}

// Removable chips for the liked / disliked dishes.
function TasteRow({ label, tone, items, onRemove }) {
  return (
    <div className={`taste-row ${tone}`}>
      <span className="taste-row-label">{label}</span>
      <div className="taste-chips">
        {items.map((f) => (
          <span key={f.id} className="taste-chip">
            {f.image_url && <img src={f.image_url} alt="" />}
            <span className="taste-chip-name">{f.name}</span>
            <button
              className="taste-chip-remove"
              aria-label={`Remove ${f.name}`}
              onClick={() => onRemove(f.id)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default App;
