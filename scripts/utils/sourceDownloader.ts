/**
 * sourceDownloader.ts
 *
 * Utility for fetching the Oh My Posh source code from GitHub.
 * This module downloads and extracts the source code for further processing.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Downloads Oh My Posh source code from GitHub.
 *
 * @param repoUrl URL of the Oh My Posh repository
 * @param targetDir Directory to store the source code
 * @param version Specific version/tag/commit to use (null for latest)
 * @param skipIfExists Whether to skip download if the source already exists
 * @returns Path to the downloaded source
 */
export async function fetchOhMyPoshSource(
  repoUrl: string,
  targetDir: string,
  version: string | null,
  skipIfExists: boolean
): Promise<string> {
  // Check if the target directory already exists
  const exists = await fs.pathExists(targetDir);

  if (exists && skipIfExists) {
    console.log(`Oh My Posh source already exists in ${targetDir}. Skipping download.`);
    return targetDir;
  }

  // Clean up existing directory if it exists
  if (exists) {
    console.log(`Removing existing source in ${targetDir}...`);
    await fs.remove(targetDir);
  }

  // Create the target directory
  await fs.ensureDir(targetDir);

  // Clone the repository
  console.log(`Cloning Oh My Posh repository from ${repoUrl}...`);
  await execAsync(`git clone ${repoUrl} ${targetDir} --depth 1`);

  // Checkout specific version if specified
  if (version) {
    console.log(`Checking out version ${version}...`);
    try {
      await execAsync(`cd ${targetDir} && git checkout ${version}`);
    } catch (error) {
      console.error(`Failed to checkout version ${version}. Using latest.`);
    }
  }

  return targetDir;
}
