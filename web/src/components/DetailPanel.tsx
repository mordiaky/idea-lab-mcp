import { useEffect, useState } from "react";
import type { IdeaDetail, IdeaSummary } from "../types.js";
import { getIdea, updateIdeaStatus } from "../api.js";
import { RadarChart } from "./RadarChart.js";
import { Toast } from "./Toast.js";

interface DetailPanelProps {
  ideaId: string;
  onClose: () => void;
  onSelectIdea: (id: string) => void;
  onStatusChanged?: () => void;
}

const STATUS_ACTIONS: Record<string, { label: string; target: IdeaSummary["status"]; color: string }[]> = {
  raw: [
    { label: "Shortlist", target: "shortlisted", color: "#3b82f6" },
    { label: "Reject", target: "rejected", color: "#ef4444" },
  ],
  shortlisted: [
    { label: "Build Next", target: "build-next", color: "#10b981" },
    { label: "Reject", target: "rejected", color: "#ef4444" },
  ],
  "build-next": [
    { label: "Start Building", target: "in-progress", color: "#f59e0b" },
    { label: "Reject", target: "rejected", color: "#ef4444" },
  ],
  "in-progress": [
    { label: "Mark Completed", target: "completed", color: "#10b981" },
    { label: "Back to Build Next", target: "build-next", color: "#6b7280" },
  ],
  completed: [
    { label: "Needs Revision", target: "needs-revision", color: "#f59e0b" },
  ],
  "needs-revision": [
    { label: "Start Revising", target: "in-progress", color: "#f59e0b" },
    { label: "Mark Completed", target: "completed", color: "#10b981" },
  ],
  rejected: [
    { label: "Reconsider (Raw)", target: "raw", color: "#6b7280" },
  ],
};

