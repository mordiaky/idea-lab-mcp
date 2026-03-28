import { useDroppable } from "@dnd-kit/core";
import type { IdeaSummary } from "../types.js";
import { IdeaCard } from "./IdeaCard.js";

interface KanbanColumnProps {
  title: string;
  status: IdeaSummary["status"];
  ideas: IdeaSummary[];
  onSelectIdea: (id: string) => void;
}

export function KanbanColumn({
  title,
  status,
  ideas,
  onSelectIdea,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="kanban-column">
      <div className={`kanban-column-header status-${status}`}>
        <span className="kanban-column-title">{title}</span>
        <span className="kanban-column-count">{ideas.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className="kanban-column-body"
        style={{ background: isOver ? "#e0f2fe" : undefined }}
      >
        {ideas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            onClick={onSelectIdea}
          />
        ))}
      </div>
    </div>
  );
}
