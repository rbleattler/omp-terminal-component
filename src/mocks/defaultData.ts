// src/mocks/defaultData.ts
import { MockData } from "./MockData";

export const defaultMockData: MockData = {
  env: {
    HOME: '/home/user',
    USER: 'user',
    PATH: '/usr/local/bin:/usr/bin:/bin',
    TERM: 'xterm-256color',
    SHELL: '/bin/bash',
    PWD: '/home/user/projects',
    WAKAPI_API_KEY: 'mock-api-key',
  },
  git: {
    branch: 'main',
    isGitRepo: true,
    status: {
      ahead: 0,
      behind: 0,
      working: { changed: true, string: '1' },
      staging: { changed: false, string: '' },
    },
    stashCount: 0,
  },
  system: {
    cpu: { physicalPercentUsed: 25, precision: 0 },
    memory: {
      physicalTotalMemory: 16000000000, // 16GB
      physicalFreeMemory: 8000000000,   // 8GB
    },
  },
  shell: { name: 'bash' },
  path: {
    pwd: '/home/user/projects/my-project',
    Path: '/home/user/projects/my-project',
    Folders: [],
    root: '',
    relative: 'my-project',
    Location: '/home/user/projects/my-project',
    pathSeparator: '/',
    cygPath: false,
    windowsPath: false,
    mappedLocations: {},
    StackCount: 0,
    RootDir: false,
    Writable: true
  },
  time: { now: new Date() },
};