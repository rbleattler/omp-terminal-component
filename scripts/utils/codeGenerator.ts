/**
 * codeGenerator.ts
 *
 * Utilities for generating TypeScript code from parsed golang segment implementations.
 * This module transforms the parsed segment data into TypeScript handlers and types.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { ParsedSegment, SegmentProperty, SegmentFunction, SegmentTemplate } from './golangParser';

/**
 * Generates TypeScript handlers for all parsed segments.
 *
 * @param parsedSegments Array of parsed segment implementations
 * @param outputDir Directory to write generated handler files
 * @param typesDir Directory to write generated type files
 * @param force Whether to overwrite existing files
 */
export async function generateSegmentHandlers(
  parsedSegments: ParsedSegment[],
  outputDir: string,
  typesDir: string,
  force: boolean
): Promise<void> {
  // Generate type definitions first
  await generateTypeDefinitions(parsedSegments, typesDir, force);

  // Generate handler implementations for each segment
  for (const segment of parsedSegments) {
    const handlerCode = generateSegmentHandlerCode(segment);
    const outputFile = path.join(outputDir, `${segment.name}Handler.ts`);

    // Check if file exists and force flag is not set
    const exists = await fs.pathExists(outputFile);
    if (exists && !force) {
      console.log(`Handler for ${segment.name} already exists. Skipping.`);
      continue;
    }

    // Write handler file
    await fs.writeFile(outputFile, handlerCode, 'utf8');
    console.log(`Generated handler for segment: ${segment.name}`);
  }
}

/**
 * Generates TypeScript type definitions for all parsed segments.
 *
 * @param parsedSegments Array of parsed segment implementations
 * @param typesDir Directory to write generated type files
 * @param force Whether to overwrite existing files
 */
async function generateTypeDefinitions(
  parsedSegments: ParsedSegment[],
  typesDir: string,
  force: boolean
): Promise<void> {
  const typeFile = path.join(typesDir, 'generatedSegments.d.ts');

  // Check if file exists and force flag is not set
  const exists = await fs.pathExists(typeFile);
  if (exists && !force) {
    console.log('Type definitions already exist. Skipping.');
    return;
  }

  // Generate combined type definitions for all segments
  let typeCode = `/**
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

`;

  // Add segment-specific type interfaces
  for (const segment of parsedSegments) {
    typeCode += generateSegmentTypeDefinition(segment);
  }

  // Write type definitions file
  await fs.writeFile(typeFile, typeCode, 'utf8');
  console.log('Generated segment type definitions');
}

/**
 * Generates a TypeScript type definition for a segment.
 *
 * @param segment Parsed segment implementation
 * @returns TypeScript type definition code
 */
function generateSegmentTypeDefinition(segment: ParsedSegment): string {
  const typeName = capitalizeFirst(segment.name);

  let typeCode = `
/**
 * Properties for the ${segment.name} segment.
 */
export interface ${typeName}SegmentProps {
`;

  // Add properties
  for (const prop of segment.properties) {
    const tsType = mapGoTypeToTypeScript(prop.type);
    const optionalFlag = prop.isRequired ? '' : '?';
    const description = prop.description.replace(/\n/g, '\n * ');

    typeCode += `  /**
   * ${description}
   */
  ${prop.name}${optionalFlag}: ${tsType};

`;
  }

  typeCode += `}

`;

  return typeCode;
}

/**
 * Generates TypeScript handler code for a segment.
 *
 * @param segment Parsed segment implementation
 * @returns TypeScript handler code
 */