export function DetailPanel({ ideaId, onClose, onSelectIdea, onStatusChanged }: DetailPanelProps) {
  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getIdea(ideaId)
      .then(setIdea)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load idea")
      )
      .finally(() => setLoading(false));
  }, [ideaId]);

  async function handleStatusChange(newStatus: IdeaSummary["status"]) {
    if (!idea || updating) return;
    setUpdating(true);
    try {
      await updateIdeaStatus(idea.id, newStatus);
      setIdea({ ...idea, status: newStatus });
      setToast({ message: `Status changed to ${newStatus}`, type: "success" });
      onStatusChanged?.();
    } catch {
      setToast({ message: "Failed to update status", type: "error" });
    } finally {
      setUpdating(false);
    }
  }

  const critique = idea?.critique;
  const flags = critique
    ? [
        { key: "wrapperProblem", label: "Wrapper problem", value: critique.wrapperProblem },
        { key: "existingProducts", label: "Existing products", value: critique.existingProducts },
        { key: "fragileDependencies", label: "Fragile dependencies", value: critique.fragileDependencies },
        { key: "vagueStatement", label: "Vague statement", value: critique.vagueStatement },
        { key: "violatesSoftwareOnly", label: "Violates software-only", value: critique.violatesSoftwareOnly },
      ].filter((f) => f.value)
    : [];

  let mvpSteps: string[] = [];
  if (idea?.mvpSteps) {
    try {
      mvpSteps = JSON.parse(idea.mvpSteps) as string[];
    } catch {
      // not parseable JSON — treat as plain text
      mvpSteps = [idea.mvpSteps];
    }
  }

  const actions = idea ? (STATUS_ACTIONS[idea.status] ?? []) : [];

  return (
    <>
      <div className="detail-backdrop" onClick={onClose} />
      <div className="detail-panel">
        {loading && <div className="loading-spinner">Loading...</div>}
        {error && (
          <div className="loading-spinner" style={{ color: "var(--color-error)" }}>
            {error}
          </div>
        )}
        {idea && !loading && (
          <>
            <div className="detail-panel-header">
              <div className="detail-panel-title">{idea.title}</div>
              <button className="detail-close-btn" onClick={onClose}>
                ×
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span className={`status-badge status-${idea.status}`}>
                {idea.status}
              </span>
              {idea.domain && (
                <span className="badge badge-domain">{idea.domain}</span>
              )}
              {idea.score && (
                <span className="badge badge-score-high">
                  {idea.score.composite.toFixed(1)}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            {actions.length > 0 && (
              <div className="detail-actions">
                {actions.map((action) => (
                  <button
                    key={action.target}
                    className="action-btn"
                    style={{
                      background: action.color,
                      color: "#fff",
                      opacity: updating ? 0.6 : 1,
                    }}
                    disabled={updating}
                    onClick={() => handleStatusChange(action.target)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            <div className="detail-one-liner">{idea.oneLiner}</div>

            {idea.score && (
              <div className="detail-section">
                <div className="detail-section-title">Score</div>
                <RadarChart score={idea.score} />
              </div>
            )}

            <div className="detail-section">
              <div className="detail-section-title">Problem</div>
              <div className="detail-section-body">{idea.problem}</div>
            </div>

            <div className="detail-section">
              <div className="detail-section-title">Solution</div>
              <div className="detail-section-body">{idea.solution}</div>
            </div>

            {critique && (
              <div className="detail-section">
                <div className="detail-section-title">Critique</div>
                {critique.overallVerdict && (
                  <div style={{ marginBottom: 8 }}>
                    <span
                      className={`badge badge-verdict-${critique.overallVerdict}`}
                    >
                      {critique.overallVerdict}
                    </span>
                  </div>
                )}
                {critique.verdictReasoning && (
                  <div className="detail-section-body" style={{ marginBottom: 10 }}>
                    {critique.verdictReasoning}
                  </div>
                )}
                {flags.map((f) => (
                  <div key={f.key} className="critique-flag">
                    <span className="critique-flag-icon">⚠</span>
                    <span>
                      <strong>{f.label}:</strong> {f.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {(idea.targetUser || idea.constraints || idea.risks || idea.whyNow) && (
              <div className="detail-section">
                <div className="detail-section-title">Metadata</div>
                {idea.targetUser && (
                  <div className="detail-section-body" style={{ marginBottom: 6 }}>
                    <strong>Target user:</strong> {idea.targetUser}
                  </div>
                )}
                {idea.constraints && (
                  <div className="detail-section-body" style={{ marginBottom: 6 }}>
                    <strong>Constraints:</strong> {idea.constraints}
                  </div>
                )}
                {idea.risks && (
                  <div className="detail-section-body" style={{ marginBottom: 6 }}>
                    <strong>Risks:</strong> {idea.risks}
                  </div>
                )}
                {idea.whyNow && (
                  <div className="detail-section-body">
                    <strong>Why now:</strong> {idea.whyNow}
                  </div>
                )}
              </div>
            )}

            {mvpSteps.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">MVP Steps</div>
                <ol className="mvp-steps-list">
                  {mvpSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {idea.tags.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">Tags</div>
                <div className="tag-list">
                  {idea.tags.map((tag) => (
                    <span key={tag} className="tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {idea.variants.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">Lineage</div>
                {idea.variants.map((v) => {
                  const isParent = v.parentId === idea.id;
                  const linkedId = isParent ? v.ideaId : v.parentId;
                  const linkedTitle = isParent ? v.childTitle : v.parentTitle;
                  return (
                    <button
                      key={v.id}
                      className="lineage-link"
                      onClick={() => onSelectIdea(linkedId)}
                    >
                      {isParent ? "Child:" : "Parent:"} {linkedTitle}
                      {v.mutationAxis && (
                        <span style={{ color: "var(--color-text-muted)" }}>
                          {" "}
                          ({v.mutationAxis})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="detail-section detail-timestamps">
              <div className="detail-section-title">Timeline</div>
              <div className="detail-section-body">
                Created: {new Date(idea.createdAt).toLocaleDateString()}
              </div>
              <div className="detail-section-body">
                Updated: {new Date(idea.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </>
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </>
  );
}
