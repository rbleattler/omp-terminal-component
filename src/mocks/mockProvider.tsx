// src/mocks/mockProvider.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { MockData } from "./MockData";
import { defaultMockData } from './defaultData';
import { SegmentProcessor } from './segmentProcessor';

interface MockContextValue {
  mockData: MockData;
  segmentProcessor: SegmentProcessor;
}

//TODO: Implement the MockProvider component
const MockContext = createContext<MockContextValue | undefined>(undefined);

export function MockProvider({
  children,
  mockData = defaultMockData
}: {
  children: ReactNode;
  mockData?: Partial<MockData>;
}) {
  // Merge provided mock data with defaults
  const mergedMockData = { ...defaultMockData, ...mockData };
  const segmentProcessor = new SegmentProcessor(mergedMockData);

  return (
    <MockContext.Provider value={ { mockData: mergedMockData, segmentProcessor } }>
      { children }
    </MockContext.Provider>
  );
}

export function useMock() {
  const context = useContext(MockContext);
  if (!context) {
    throw new Error('useMock must be used within a MockProvider');
  }
  return context;
}