function generateSegmentHandlerCode(segment: ParsedSegment): string {
  const typeName = capitalizeFirst(segment.name);
  const imports = generateImports(segment);

  let handlerCode = `/**
 * ${typeName}Handler.ts
 *
 * Generated segment handler for the ${segment.name} segment.
 * DO NOT EDIT MANUALLY - This file is auto-generated from the golang source.
 * Original source: ${path.basename(segment.sourceFile)}
 */

${imports}
import { Segment } from '@rbleattler/omp-ts-typegen';
import { ${typeName}SegmentProps, SegmentHandler } from '../../types/generatedSegments';
import { TemplateResolver } from '../../mocks/templateResolver';
import { MockData } from '../../mocks/mockData';

/**
 * Handler for ${segment.name} segments.
 * This is auto-generated from the Oh My Posh golang implementation.
 */
export class ${typeName}Handler implements SegmentHandler {
  private templateResolver: TemplateResolver;
  private mockData: MockData;

  /**
   * Creates a new ${typeName}Handler instance.
   *
   * @param mockData Mock data for resolving templates and dynamic values
   */
  constructor(mockData: MockData) {
    this.mockData = mockData;
    this.templateResolver = new TemplateResolver(mockData);
  }

`;

  // Add template constants
  for (const template of segment.templates) {
    const description = template.description ? `\n   * ${template.description}` : '';
    handlerCode += `  /**
   * Template for ${template.name.replace('Template', '')}${description}
   */
  private ${template.name} = "${escapeString(template.template)}";

`;
  }

  // Add isEnabled method
  handlerCode += `  /**
   * Determines if the ${segment.name} segment should be enabled.
   *
   * @param segment The segment to check
   * @returns Whether the segment should be enabled
   */
  public isEnabled(segment: Segment): boolean {
    // Default implementation assumes the segment is always enabled
    // This would be overridden with specific logic from the golang implementation
    return segment.properties?.always_enabled === true || true;
  }

`;

  // Add processSegment method
  handlerCode += `  /**
   * Processes a ${segment.name} segment.
   *
   * @param segment The segment to process
   * @returns The processed segment
   */
  public processSegment(segment: Segment): Segment {
    // Create a copy of the segment to avoid modifying the original
    const processedSegment = { ...segment };
    const props = processedSegment.properties as ${typeName}SegmentProps;

    // Skip processing if the segment is not enabled
    if (!this.isEnabled(processedSegment)) {
      return { ...processedSegment, visible: false };
    }

`;

  // Add template resolution if segment has template property
  if (segment.templates.length > 0 || hasTemplateFunction(segment)) {
    handlerCode += `    // Process template if present
    if (props.template) {
      const resolvedText = this.templateResolver.resolveTemplate(props.template);
      processedSegment.properties = {
        ...processedSegment.properties,
        text: resolvedText
      };
    } else {
      // Use default template
      const defaultTemplate = this.getDefaultTemplate(processedSegment);
      if (defaultTemplate) {
        const resolvedText = this.templateResolver.resolveTemplate(defaultTemplate);
        processedSegment.properties = {
          ...processedSegment.properties,
          text: resolvedText
        };
      }
    }

`;
  }

  // Handle specific methods based on segment name
  handlerCode += generateSegmentSpecificProcessing(segment);

  handlerCode += `    return processedSegment;
  }

  /**
   * Gets the default template for the segment.
   *
   * @param segment The segment
   * @returns The default template string
   */
  private getDefaultTemplate(segment: Segment): string {
`;

  // If templates exist, use the main template
  if (segment.templates.length > 0) {
    const mainTemplate = segment.templates.find(t =>
      t.name === 'mainTemplate' ||
      t.name === 'defaultTemplate' ||
      t.name.includes('Template')
    );

    if (mainTemplate) {
      handlerCode += `    return this.${mainTemplate.name};
`;
    } else {
      handlerCode += `    return "";
`;
    }
  } else {
    handlerCode += `    return "";
`;
  }

  handlerCode += `  }
}

/**
 * Creates a new ${typeName}Handler instance.
 *
 * @param mockData Mock data for the segment
 * @returns A new ${typeName}Handler instance
 */
export function create${typeName}Handler(mockData: MockData): ${typeName}Handler {
  return new ${typeName}Handler(mockData);
}
`;

  return handlerCode;
}

/**
 * Generates import statements for a segment handler.
 *
 * @param segment Parsed segment implementation
 * @returns Import statements
 */
function generateImports(segment: ParsedSegment): string {
  const imports: string[] = [];

  // Add any necessary imports based on segment requirements

  return imports.join('\n');
}

/**
 * Generates segment-specific processing code.
 *
 * @param segment Parsed segment implementation
 * @returns Segment-specific code
 */
