// ---------------------------------------------------------------------------
// api.js – AllTrails React-Query hooks (Q1-Q5 wired)
// ---------------------------------------------------------------------------
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const API_BASE = "http://localhost:3001/api";   // dev server
const API =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:3001";
/* ---------- helper ------------------------------------------------------- */
export async function request(path, options = {}) {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const txt = await resp.text();
  if (!resp.ok) throw new Error(txt || resp.statusText);
  try   { return JSON.parse(txt); }
  catch { throw new Error("Expected JSON, got: " + txt.slice(0, 60) + "…"); }
}

/* ---------- query hooks -------------------------------------------------- */
// Trails
export const useTrailList       = () => useQuery({ queryKey:["trails"],                    queryFn: () => request("/trails"),             staleTime:300_000 });
export const useTrailSummary    = (id,enabled=true)=> useQuery({queryKey:["trail",id,"summary"],         queryFn:()=>request(`/trails/${id}/summary`),enabled});
export const useDifficultyDist  = (id)=> useQuery({ queryKey:["trail",id,"difficulty-dist"],queryFn:()=>request(`/trails/${id}/difficulty-dist`) });

// Recommendations


export function useRecommendations(userId, top = 5, opts = {}) {
  const {
    lat,
    lng,
    radiusKm = 30000,
    minReviews = 0,
  } = opts ?? {};

  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  // stabilize queryKey to avoid refetch spam from tiny GPS jitter
  const latQ = hasCoords ? Number(lat.toFixed(5)) : null;
  const lngQ = hasCoords ? Number(lng.toFixed(5)) : null;

  return useQuery({
    queryKey: ["recs", userId, top, latQ, lngQ, radiusKm, minReviews],
    enabled: Number.isFinite(userId) && userId > 0 && hasCoords,
    queryFn: async () => {
      const params = new URLSearchParams({
        userId: String(userId),
        top: String(top),
        minReviews: String(minReviews),
        lat: String(latQ),
        lng: String(lngQ),
        radiusKm: String(radiusKm),
      });

      const r = await fetch(`http://localhost:3001/api/recommendations?${params.toString()}`);
      if (!r.ok) throw new Error("Failed to fetch recommendations");
      return r.json();
    },
    staleTime: 60_000,         // cache for 1 min
    keepPreviousData: true,    // smoother UI when options change
    retry: 1,                  // fail fast if server rejects
  });
}




// Q1 Top-rated
export const useTopRated        = (min=5)=> useQuery({ queryKey:["analytics","top-rated",min],      queryFn:()=>request(`/analytics/top-rated?minReviews=${min}`), staleTime:300_000 });
// Q3 Top hikers
export const useTopHikers       = ()     => useQuery({ queryKey:["analytics","top-hikers"],         queryFn:()=>request("/analytics/top-hikers") });
// Q4 Challenge trails
export const useChallengeTrails = ({minMiles=10,minRating=4}={}) =>
  useQuery({
    queryKey:["analytics","challenge-trails",minMiles,minRating],
    queryFn:()=>request(`/analytics/challenge-trails?minMiles=${minMiles}&minRating=${minRating}`),
  });
// Q5 Club sizes
export const useClubSizes       = ()     => useQuery({ queryKey:["clubs","sizes"],                  queryFn:()=>request("/clubs/sizes"),          staleTime:300_000 });

// Q6 – who hiked together
export const useHikingBuddies = () =>
  useQuery({
    queryKey: ["analytics", "hiking-buddies"],
    queryFn : () => request("/analytics/hiking-buddies"),
    staleTime: 300_000,
  });


// Monthly hike counts (Q7 – already planned)
export const useMonthlyHikeCounts = ()   => useQuery({ queryKey:["analytics","monthly-hikes"],      queryFn:()=>request("/analytics/monthly-hikes") });
// Q8 – steepness list

export const useSteepTrails = () =>
  useQuery({
    queryKey: ["analytics", "steep-trails"],
    queryFn : () => request("/analytics/steep-trails"),
    staleTime: 300_000,
  });
  export const useUsersWithoutReviews = () =>
  useQuery({
    queryKey: ["users", "most-reviews"],
    queryFn : () => request("/users/most-reviews"),
    staleTime: 300_000,
  });
export function useMostReviewedTrails() {
  return useQuery({
    queryKey: ["mostReviewedTrails"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/analytics/most-reviewed-trails`);
      if (!res.ok) throw new Error("Failed to load most-reviewed trails");
      return res.json();
    },
    staleTime: 60_000,
  });
}


/* ---------- mutation hook ------------------------------------------------ */
export function useUpsertReview(userId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: body => request("/reviews",{method:"POST",body:JSON.stringify({userId,...body})}),
    onSuccess : (_vars,vars)=> {
      qc.invalidateQueries({queryKey:["trail",vars.trailId,"summary"]});
      qc.invalidateQueries({queryKey:["trail",vars.trailId,"difficulty-dist"]});
    },
  });
}
