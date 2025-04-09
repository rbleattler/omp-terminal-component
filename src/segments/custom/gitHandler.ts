/**
 * Custom git segment handler that extends the generated handler with additional functionality.
 * This serves as an example of how to create custom segment handlers.
 */

import { Segment } from '@rbleattler/omp-ts-typegen';
import { SegmentHandler } from '../../types/generatedSegments';
import { MockData } from '../../mocks/mockData';
import { TemplateResolver } from '../../mocks/templateResolver';

/**
 * Custom handler for git segments that adds enhanced functionality.
 */
export class CustomGitHandler implements SegmentHandler {
  private templateResolver: TemplateResolver;
  private mockData: MockData;

  /**
   * Default template with enhanced formatting
   */
  private enhancedTemplate = "{{ .BranchIcon }} {{ .HEAD }}{{ .BranchStatus }}{{ if .Working.Changed }} \uf044 {{ .Working.String }}{{ end }}{{ if and (.Working.Changed) (.Staging.Changed) }} |{{ end }}{{ if .Staging.Changed }} \uf046 {{ .Staging.String }}{{ end }}{{ if gt .StashCount 0}} \ueb4b {{ .StashCount }}{{ end }}";

  /**
   * Creates a new CustomGitHandler instance.
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
    // Always show a git segment in the demo, even if we're not in a git repo
    return true;
  }

  /**
   * Processes a git segment with enhanced functionality.
   *
   * @param segment The segment to process
   * @returns The processed segment
   */
  public processSegment(segment: Segment): Segment {
    // Create a copy of the segment to avoid modifying the original
    const processedSegment = { ...segment };

    // Add custom branch icon if not present
    if (!processedSegment.properties?.branch_icon) {
      processedSegment.properties.branch_icon = '\ue725'; // Git branch icon
    }

    // Use optional chaining and default values to handle possibly undefined properties
    if (processedSegment.properties?.someProperty) {
      // Access properties safely
      const value = processedSegment.properties.someProperty || 'default';
    }

    // Use git information from mock data
    const gitInfo = this.mockData.git;
    if (gitInfo) {
      // Add git information to the segment properties
      processedSegment.properties = {
        ...processedSegment.properties,
        BranchIcon: processedSegment.properties.branch_icon,
        HEAD: gitInfo.branch || 'main',
        BranchStatus: '',
        Working: gitInfo.status?.working || { changed: true, string: '2' },
        Staging: gitInfo.status?.staging || { changed: false, string: '0' },
        StashCount: gitInfo.stashCount || 3
      };
    } else {
      // Provide fallback demo values if no git data available
      processedSegment.properties = {
        ...processedSegment.properties,
        BranchIcon: processedSegment.properties.branch_icon,
        HEAD: 'demo-branch',
        BranchStatus: '',
        Working: { changed: true, string: '2' },
        Staging: { changed: true, string: '1' },
        StashCount: 3
      };
    }

    // Process template if present, otherwise use our enhanced template
    let template = processedSegment.properties.template || this.enhancedTemplate;
    const resolvedText = this.templateResolver.resolveTemplate(template);

    processedSegment.properties = {
      ...processedSegment.properties,
      text: resolvedText
    };

    return processedSegment;
  }
}

/**
 * Creates a new CustomGitHandler instance.
 *
 * @param mockData Mock data for the segment
 * @returns A new CustomGitHandler instance
 */
export function createCustomGitHandler(mockData: MockData): CustomGitHandler {
  return new CustomGitHandler(mockData);
}
