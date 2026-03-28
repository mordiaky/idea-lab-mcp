import { useEffect, useState } from "react";
import type { IdeaDetail } from "../types.js";
import { getIdea } from "../api.js";
import { RadarChart } from "./RadarChart.js";

interface DetailPanelProps {
  ideaId: string;
  onClose: () => void;
  onSelectIdea: (id: string) => void;
}

export function DetailPanel({ ideaId, onClose, onSelectIdea }: DetailPanelProps) {
  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      // not parseable JSON — ignore
    }
  }

  return (
    <>
      <div className="detail-backdrop" onClick={onClose} />
      <div className="detail-panel">
        {loading && <div className="loading-spinner">Loading...</div>}
        {error && (
          <div className="loading-spinner" style={{ color: "#ef4444" }}>
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

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <span className={`status-badge status-${idea.status}`}>
                {idea.status}
              </span>
              {idea.domain && (
                <span className="badge badge-domain">{idea.domain}</span>
              )}
            </div>

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
                        <span style={{ color: "#6b7280" }}>
                          {" "}
                          ({v.mutationAxis})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
