// src/mocks/segmentProcessor.ts
import { Segment } from '@rbleattler/omp-ts-typegen';
import { MockData } from "./mockData";
import { TemplateResolver } from './templateResolver';
import { SegmentHandlerRegistry } from '../types/generatedSegments';
import { createSegmentHandlerRegistry } from '../segments/handlers';

/**
 * Processes segments using the appropriate segment handler based on segment type.
 * Combines static and dynamically generated segment handlers.
 */
export class SegmentProcessor {
  private mockData: MockData;
  private templateResolver: TemplateResolver;
  private segmentHandlers: SegmentHandlerRegistry;

  /**
   * Creates a new SegmentProcessor instance.
   *
   * @param mockData Mock data for segments
   */  constructor(mockData: MockData) {
    this.mockData = mockData;
    this.templateResolver = new TemplateResolver(mockData);

    // Initialize segment handlers from the generated registry
    this.segmentHandlers = createSegmentHandlerRegistry(mockData);

    // Look for custom handlers
    try {
      // Use dynamic import to avoid dependency issues if custom handlers don't exist
      const { createCustomSegmentHandlerRegistry } = require('../segments/custom');
      if (createCustomSegmentHandlerRegistry) {
        // Merge custom handlers with generated ones, giving priority to custom handlers
        const customHandlers = createCustomSegmentHandlerRegistry(mockData);
        this.segmentHandlers = { ...this.segmentHandlers, ...customHandlers };
        console.log(`Loaded custom handlers for segment types: ${Object.keys(customHandlers).join(', ')}`);
      }
    } catch (error) {
      // No custom handlers available, just use generated ones
      console.log('No custom segment handlers found. Using generated handlers only.');
    }
  }

  /**
   * Processes a segment using the appropriate handler.
   *
   * @param segment The segment to process
   * @returns The processed segment
   */
  processSegment(segment: Segment): Segment {
    if (!segment || !segment.type) {
      return segment;
    }

    // Find the appropriate handler for this segment type
    const handler = this.segmentHandlers[segment.type.toLowerCase()];

    if (handler) {
      // Use the specific handler for this segment type
      return handler.processSegment(segment);
    }

    // Fall back to default handler if no specific handler exists
    return this.defaultSegmentHandler(segment);
  }

  /**
   * Default handler for segments without a specific handler.
   *
   * @param segment The segment to process
   * @returns The processed segment
   */
  private defaultSegmentHandler(segment: Segment): Segment {
    // Create a copy of the segment to avoid modifying the original
    const processedSegment = { ...segment };

    // If the segment has a template, resolve it
    if (segment.properties?.template) {
      const resolvedText = this.templateResolver.resolveTemplate(segment.properties.template);
      processedSegment.properties = {
        ...processedSegment.properties,
        text: resolvedText
      };
    }

    return processedSegment;
  }
}