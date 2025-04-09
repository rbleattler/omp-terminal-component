# Commit Message

**Title**: Fix build issues and update tests

**Body**:
- Added missing type definitions for `GitMock`, `SysInfoMock`, `ShellMock`, and `PathMock` in `.scratch/MockData.ts`.
- Aligned `MockData` interface in `src/mocks/mockData.ts` with `.scratch/MockData.ts`.
- Used optional chaining and default values in `gitHandler.ts` to handle undefined properties.
- Updated test files to include the required `style` property in `Segment` objects and corrected argument types.
- Updated documentation to reflect the changes.

**Footer**:
Resolves build issues and ensures type consistency across the codebase.
