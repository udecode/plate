import type { LoaderOutput } from 'fumadocs-core/source';

import type { PlateLLMPage } from './llm';

import { source } from './source';

type PlateLLMSource = Omit<LoaderOutput, 'getPage' | 'getPages'> & {
  getPage: (
    slugs: string[] | undefined,
    language?: string
  ) => PlateLLMPage | undefined;
  getPages: (language?: string) => PlateLLMPage[];
};

export function getPlateLLMSource() {
  return source as unknown as PlateLLMSource;
}
