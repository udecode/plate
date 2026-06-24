import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { type Descendant, defineStateField } from '@platejs/plite';

import {
  createReactEditor,
  Plite,
  useSetStateField,
  useStateFieldValue,
} from '../src';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const documentTitle = defineStateField({
  key: 'document.title',
  collab: 'shared',
  history: 'push',
  initial: () => 'Untitled',
  persist: true,
});

describe('plite-react state field selector contract', () => {
  test('useStateFieldValue subscribes to one field and ignores body commits', async () => {
    const editor = createReactEditor({
      extensions: [documentTitle],
      initialValue: {
        children: [paragraph('body')],
        state: { [documentTitle.key]: 'Q2 Plan' },
      },
    });
    const values: string[] = [];
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Plite editor={editor}>{children}</Plite>
    );

    const { result } = renderHook(
      () => {
        const value = useStateFieldValue(documentTitle);
        const setValue = useSetStateField(documentTitle);
        values.push(value);

        return { setValue, value };
      },
      { wrapper }
    );

    expect(result.current.value).toBe('Q2 Plan');

    const renderCountAfterMount = values.length;

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
    });

    expect(result.current.value).toBe('Q2 Plan');
    expect(values).toHaveLength(renderCountAfterMount);

    await act(async () => {
      result.current.setValue('Q3 Plan');
    });

    expect(result.current.value).toBe('Q3 Plan');
    expect(values.at(-1)).toBe('Q3 Plan');
  });
});
