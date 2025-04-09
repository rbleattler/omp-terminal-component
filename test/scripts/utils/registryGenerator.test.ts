/**
 * Tests for the registry generator utility
 */
import { jest } from '@jest/globals';
import * as fs from 'fs-extra';
import * as path from 'path';
import { createSegmentRegistry } from '../../../scripts/utils/registryGenerator';

// Mock fs-extra
jest.mock('fs-extra');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('registryGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fs.writeFile to do nothing
    mockedFs.writeFile.mockResolvedValue(undefined);
  });

  describe('createSegmentRegistry', () => {
    it('should generate a registry with all handler files', async () => {
      // Mock the glob.sync to return a list of handler files
      const mockHandlerFiles = [
        '/output/dir/gitHandler.ts',
        '/output/dir/pathHandler.ts',
        '/output/dir/osHandler.ts',
        '/output/dir/timeHandler.ts',
      ];

      jest.spyOn(global, 'require').mockImplementation((module) => {
        if (module === 'glob') {
          return {
            sync: jest.fn().mockReturnValue(mockHandlerFiles),
          };
        }
        return jest.requireActual(module);
      });

      // Call createSegmentRegistry
      await createSegmentRegistry('/output/dir');

      // Check that the registry file was written
      expect(mockedFs.writeFile).toHaveBeenCalledTimes(1);
      expect(mockedFs.writeFile.mock.calls[0][0]).toBe(path.join('/output/dir', 'index.ts'));

      // Verify registry content includes all handlers
      const registryContent = mockedFs.writeFile.mock.calls[0][1] as string;

      // Should import all handlers
      expect(registryContent).toContain("import { createGitHandler } from './gitHandler';");
      expect(registryContent).toContain("import { createPathHandler } from './pathHandler';");
      expect(registryContent).toContain("import { createOsHandler } from './osHandler';");
      expect(registryContent).toContain("import { createTimeHandler } from './timeHandler';");

      // Should add all handlers to the registry
      expect(registryContent).toContain("'git': createGitHandler(mockData)");
      expect(registryContent).toContain("'path': createPathHandler(mockData)");
      expect(registryContent).toContain("'os': createOsHandler(mockData)");
      expect(registryContent).toContain("'time': createTimeHandler(mockData)");
    });

    it('should handle an empty directory with no handlers', async () => {
      // Mock the glob.sync to return an empty array
      jest.spyOn(global, 'require').mockImplementation((module) => {
        if (module === 'glob') {
          return {
            sync: jest.fn().mockReturnValue([]),
          };
        }
        return jest.requireActual(module);
      });

      // Call createSegmentRegistry
      await createSegmentRegistry('/empty/dir');

      // Check that the registry file was still written
      expect(mockedFs.writeFile).toHaveBeenCalledTimes(1);

      // The registry should be empty but valid
      const registryContent = mockedFs.writeFile.mock.calls[0][1] as string;
      expect(registryContent).toContain('export function createSegmentHandlerRegistry');
      expect(registryContent).toContain('return {');
      expect(registryContent).toContain('};');
    });

    it('should sort handlers alphabetically', async () => {
      // Mock the glob.sync to return an unsorted list of handler files
      const mockHandlerFiles = [
        '/output/dir/zzHandler.ts',
        '/output/dir/aaHandler.ts',
        '/output/dir/mmHandler.ts',
      ];

      jest.spyOn(global, 'require').mockImplementation((module) => {
        if (module === 'glob') {
          return {
            sync: jest.fn().mockReturnValue(mockHandlerFiles),
          };
        }
        return jest.requireActual(module);
      });

      // Call createSegmentRegistry
      await createSegmentRegistry('/output/dir');

      // The registry content should have handlers in alphabetical order
      const registryContent = mockedFs.writeFile.mock.calls[0][1] as string;

      // Extract the order of imports
      const importLines = registryContent.split('\n').filter(line => line.startsWith('import'));

      expect(importLines[0]).toContain('aaHandler');
      expect(importLines[1]).toContain('mmHandler');
      expect(importLines[2]).toContain('zzHandler');
    });

    it('should handle valid input', () => {
      const result = mockedFs.writeFile.mock.calls[0][0]; // Corrected type handling
      expect(result).toBeDefined();
    });

    it('should handle undefined input', () => {
      const result = mockedFs.writeFile.mock.calls[0][1]; // Corrected type handling
      expect(result).toBeUndefined();
    });
  });
});
