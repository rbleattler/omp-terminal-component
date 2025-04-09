/**
 * Example component that demonstrates how to use the dynamically generated segment handlers.
 * This shows integration with the segment processor and how to render processed segments.
 */
import React, { useState, useEffect } from 'react';
import { Segment } from '@rbleattler/omp-ts-typegen';
import { useMock } from '../src/mocks/mockProvider';

interface SegmentExampleProps {
  /**
   * Array of segments to render
   */
  segments?: Segment[];

  /**
   * Custom class name for the container
   */
  className?: string;

  /**
   * Custom style for the container
   */
  style?: React.CSSProperties;
}

/**
 * Component that demonstrates how to use segment handlers to process and render segments.
 * This can be used as a reference for how to integrate with the dynamic segment handlers.
 */
export function SegmentExample({ segments, className, style }: SegmentExampleProps) {
  const { segmentProcessor, mockData } = useMock();
  const [processedSegments, setProcessedSegments] = useState<Segment[]>([]);

  // Example segments to use if none provided
  const defaultSegments: Segment[] = [
    {
      type: 'git',
      foreground: '#ffffff',
      background: '#007acc',
      properties: {
        branch_icon: '\ue725',
        fetch_status: true,
        fetch_stash_count: true
      },
      style: 'plain' // Ensure style is explicitly defined
    },
    {
      type: 'path',
      foreground: '#000000',
      background: '#ffcc00',
      properties: {
        style: 'folder',
        max_depth: 3
      },
      style: 'plain' // Ensure style is explicitly defined
    },
    {
      type: 'time',
      foreground: '#ffffff',
      background: '#444444',
      properties: {
        time_format: '15:04:05',
        template: '{{ .CurrentDate | date "15:04:05" }}'
      },
      style: 'plain' // Ensure style is explicitly defined
    }
  ];

  // Process segments when they change
  useEffect(() => {
    const segmentsToProcess = segments || defaultSegments;
    const processed = segmentsToProcess.map(segment => segmentProcessor.processSegment(segment))
                                       .filter(segment => segment.visible !== false);
    setProcessedSegments(processed);
  }, [segments, segmentProcessor]);

  // Render the processed segments
  return (
    <div className={`segment-example ${className || ''}`} style={style}>
      <h3>Processed Segments Example</h3>
      <div className="segments-container">
        {processedSegments.map((segment, index) => (
          <div
            key={index}
            className={`segment segment-${segment.type}`}
            style={{
              color: segment.foreground || 'inherit',
              backgroundColor: segment.background || 'transparent',
              padding: '8px 12px',
              margin: '4px',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            {segment.properties?.prefix && (
              <span className="segment-prefix">{segment.properties.prefix}</span>
            )}
            <span className="segment-content">{segment.properties?.text || `[${segment.type}]`}</span>
            {segment.properties?.postfix && (
              <span className="segment-postfix">{segment.properties.postfix}</span>
            )}
          </div>
        ))}
      </div>

      <h3>Raw Segment Data</h3>
      <pre style={{ maxHeight: '200px', overflow: 'auto', padding: '8px', backgroundColor: '#f5f5f5' }}>
        {JSON.stringify(processedSegments, null, 2)}
      </pre>

      <h3>Available Mock Data</h3>
      <pre style={{ maxHeight: '200px', overflow: 'auto', padding: '8px', backgroundColor: '#f5f5f5' }}>
        {JSON.stringify(mockData, null, 2)}
      </pre>
    </div>
  );
}

export default SegmentExample;
