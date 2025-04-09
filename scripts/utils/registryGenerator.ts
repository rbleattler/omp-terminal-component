/**
 * registryGenerator.ts
 *
 * Utility for generating a registry of all segment handlers.
 * This module creates an index file that exports all segment handlers.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';

/**
 * Creates a registry of all segment handlers.
 *
 * @param outputDir Directory containing handler files
 */
export async function createSegmentRegistry(outputDir: string): Promise<void> {
  // Find all handler files
  const handlerFiles = glob.sync(path.join(outputDir, '*Handler.ts'));

  // Sort handlers alphabetically
  handlerFiles.sort();

  // Generate registry code
  let registryCode = `/**
 * Generated segment handler registry.
 * DO NOT EDIT MANUALLY - This file is auto-generated.
 */

import { MockData } from '../../mocks/mockData';
import { SegmentHandlerRegistry } from '../../types/generatedSegments';

`;

  // Import all handlers
  for (const file of handlerFiles) {
    const basename = path.basename(file, '.ts');
    const segmentName = basename.replace('Handler', '').toLowerCase();
    registryCode += `import { create${basename} } from './${basename}';\n`;
  }

  // Create registry function
  registryCode += `
/**
 * Creates a registry of all segment handlers.
 *
 * @param mockData Mock data for segments
 * @returns Registry of all segment handlers
 */
export function createSegmentHandlerRegistry(mockData: MockData): SegmentHandlerRegistry {
  return {
`;

  // Add each handler to the registry
  for (const file of handlerFiles) {
    const basename = path.basename(file, '.ts');
    const segmentName = basename.replace('Handler', '').toLowerCase();
    registryCode += `    '${segmentName}': create${basename}(mockData),\n`;
  }

  registryCode += `  };
}
`;

  // Write registry file
  const registryFile = path.join(outputDir, 'index.ts');
  await fs.writeFile(registryFile, registryCode, 'utf8');
  console.log(`Generated segment handler registry with ${handlerFiles.length} handlers`);
}
