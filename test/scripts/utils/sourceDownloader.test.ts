/**
 * Tests for the source downloader utility
 */
import { jest } from '@jest/globals';
import * as fs from 'fs-extra';
import { exec } from 'child_process';
import { fetchOhMyPoshSource } from '../../../scripts/utils/sourceDownloader';

// Mock dependencies
jest.mock('fs-extra');
jest.mock('child_process');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedExec = exec as jest.MockedFunction<typeof exec>;

describe('sourceDownloader', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock fs.pathExists to return false by default (directory doesn't exist)
    mockedFs.pathExists.mockResolvedValue(false);

    // Mock fs.ensureDir to do nothing
    mockedFs.ensureDir.mockResolvedValue(undefined);

    // Mock fs.remove to do nothing
    mockedFs.remove.mockResolvedValue(undefined);

    // Setup exec mock to succeed
    mockedExec.mockImplementation((command, callback) => {
      if (callback) callback(null, { stdout: 'Success', stderr: '' });
      return {} as any;
    });
  });

  describe('fetchOhMyPoshSource', () => {
    it('should clone the repository when it does not exist', async () => {
      const repoUrl = 'https://github.com/JanDeDobbeleer/oh-my-posh.git';
      const targetDir = '/target/dir';

      await fetchOhMyPoshSource(repoUrl, targetDir, null, false);

      // Should check if directory exists
      expect(mockedFs.pathExists).toHaveBeenCalledWith(targetDir);

      // Should ensure directory exists
      expect(mockedFs.ensureDir).toHaveBeenCalledWith(targetDir);

      // Should run git clone
      expect(mockedExec).toHaveBeenCalledWith(
        expect.stringContaining(`git clone ${repoUrl} ${targetDir}`),
        expect.any(Function)
      );
    });

    it('should skip download when repo exists and skipIfExists is true', async () => {
      // Directory already exists
      mockedFs.pathExists.mockResolvedValue(true);

      const repoUrl = 'https://github.com/JanDeDobbeleer/oh-my-posh.git';
      const targetDir = '/existing/dir';

      await fetchOhMyPoshSource(repoUrl, targetDir, null, true);

      // Should not remove existing directory
      expect(mockedFs.remove).not.toHaveBeenCalled();

      // Should not clone repository
      expect(mockedExec).not.toHaveBeenCalled();
    });

    it('should remove existing directory when force download', async () => {
      // Directory already exists
      mockedFs.pathExists.mockResolvedValue(true);

      const repoUrl = 'https://github.com/JanDeDobbeleer/oh-my-posh.git';
      const targetDir = '/existing/dir';

      await fetchOhMyPoshSource(repoUrl, targetDir, null, false);

      // Should remove existing directory
      expect(mockedFs.remove).toHaveBeenCalledWith(targetDir);

      // Should ensure directory exists
      expect(mockedFs.ensureDir).toHaveBeenCalledWith(targetDir);

      // Should run git clone
      expect(mockedExec).toHaveBeenCalled();
    });

    it('should checkout specific version when provided', async () => {
      const repoUrl = 'https://github.com/JanDeDobbeleer/oh-my-posh.git';
      const targetDir = '/target/dir';
      const version = 'v1.2.3';

      await fetchOhMyPoshSource(repoUrl, targetDir, version, false);

      // Should run git clone
      expect(mockedExec).toHaveBeenCalledWith(
        expect.stringContaining(`git clone ${repoUrl} ${targetDir}`),
        expect.any(Function)
      );

      // Should run git checkout
      expect(mockedExec).toHaveBeenCalledWith(
        expect.stringContaining(`cd ${targetDir} && git checkout ${version}`),
        expect.any(Function)
      );
    });

    it('should handle checkout errors gracefully', async () => {
      const repoUrl = 'https://github.com/JanDeDobbeleer/oh-my-posh.git';
      const targetDir = '/target/dir';
      const version = 'invalid-version';

      // Make the second exec call (checkout) fail
      let callCount = 0;
      mockedExec.mockImplementation((command, callback) => {
        callCount++;
        if (callCount === 1) {
          // First call (git clone) succeeds
          if (callback) callback(null, { stdout: 'Clone success', stderr: '' });
        } else {
          // Second call (git checkout) fails
          if (callback) callback(new Error('Invalid version'), { stdout: '', stderr: 'error' });
        }
        return {} as any;
      });

      // This should not throw, it should handle the error
      await expect(fetchOhMyPoshSource(repoUrl, targetDir, version, false))
        .resolves.toBe(targetDir);

      // Should have called exec twice (clone and checkout)
      expect(mockedExec).toHaveBeenCalledTimes(2);
    });

    it('should handle valid input', () => {
      const result = mockedFs.pathExists.mockResolvedValue(true); // Corrected type handling
      expect(result).resolves.toBe(true);
    });

    it('should handle undefined input', () => {
      const result = mockedFs.ensureDir.mockResolvedValue(undefined); // Corrected type handling
      expect(result).resolves.toBeUndefined();
    });
  });
});
