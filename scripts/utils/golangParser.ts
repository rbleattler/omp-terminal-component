/**
 * golangParser.ts
 *
 * Utilities for parsing golang source files to extract segment implementations.
 * This module identifies and parses segment implementations from the Oh My Posh golang codebase.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';

/**
 * Represents a parsed segment implementation from golang source
 */
export interface ParsedSegment {
  name: string;                  // Segment name/type (e.g., "git", "path")
  sourceFile: string;            // Original golang source file path
  properties: SegmentProperty[]; // Properties defined in the segment
  functions: SegmentFunction[];  // Functions defined for the segment
  templates: SegmentTemplate[];  // Templates used by the segment
}

/**
 * Represents a property defined in a segment
 */
export interface SegmentProperty {
  name: string;           // Property name
  type: string;           // Go type
  description: string;    // Description (from comments)
  defaultValue?: string;  // Default value if specified
  isRequired: boolean;    // Whether the property is required
}

/**
 * Represents a function defined in a segment
 */
export interface SegmentFunction {
  name: string;           // Function name
  params: FunctionParam[]; // Function parameters
  returnType: string;     // Return type
  body: string;           // Function body
  description: string;    // Description (from comments)
}

/**
 * Represents a function parameter
 */
export interface FunctionParam {
  name: string;           // Parameter name
  type: string;           // Parameter type
}

/**
 * Represents a template used in a segment
 */
export interface SegmentTemplate {
  name: string;           // Template name
  template: string;       // Template string
  description: string;    // Description (from comments)
}

/**
 * Finds and parses all segment implementations from the Oh My Posh golang source.
 *
 * @param segmentsDir Directory containing segment implementations
 * @returns Array of parsed segment implementations
 */
export async function parseGolangFiles(segmentsDir: string): Promise<ParsedSegment[]> {
  // Find all golang files in the segments directory
  const files = glob.sync(path.join(segmentsDir, '**/*.go')).filter(file => {
    // Skip test files
    return !file.includes('_test.go');
  });

  const segments: ParsedSegment[] = [];

  // Process each file
  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf8');

      // Extract segment name from filename or package declaration
      const segmentName = extractSegmentName(file, content);

      // Only process files that are actual segment implementations
      if (isSegmentImplementation(content)) {
        const segment: ParsedSegment = {
          name: segmentName,
          sourceFile: file,
          properties: extractProperties(content),
          functions: extractFunctions(content),
          templates: extractTemplates(content),
        };

        segments.push(segment);
      }
    } catch (error) {
      console.warn(`Error parsing file ${file}: ${error}`);
    }
  }

  return segments;
}

/**
 * Extracts the segment name from a file path or content.
 *
 * @param file File path
 * @param content File content
 * @returns Segment name
 */
function extractSegmentName(file: string, content: string): string {
  // Try to extract from package declaration
  const packageMatch = content.match(/package\s+([a-z0-9_]+)/);
  if (packageMatch && packageMatch[1] !== 'segments' && packageMatch[1]) {
    return packageMatch[1];
  }

  // Fall back to filename
  const filename = path.basename(file, '.go');
  return filename;
}

/**
 * Determines if a file contains a segment implementation.
 *
 * @param content File content
 * @returns Whether the file contains a segment implementation
 */
function isSegmentImplementation(content: string): boolean {
  // Check for the presence of a struct that implements the Segment interface
  return (
    content.includes('func (') &&
    content.includes('Template(') &&
    (content.includes('properties') || content.includes('Properties'))
  );
}

/**
 * Extracts segment properties from golang source.
 *
 * @param content File content
 * @returns Array of segment properties
 */
