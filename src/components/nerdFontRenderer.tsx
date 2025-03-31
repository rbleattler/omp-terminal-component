/**
 * Nerd Font Renderer
 *
 * This component handles the rendering of Nerd Font icons in terminal-like interfaces.
 * Since we can't solely rely on webfonts (woff2) to render the icons, we implement a
 * fallback mechanism to render the icons in the terminal.
 *
 * The implementation:
 * 1. Uses `https://www.nerdfonts.com/assets/css/combo.css` to load the Nerd Font icons
 * 2. Identifies the use of unicode icons in the component tree
 * 3. Replaces the unicode icons with the corresponding Nerd Font icon in styled spans
 * 4. Styles the text span to match the Nerd Font icon while preserving overall text flow
 *
 * @module NerdFontRenderer
 */

import React, { useEffect, FC, ReactNode } from 'react';

/**
 * Props interface for the NerdFontRenderer component
 */
interface NerdFontRendererProps {
  /**
   * ReactNode children to be processed for Nerd Font icons
   * Can be strings, arrays, or React elements
   */
  children: ReactNode;
}

/**
 * Determines if a character should be considered "unprintable" or special
 * This is used to identify characters that need special handling, particularly
 * Nerd Font icons that fall in Unicode's Private Use Areas.
 *
 * @param char - Single character string to evaluate
 * @returns Boolean indicating if the character is unprintable/special
 */
export function isUnprintableCharacter(char: string): boolean {
  // Special check for Nerd Font characters
  const code = char.codePointAt(0);
  if (code) {
    // Check if it's in the Private Use Area which Nerd Fonts use
    if ((code >= 0xe000 && code <= 0xf8ff) ||
       (code >= 0xf0000 && code <= 0xfffff) ||
       (code >= 0x100000 && code <= 0x10fffd)) {
      return true;
    }
  }

  // Original checks
  const unprintableRegex = /[^\u0000-\u0009\u000b-\u001f\u007f-\u009f\u2000-\u200f\u2028-\u202f\u205f-\u206f\u3000\ufeff \ue0100-\ue01ef]|[\uFEFF]/;
  const standardPrintableRegex = /[a-z A-Z 0-9|\u0020-\u007e ]/;
  const matchStandardPrintable = standardPrintableRegex.test(char);
  const matchUnprintable = unprintableRegex.test(char);

  return (!matchStandardPrintable && matchUnprintable);
}

/**
 * NerdFontRenderer component
 * Processes children recursively to detect and style Nerd Font icons
 *
 * @param props - Component props (children)
 * @returns JSX element with processed children
 */
const NerdFontRenderer: FC<NerdFontRendererProps> = ({ children }) => {
  /**
   * Effect hook to load Nerd Font CSS when component mounts
   * Cleans up by removing the CSS when component unmounts
   */
  useEffect(() => {
    // Load Nerd Font CSS
    const link = document.createElement('link');
    link.href = 'https://www.nerdfonts.com/assets/css/combo.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      // Clean up when component unmounts
      document.head.removeChild(link);
    };
  }, []);

  /**
   * Determines if a character is a Nerd Font icon
   *
   * @param char - Character to evaluate
   * @returns Boolean indicating if the character is a Nerd Font icon
   */
  const isNerdFontIcon = (char: string): boolean => {
    const code = char.codePointAt(0);
    if (!code) return false;

    // Debug information to help troubleshoot
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      if (code >= 0xe000 && code <= 0xf8ff) {
        console.debug(`Found Nerd Font character: ${char}, code point: ${code.toString(16)}`);
      }
    }

    // Nerd Fonts primarily use these Unicode ranges
    return (
      (code >= 0xe000 && code <= 0xf8ff) ||   // Private Use Area
      (code >= 0xf0000 && code <= 0xfffff) || // Supplementary Private Use Area-A
      (code >= 0x100000 && code <= 0x10fffd)  // Supplementary Private Use Area-B
    );
  };

  /**
   * Processes a text string to identify and wrap Nerd Font icons in styled spans
   *
   * @param text - String to process for Nerd Font icons
   * @returns Array of text nodes and icon span elements
   */
  const renderText = (text: string): ReactNode[] => {
    const result: ReactNode[] = [];
    let currentText = '';

    // Process each character
    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      // Handle surrogate pairs for Unicode characters beyond BMP
      if (
        i + 1 < text.length &&
        char!.charCodeAt(0) >= 0xd800 &&
        char!.charCodeAt(0) <= 0xdbff &&
        text.charCodeAt(i + 1) >= 0xdc00 &&
        text.charCodeAt(i + 1) <= 0xdfff
      ) {
        const pair = char! + text[i + 1];

        if (isNerdFontIcon(pair)) {
          // Push any accumulated text
          if (currentText) {
            result.push(currentText);
            currentText = '';
          }
          // Add the icon with special styling
          result.push(
            <span key={ `icon-${i}` } className="nerd-font-icon" style={ { fontFamily: 'inherit' } }>
              { pair }
            </span>
          );
          i++; // Skip the second part of the surrogate pair
        } else {
          currentText += pair;
          i++; // Skip the second part of the surrogate pair
        }
      } else if (isNerdFontIcon(char!)) {
        // Push any accumulated text
        if (currentText) {
          result.push(currentText);
          currentText = '';
        }
        // Add the icon with special styling
        result.push(
          <span key={ `icon-${i}` } className="nerd-font-icon" style={ { fontFamily: 'inherit' } }>
            { char }
          </span>
        );
      } else {
        currentText += char;
      }
    }

    // Push any remaining text
    if (currentText) {
      result.push(currentText);
    }

    return result;
  };

  /**
   * Recursively processes React component children to find and handle text nodes
   * containing Nerd Font icons
   *
   * @param children - React children to process (string, array, or React element)
   * @returns Processed React nodes with Nerd Font icons wrapped in spans
   */
  const renderChildren = (children: ReactNode): ReactNode => {
    if (typeof children === 'string') {
      return renderText(children);
    }

    if (Array.isArray(children)) {
      return children.map((child, index) => (
        <React.Fragment key={ index }>
          { renderChildren(child) }
        </React.Fragment>
      ));
    }

    if (React.isValidElement(children)) {
      // Use type assertion with a generic type for the element
      const element = React.Children.only(children) as React.ReactElement<{ children?: ReactNode }>;

      return React.cloneElement(
        element,
        {},
        element.props.children ? renderChildren(element.props.children) : null
      );
    }

    return children;
  };

  return <>{ renderChildren(children) }</>;
};

export default NerdFontRenderer;
