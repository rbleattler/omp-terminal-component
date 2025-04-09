/**
 * GitHandler.ts
 *
 * Generated segment handler for the git segment.
 * This is an example of what the generated code will look like.
 * DO NOT EDIT MANUALLY - This file would be auto-generated from the golang source.
 */

import { Segment } from '@rbleattler/omp-ts-typegen';
import { SegmentHandler } from '../../types/generatedSegments';
import { TemplateResolver } from '../../mocks/templateResolver';
import { MockData } from '../../mocks/mockData';

/**
 * Properties for the git segment.
 */
export interface GitSegmentProps {
  /**
   * The icon to use for the git branch
   */
  branch_icon?: string;

  /**
   * Whether to fetch the status of the repository
   */
  fetch_status?: boolean;

  /**
   * Whether to display the upstream icon
   */
  fetch_upstream_icon?: boolean;

  /**
   * Whether to fetch the stash count
   */
  fetch_stash_count?: boolean;

  /**
   * Template to use for rendering the segment
   */
  template?: string;
}

/**
 * Handler for git segments.
 * This is an example of what would be auto-generated from the Oh My Posh golang implementation.
 */
export class GitHandler implements SegmentHandler {
  private templateResolver: TemplateResolver;
  private mockData: MockData;

  /**
   * Default template for git segments
   */
  private defaultTemplate = "{{ .UpstreamIcon }}{{ .HEAD }}{{ .BranchStatus }}{{ if .Working.Changed }} \uf044 {{ .Working.String }}{{ end }}{{ if and (.Working.Changed) (.Staging.Changed) }} |{{ end }}{{ if .Staging.Changed }} \uf046 {{ .Staging.String }}{{ end }}{{ if gt .StashCount 0}} \ueb4b {{ .StashCount }}{{ end }}";

  /**
   * Creates a new GitHandler instance.
   *
   * @param mockData Mock data for resolving templates and git values
   */
  constructor(mockData: MockData) {
    this.mockData = mockData;
    this.templateResolver = new TemplateResolver(mockData);
  }

  /**
   * Determines if the git segment should be enabled.
   *
   * @param segment The segment to check
   * @returns Whether the segment should be enabled
   */
  public isEnabled(segment: Segment): boolean {
    return this.mockData.git?.isGitRepo === true || segment.properties?.always_enabled === true;
  }

  /**
   * Processes a git segment.
   *
   * @param segment The segment to process
   * @returns The processed segment
   */
  public processSegment(segment: Segment): Segment {
    // Create a copy of the segment to avoid modifying the original
    const processedSegment = { ...segment };
    const props = processedSegment.properties as GitSegmentProps;

    // Skip processing if the segment is not enabled
    if (!this.isEnabled(processedSegment)) {
      return { ...processedSegment, visible: false };
    }

    // Use git information from mock data
    const gitInfo = this.mockData.git;
    if (gitInfo) {
      // Add git information to the segment properties
      processedSegment.properties = {
        ...processedSegment.properties,
        HEAD: gitInfo.branch,
        UpstreamIcon: '',
        BranchStatus: '',
        Working: gitInfo.status?.working || { changed: false, string: '' },
        Staging: gitInfo.status?.staging || { changed: false, string: '' },
        StashCount: gitInfo.stashCount || 0
      };
    }

    // Process template if present
    let template = props.template || this.defaultTemplate;
    const resolvedText = this.templateResolver.resolveTemplate(template);
    processedSegment.properties = {
      ...processedSegment.properties,
      text: resolvedText
    };

    return processedSegment;
  }
}

/**
 * Creates a new GitHandler instance.
 *
 * @param mockData Mock data for the segment
 * @returns A new GitHandler instance
 */
export function createGitHandler(mockData: MockData): GitHandler {
  return new GitHandler(mockData);
}