function extractProperties(content: string): SegmentProperty[] {
  const properties: SegmentProperty[] = [];
  // Find properties struct
  const propsMatch = content.match(/type\s+(\w+Properties)\s+struct\s*{([^}]+)}/);
  if (!propsMatch) return properties;

  const propsContent = propsMatch[2] || '';

  // Extract individual properties
  const propertyPattern = /(\w+)\s+([^\n]+?)(\s+\/\/\s*(.+))?$/gm;
  let match;
  while ((match = propertyPattern.exec(propsContent)) !== null) {
    const name = match[1] || '';
    const type = match[2] ? match[2].trim() : '';
    const description = match[4] || '';
    const isRequired = description.toLowerCase().includes('required');    // Extract default value if present
    let defaultValue: string | undefined;
    const defaultMatch = description.match(/default:\s*(.+?)($|,)/i);
    if (defaultMatch && defaultMatch[1]) {
      defaultValue = defaultMatch[1].trim();
    }    properties.push({
      name,
      type,
      description: description || '',
      defaultValue,
      isRequired
    });
  }

  return properties;
}

/**
 * Extracts functions from golang source.
 *
 * @param content File content
 * @returns Array of segment functions
 */
function extractFunctions(content: string): SegmentFunction[] {
  const functions: SegmentFunction[] = [];

  // Look for function declarations
  const funcPattern = /func\s+(?:\([\w\s*]+\)\s+)?(\w+)\(([^)]*)\)\s*([^{]+)?\s*{([^}]+)}/g;
  let match;
  while ((match = funcPattern.exec(content)) !== null) {
    const name = match[1] || '';
    const paramsStr = match[2] || '';
    const returnType = (match[3] || '').trim();
    const body = match[4] || '';

    // Skip if not relevant to segment rendering
    if (!isRelevantFunction(name)) continue;    // Extract function description from preceding comments
    const funcStart = match.index || 0;
    const descriptionMatch = content.substring(0, funcStart).match(/\/\/\s*(.+?)(\n\s*func|$)/);
    const description = descriptionMatch ? descriptionMatch[1] : '';

    // Parse parameters
    const params = parseParameters(paramsStr);

    functions.push({
      name,
      params,
      returnType,
      body,
      description: description || ''
    });
  }

  return functions;
}

/**
 * Determines if a function is relevant for segment rendering.
 *
 * @param name Function name
 * @returns Whether the function is relevant
 */
function isRelevantFunction(name: string): boolean {
  // Include common segment functions and exclude internal helpers
  const relevantNames = ['Template', 'Enabled', 'Init', 'ProcessSegment', 'MapSegmentValues'];
  return relevantNames.includes(name) || name.startsWith('get') || name.startsWith('parse');
}

/**
 * Parses function parameters from a parameter string.
 *
 * @param paramsStr Parameter string
 * @returns Array of function parameters
 */
function parseParameters(paramsStr: string): FunctionParam[] {
  const params: FunctionParam[] = [];

  if (!paramsStr.trim()) return params;

  // Split by commas but account for complex types
  const paramParts = paramsStr.split(',');

  for (const part of paramParts) {    // Split parameter name and type
    const paramMatch = part.trim().match(/(\w+)\s+(.+)/);
    if (paramMatch && paramMatch[1] && paramMatch[2]) {
      params.push({
        name: paramMatch[1],
        type: paramMatch[2].trim()
      });
    }
  }

  return params;
}

/**
 * Extracts templates from golang source.
 *
 * @param content File content
 * @returns Array of segment templates
 */
function extractTemplates(content: string): SegmentTemplate[] {
  const templates: SegmentTemplate[] = [];

  // Find template string constants
  const templatePattern = /([A-Za-z]+Template)\s*=\s*"([^"]+)"/g;
  let match;
  while ((match = templatePattern.exec(content)) !== null) {
    const name = match[1] || '';
    const template = match[2] || '';    // Extract description from preceding comments
    const templateStart = match.index || 0;
    const descriptionMatch = content.substring(0, templateStart).match(/\/\/\s*(.+?)(\n\s*([A-Za-z]+Template)|$)/);
    const description = descriptionMatch ? descriptionMatch[1] : '';

    templates.push({
      name,
      template,
      description: description || ''
    });
  }

  return templates;
}
