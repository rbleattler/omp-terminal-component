/**
 * generateSegmentCode.ts
 *
 * This script dynamically generates TypeScript code from the Oh My Posh golang codebase
 * at build time. It fetches the segment implementations from the golang source and
 * creates equivalent TypeScript handlers that extend the omp-ts-typegen types.
 *
 * Usage:
 *   npm run generate:segments
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import { fetchOhMyPoshSource } from './utils/sourceDownloader';
import { parseGolangFiles } from './utils/golangParser';
import { generateSegmentHandlers } from './utils/codeGenerator';
import { createSegmentRegistry } from './utils/registryGenerator';

// Configuration
const CONFIG = {
  // Repository URL for Oh My Posh source code
  repoUrl: 'https://github.com/JanDeDobbeleer/oh-my-posh.git',
  // Directory to store downloaded source code
  sourceDir: path.resolve(__dirname, '../.cache/omp-source'),
  // Output directory for generated TypeScript files
  outputDir: path.resolve(__dirname, '../src/segments/handlers'),
  // Types output directory
  typesDir: path.resolve(__dirname, '../src/types'),
  // Specific version/tag/commit to use (use null for latest)
  version: process.env.OMP_VERSION || null,
  // Path to segment implementations within the source
  segmentsPath: 'src/segments',
  // Whether to skip download if the source already exists
  skipIfExists: process.env.SKIP_DOWNLOAD === 'true',
  // Whether to force generation even if files exist
  force: process.env.FORCE_GENERATE === 'true',
};

async function generateSegmentCode(): Promise<void> {
  try {
    console.log('Starting Oh My Posh segment code generation...');

    // Step 1: Ensure output directories exist
    await fs.ensureDir(CONFIG.outputDir);
    await fs.ensureDir(CONFIG.typesDir);

    // Step 2: Download Oh My Posh source code
    console.log(`Fetching Oh My Posh source code from ${CONFIG.repoUrl}...`);
    const sourcePath = await fetchOhMyPoshSource(
      CONFIG.repoUrl,
      CONFIG.sourceDir,
      CONFIG.version,
      CONFIG.skipIfExists
    );

    // Step 3: Parse golang segment files
    console.log('Parsing golang segment files...');
    const segmentPath = path.join(sourcePath, CONFIG.segmentsPath);
    const parsedSegments = await parseGolangFiles(segmentPath);

    console.log(`Found ${parsedSegments.length} segment implementations`);

    // Step 4: Generate TypeScript handlers from parsed segments
    console.log('Generating TypeScript segment handlers...');
    await generateSegmentHandlers(parsedSegments, CONFIG.outputDir, CONFIG.typesDir, CONFIG.force);

    // Step 5: Create segment registry
    console.log('Creating segment handler registry...');
    await createSegmentRegistry(CONFIG.outputDir);

    console.log('Code generation complete!');
  } catch (error) {
    console.error('Error generating segment code:', error);
    process.exit(1);
  }
}

// Run the code generation
generateSegmentCode().catch(error => {
  console.error('Fatal error during code generation:', error);
  process.exit(1);
});
