import { renderHook } from '@testing-library/react';

import { createEditor as createRuntimeEditor } from '../../facade';
import { useCreateEditor } from './useCreateEditor';

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

  it('creates the editor from options the options object inherits', () => {
    const created = renderHook(() =>
      useCreateEditor(
        Object.create({
          id: 'inherited',
          initialValue: [{ children: [{ text: 'One' }], type: 'paragraph' }],
          userId: 'ada',
        })
      )
    ).result.current;
    const disabled = renderHook(() =>
      useCreateEditor(Object.create({ enabled: false }))
    ).result.current;

    expect({
      disabled,
      id: created?.id,
      text: created?.read.text.string([]),
      userId: created?.userId,
    }).toEqual({ disabled: null, id: 'inherited', text: 'One', userId: 'ada' });
  });
});

describe('useCreateEditor identity', () => {
  const initialValue = [{ type: 'paragraph', children: [{ text: 'Base' }] }];

  it('creates a new editor when the id changes', () => {
    const { rerender, result } = renderHook(
      ({ id }: { id: string }) => useCreateEditor({ id, initialValue }),
      { initialProps: { id: 'first' } }
    );
    const first = result.current;

    rerender({ id: 'second' });

    expect({ same: result.current === first, id: result.current.id }).toEqual({
      same: false,
      id: 'second',
    });
  });

  it('creates a new editor when an inherited id changes', () => {
    const { rerender, result } = renderHook(
      (options) => useCreateEditor(options),
      { initialProps: Object.create({ id: 'first', initialValue }) }
    );
    const first = result.current;

    rerender(Object.create({ id: 'second', initialValue }));

    expect({ same: result.current === first, id: result.current.id }).toEqual({
      same: false,
      id: 'second',
    });
  });

  it('creates a new editor when a caller dependency changes', () => {
    const { rerender, result } = renderHook(
      ({ version }: { version: number }) =>
        useCreateEditor({ initialValue }, [version]),
      { initialProps: { version: 1 } }
    );
    const first = result.current;

    rerender({ version: 2 });

    expect(result.current).not.toBe(first);
  });

  it('keeps the editor and its text when only the initial value changes', () => {
    const { rerender, result } = renderHook(
      ({ text }: { text: string }) =>
        useCreateEditor({
          initialValue: [{ type: 'paragraph', children: [{ text }] }],
        }),
      { initialProps: { text: 'Base' } }
    );
    const editor = result.current;

    rerender({ text: 'Changed' });

    expect({
      same: result.current === editor,
      text: result.current.read.value().children[0]?.children[0]?.text,
    }).toEqual({ same: true, text: 'Base' });
  });

  it('creates the editor when enabled turns on and drops it when enabled turns off', () => {
    const { rerender, result } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useCreateEditor({ enabled, initialValue }),
      { initialProps: { enabled: false } }
    );
    const disabled = result.current;

    rerender({ enabled: true });
    const created = result.current;

    rerender({ enabled: false });

    expect({
      disabled,
      created: created !== null,
      dropped: result.current,
    }).toEqual({ disabled: null, created: true, dropped: null });
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

  it('refuses an option it does not take while disabled', () => {
    const options = { enabled: false, initialValue, value: initialValue };

    expect(() => renderHook(() => useCreateEditor(options))).toThrow(
      'Unknown editor option "value". Use "initialValue" to set the document.'
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
