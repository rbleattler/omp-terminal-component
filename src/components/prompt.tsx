import { Component } from 'react';
import CursorType from './cursorType';
import type { Config } from '@rbleattler/omp-ts-typegen';
import renderBlocks from './blockRenderer';

class Prompt extends Component<{ config: Config, cursor?: CursorType }> {
  config: Config;
  cursor: CursorType;

  // Default Constructor
  constructor(props: { config: Config, cursor?: CursorType }) {
    super(props);
    this.config = props.config;
    this.cursor = props.cursor ?? 0;
  }

  override render(): JSX.Element {
    return (
      <div className="terminal-prompt">
        { renderBlocks(this.config.blocks) }
      </div>
    );
  }
}

export default Prompt;