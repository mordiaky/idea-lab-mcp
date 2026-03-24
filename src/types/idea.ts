export const IDEA_STATUSES = ["raw", "shortlisted", "build-next", "rejected"] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];
