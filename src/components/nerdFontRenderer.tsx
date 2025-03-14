/*

Nerd Font Renderer

Since we can't solely rely on webfonts (woff2) to render the icons, we need to implement a fallback mechanism to render the icons in the terminal. The Nerd Font Renderer will:

1. Use `https://www.nerdfonts.com/assets/css/combo.css` to load the Nerd Font icons
1. Identify the use of unicode icons in the segment
1. Replace the unicode icons with the corresponding Nerd Font icon in the form of a text span
1. Style the text span to match the Nerd Font icon

*/

import React, { useEffect, FC, ReactNode } from 'react';

interface NerdFontRendererProps {
  children: ReactNode;
}

const NerdFontRenderer: FC<NerdFontRendererProps> = ({ children }) => {
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

  // Check if a character is a Nerd Font icon (Unicode private use area)
  const isNerdFontIcon = (char: string): boolean => {
    const code = char.codePointAt(0);
    if (!code) return false;

    // Nerd Fonts primarily use Private Use Area ranges
    return (
      (code >= 0xe000 && code <= 0xf8ff) ||   // Private Use Area
      (code >= 0xf0000 && code <= 0xfffff) || // Supplementary Private Use Area-A
      (code >= 0x100000 && code <= 0x10fffd)  // Supplementary Private Use Area-B
    );
  };

  // Identify unicode icons in text and wrap them in styled spans
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
            <span key={`icon-${i}`} className="nerd-font-icon" style={{ fontFamily: 'inherit' }}>
              {pair}
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
          <span key={`icon-${i}`} className="nerd-font-icon" style={{ fontFamily: 'inherit' }}>
            {char}
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

  // Recursively process children to handle nested components
  const renderChildren = (children: ReactNode): ReactNode => {
    if (typeof children === 'string') {
      return renderText(children);
    }

    if (Array.isArray(children)) {
      return children.map((child, index) => (
        <React.Fragment key={index}>
          {renderChildren(child)}
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

  return <>{renderChildren(children)}</>;
};

export default NerdFontRenderer;

