export interface IdeaSummary {
  id: string;
  title: string;
  oneLiner: string;
  domain: string | null;
  status: "raw" | "shortlisted" | "build-next" | "rejected";
  composite: number | null;
  overallVerdict: "pass" | "weak" | "reject" | null;
  createdAt: string;
}

export interface Score {
  id: string;
  ideaId: string;
  novelty: number;
  usefulness: number;
  feasibility: number;
  testability: number;
  speedToMvp: number;
  defensibility: number;
  clarity: number;
  composite: number;
  noveltyReasoning: string | null;
  usefulnessReasoning: string | null;
  feasibilityReasoning: string | null;
  testabilityReasoning: string | null;
  speedToMvpReasoning: string | null;
  defensibilityReasoning: string | null;
  clarityReasoning: string | null;
  createdAt: string;
}

export interface Critique {
  id: string;
  ideaId: string;
  content: string;
  wrapperProblem: string | null;
  existingProducts: string | null;
  fragileDependencies: string | null;
  vagueStatement: string | null;
  violatesSoftwareOnly: string | null;
  overallVerdict: "pass" | "weak" | "reject" | null;
  verdictReasoning: string | null;
  createdAt: string;
}

export interface IdeaDetail {
  id: string;
  title: string;
  oneLiner: string;
  problem: string;
  solution: string;
  whyNow: string | null;
  targetUser: string | null;
  constraints: string | null;
  risks: string | null;
  mvpSteps: string | null;
  domain: string | null;
  status: "raw" | "shortlisted" | "build-next" | "rejected";
  createdAt: string;
  updatedAt: string;
  score: Score | null;
  critique: Critique | null;
  tags: string[];
  variants: VariantEdge[];
}

export interface VariantEdge {
  id: string;
  parentId: string;
  parentTitle: string;
  ideaId: string;
  childTitle: string;
  mutationAxis: string | null;
  mutationDepth: number;
  parentStatus: string;
  childStatus: string;
  parentScore: number | null;
  childScore: number | null;
}

export interface PortfolioDomain {
  domain: string;
  count: number;
  avgComposite: number;
  statusBreakdown: {
    raw: number;
    shortlisted: number;
    buildNext: number;
    rejected: number;
  };
}
