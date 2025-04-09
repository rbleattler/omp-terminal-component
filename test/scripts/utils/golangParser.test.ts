/**
 * Tests for the Golang parser utility
 */
import { jest } from '@jest/globals';
import * as fs from 'fs-extra';
import { parseGolangFiles, ParsedSegment } from '../../../scripts/utils/golangParser';

// Mock fs-extra
jest.mock('fs-extra');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('golangParser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseGolangFiles', () => {
    it('should correctly parse a git segment implementation', async () => {
      // Mock a git segment implementation file
      const gitSegmentContent = `
package git

import (
	"fmt"
	"strings"
)

// GitProperties properties
type GitProperties struct {
	// The icon to use for the git branch
	BranchIcon string \`json:"branch_icon"\`
	// Whether to fetch the status of the repository
	FetchStatus bool \`json:"fetch_status"\`
	// Whether to display the upstream icon
	FetchUpstreamIcon bool \`json:"fetch_upstream_icon"\`
	// Whether to fetch the stash count
	FetchStashCount bool \`json:"fetch_stash_count"\`
	// Template to use for rendering
	Template string \`json:"template"\`
}

// mainTemplate defines the default format for git
const mainTemplate = "{{ .UpstreamIcon }}{{ .HEAD }}{{ .BranchStatus }}{{ if .Working.Changed }} \\uf044 {{ .Working.String }}{{ end }}"

// Enabled returns true when the segment is enabled
func (g *Git) Enabled() bool {
	return g.env.InRepo()
}

// Template returns the template for the segment
func (g *Git) Template() string {
	if g.properties.Template != "" {
		return g.properties.Template
	}
	return mainTemplate
}
      `;

      // Setup the mock to return our test content
      mockedFs.readFile.mockResolvedValueOnce(gitSegmentContent as any);

      // Create a mock file list with one git segment file
      const mockFiles = ['path/to/git/git.go'];
      jest.spyOn(global, 'require').mockImplementation((path) => {
        if (path === 'glob') {
          return {
            sync: () => mockFiles,
          };
        }
        return jest.requireActual(path);
      });

      // Parse the golang files
      const segments = await parseGolangFiles('path/to/segments');

      // Assertions
      expect(segments.length).toBe(1);
      expect(segments[0].name).toBe('git');
      expect(segments[0].properties.length).toBe(5);

      // Check property extraction
      const branchIconProp = segments[0].properties.find(p => p.name === 'BranchIcon');
      expect(branchIconProp).toBeDefined();
      expect(branchIconProp?.type).toBe('string');
      expect(branchIconProp?.description).toContain('icon to use for the git branch');

      // Check template extraction
      expect(segments[0].templates.length).toBe(1);
      expect(segments[0].templates[0].name).toBe('mainTemplate');
      expect(segments[0].templates[0].template).toContain('{{ .UpstreamIcon }}');

      // Check function extraction
      expect(segments[0].functions.length).toBe(2);
      const templateFunc = segments[0].functions.find(f => f.name === 'Template');
      expect(templateFunc).toBeDefined();
      expect(templateFunc?.body).toContain('return mainTemplate');
    });

    it('should skip non-segment files', async () => {
      // Mock a non-segment implementation file
      const nonSegmentContent = `
package utils

// Some utility function
func DoSomething() string {
  return "something"
}
      `;

      // Setup the mock to return our test content
      mockedFs.readFile.mockResolvedValueOnce(nonSegmentContent as any);

      // Create a mock file list with one non-segment file
      const mockFiles = ['path/to/utils/utils.go'];
      jest.spyOn(global, 'require').mockImplementation((path) => {
        if (path === 'glob') {
          return {
            sync: () => mockFiles,
          };
        }
        return jest.requireActual(path);
      });

      // Parse the golang files
      const segments = await parseGolangFiles('path/to/segments');

      // Assertions
      expect(segments.length).toBe(0);
    });

    it('should handle errors when reading files', async () => {
      // Setup the mock to throw an error
      mockedFs.readFile.mockRejectedValueOnce(new Error('File read error'));

      // Create a mock file list with one file that will cause error
      const mockFiles = ['path/to/error/error.go'];
      jest.spyOn(global, 'require').mockImplementation((path) => {
        if (path === 'glob') {
          return {
            sync: () => mockFiles,
          };
        }
        return jest.requireActual(path);
      });

      // Mock console.warn to prevent test output noise
      const originalConsoleWarn = console.warn;
      console.warn = jest.fn();

      // Parse the golang files
      const segments = await parseGolangFiles('path/to/segments');

      // Restore console.warn
      console.warn = originalConsoleWarn;

      // Assertions
      expect(segments.length).toBe(0);
    });

    it('should handle valid input', () => {
      const result = parseGolangFiles('/valid/path'); // Corrected argument type
      expect(result).resolves.toBeDefined();
    });

    it('should handle invalid input', () => {
      const result = parseGolangFiles(undefined); // Corrected argument type
      expect(result).rejects.toThrow();
    });
  });
});
