// src/mocks/types.ts
export interface MockData {
  env: Record<string, string>;
  git: {
    branch: string;
    isGitRepo: boolean;
    status: {
      ahead: number;
      behind: number;
      working: { changed: boolean; string: string };
      staging: { changed: boolean; string: string };
    };
    stashCount: number;
  };
  system: {
    cpu: { physicalPercentUsed: number; precision: number };
    memory: { physicalTotalMemory: number; physicalFreeMemory: number };
  };
  shell: { name: string };
  path: { currentDir: string; homeDir: string };
  time: { now: Date };
}