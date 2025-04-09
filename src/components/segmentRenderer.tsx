import { Segment } from '@rbleattler/omp-ts-typegen';
import { useMock } from '../mocks/mockProvider';

/**
 * Renders segments from an Oh-My-Posh block.
 *
 * @param segments An array of Segment objects from a block
 * @returns JSX elements representing the segments or null if no segments are provided
 */


export function renderSegments(segments: Segment[] | undefined) {
  const { segmentProcessor } = useMock();

  if (!segments || segments.length === 0) {
    return null;
  }

  return segments.map((segment, index) => {
    // Process the segment with the appropriate handler
    const processedSegment = segmentProcessor.processSegment(segment);

    // Skip rendering if the segment is not visible
    if (processedSegment.visible === false) {
      return null;
    }

    // Determine styling based on segment properties
    const segmentStyle = {
      color: processedSegment.foreground || 'inherit',
      backgroundColor: processedSegment.background || 'transparent',
    };

    // Combine classes
    const segmentClasses = [
      'terminal-segment',
      `terminal-segment-type-${processedSegment.type || 'default'}`,
      processedSegment.style ? `terminal-segment-style-${processedSegment.style}` : '',
    ].filter(Boolean).join(' ');

    // Get text content for the segment
    const textContent = processedSegment.properties?.text || getSegmentText(processedSegment);

    return (
      <span key={index} className={segmentClasses} style={segmentStyle}>
        {processedSegment.properties?.prefix && (
          <span className="terminal-segment-prefix">{processedSegment.properties.prefix}</span>
        )}
        <span className="terminal-segment-content">{textContent}</span>
        {processedSegment.properties?.postfix && (
          <span className="terminal-segment-postfix">{processedSegment.properties.postfix}</span>
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
