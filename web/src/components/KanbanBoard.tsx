import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import type { IdeaSummary } from "../types.js";
import { getIdeas, updateIdeaStatus } from "../api.js";
import { KanbanColumn } from "./KanbanColumn.js";
import { IdeaCard } from "./IdeaCard.js";
import { Toast } from "./Toast.js";

const COLUMNS: { status: IdeaSummary["status"]; title: string }[] = [
  { status: "raw", title: "Raw" },
  { status: "shortlisted", title: "Shortlisted" },
  { status: "build-next", title: "Build Next" },
  { status: "in-progress", title: "In Progress" },
  { status: "completed", title: "Completed" },
  { status: "needs-revision", title: "Needs Revision" },
  { status: "rejected", title: "Rejected" },
];

interface KanbanBoardProps {
  onSelectIdea: (id: string) => void;
}

export function KanbanBoard({ onSelectIdea }: KanbanBoardProps) {
  const [ideas, setIdeas] = useState<IdeaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIdea, setActiveIdea] = useState<IdeaSummary | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const reload = useCallback(() => {
    getIdeas()
      .then(setIdeas)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load ideas")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  function handleDragStart(event: DragStartEvent) {
    const idea = ideas.find((i) => i.id === event.active.id);
    setActiveIdea(idea ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveIdea(null);
    const { active, over } = event;
    if (!over) return;

    const draggedId = active.id as string;
    const targetStatus = over.id as IdeaSummary["status"];

    const dragged = ideas.find((i) => i.id === draggedId);
    if (!dragged || dragged.status === targetStatus) return;

    const previous = [...ideas];
    setIdeas((prev) =>
      prev.map((i) => (i.id === draggedId ? { ...i, status: targetStatus } : i))
    );

    try {
      await updateIdeaStatus(draggedId, targetStatus);
      setToast({
        message: `"${dragged.title}" moved to ${targetStatus}`,
        type: "success",
      });
    } catch {
      setIdeas(previous);
      setToast({
        message: `Failed to move "${dragged.title}"`,
        type: "error",
      });
    }
  }

  if (loading) {
    return <div className="loading-spinner">Loading ideas...</div>;
  }

  if (error) {
    return (
      <div className="loading-spinner" style={{ color: "var(--color-error)" }}>
        {error}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            title={col.title}
            ideas={ideas.filter((i) => i.status === col.status)}
            onSelectIdea={onSelectIdea}
          />
        ))}
      </div>
      <DragOverlay>
        {activeIdea && (
          <IdeaCard
            idea={activeIdea}
            onClick={() => {}}
          />
        )}
      </DragOverlay>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DndContext>
  );
}
