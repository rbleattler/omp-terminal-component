/**
 * Tests for the segment renderer with dynamic code generation integration
 */
import React from 'react';
import { render } from '@testing-library/react';
import { renderSegments } from '../../src/components/segmentRenderer';
import { useMock } from '../../src/mocks/mockProvider';
import { SegmentProcessor } from '../../src/mocks/segmentProcessor';
import { MockData } from '../../src/mocks/mockData';

// Mock the useMock hook
jest.mock('../../src/mocks/mockProvider', () => ({
  useMock: jest.fn(),
}));

describe('segmentRenderer with dynamic handlers', () => {
  // Setup mock data and processor
  const mockData: Partial<MockData> = {
    git: {
      branch: 'main',
      isGitRepo: true,
      status: {
        working: { changed: true, string: '1' },
        staging: { changed: false, string: '0' }
      },
      stashCount: 2
    }
  };

  const mockSegmentProcessor = {
    processSegment: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useMock as jest.Mock).mockReturnValue({
      segmentProcessor: mockSegmentProcessor,
      mockData
    });
  });

  it('should render processed segments correctly', () => {
    // Setup test segments
    const testSegments = [
      {
        type: 'git',
        style: 'powerline',
        foreground: '#ffffff',
        background: '#007acc',
        properties: {
          prefix: '<prefix>',
          postfix: '<postfix>',
        }
      }
    ];

    // Setup the processed segment
    const processedSegment = {
      ...testSegments[0],
      properties: {
        ...testSegments[0].properties,
        text: 'processed git segment'
      }
    };

    // Mock the processor to return our processed segment
    mockSegmentProcessor.processSegment.mockReturnValue(processedSegment);

    // Render the segments
    const { container } = render(
      <div>
        {renderSegments(testSegments)}
      </div>
    );

    // Verify that the segment processor was called
    expect(mockSegmentProcessor.processSegment).toHaveBeenCalledWith(testSegments[0]);

    // Verify that the segment was rendered with the processed content
    const segmentElement = container.querySelector('.terminal-segment-content');
    expect(segmentElement).toHaveTextContent('processed git segment');

    // Verify prefix and postfix
    const prefixElement = container.querySelector('.terminal-segment-prefix');
    expect(prefixElement).toHaveTextContent('<prefix>');

    const postfixElement = container.querySelector('.terminal-segment-postfix');
    expect(postfixElement).toHaveTextContent('<postfix>');
  });

  it('should skip segments that are not visible', () => {
    // Setup test segments
    const testSegments = [
      {
        type: 'git',
        style: 'plain', // Added required `style` property
        visible: false
      }
    ];

    // Mock the processor to return the invisible segment
    mockSegmentProcessor.processSegment.mockReturnValue(testSegments[0]);

    // Render the segments
    const { container } = render(
      <div>
        {renderSegments(testSegments)}
      </div>
    );

    // Verify that the segment processor was called
    expect(mockSegmentProcessor.processSegment).toHaveBeenCalled();

    // Verify that no segment was rendered
    const segmentElement = container.querySelector('.terminal-segment');
    expect(segmentElement).toBeNull();
  });

  it('should handle multiple segments', () => {
    // Setup test segments
    const testSegments = [
      {
        type: 'git',
        style: 'powerline', // Added required `style` property
        foreground: '#ffffff',
        background: '#007acc',
        properties: {
          text: 'git segment'
        }
      },
      {
        type: 'path',
        style: 'plain', // Added required `style` property
        foreground: '#000000',
        background: '#ffcc00',
        properties: {
          text: 'path segment'
        }
      }
    ];

    // Mock the processor to return the segments as is
    mockSegmentProcessor.processSegment.mockImplementation(segment => segment);

    // Render the segments
    const { container } = render(
      <div>
        {renderSegments(testSegments)}
      </div>
    );

    // Verify that the segment processor was called for each segment
    expect(mockSegmentProcessor.processSegment).toHaveBeenCalledTimes(2);

    // Verify that all segments were rendered
    const segmentElements = container.querySelectorAll('.terminal-segment');
    expect(segmentElements.length).toBe(2);

    // Verify the content of each segment
    const segmentContents = container.querySelectorAll('.terminal-segment-content');
    expect(segmentContents[0]).toHaveTextContent('git segment');
    expect(segmentContents[1]).toHaveTextContent('path segment');
  });

  it('should return null for empty or undefined segments', () => {
    // Test with empty array
    const { container: emptyContainer } = render(
      <div>
        {renderSegments([])}
      </div>
    );
    expect(emptyContainer.firstChild).toBeEmptyDOMElement();

    // Test with undefined
    const { container: undefinedContainer } = render(
      <div>
        {renderSegments(undefined)}
      </div>
    );
    expect(undefinedContainer.firstChild).toBeEmptyDOMElement();
  });
});
