# Dynamic TypeScript Code Generation from Oh My Posh Golang Codebase

## Description

This PR implements a build-time process that dynamically generates TypeScript functions and complementary code for all segments from the Oh My Posh golang codebase. The goal is to extend the `omp-ts-typegen` types which have been generated from the oh-my-posh profile/theme schema without having to manually maintain a parallel codebase.

## Problem Solved

Currently, the `omp-terminal-react-component` has typings for Oh My Posh segments via the `omp-ts-typegen` package, but it doesn't have implementations for the segment handlers that replicate the behavior of the golang code. This means that:

1. When Oh My Posh adds new segments, we need to manually write TypeScript code to handle them
2. When segment behavior changes in Oh My Posh, we need to manually update our code
3. It's difficult to keep perfect parity with the Oh My Posh implementation

This PR solves this by automating the generation of TypeScript code from the Oh My Posh golang source at build time, ensuring our component always stays in sync with the original implementation.

## Implementation

The implementation involves:

- A Node.js script that fetches and parses the Oh My Posh golang codebase
- A code generation system that creates TypeScript equivalents of the golang segment handlers
- Integration with the build process to run the code generation before TypeScript compilation
- Updates to the SegmentProcessor to use the dynamically generated handlers
- A registry system to manage all the generated segment handlers

For full technical details, see the [implementation plan](./implementation.md).

## User Stories

This PR addresses the following user stories:

1. [Seamless Integration with Oh My Posh Updates](./user_stories.md#user-story-1-developer-integration)
2. [Complete Segment Feature Support](./user_stories.md#user-story-2-feature-parity)
3. [TypeScript Type Safety for Generated Code](./user_stories.md#user-story-3-type-safety)
4. [Efficient Build Process](./user_stories.md#user-story-4-build-performance)
5. [Easily Extend Generated Code](./user_stories.md#user-story-5-extensibility)

## Testing

The changes have been tested with:

- Unit tests for the code generator
- Unit tests for the generated segment handlers
- Integration tests with the SegmentProcessor and SegmentRenderer
- Manual verification against native Oh My Posh output

## Documentation

The PR includes:

- Documentation for the code generation process
- Examples of how to extend or override generated segment handlers
- Comments in the generated code to explain the original golang logic

## Next Steps

After this PR is merged:

1. Add more comprehensive tests for specific segment types
2. Optimize the build process for faster code generation
3. Consider publishing the generated segment handlers as a separate package
