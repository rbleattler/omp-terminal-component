import '@jest/globals';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/jest-globals';

// Only mock DOM elements if we're in a DOM environment
if (typeof document !== 'undefined') {
  // Store the original createElement method
  const originalCreateElement = document.createElement;

  // Mock for document.createElement for link element
  Object.defineProperty(document, 'createElement', {
    value: function(tag: string) {
      if (tag === 'link') {
        return {
          href: '',
          rel: '',
          setAttribute: jest.fn(),
        };
      }
      return originalCreateElement.call(document, tag);
    },
    configurable: true,
  });

  // Mock for document.head.appendChild
  Object.defineProperty(document.head, 'appendChild', {
    value: jest.fn(),
    configurable: true,
  });

  // Mock for document.head.removeChild
  Object.defineProperty(document.head, 'removeChild', {
    value: jest.fn(),
    configurable: true,
  });
}
