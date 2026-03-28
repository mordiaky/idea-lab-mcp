import { useDraggable } from "@dnd-kit/core";
import type { IdeaSummary } from "../types.js";

interface IdeaCardProps {
  idea: IdeaSummary;
  onClick: (id: string) => void;
}

function scoreClass(composite: number | null): string {
  if (composite === null) return "";
  if (composite > 7) return "badge-score-high";
  if (composite > 4) return "badge-score-mid";
  return "badge-score-low";
}

function verdictClass(verdict: IdeaSummary["overallVerdict"]): string {
  if (!verdict) return "";
  if (verdict === "pass") return "badge-verdict-pass";
  if (verdict === "weak") return "badge-verdict-weak";
  return "badge-verdict-reject";
}

function statusIcon(status: IdeaSummary["status"]): string {
  switch (status) {
    case "in-progress": return "\u25b6 ";
    case "completed": return "\u2713 ";
    case "needs-revision": return "\u21bb ";
    default: return "";
  }
}

export function IdeaCard({ idea, onClick }: IdeaCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: idea.id,
    data: { idea },
  });

  return (
    <div
      ref={setNodeRef}
      className={`idea-card${isDragging ? " dragging" : ""}`}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onClick(idea.id);
      }}
    >
      <div className="idea-card-title" title={idea.title}>
        {statusIcon(idea.status)}{idea.title}
      </div>
      <div className="idea-card-meta">
        {idea.domain && (
          <span className="badge badge-domain">{idea.domain}</span>
        )}
        {idea.composite !== null && (
          <span className={`badge ${scoreClass(idea.composite)}`}>
            {idea.composite.toFixed(1)}
          </span>
        )}
        {idea.overallVerdict && (
          <span className={`badge ${verdictClass(idea.overallVerdict)}`}>
            {idea.overallVerdict}
          </span>
        )}
      </div>
    </div>
  );
}
