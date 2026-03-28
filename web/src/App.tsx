import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar.js";
import { KanbanBoard } from "./components/KanbanBoard.js";
import { GraphView } from "./components/GraphView.js";
import { PortfolioView } from "./components/PortfolioView.js";
import { DetailPanel } from "./components/DetailPanel.js";

export default function App() {
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route
          path="/"
          element={
            <KanbanBoard onSelectIdea={(id) => setSelectedIdeaId(id)} />
          }
        />
        <Route
          path="/graph"
          element={
            <GraphView onSelectIdea={(id) => setSelectedIdeaId(id)} />
          }
        />
        <Route path="/portfolio" element={<PortfolioView />} />
      </Routes>
      {selectedIdeaId && (
        <DetailPanel
          ideaId={selectedIdeaId}
          onClose={() => setSelectedIdeaId(null)}
          onSelectIdea={(id) => setSelectedIdeaId(id)}
        />
      )}
    </BrowserRouter>
  );
}
