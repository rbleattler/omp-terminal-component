# OMP Terminal Component Mocking System

## Overview

The OMP Terminal Component needs to display Oh-My-Posh prompts in a React component. However, Oh-My-Posh normally relies on real system data like:
- Environment variables
- Git repository information
- System metrics (CPU, memory)
- Shell information
- File paths
- Current time

To properly render these elements in a static or demo environment, we need a mocking system that can:
1. Provide realistic mock values for all data points Oh-My-Posh expects
2. Process Oh-My-Posh templates (like `{{ .Env.HOME }}`)
3. Handle segment-specific rendering needs
4. Allow easy customization of mock data

## Architecture

The mocking system consists of several key components:

1. **Mock Data Interface & Default Values** - Define the shape of all mockable data and provide sensible defaults
2. **Template Resolver** - Parse and evaluate Oh-My-Posh template expressions
3. **Segment Processor** - Handle segment-specific logic and data requirements
4. **Mock Provider** - React context to make mock data available throughout the component tree
5. **Segment Renderer Integration** - Modify the existing segment renderer to use mock data

### Component Relationships

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Mock Data     │────▶│   Segment       │────▶│   Segment       │
│   Provider      │     │   Processor     │     │   Renderer      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │
         │                      │
         ▼                      ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│   Template      │◀────│   Mock Data     │
│   Resolver      │     │   Interface     │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

## Implementation Details

### 1. Mock Data Interface

```typescript
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
```

### 2. Default Mock Data

```typescript
// src/mocks/defaultData.ts
import { MockData } from './types';

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
    currentDir: '/home/user/projects/my-project',
    homeDir: '/home/user',
  },
  time: { now: new Date() },
};
```

### 3. Template Resolver

The template resolver handles Oh-My-Posh template expressions like:
- Simple variables: `{{ .Env.HOME }}`
- Functions: `{{ round .PhysicalPercentUsed .Precision }}`
- Conditionals: `{{ if .Working.Changed }}modified{{ end }}`

```typescript
// src/mocks/templateResolver.ts
import { MockData } from './types';

export class TemplateResolver {
  private mockData: MockData;

  constructor(mockData: MockData) {
    this.mockData = mockData;
  }

  resolveTemplate(template: string): string {
    if (!template) return '';

    // Match all template patterns {{ ... }}
    const matches = template.match(/\{\{\s*([^}]+)\s*\}\}/g);
    if (!matches) return template;

    let result = template;

    for (const match of matches) {
      const expression = match.replace(/\{\{\s*|\s*\}\}/g, '').trim();
      const value = this.evaluateExpression(expression);
      result = result.replace(match, String(value));
    }

    return result;
  }

  // Evaluates expressions like ".Env.HOME" or "round .PhysicalPercentUsed .Precision"
  private evaluateExpression(expression: string): any {
    // Implementation details for different expression types...
  }
}
```

### 4. Segment Processor

The segment processor handles segment-specific logic:

```typescript
// src/mocks/segmentProcessor.ts
import { Segment } from '@rbleattler/omp-ts-typegen';
import { MockData } from './types';
import { TemplateResolver } from './templateResolver';

export class SegmentProcessor {
  private mockData: MockData;
  private templateResolver: TemplateResolver;

  constructor(mockData: MockData) {
    this.mockData = mockData;
    this.templateResolver = new TemplateResolver(mockData);
  }

  processSegment(segment: Segment): Segment {
    // Process templates and segment-specific logic
    // Return a processed segment with mock data applied
  }

  // Segment-specific processors
  private processOsSegment(segment: Segment): Segment {
    // OS-specific logic
  }

  private processGitSegment(segment: Segment): Segment {
    // Git-specific logic
  }

  // More segment processors...
}
```

### 5. Mock Provider

A React context provider for the mock system:

```typescript
// src/mocks/mockProvider.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { MockData } from './types';
import { defaultMockData } from './defaultData';
import { SegmentProcessor } from './segmentProcessor';

interface MockContextValue {
  mockData: MockData;
  segmentProcessor: SegmentProcessor;
}

const MockContext = createContext<MockContextValue | undefined>(undefined);

export function MockProvider({
  children,
  mockData = defaultMockData
}: {
  children: ReactNode;
  mockData?: Partial<MockData>;
}) {
  // Merge provided mock data with defaults
  const mergedMockData = { ...defaultMockData, ...mockData };
  const segmentProcessor = new SegmentProcessor(mergedMockData);

  return (
    <MockContext.Provider value={{ mockData: mergedMockData, segmentProcessor }}>
      {children}
    </MockContext.Provider>
  );
}

export function useMock() {
  const context = useContext(MockContext);
  if (!context) {
    throw new Error('useMock must be used within a MockProvider');
  }
  return context;
}
```

## Integration with Segment Renderer

To use the mock system in the segment renderer:

```typescript
// src/components/segmentRenderer.tsx
import { Segment } from '@rbleattler/omp-ts-typegen';
import { useMock } from '../mocks/mockProvider';

export function renderSegments(segments: Segment[] | undefined) {
  const { segmentProcessor } = useMock();

  if (!segments || segments.length === 0) {
    return null;
  }

  return segments.map((segment, index) => {
    // Process the segment with mock data
    const processedSegment = segmentProcessor.processSegment(segment);

    // Rest of the segment rendering logic...
  });
}
```

## Usage Example

```tsx
// example/app.tsx
import Terminal from '../src/components/Terminal';
import Prompt from '../src/components/prompt';
import { MockProvider } from '../src/mocks/mockProvider';
import * as omp from '@rbleattler/omp-ts-typegen';

const App = () => {
  // Create a sample oh-my-posh config
  const sampleConfig: omp.Config = {
    // Config details...
  };

  // Custom mock data (optional)
  const customMockData = {
    git: {
      branch: 'feature/mock-system',
      status: {
        working: { changed: true, string: '3' },
        staging: { changed: true, string: '2' },
      },
    },
  };

  const samplePrompt = new Prompt({
    config: sampleConfig,
    cursor: 0,
  });

  return (
    <MockProvider mockData={customMockData}>
      <div className="container">
        <h1>OMP Terminal Component Example</h1>
        <Terminal
          prompt={samplePrompt}
          title="Example Terminal"
          os="windows"
        />
      </div>
    </MockProvider>
  );
};
```

## Extension Points

The mock system can be extended in several ways:

1. **Adding new mock data** - Extend the `MockData` interface and provide values
2. **Supporting new template functions** - Add new function handlers in `TemplateResolver`
3. **Adding segment processors** - Implement new segment-specific processors
4. **Custom mock providers** - Create specialized mock providers for specific scenarios

## Benefits

1. **Consistent demos** - Presentations and documentation show consistent terminal output
2. **Testing** - Component tests can run with predictable data
3. **Development** - Work on the terminal component without needing real system metrics
4. **Customization** - Easily show different states for documentation or marketing

## Implementation Plan

1. Create the core mock data types and defaults
2. Implement the template resolver
3. Build the segment processor with support for common segment types
4. Create the React context provider
5. Update the segment renderer to use the mock system
6. Document the system and provide examples
7. Add extension points for additional segment types
