import { Segment } from '@rbleattler/omp-ts-typegen';

/**
 * Renders segments from an Oh-My-Posh block.
 *
 * @param segments An array of Segment objects from a block
 * @returns JSX elements representing the segments or null if no segments are provided
 */


export function renderSegments(segments: Segment[] | undefined) {
  if (!segments || segments.length === 0) {
    return null;
  }

  return segments.map((segment, index) => {
    // Determine styling based on segment properties
    const segmentStyle = {
      color: segment.foreground || 'inherit',
      backgroundColor: segment.background || 'transparent',
    };

    // Combine classes
    const segmentClasses = [
      'terminal-segment',
      `terminal-segment-type-${segment.type || 'default'}`,
      segment.style ? `terminal-segment-style-${segment.style}` : '',
    ].filter(Boolean).join(' ');

    // Get text content for the segment
    const textContent = getSegmentText(segment);

    return (
      <span key={index} className={segmentClasses} style={segmentStyle}>
        {segment.properties?.prefix && (
          <span className="terminal-segment-prefix">{segment.properties.prefix}</span>
        )}
        <span className="terminal-segment-content">{textContent}</span>
        {segment.properties?.postfix && (
          <span className="terminal-segment-postfix">{segment.properties.postfix}</span>
        )}
      </span>
    );
  });
}

/**
 * Gets the text content for a segment based on its type and properties.
 *
 * @param segment The segment to get text for
 * @returns The text content of the segment
 */
function getSegmentText(segment: Segment): string {
  // For text segments, use the text property directly
  if (segment.type === 'text' && segment.properties?.text) {
    return segment.properties.text;
  }
  
  // Placeholder for other segment types
  // If no other logic works, then return the following
  return segment.properties?.text || `[${segment.type || 'unknown'}]`;
}

export default renderSegments;
