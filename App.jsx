import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import TrailList from './components/TrailList';
import TrailDetail from './components/TrailDetail'; 

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<TrailList />} />
          <Route path="/trails/:id" element={<TrailDetail />} /> 
        </Routes>
      </main>
    </div>
  );
}
