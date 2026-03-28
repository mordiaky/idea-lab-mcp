import { useEffect, useState } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import type { PortfolioDomain } from "../types.js";
import { getPortfolio } from "../api.js";

type SortKey = "domain" | "count" | "avgComposite" | "raw" | "shortlisted" | "buildNext" | "rejected" | "inProgress" | "completed" | "needsRevision";

function scoreColor(avg: number): string {
  if (avg > 8) return "#059669";
  if (avg > 6) return "#10b981";
  if (avg > 4) return "#f59e0b";
  return "#ef4444";
}

interface TreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  domain?: string;
  count?: number;
  avgComposite?: number;
}

function CustomTreemapContent(props: TreemapContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, domain, count, avgComposite } = props;
  const color = scoreColor(avgComposite ?? 0);

  if (width < 60 || height < 40) {
    return <rect x={x} y={y} width={width} height={height} fill={color} stroke="#fff" strokeWidth={2} />;
  }

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} stroke="#fff" strokeWidth={2} />
      <text x={x + width / 2} y={y + height / 2 - 10} textAnchor="middle" fill="#fff" fontSize={13} fontWeight="bold">
        {domain}
      </text>
      <text x={x + width / 2} y={y + height / 2 + 6} textAnchor="middle" fill="#fff" fontSize={11}>
        {count} ideas
      </text>
      <text x={x + width / 2} y={y + height / 2 + 20} textAnchor="middle" fill="#fff" fontSize={11}>
        avg {(avgComposite ?? 0).toFixed(1)}
      </text>
    </g>
  );
}

export function PortfolioView() {
  const [domains, setDomains] = useState<PortfolioDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("count");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    getPortfolio()
      .then(setDomains)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load portfolio")
      )
      .finally(() => setLoading(false));
  }, []);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  function sortedDomains() {
    return [...domains].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;
      switch (sortKey) {
        case "domain":
          aVal = a.domain;
          bVal = b.domain;
          break;
        case "count":
          aVal = a.count;
          bVal = b.count;
          break;
        case "avgComposite":
          aVal = a.avgComposite;
          bVal = b.avgComposite;
          break;
        case "raw":
          aVal = a.statusBreakdown.raw;
          bVal = b.statusBreakdown.raw;
          break;
        case "shortlisted":
          aVal = a.statusBreakdown.shortlisted;
          bVal = b.statusBreakdown.shortlisted;
          break;
        case "buildNext":
          aVal = a.statusBreakdown.buildNext;
          bVal = b.statusBreakdown.buildNext;
          break;
        case "rejected":
          aVal = a.statusBreakdown.rejected;
          bVal = b.statusBreakdown.rejected;
          break;
        case "inProgress":
          aVal = a.statusBreakdown.inProgress;
          bVal = b.statusBreakdown.inProgress;
          break;
        case "completed":
          aVal = a.statusBreakdown.completed;
          bVal = b.statusBreakdown.completed;
          break;
        case "needsRevision":
          aVal = a.statusBreakdown.needsRevision;
          bVal = b.statusBreakdown.needsRevision;
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }

  const treemapData = domains.map((d) => ({
    name: d.domain,
    size: d.count,
    domain: d.domain,
    count: d.count,
    avgComposite: d.avgComposite,
  }));

  if (loading) {
    return <div className="loading-spinner">Loading portfolio...</div>;
  }

  if (error) {
    return (
      <div className="loading-spinner" style={{ color: "var(--color-error)" }}>
        {error}
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="portfolio-container">
        <div className="portfolio-empty">
          No ideas found. Use the MCP tools to generate ideas first.
        </div>
      </div>
    );
  }

  const sorted = sortedDomains();

  return (
    <div className="portfolio-container">
      <h1>Domain Portfolio</h1>
      <div className="portfolio-treemap">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treemapData}
            dataKey="size"
            content={<CustomTreemapContent />}
          >
            <Tooltip
              formatter={(_value, _name, props) => {
                const p = props.payload as { domain?: string; count?: number; avgComposite?: number } | undefined;
                return [
                  `${p?.count ?? 0} ideas, avg score ${(p?.avgComposite ?? 0).toFixed(1)}`,
                  p?.domain ?? "",
                ];
              }}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>

      <div className="portfolio-table-wrapper">
        <table className="portfolio-table">
          <thead>
            <tr>
              {(
                [
                  { key: "domain", label: "Domain" },
                  { key: "count", label: "Ideas" },
                  { key: "avgComposite", label: "Avg Score" },
                  { key: "raw", label: "Raw" },
                  { key: "shortlisted", label: "Shortlisted" },
                  { key: "buildNext", label: "Build Next" },
                  { key: "inProgress", label: "In Progress" },
                  { key: "completed", label: "Completed" },
                  { key: "needsRevision", label: "Revision" },
                  { key: "rejected", label: "Rejected" },
                ] as { key: SortKey; label: string }[]
              ).map(({ key, label }) => (
                <th key={key} onClick={() => handleSort(key)}>
                  {label}
                  {sortKey === key ? (sortAsc ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr key={d.domain}>
                <td>{d.domain}</td>
                <td>{d.count}</td>
                <td>
                  <span style={{ color: scoreColor(d.avgComposite), fontWeight: 600 }}>
                    {d.avgComposite.toFixed(1)}
                  </span>
                </td>
                <td>{d.statusBreakdown.raw}</td>
                <td>{d.statusBreakdown.shortlisted}</td>
                <td>{d.statusBreakdown.buildNext}</td>
                <td>{d.statusBreakdown.inProgress}</td>
                <td>{d.statusBreakdown.completed}</td>
                <td>{d.statusBreakdown.needsRevision}</td>
                <td>{d.statusBreakdown.rejected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
