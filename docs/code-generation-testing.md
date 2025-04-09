# Testing Strategy for Dynamic Segment Code Generation

This document outlines the testing approach for the dynamic TypeScript code generation system that converts Oh My Posh golang segment implementations into TypeScript code.

## Testing Goals

1. Ensure generated TypeScript code is valid and compiles successfully
2. Verify that segment handlers correctly implement their original golang functionality
3. Confirm the template resolution works as expected
4. Test integration with the React component rendering system

## Testing Levels

### Unit Tests

#### Source Downloader Tests

Tests for the `sourceDownloader.ts` module:
- Test downloading from various Git repositories
- Verify version/tag checkout functionality
- Test error handling for failed downloads
- Test cache functionality when `skipIfExists` is true

```typescript
describe('fetchOhMyPoshSource', () => {
  it('should download the repository when it does not exist', async () => {
    // Test implementation
  });

  it('should skip download when repo exists and skipIfExists is true', async () => {
    // Test implementation
  });

  // More tests...
});
```

#### Golang Parser Tests

Tests for the `golangParser.ts` module:
- Test extraction of segment properties
- Test extraction of functions
- Test extraction of templates
- Test handling of different golang code patterns

```typescript
describe('parseGolangFiles', () => {
  it('should extract segment properties correctly', async () => {
    // Test implementation
  });

  it('should extract template strings', async () => {
    // Test implementation
  });

  // More tests...
});
```

#### Code Generator Tests

Tests for the `codeGenerator.ts` module:
- Test TypeScript type generation for different golang types
- Test handler class generation
- Test special handling for specific segment types

```typescript
describe('generateSegmentHandlers', () => {
  it('should generate valid TypeScript code', async () => {
    // Test implementation
  });

  it('should handle all golang types correctly', async () => {
    // Test implementation
  });

  // More tests...
});
```

#### Registry Generator Tests

Tests for the `registryGenerator.ts` module:
- Test creation of registry with multiple handlers
- Test sorting and organization of handlers

```typescript
describe('createSegmentRegistry', () => {
  it('should include all handlers in the registry', async () => {
    // Test implementation
  });

  // More tests...
});
```

### Integration Tests

#### Full Generation Pipeline Tests

Test the entire code generation pipeline:
- Test end-to-end generation from golang source to TypeScript files
- Verify the complete set of segment handlers is generated
- Check that the registry is properly created and exports all handlers

```typescript
describe('generateSegmentCode', () => {
  it('should generate a complete set of segment handlers', async () => {
    // Test implementation
  });

  it('should create a valid registry with all handlers', async () => {
    // Test implementation
  });

  // More tests...
});
```

#### Segment Processor Integration Tests

Test the integration with the segment processor:
- Test that the segment processor correctly uses generated handlers
- Test the registry lookup functionality
- Test fallback to default handler when a specific handler doesn't exist

```typescript
describe('SegmentProcessor with generated handlers', () => {
  it('should use the correct handler for each segment type', () => {
    // Test implementation
  });

  it('should fall back to the default handler for unknown segment types', () => {
    // Test implementation
  });

  // More tests...
});
```

### Functional Tests

#### Segment Rendering Tests

Test the full rendering of segments with generated handlers:
- Test rendering of different segment types
- Test template resolution within rendered segments
- Test conditional rendering based on mock data

```typescript
describe('Segment Rendering with generated handlers', () => {
  it('should correctly render git segments', () => {
    // Test implementation
  });

  it('should correctly render path segments', () => {
    // Test implementation
  });

  // More tests for other segment types...
});
```

## Test Data

### Mock Golang Source

Create a set of mock golang source files for testing:
- Simple segment implementations
- Segment implementations with complex templates
- Segment implementations with conditional logic
- Implementations representing all common patterns in the Oh My Posh codebase

### Expected Output

Create fixtures for expected output:
- Expected TypeScript interfaces
- Expected handler implementations
- Expected registry content

## Testing Tools

- **Jest**: Primary testing framework
- **ts-jest**: TypeScript support for Jest
- **@testing-library/react**: Testing React components
- **mock-fs**: Mock filesystem for testing file operations

## Test Configuration

```javascript
// jest.config.js additions
module.exports = {
  // Existing configuration...
  moduleNameMapper: {
    // Add mappings for generated code
    '^@generated/(.*)$': '<rootDir>/src/segments/handlers/$1',
  },
  collectCoverageFrom: [
    // Add coverage for generated code
    'scripts/utils/**/*.ts',
    'src/segments/handlers/**/*.ts',
  ],
};
```

## CI Integration

Configure the CI pipeline to:
1. Run the code generation process
2. Run tests against the generated code
3. Verify that all tests pass
4. Report coverage metrics

## Manual Testing

In addition to automated tests, perform manual verification:
1. Review generated code for readability and correctness
2. Compare rendered output with actual Oh My Posh terminal output
3. Test with different Oh My Posh themes and configurations

## Test Documentation

Document test cases in the code:

```typescript
/**
 * Tests the parsing of a git segment implementation.
 *
 * This test verifies that:
 * 1. All properties are correctly extracted
 * 2. Template strings are preserved
 * 3. Function bodies are properly analyzed
 *
 * @see https://github.com/JanDeDobbeleer/oh-my-posh/blob/main/src/segments/git/git.go
 */
it('should correctly parse git segment implementation', () => {
  // Test implementation
});
```
