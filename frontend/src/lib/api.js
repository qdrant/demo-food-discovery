// Talks to the original food-discovery backend (POST /api/search), which runs
// the Qdrant Recommendation API server-side (recommend_groups with a
// best_score or average_vector strategy). Same contract as qdrant/demo-food-
// discovery: positive/negative example ids, optional text queries + location,
// and a strategy ("best_score" | "average_vector").
//
// In dev with no backend, set VITE_MOCK=1 to render sample data. VITE_API_BASE
// lets the UI live on a different host than the API (e.g. UI on Vercel, API on
// Railway); empty by default -> same-origin (backend serves the frontend).
const USE_MOCK = import.meta.env.VITE_MOCK === "1";
const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export async function search({ positive = [], negative = [], queries = [], strategy = "best_score", location = null, limit = 12 } = {}) {
  if (USE_MOCK) return mockSearch({ positive, negative });

  const body = { positive, negative, queries, strategy, limit };
  if (location) body.location = location;

  const res = await fetch(`${API_BASE}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);

  const products = await res.json();
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    image_url: p.image_url,
    restaurant: p.restaurant,
    score: p.score,
  }));
}

// Sampled coverage points for the map preview: [{ lat, lon, count }].
export async function sampleLocations() {
  if (USE_MOCK) return { points: [], sampled: 0 };
  const res = await fetch(`${API_BASE}/api/locations`);
  if (!res.ok) throw new Error(`Locations failed (${res.status})`);
  return res.json();
}

/* ------------------------------- dev mock -------------------------------- */

const MOCK = [
  { id: "1", name: "Quattro Formaggi Pizza", description: "Mozzarella, gorgonzola, parmesan and smoked cheese on a wood-fired base.", image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=70", restaurant: { name: "Napoli Corner", rating: 4.7 } },
  { id: "2", name: "Spicy Ramen", description: "Rich pork broth, chili oil, soft egg, scallions and nori.", image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=70", restaurant: { name: "Ramen-ya", rating: 4.6 } },
  { id: "3", name: "Salmon Nigiri Set", description: "Fresh salmon, tuna and salmon-roe over seasoned rice.", image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=70", restaurant: { name: "Sushi Bar", rating: 4.8 } },
  { id: "4", name: "Ghormeh Sabzi", description: "Persian herb stew with red beans and dried limes.", image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=70", restaurant: { name: "Persian Kitchen", rating: 4.5 } },
  { id: "5", name: "Chicken McNuggets (9)", description: "Crispy chicken nuggets with fries and a drink of choice.", image_url: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=70", restaurant: { name: "Fast Bites", rating: 4.1 } },
  { id: "6", name: "Onion Salad", description: "Fresh onion, herbs and a light citrus dressing.", image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=70", restaurant: { name: "Green Garden", rating: 4.4 } },
];

function mockSearch({ positive = [], negative = [] }) {
  // Simple deterministic reshuffle so likes/skips visibly change results.
  const excluded = new Set([...positive, ...negative]);
  const pool = MOCK.filter((m) => !excluded.has(m.id));
  const rotate = positive.length % (pool.length || 1);
  const ordered = [...pool.slice(rotate), ...pool.slice(0, rotate)];
  return Promise.resolve(
    ordered.map((m, i) => ({ ...m, score: Math.round((0.9 - i * 0.05) * 1000) / 1000 })),
  );
}
