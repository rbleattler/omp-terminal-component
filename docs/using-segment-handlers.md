# Using Segment Handlers in Custom Components

This guide explains how to use the dynamically generated Oh My Posh segment handlers in your own custom components.

## Overview

The Oh My Posh Terminal React Component uses a dynamic code generation system to create TypeScript handlers for all segment types defined in the original Oh My Posh golang implementation. These handlers can be accessed and used in your custom components to process segment data consistently with the main terminal component.

## Basic Usage

To use segment handlers in your custom components:

1. Import the `useMock` hook to access the segment processor
2. Use the processor to process your segment data
3. Render the processed segment

```tsx
import React from 'react';
import { Segment } from '@rbleattler/omp-ts-typegen';
import { useMock } from '../mocks/mockProvider';

interface CustomSegmentProps {
  segment: Segment;
}

export function CustomSegment({ segment }: CustomSegmentProps) {
  const { segmentProcessor } = useMock();

  // Process the segment using the appropriate handler
  const processedSegment = segmentProcessor.processSegment(segment);

  // Skip rendering if the segment is not visible
  if (processedSegment.visible === false) {
    return null;
  }

  return (
    <div className="custom-segment" style={{
      color: processedSegment.foreground || 'inherit',
      backgroundColor: processedSegment.background || 'transparent',
    }}>
      {processedSegment.properties?.text || '[No Text]'}
    </div>
  );
}
```

## Accessing Specific Segment Handlers

If you need direct access to a specific segment handler rather than using the segment processor:

```tsx
import React from 'react';
import { Segment } from '@rbleattler/omp-ts-typegen';
import { useMock } from '../mocks/mockProvider';
import { createSegmentHandlerRegistry } from '../segments/handlers';

export function GitInfoComponent() {
  const { mockData } = useMock();

  // Get all handlers
  const handlers = createSegmentHandlerRegistry(mockData);

  // Get the git handler specifically
  const gitHandler = handlers.git;

  // Create a git segment
  const gitSegment: Segment = {
    type: 'git',
    properties: {
      fetch_status: true,
      fetch_stash_count: true
    }
  };

  // Process the segment with the git handler
  const processedSegment = gitHandler.processSegment(gitSegment);

  return (
    <div className="git-info">
      <div>Branch: {processedSegment.properties?.branch || 'N/A'}</div>
      <div>Status: {processedSegment.properties?.text || 'N/A'}</div>
    </div>
  );
}
```

## Creating Custom Segments

You can create custom segments and process them using the segment processor:

```tsx
import React from 'react';
import { Segment } from '@rbleattler/omp-ts-typegen';
import { useMock } from '../mocks/mockProvider';

export function CustomTimeSegment() {
  const { segmentProcessor } = useMock();

  // Create a custom time segment
  const timeSegment: Segment = {
    type: 'time',
    foreground: '#ffffff',
    background: '#007acc',
    properties: {
      time_format: 'HH:MM:SS', // Format for the time
      template: '{{ .CurrentDate | date "2006-01-02" }} {{ .CurrentDate | date "15:04:05" }}',
    }
  };

  // Process the segment
  const processedSegment = segmentProcessor.processSegment(timeSegment);

  return (
    <div className="custom-time" style={{
      color: processedSegment.foreground || 'inherit',
      backgroundColor: processedSegment.background || 'transparent',
    }}>
      {processedSegment.properties?.text || 'N/A'}
    </div>
  );
}
```

## Using Template Resolution

Many segment handlers use templates for rendering text. You can access the template resolver directly to resolve custom templates:

```tsx
import React from 'react';
import { useMock } from '../mocks/mockProvider';
import { TemplateResolver } from '../mocks/templateResolver';

export function TemplateExample() {
  const { mockData } = useMock();
  const templateResolver = new TemplateResolver(mockData);

  // Define a template
  const template = 'Hello {{ .Name }}! Today is {{ .CurrentDate | date "Monday, January 2, 2006" }}';

  // Add custom data to the template context
  const customData = {
    Name: 'User',
    CustomValue: 42
  };

  // Resolve the template with custom data
  const resolvedText = templateResolver.resolveTemplate(template, customData);

  return <div>{resolvedText}</div>;
}
```

## Integrating with MockProvider

For your component to work with segment handlers, it needs to be wrapped with the MockProvider:

```tsx
import React from 'react';
import { MockProvider } from '../mocks/mockProvider';
import YourCustomComponent from './YourCustomComponent';

export function App() {
  // Optional: Provide custom mock data
  const customMockData = {
    git: {
      branch: 'feature/custom-feature',
      isGitRepo: true,
      status: {
        working: { changed: true, string: '2' },
        staging: { changed: true, string: '1' }
      }
    }
  };

  return (
    <MockProvider mockData={customMockData}>
      <YourCustomComponent />
    </MockProvider>
  );
}
```

## Performance Considerations

1. Segment processing involves template resolution, which can be expensive if done frequently
2. Consider memoizing processed segments if they don't change often
3. Use React.memo for components that render segments that don't change frequently

```tsx
import React, { useMemo } from 'react';
import { Segment } from '@rbleattler/omp-ts-typegen';
import { useMock } from '../mocks/mockProvider';

export function OptimizedSegmentRenderer({ segment }: { segment: Segment }) {
  const { segmentProcessor } = useMock();

  // Memoize the processed segment to avoid unnecessary processing
  const processedSegment = useMemo(() => {
    return segmentProcessor.processSegment(segment);
  }, [segment, segmentProcessor]);

  if (processedSegment.visible === false) {
    return null;
  }

  return (
    <div>{processedSegment.properties?.text || 'N/A'}</div>
  );
}

// Memoize the component to avoid unnecessary re-renders
export default React.memo(OptimizedSegmentRenderer);
```

## Troubleshooting

### Missing Segment Handlers

If you encounter errors about missing segment handlers:

1. Ensure that the segment type is spelled correctly and in lowercase
2. Check that the build process has generated the necessary handlers
3. Run `npm run generate:segments` manually to ensure all handlers are generated

### Template Resolution Errors

If templates aren't resolving correctly:

1. Check that the template syntax is valid
2. Verify that the required data is available in the mock data
3. Use console.log to debug the template resolution process

### Custom Handler Integration

If your custom handlers aren't being used:

1. Check that the custom handler is properly registered in the custom registry
2. Verify that the handler implements the SegmentHandler interface correctly
3. Ensure the MockProvider is properly set up with the necessary mock data