function generateSegmentSpecificProcessing(segment: ParsedSegment): string {
  let code = '';

  // Add special handling based on segment type
  switch (segment.name) {
    case 'git':
      code += `    // Handle git-specific properties
    const gitInfo = this.mockData.git;
    if (gitInfo) {
      processedSegment.properties = {
        ...processedSegment.properties,
        branch: gitInfo.branch,
        working: gitInfo.status?.working,
        staging: gitInfo.status?.staging,
        ahead: gitInfo.status?.ahead,
        behind: gitInfo.status?.behind,
        stashCount: gitInfo.stashCount
      };
    }

`;
      break;

    case 'path':
      code += `    // Handle path-specific properties
    const pathInfo = this.mockData.path;
    if (pathInfo) {
      processedSegment.properties = {
        ...processedSegment.properties,
        pwd: pathInfo.pwd,
        folder: pathInfo.Location,
        home: this.mockData.env?.HOME
      };
    }

`;
      break;

    case 'os':
      code += `    // Handle OS-specific properties
    const osInfo = process.platform;
    let icon = '';

    // Set icon based on platform
    if (osInfo === 'win32') {
      icon = props.windows || '󰨡';
    } else if (osInfo === 'darwin') {
      icon = props.macos || '';
    } else {
      icon = props.linux || '󰌽';
    }

    processedSegment.properties = {
      ...processedSegment.properties,
      text: icon
    };

`;
      break;

    case 'shell':
      code += `    // Handle shell-specific properties
    const shellInfo = this.mockData.shell;
    if (shellInfo) {
      processedSegment.properties = {
        ...processedSegment.properties,
        name: shellInfo.name
      };
    }

`;
      break;

    case 'time':
      code += `    // Handle time-specific properties
    const now = this.mockData.time?.now || new Date();
    const timeFormat = props.time_format || "15:04:05";

    // Format the time according to the format string
    const formattedTime = formatTime(now, timeFormat);

    processedSegment.properties = {
      ...processedSegment.properties,
      text: formattedTime
    };

`;
      break;

    case 'sysinfo':
      code += `    // Handle sysinfo-specific properties
    const sysInfo = this.mockData.system;
    if (sysInfo) {
      if (sysInfo.cpu) {
        processedSegment.properties = {
          ...processedSegment.properties,
          PhysicalPercentUsed: sysInfo.cpu.physicalPercentUsed,
          Precision: sysInfo.cpu.precision
        };
      }

      if (sysInfo.memory) {
        processedSegment.properties = {
          ...processedSegment.properties,
          PhysicalTotalMemory: sysInfo.memory.physicalTotalMemory,
          PhysicalFreeMemory: sysInfo.memory.physicalFreeMemory
        };
      }
    }

`;
      break;

    default:
      // For segments without special handling, add a default comment
      code += `    // Default handling for ${segment.name} segment
    // Add specific processing logic here if needed

`;
  }

  return code;
}

/**
 * Formats a Date object according to a format string.
 * This is a simple implementation to support common format strings.
 *
 * @param date The date to format
 * @param format The format string
 * @returns The formatted date string
 */
function formatTime(date: Date, format: string): string {
  // Replace format specifiers with actual values
  return format
    .replace(/15|HH/g, padZero(date.getHours()))
    .replace(/04|MM/g, padZero(date.getMinutes()))
    .replace(/05|SS/g, padZero(date.getSeconds()));
}

/**
 * Pads a number with a leading zero if it's less than 10.
 *
 * @param num The number to pad
 * @returns The padded number string
 */
function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

/**
 * Maps Go types to TypeScript types.
 *
 * @param goType Go type string
 * @returns Equivalent TypeScript type
 */
function mapGoTypeToTypeScript(goType: string): string {
  const typeMap: Record<string, string> = {
    'string': 'string',
    'bool': 'boolean',
    'int': 'number',
    'float64': 'number',
    'map[string]string': 'Record<string, string>',
    'map[string]interface{}': 'Record<string, any>',
    'map[string]bool': 'Record<string, boolean>',
    'map[string]int': 'Record<string, number>',
    '[]string': 'string[]',
    '[]int': 'number[]'
  };

  return typeMap[goType] || 'any';
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param str Input string
 * @returns String with first letter capitalized
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Escapes special characters in a string.
 *
 * @param str Input string
 * @returns Escaped string
 */
function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}

/**
 * Checks if a segment has a template function.
 *
 * @param segment Parsed segment implementation
 * @returns Whether the segment has a template function
 */
function hasTemplateFunction(segment: ParsedSegment): boolean {
  return segment.functions.some(fn => fn.name === 'Template');
}
