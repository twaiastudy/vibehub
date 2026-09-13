export const ROLE_LABEL: Record<string, string> = {
  OWNER: "發起人",
  DEVELOPER: "開發者",
  TESTER: "測試者",
  DESIGNER: "UI 設計",
  DOMAIN_EXPERT: "領域專家",
  PROJECT_MANAGER: "專案經理",
  BUSINESS_MANAGER: "業務經理",
  OTHER: "其他",
};

// The roles a project can recruit for / a member can pick when joining —
// everything except OWNER, which only exists via project creation.
export const JOINABLE_ROLES = [
  "DEVELOPER",
  "TESTER",
  "DESIGNER",
  "DOMAIN_EXPERT",
  "PROJECT_MANAGER",
  "BUSINESS_MANAGER",
  "OTHER",
] as const;
