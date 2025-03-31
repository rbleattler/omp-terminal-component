import NerdFontRenderer from '../../src/components/nerdFontRenderer';
import { isUnprintableCharacter } from '../../src/components/nerdFontRenderer';
import '../setupTests';
import * as react from '@testing-library/react';
import { describe, test, expect, jest, beforeEach } from '@jest/globals';

describe('NerdFontRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children text correctly', () => {
    const { container } = react.render(<NerdFontRenderer>Hello World</NerdFontRenderer>);
    expect(container.textContent).toBe('Hello World');
  });

  test('loads nerd font CSS on mount', () => {
    react.render(<NerdFontRenderer>Test</NerdFontRenderer>);

    // Check if the link was added to head
    expect(document.head.appendChild).toHaveBeenCalled();
  });

  test('removes nerd font CSS on unmount', () => {
    const { unmount } = react.render(<NerdFontRenderer>Test</NerdFontRenderer>);
    unmount();

    // Check if the link was removed from head
    expect(document.head.removeChild).toHaveBeenCalled();
  });

  test('renders unicode icons with special styling', () => {
    // Use an actual Unicode character from Nerd Font range (this is a rocket icon in many Nerd Font sets)
    const testContent = 'Launch \uf135 now';
    const { container } = react.render(<NerdFontRenderer>{ testContent }</NerdFontRenderer>);

    // Check text content contains the expected text
    expect(container.textContent).toContain('Launch');
    expect(container.textContent).toContain('now');

    // Check that the icon is rendered with the nerd-font-icon class
    const iconElement = container.querySelector('.nerd-font-icon');
    expect(iconElement).not.toBeNull();
    expect(iconElement?.textContent).toBe('\uf135');
  });

  test('handles nested components correctly', () => {
    // Use an actual Unicode character that should be recognized as an icon
    const { container } = react.render(
      <NerdFontRenderer>
        <div>
          <span>Hello {'\uf30d'} World</span>
        </div>
      </NerdFontRenderer>
    );

    expect(container.textContent).toContain('Hello');
    expect(container.textContent).toContain('World');

    const iconElement = container.querySelector('.nerd-font-icon');
    expect(iconElement).not.toBeNull();
    expect(iconElement?.textContent).toBe('\uf30d');
  });

  test('handles array of children', () => {
    const { container } = react.render(
      <NerdFontRenderer>
        { ['Item 1 \uf0c5', 'Item 2 \uf0ce'] }
      </NerdFontRenderer>
    );

    expect(container.textContent).toContain('Item 1');
    expect(container.textContent).toContain('Item 2');

    const iconElements = container.querySelectorAll('.nerd-font-icon');
    expect(iconElements.length).toBe(2);
    expect(iconElements[0]?.textContent).toBe('\uf0c5');
    expect(iconElements[1]?.textContent).toBe('\uf0ce');
  });

  test('handles empty children', () => {
    react.render(<NerdFontRenderer>{ '' }</NerdFontRenderer>);
    // Should not throw an error
  });

  test('handles null/undefined children', () => {
    react.render(<NerdFontRenderer>{ null }</NerdFontRenderer>);
    react.render(<NerdFontRenderer>{ undefined }</NerdFontRenderer>);
    // Should not throw an error
  });

  test('isUnprintableCharacter identifies unprintable characters correctly', () => {
    var standardAndSpecialCharacters = " 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    // Test visible characters
    for (let i = 0; i < standardAndSpecialCharacters.length; i++) {
      const char = standardAndSpecialCharacters[i];
      if (char) {
        expect(isUnprintableCharacter(char)).toBe(false);

      }
    }

    // Test control characters
    expect(isUnprintableCharacter('\u0000')).toBe(false); // Null
    expect(isUnprintableCharacter('\u0007')).toBe(false); // Bell
    expect(isUnprintableCharacter('\u0009')).toBe(false); // Horizontal Tab
    expect(isUnprintableCharacter('\u001F')).toBe(false); // Unit separator

    // Test format characters
    expect(isUnprintableCharacter('\u200B')).toBe(false); // Zero width space
    expect(isUnprintableCharacter('\u2028')).toBe(false); // Line separator
    expect(isUnprintableCharacter('\u206F')).toBe(false); // Nominal digit shapes

    // Test special unicode characters
    expect(isUnprintableCharacter('\u3000')).toBe(false); // Ideographic space
    expect(isUnprintableCharacter('\uFEFF')).toBe(true); // Zero width no-break space

    // Test characters that should be considered "printable"
    expect(isUnprintableCharacter('\u2764')).toBe(false); // Heart symbol
    expect(isUnprintableCharacter('\u26A1')).toBe(false); // Lightning bolt
    expect(isUnprintableCharacter('\uf135')).toBe(true); // Nerd Font rocket icon
  });



});
