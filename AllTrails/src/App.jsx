// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Header from "./components/Header";
import TrailList from "./components/TrailList";
import TrailDetail from "./components/TrailDetail";
import AuthPage from "./components/AuthPage";
import ProfilePage from "./components/ProfilePage";
import ExplorePage from "./components/ExplorePage";
import TrailsPage from "./components/TrailsPage";
import AboutPage from "./components/AboutPage";
import SettingsPage from "./components/SettingsPage";
import FavoritesPage from "./components/FavoritesPage";
import ClubDetailsPage from "./components/ClubDetailsPage";

const qc = new QueryClient();

export default function App() {
  // TODO: replace with real auth / context
  const currentUser = { id: 1, name: "Demo User" };

  return (
    <QueryClientProvider client={qc}>
      <div className="flex flex-col min-h-screen">
        <Header currentUser={currentUser} />

        <main className="flex-1 container mx-auto px-4 py-6">
          <Routes>
            <Route
              path="/"
              element={<TrailList currentUser={currentUser} />}
            />
            <Route
              path="/trails/:id"
              element={<TrailDetail currentUser={currentUser} />}
            />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/profile"
              element={<ProfilePage currentUser={currentUser} />}
            />
            <Route path="/explore" element={<ExplorePage />} />
            <Route
              path="/trails"
              element={<TrailsPage currentUser={currentUser} />}
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="/favorites"
              element={<FavoritesPage currentUser={currentUser} />}
            />
            <Route
              path="/clubs/:clubId"
              element={<ClubDetailsPage currentUser={currentUser} />}
            />
          </Routes>
        </main>
      </div>
    </QueryClientProvider>
  );
}
