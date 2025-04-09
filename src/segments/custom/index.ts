/**
 * Registry for custom segment handlers that override or extend the generated ones.
 * This allows developers to customize segment behavior without modifying the generated code.
 */

import { MockData } from '../../mocks/mockData';
import { SegmentHandlerRegistry } from '../../types/generatedSegments';
import { createCustomGitHandler } from './gitHandler';

/**
 * Creates a registry of custom segment handlers.
 * These handlers will override the generated handlers for the specified segment types.
 *
 * @param mockData Mock data for segments
 * @returns Registry of custom segment handlers
 */
export function createCustomSegmentHandlerRegistry(mockData: MockData): SegmentHandlerRegistry {
  return {
    // Add custom handlers here by segment type
    // Each entry will override the generated handler for that segment type
    'git': createCustomGitHandler(mockData),

    // Example of how to add more custom handlers:
    // 'path': createCustomPathHandler(mockData),
    // 'time': createCustomTimeHandler(mockData),
  };
}
