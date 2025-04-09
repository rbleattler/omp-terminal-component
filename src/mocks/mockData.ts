import { GitMock, PathMock, ShellMock, SysInfoMock } from "../../.scratch/MockData";

export interface MockData {
  env: Record<string, string>; // Ensure consistency with .scratch/MockData.ts
  git: GitMock;
  system: SysInfoMock;
  shell: ShellMock;
  path: PathMock;
  time: { now: Date; };
}