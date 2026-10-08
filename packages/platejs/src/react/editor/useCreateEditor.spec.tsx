import { renderHook } from '@testing-library/react';

import { createEditor as createRuntimeEditor } from '../../facade';
import { createStaticEditor } from '../../static/editor/withStatic';
import { useCreateEditor } from './useCreateEditor';
import { useStaticEditor } from './useStaticEditor';

describe('useCreateEditor', () => {
  it('creates a derived-schema editor without options', () => {
    const { result } = renderHook(() => useCreateEditor());

    expect(result.current.read.schema.identity()?.kind).toBe('derived');
  });

  it('preserves the enabled result contract', () => {
    const { result } = renderHook(() => useCreateEditor({ enabled: false }));
    const disabled: null = result.current;

    expect(disabled).toBeNull();
  });

  it('creates static editors and view editors without options', () => {
    const staticEditor = createStaticEditor();
    const { result } = renderHook(() => useStaticEditor());

    expect(staticEditor.read.schema.identity()?.kind).toBe('derived');
    expect(result.current.read.schema.identity()?.kind).toBe('derived');
  });
});

describe('removed editor option', () => {
  const initialValue = [{ type: 'paragraph', children: [{ text: 'Base' }] }];

  it('refuses an existing editor that useCreateEditor options hold as a hidden key', () => {
    const options = { initialValue };

    Object.defineProperty(options, 'editor', { value: createRuntimeEditor() });

    expect(() => renderHook(() => useCreateEditor(options))).toThrow(
      'Plate editor constructors always create a new editor'
    );
  });

  it('refuses an existing editor added to useCreateEditor options on a later render', () => {
    const withEditor = { editor: createRuntimeEditor(), initialValue };
    const { rerender } = renderHook(({ options }) => useCreateEditor(options), {
      initialProps: { options: { initialValue } },
    });

    expect(() => rerender({ options: withEditor })).toThrow(
      'Plate editor constructors always create a new editor'
    );
  });

  it('refuses an existing editor added to useStaticEditor options on a later render', () => {
    const withEditor = { editor: createRuntimeEditor(), initialValue };
    const { rerender } = renderHook(({ options }) => useStaticEditor(options), {
      initialProps: { options: { initialValue } },
    });

    expect(() => rerender({ options: withEditor })).toThrow(
      'Plate editor constructors always create a new editor'
    );
  });
});

describe('useCreateEditor user', () => {
  const initialValue = [{ type: 'paragraph', children: [{ text: 'Base' }] }];

  const switches: ReadonlyArray<
    readonly [string | undefined, string | undefined]
  > = [
    [undefined, 'alice'],
    ['alice', 'bob'],
    ['alice', undefined],
  ];

  for (const [from, to] of switches) {
    it(`creates an editor for ${to ?? 'the local user'} when the user changes from ${from ?? 'the local user'}`, () => {
      const { rerender, result } = renderHook(
        ({ userId }: { userId?: string }) =>
          useCreateEditor({ initialValue, userId }),
        { initialProps: { userId: from } }
      );
      const first = result.current;

      rerender({ userId: to });

      expect({
        same: result.current === first,
        userId: result.current.userId,
      }).toEqual({ same: false, userId: to ?? 'local' });
    });
  }

  it('keeps the editor and its text while the user stays the local user', () => {
    const { rerender, result } = renderHook(
      ({ userId }: { userId?: string }) =>
        useCreateEditor({ initialValue, userId }),
      { initialProps: {} }
    );
    const editor = result.current;

    editor.update.text.insert('!', { at: { offset: 4, path: [0, 0] } });
    rerender({ userId: '' });
    rerender({});

    expect({
      same: result.current === editor,
      text: result.current.read.value().children[0]?.children[0]?.text,
    }).toEqual({ same: true, text: 'Base!' });
  });
});
