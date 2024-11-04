'use client';

import { ReactNode, createContext, useContext, useState } from 'react';

interface Model {
  label: string;
  value: string;
}

interface OpenAIContextType {
  apiKey: string;
  model: Model;
  setApiKey: (key: string) => void;
  setModel: (model: Model) => void;
}

export const models: Model[] = [
  { label: 'gpt-4o-mini', value: 'gpt-4o-mini' },
  { label: 'gpt-4o', value: 'gpt-4o' },
  { label: 'gpt-4-turbo', value: 'gpt-4-turbo' },
  { label: 'gpt-4', value: 'gpt-4' },
  { label: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo' },
  { label: 'gpt-3.5-turbo-instruct', value: 'gpt-3.5-turbo-instruct' },
];

const OpenAIContext = createContext<OpenAIContextType | undefined>(undefined);

export function OpenAIProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState<Model>(models[0]);

  return (
    <OpenAIContext.Provider value={{ apiKey, model, setApiKey, setModel }}>
      {children}
    </OpenAIContext.Provider>
  );
}

export function useOpenAI() {
  const context = useContext(OpenAIContext);
  if (context === undefined) {
    throw new Error('useOpenAI must be used within an OpenAIProvider');
  }
  return context;
}
