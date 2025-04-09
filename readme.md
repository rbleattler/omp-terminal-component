# Oh My Posh Terminal React Component

A React component that renders the likeness of a terminal using an Oh My Posh configuration, providing a customizable and cross-platform terminal UI experience.

## Features

- Renders Oh My Posh prompts in a React component
- Full support for all Oh My Posh segment types
- Dynamic code generation from Oh My Posh golang source
- Nerd Font rendering support
- Customizable terminal appearance

## Installation

```bash
npm install omp-terminal-component
```

## Quick Start

```jsx
import React from 'react';
import Terminal from 'omp-terminal-component';
import Prompt from 'omp-terminal-component/dist/components/prompt';
import * as omp from '@rbleattler/omp-ts-typegen';

// Your Oh My Posh config object
const ompConfig = {
  // Oh My Posh configuration...
};

function App() {
  return (
    <div className="app">
      <Terminal
        prompt={new Prompt({ config: ompConfig })}
        title="My Terminal"
        os="windows"
      />
    </div>
  );
}
```

## How It Works

The component uses a dynamic code generation system to maintain feature parity with Oh My Posh. At build time, it fetches the Oh My Posh golang source code and generates TypeScript segment handlers that replicate the behavior of the original implementation.

### Segment Types

The component supports all segment types available in Oh My Posh, including but not limited to:

- Git status and information
- Path and directory information
- OS and platform details
- Time and date
- System information
- Shell information
- And many more...

For a full list, see [Segment Types Documentation](./docs/segments/segmenttypes.md).

## Development

### Prerequisites

- Node.js 14+
- npm 7+

### Setup

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start the development server with example
npm run start:example
```

### Building

```bash
# Full build with code generation
npm run build

# Fast build (skips code generation)
npm run build:fast

# Generate segment code only
npm run generate:segments
```

## Documentation

- [Code Generation](./docs/code-generation.md) - How the dynamic TypeScript code generation works
- [Mock System](./docs/mocksystem.md) - How the mocking system provides data for segments
- [Nerd Font Renderer](./docs/nerdfontrender.md) - How Nerd Font icons are rendered

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.


