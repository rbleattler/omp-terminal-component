# Extending Segment Handlers

This document explains how to extend or customize the behavior of the dynamically generated segment handlers in the Oh My Posh Terminal React Component.

## Overview

The segment handlers in this project are automatically generated from the Oh My Posh golang codebase at build time. This ensures that the React component always stays in sync with the original implementation. However, there may be cases where you need to customize or extend the behavior of specific segment handlers.

## Creating Custom Handlers

To create a custom handler that overrides or extends a generated one:

1. Create a new file in `src/segments/custom/` with the same name as the generated handler (e.g., `gitHandler.ts`)
2. Implement the `SegmentHandler` interface with your custom logic
3. Register your custom handler in the custom registry

### Example Custom Handler

```typescript
// src/segments/custom/gitHandler.ts
import { Segment } from '@rbleattler/omp-ts-typegen';
import { SegmentHandler } from '../../types/generatedSegments';
import { MockData } from '../../mocks/mockData';
import { TemplateResolver } from '../../mocks/templateResolver';

/**
 * Custom handler for git segments that extends the generated one.
 */
export class CustomGitHandler implements SegmentHandler {
  private templateResolver: TemplateResolver;
  private mockData: MockData;

  constructor(mockData: MockData) {
    this.mockData = mockData;
    this.templateResolver = new TemplateResolver(mockData);
  }

  public isEnabled(segment: Segment): boolean {
    // Custom logic to determine if the segment should be enabled
    return this.mockData.git?.isGitRepo === true || segment.properties?.always_enabled === true;
  }

  public processSegment(segment: Segment): Segment {
    // Create a copy of the segment to avoid modifying the original
    const processedSegment = { ...segment };

    // Skip processing if the segment is not enabled
    if (!this.isEnabled(processedSegment)) {
      return { ...processedSegment, visible: false };
    }

    // Custom processing logic
    const gitInfo = this.mockData.git;
    if (gitInfo) {
      // Add custom properties or modify existing ones
      processedSegment.properties = {
        ...processedSegment.properties,
        branch: gitInfo.branch,
        working: gitInfo.status?.working,
        staging: gitInfo.status?.staging,
        text: `[Custom] ${gitInfo.branch}`
      };
    }

    return processedSegment;
  }
}

/**
 * Creates a new CustomGitHandler instance.
 */
export function createCustomGitHandler(mockData: MockData): CustomGitHandler {
  return new CustomGitHandler(mockData);
}
```

### Registering Custom Handlers

To register your custom handlers, create or modify the custom registry:

```typescript
// src/segments/custom/index.ts
import { MockData } from '../../mocks/mockData';
import { SegmentHandlerRegistry } from '../../types/generatedSegments';
import { createCustomGitHandler } from './gitHandler';

/**
 * Creates a registry of custom segment handlers.
 * These will override the generated handlers.
 */
export function createCustomSegmentHandlerRegistry(mockData: MockData): SegmentHandlerRegistry {
  return {
    'git': createCustomGitHandler(mockData),
    // Add more custom handlers here
  };
}
```

Then modify the segment processor to use your custom registry:

```typescript
// src/mocks/segmentProcessor.ts
import { Segment } from '@rbleattler/omp-ts-typegen';
import { MockData } from "./mockData";
import { TemplateResolver } from './templateResolver';
import { SegmentHandlerRegistry } from '../types/generatedSegments';
import { createSegmentHandlerRegistry } from '../segments/handlers';
import { createCustomSegmentHandlerRegistry } from '../segments/custom';

export class SegmentProcessor {
  private mockData: MockData;
  private templateResolver: TemplateResolver;
  private segmentHandlers: SegmentHandlerRegistry;

  constructor(mockData: MockData) {
    this.mockData = mockData;
    this.templateResolver = new TemplateResolver(mockData);

    // Get the generated handlers
    const generatedHandlers = createSegmentHandlerRegistry(mockData);

    // Get the custom handlers (if any)
    const customHandlers = createCustomSegmentHandlerRegistry(mockData);

    // Merge the handlers, with custom ones taking precedence
    this.segmentHandlers = { ...generatedHandlers, ...customHandlers };
  }

  // ... rest of the class
}
```

## Adding New Segment Types

If you need to add support for a segment type that doesn't exist in Oh My Posh yet:

1. Create a new handler in `src/segments/custom/` (e.g., `customSegmentHandler.ts`)
2. Implement the `SegmentHandler` interface
3. Register it in the custom registry with its type name

```typescript
// src/segments/custom/customSegmentHandler.ts
import { Segment } from '@rbleattler/omp-ts-typegen';
import { SegmentHandler } from '../../types/generatedSegments';

export class CustomSegmentHandler implements SegmentHandler {
  // Implementation...
}

// In the custom registry:
export function createCustomSegmentHandlerRegistry(mockData: MockData): SegmentHandlerRegistry {
  return {
    'custom_segment_type': createCustomSegmentHandler(mockData),
  };
}
```

## Debugging Generated Handlers

To debug issues with the generated handlers:

1. Check the generated code in `src/segments/handlers/`
2. Use environment variables to get more verbose output during code generation:

```bash
# Enable debug logging
DEBUG=true npm run generate:segments

# Force regeneration
FORCE_GENERATE=true npm run generate:segments
```

3. Look for generation logs in the console output

## Testing Custom Handlers

When testing custom handlers, follow these best practices:

1. Create unit tests in `test/segments/custom/`
2. Mock the necessary dependencies (MockData, TemplateResolver)
3. Test both the `isEnabled` and `processSegment` methods
4. Test integration with the SegmentProcessor

```typescript
// test/segments/custom/customGitHandler.test.ts
import { CustomGitHandler } from '../../../src/segments/custom/gitHandler';
import { MockData } from '../../../src/mocks/mockData';

describe('CustomGitHandler', () => {
  // Test implementation...
});
```
