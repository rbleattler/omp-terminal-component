import { Block } from '@rbleattler/omp-ts-typegen';
import renderSegments from './segmentRenderer';

/**
 * Renders blocks from an Oh-My-Posh configuration.
 *
 * @param blocks An array of Block objects from the configuration
 * @returns JSX elements representing the blocks or null if no blocks are provided
 */
export function renderBlocks(blocks: Block[] | undefined) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return blocks.map((block, index) => {
    // Add newline class if newline is true and not the first block
    const shouldAddNewline = block.newline && index > 0;

    // Determine the alignment class
    const alignmentClass = block.alignment ? `terminal-block-${block.alignment}` : 'terminal-block-left';

    // Combine classes
    const blockClasses = [
      'terminal-block',
      alignmentClass,
      shouldAddNewline ? 'terminal-block-newline' : '',
      `terminal-block-type-${block.type || 'default'}`
    ].filter(Boolean).join(' ');

    return (
      <div key={ index } className={ blockClasses }>
        {renderSegments(block.segments)}
      </div>
    );
  });
}

export default renderBlocks;
