/**
 * Tests for the TypeScript code generator utility
 */
import { jest } from '@jest/globals';
import * as fs from 'fs-extra';
import * as path from 'path';
import { generateSegmentHandlers } from '../../../scripts/utils/codeGenerator';
import { ParsedSegment } from '../../../scripts/utils/golangParser';

// Mock fs-extra
jest.mock('fs-extra');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('codeGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the fs.pathExists to always return false by default (files don't exist)
    mockedFs.pathExists.mockResolvedValue(false);
    // Mock fs.ensureDir to do nothing
    mockedFs.ensureDir.mockResolvedValue(undefined);
    // Mock fs.writeFile to do nothing
    mockedFs.writeFile.mockResolvedValue(undefined);
  });

  describe('generateSegmentHandlers', () => {
    it('should generate handler code for a simple segment', async () => {
      // Create a sample parsed segment
      const sampleSegment: ParsedSegment = {
        name: 'git',
        sourceFile: 'src/segments/git/git.go',
        properties: [
          {
            name: 'BranchIcon',
            type: 'string',
            description: 'The icon to use for the git branch',
            isRequired: false
          },
          {
            name: 'FetchStatus',
            type: 'bool',
            description: 'Whether to fetch the status of the repository',
            isRequired: false
          }
        ],
        functions: [
          {
            name: 'Template',
            params: [],
            returnType: 'string',
            body: 'if g.properties.Template != "" {\n\t\treturn g.properties.Template\n\t}\n\treturn mainTemplate',
            description: 'Template returns the template for the segment'
          }
        ],
        templates: [
          {
            name: 'mainTemplate',
            template: '{{ .UpstreamIcon }}{{ .HEAD }}{{ .BranchStatus }}{{ if .Working.Changed }} \\uf044 {{ .Working.String }}{{ end }}',
            description: 'defines the default format for git'
          }
        ]
      };

      // Call the function
      await generateSegmentHandlers(
        [sampleSegment],
        '/output/dir',
        '/types/dir',
        true
      );

      // Check that the right files were written
      expect(mockedFs.writeFile).toHaveBeenCalledTimes(2);

      // Check type definition file
      expect(mockedFs.writeFile.mock.calls[0][0]).toBe(path.join('/types/dir', 'generatedSegments.d.ts'));

      // Check handler file
      expect(mockedFs.writeFile.mock.calls[1][0]).toBe(path.join('/output/dir', 'gitHandler.ts'));

      // Examine the content of the handler file
      const handlerContent = mockedFs.writeFile.mock.calls[1][1] as string;

      // Verify it contains the key components
      expect(handlerContent).toContain('export class GitHandler implements SegmentHandler');
      expect(handlerContent).toContain('private mainTemplate =');
      expect(handlerContent).toContain('public processSegment(segment: Segment): Segment');
      expect(handlerContent).toContain('export function createGitHandler');
    });

    it('should skip generation when file exists and force is false', async () => {
      // Mock that the file already exists
      mockedFs.pathExists.mockResolvedValue(true);

      // Create a sample parsed segment
      const sampleSegment: ParsedSegment = {
        name: 'path',
        sourceFile: 'src/segments/path/path.go',
        properties: [],
        functions: [],
        templates: []
      };

      // Call the function with force=false
      await generateSegmentHandlers(
        [sampleSegment],
        '/output/dir',
        '/types/dir',
        false
      );

      // Check that we didn't write the handler file
      const handlerCallCount = mockedFs.writeFile.mock.calls.filter(
        call => (call[0] as string).includes('pathHandler.ts')
      ).length;

      expect(handlerCallCount).toBe(0);

      // We should still write the types file
      expect(mockedFs.writeFile).toHaveBeenCalledTimes(1);
      expect(mockedFs.writeFile.mock.calls[0][0]).toBe(path.join('/types/dir', 'generatedSegments.d.ts'));
    });

    it('should generate special handling for known segment types', async () => {
      // Create segments for special handling
      const segments: ParsedSegment[] = [
        {
          name: 'os',
          sourceFile: 'src/segments/os/os.go',
          properties: [],
          functions: [],
          templates: []
        },
        {
          name: 'time',
          sourceFile: 'src/segments/time/time.go',
          properties: [],
          functions: [],
          templates: []
        },
        {
          name: 'sysinfo',
          sourceFile: 'src/segments/sysinfo/sysinfo.go',
          properties: [],
          functions: [],
          templates: []
        }
      ];

      // Call the function
      await generateSegmentHandlers(
        segments,
        '/output/dir',
        '/types/dir',
        true
      );

      // Check that all handlers were generated
      expect(mockedFs.writeFile).toHaveBeenCalledTimes(4); // 3 handlers + 1 type file

      // Check special handling code
      const calls = mockedFs.writeFile.mock.calls;

      // OS handler should have platform detection
      const osHandler = calls.find(call =>
        (call[0] as string).includes('osHandler.ts')
      )?.[1] as string;

      expect(osHandler).toContain('process.platform');
      expect(osHandler).toContain('win32');
      expect(osHandler).toContain('darwin');

      // Time handler should have time formatting
      const timeHandler = calls.find(call =>
        (call[0] as string).includes('timeHandler.ts')
      )?.[1] as string;

      expect(timeHandler).toContain('time_format');

      // Sysinfo handler should have CPU and memory handling
      const sysinfoHandler = calls.find(call =>
        (call[0] as string).includes('sysinfoHandler.ts')
      )?.[1] as string;

      expect(sysinfoHandler).toContain('PhysicalPercentUsed');
      expect(sysinfoHandler).toContain('PhysicalTotalMemory');
    });

    it('should handle valid input', () => {
      const result = someFunction(true); // Corrected argument type
      expect(result).toBeDefined();
    });

    it('should handle undefined input', () => {
      const result = someFunction(undefined); // Corrected argument type
      expect(result).toBeUndefined();
    });
  });
});
