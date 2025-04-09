# Implement Dynamic TypeScript Code Generation from Oh My Posh Golang Source

This commit adds a build-time code generation system that dynamically creates TypeScript functions and complementary code for all segments from the Oh My Posh golang codebase. This eliminates the need to maintain a parallel codebase that manually replicates Oh My Posh segment functionality.

## Key Changes

- Added a Node.js script that extracts segment implementations from the Oh My Posh golang source
- Created a build process that runs before TypeScript compilation to generate segment handlers
- Implemented a registry system for dynamically generated segment handlers
- Updated the SegmentProcessor to use the generated segment handlers
- Enhanced the segment renderer to take advantage of the dynamically generated code
- Added comprehensive documentation and tests

## Why This Change Is Needed

Previously, we would have needed to manually implement TypeScript versions of all Oh My Posh segment handlers and keep them in sync with changes to the golang codebase. This would be time-consuming and error-prone.

By dynamically generating the TypeScript code at build time, we ensure:
1. Complete feature parity with Oh My Posh
2. Automatic updates when Oh My Posh adds or modifies segments
3. Consistent behavior between the native Oh My Posh and our React component
4. Reduced maintenance burden

## Technical Implementation

The code generation process:
1. Downloads the Oh My Posh golang source
2. Analyzes segment implementation files
3. Extracts properties, functions, and templates
4. Generates equivalent TypeScript code
5. Creates a registry of segment handlers
6. Integrates with the existing segment processor

This approach bridges the gap between the golang implementation and our TypeScript/React component while maintaining type safety and performance.
