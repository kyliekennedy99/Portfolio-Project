// ---------------------------------------------------------------------------
// api.js – AllTrails React-Query hooks (Q1-Q5 wired)
// ---------------------------------------------------------------------------
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const API_BASE = "http://localhost:3001/api";   // dev server

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
export const useRecommendations = (userId,top=5)=> useQuery({ queryKey:["user",userId,"recommendations",top], queryFn:()=>request(`/user/${userId}/recommendations?top=${top}`) });

// Q1 Top-rated
export const useTopRated        = (min=5)=> useQuery({ queryKey:["analytics","top-rated",min],      queryFn:()=>request(`/analytics/top-rated?minReviews=${min}`), staleTime:300_000 });
// Q3 Top hikers
export const useTopHikers       = ()     => useQuery({ queryKey:["analytics","top-hikers"],         queryFn:()=>request("/analytics/top-hikers") });
// Q4 Challenge trails  ❱❱❱  this is the one you asked for
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
    queryKey: ["users", "no-reviews"],
    queryFn : () => request("/users/no-reviews"),
    staleTime: 300_000,
  });
export const useUnreviewedTrails = () =>
  useQuery({
    queryKey: ["analytics", "unreviewed-trails"],
    queryFn : () => request("/analytics/unreviewed-trails"),
    staleTime: 300_000,
  });


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
