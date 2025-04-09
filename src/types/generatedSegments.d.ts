/**
 * Generated type definitions for Oh My Posh segments.
 * DO NOT EDIT MANUALLY - This file is auto-generated from the golang source.
 */

import { Segment } from '@rbleattler/omp-ts-typegen';

/**
 * Interface for a segment handler that processes a segment.
 */
export interface SegmentHandler {
  /**
   * Process a segment according to its type-specific logic.
   *
   * @param segment The segment to process
   * @returns The processed segment
   */
  processSegment(segment: Segment): Segment;

  /**
   * Check if the segment should be enabled based on conditions.
   *
   * @param segment The segment to check
   * @returns Whether the segment should be enabled
   */
  isEnabled(segment: Segment): boolean;
}

/**
 * Registry interface for all segment handlers.
 */
export interface SegmentHandlerRegistry {
  [key: string]: SegmentHandler;
}

/**
 * Base properties available on all segment types
 */
export interface BaseSegmentProps {
  /**
   * Template to use for rendering segment content
   */
  template?: string;

  /**
   * Text to display if no template is provided
   */
  text?: string;

  /**
   * Prefix to show before the segment content
   */
  prefix?: string;

  /**
   * Postfix to show after the segment content
   */
  postfix?: string;

  /**
   * Whether the segment should always be enabled regardless of conditions
   */
  always_enabled?: boolean;
}
