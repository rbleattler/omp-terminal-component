/**
 * Tests for custom segment handler integration with the segment processor
 */
import { jest } from '@jest/globals';
import { Segment } from '@rbleattler/omp-ts-typegen';
import { SegmentProcessor } from '../../src/mocks/segmentProcessor';
import { MockData } from '../../src/mocks/mockData';

// Mock the require function to control what modules are loaded
jest.mock('require');

describe('SegmentProcessor with custom handlers', () => {
  let mockData: MockData;

  // Mock segment handlers
  const mockGeneratedHandlers = {
    'git': {
      processSegment: jest.fn(segment => {
        return {
          ...segment,
          properties: {
            ...segment.properties,
            text: 'Generated Git Handler'
          }
        };
      }),
      isEnabled: jest.fn(() => true)
    },
    'path': {
      processSegment: jest.fn(segment => {
        return {
          ...segment,
          properties: {
            ...segment.properties,
            text: 'Generated Path Handler'
          }
        };
      }),
      isEnabled: jest.fn(() => true)
    }
  };

  const mockCustomHandlers = {
    'git': {
      processSegment: jest.fn(segment => {
        return {
          ...segment,
          properties: {
            ...segment.properties,
            text: 'Custom Git Handler'
          }
        };
      }),
      isEnabled: jest.fn(() => true)
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockData = {
      git: { branch: 'main', isGitRepo: true },
      path: { pwd: '/home/user', Location: 'user' },
      env: { HOME: '/home/user' }
    } as any;

    // Setup mocks for the segment handlers
    jest.mock('../../src/segments/handlers', () => ({
      createSegmentHandlerRegistry: () => mockGeneratedHandlers
    }));
  });

  it('should use generated handler when no custom handler exists', () => {
    // Mock the require to not find custom handlers
    jest.spyOn(global, 'require').mockImplementationOnce(() => {
      throw new Error('Module not found');
    });

    // Create processor with mock data
    const processor = new SegmentProcessor(mockData);

    // Create a test segment
    const segment: Segment = {
      type: 'path',
      properties: {}
    };

    // Process the segment
    const processedSegment = processor.processSegment(segment);

    // Should use the generated handler
    expect(processedSegment.properties?.text).toBe('Generated Path Handler');
  });

  it('should use custom handler when available', () => {
    // Mock the require to return custom handlers
    jest.spyOn(global, 'require').mockImplementationOnce(() => ({
      createCustomSegmentHandlerRegistry: () => mockCustomHandlers
    }));

    // Create processor with mock data
    const processor = new SegmentProcessor(mockData);

    // Create a test segment
    const segment: Segment = {
      type: 'git',
      properties: {}
    };

    // Process the segment
    const processedSegment = processor.processSegment(segment);

    // Should use the custom handler
    expect(processedSegment.properties?.text).toBe('Custom Git Handler');
  });

  it('should fall back to default handler when no specific handler exists', () => {
    // Mock the require to return custom handlers
    jest.spyOn(global, 'require').mockImplementationOnce(() => ({
      createCustomSegmentHandlerRegistry: () => mockCustomHandlers
    }));

    // Create processor with mock data
    const processor = new SegmentProcessor(mockData);

    // Create a test segment for a type that doesn't have a handler
    const segment: Segment = {
      type: 'unknown',
      properties: {
        template: '{{ .Text }}',
        Text: 'Default Handler'
      }
    };

    // Process the segment
    const processedSegment = processor.processSegment(segment);

    // Should use the default handler
    expect(processedSegment.properties?.text).toBe('Default Handler');
  });
});
