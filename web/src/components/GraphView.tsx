import { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { IdeaSummary, VariantEdge } from "../types.js";
import { getIdeas, getVariants } from "../api.js";

interface GraphNode {
  id: string;
  title: string;
  status: IdeaSummary["status"];
  composite: number | null;
}

interface GraphLink {
  source: string;
  target: string;
  label: string | null;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const STATUS_COLORS: Record<string, string> = {
  raw: "#6b7280",
  shortlisted: "#3b82f6",
  "build-next": "#10b981",
  rejected: "#ef4444",
};

interface GraphViewProps {
  onSelectIdea: (id: string) => void;
}

export function GraphView({ onSelectIdea }: GraphViewProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    Promise.all([getIdeas(), getVariants()])
      .then(([ideas, variants]) => {
        const nodes: GraphNode[] = ideas.map((idea) => ({
          id: idea.id,
          title: idea.title,
          status: idea.status,
          composite: idea.composite,
        }));

        const links: GraphLink[] = variants.map((v: VariantEdge) => ({
          source: v.parentId,
          target: v.ideaId,
          label: v.mutationAxis,
        }));

        setGraphData({ nodes, links });
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load graph data")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function update() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (loading) {
    return <div className="loading-spinner">Loading graph data...</div>;
  }

  if (error) {
    return (
      <div className="loading-spinner" style={{ color: "#ef4444" }}>
        {error}
      </div>
    );
  }

  if (graphData.links.length === 0) {
    return (
      <div className="graph-container">
        <div className="graph-empty">
          No idea variants found. Use the mutation engine to create idea
          lineages.
        </div>
      </div>
    );
  }

  return (
    <div className="graph-container" ref={containerRef}>
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(node) => (node as GraphNode).title}
        nodeColor={(node) =>
          STATUS_COLORS[(node as GraphNode).status] ?? "#6b7280"
        }
        nodeVal={(node) => {
          const composite = (node as GraphNode).composite;
          return composite !== null ? 4 + composite * 1.5 : 4;
        }}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const n = node as GraphNode & { x?: number; y?: number };
          const label =
            n.title.length > 25 ? n.title.slice(0, 25) + "…" : n.title;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px sans-serif`;
          ctx.fillStyle = "#374151";
          ctx.textAlign = "center";
          ctx.fillText(label, n.x ?? 0, (n.y ?? 0) + 10 / globalScale + 4);
        }}
        linkColor={() => "#94a3b8"}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        onNodeClick={(node) => {
          onSelectIdea((node as GraphNode).id);
        }}
        backgroundColor="#f3f4f6"
      />
    </div>
  );
}
