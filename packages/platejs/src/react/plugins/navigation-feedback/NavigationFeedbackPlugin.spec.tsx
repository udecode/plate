import { act, render } from '@testing-library/react';
import React from 'react';

import { createEditorView, schema } from '../../../facade';
import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { PlateContent } from '../../components/PlateContent';
import { createEditor } from '../../editor';
import { definePlatePlugin } from '../../plugin';
import { useEditor } from '../../stores';
import { NavigationFeedbackPlugin } from './NavigationFeedbackPlugin';

const mount = (readOnly = false, duration = 1600) => {
  const editor = createEditor({
    navigationFeedback: { duration },
    initialValue: [
      { children: [{ text: 'one' }], type: 'paragraph' },
      { children: [{ text: 'two' }], type: 'paragraph' },
    ],
  });
  const views: Array<ReturnType<typeof useEditor>> = [];
  function Capture({ index }: { index: number }) {
    const view = useEditor();
    React.useLayoutEffect(() => {
      views[index] = view;
    }, [index, view]);
    return <PlateContent readOnly={readOnly} />;
  }
  const rendered = render(
    <>
      <Plate editor={editor} readOnly={readOnly}>
        <Capture index={0} />
      </Plate>
      <Plate editor={editor} readOnly={readOnly}>
        <Capture index={1} />
      </Plate>
    </>
  );
  const roots = rendered.getAllByRole('textbox');
  const key = editor.key([0]);
  if (!key) throw new Error('Missing fixture key');
  return { editor, key, rendered, roots, views };
};

describe('NavigationFeedbackPlugin', () => {
  afterEach(() => mock.restore());

  it.each([false, true])(
    'paints only the calling view without a model change (readonly: %s)',
    (readOnly) => {
      const { editor, key, rendered, roots, views } = mount(readOnly);
      const commit = mock();
      const unsubscribe = editor.subscribeCommit(commit);
      const before = editor.read.selection();
      const attributes = { className: 'target', style: { color: 'red' } };
      act(() => {
        expect(
          views[0]
            .plugin(NavigationFeedbackPlugin)
            .api.flashTarget({ key, attributes })
        ).toBe(true);
      });
      attributes.style.color = 'blue';

      const target = roots[0].querySelector('[data-nav-target]');
      expect(target?.classList.contains('target')).toBe(true);
      expect(target?.getAttribute('style')).toContain('color: red');
      expect(target?.getAttribute('data-nav-pulse')).toBe('1');
      expect(roots[1].querySelector('[data-nav-target]')).toBeNull();
      expect(editor.read.selection()).toEqual(before);
      expect(commit).not.toHaveBeenCalled();

      act(() => {
        expect(
          views[1].plugin(NavigationFeedbackPlugin).api.flashTarget({ key })
        ).toBe(true);
        expect(views[0].plugin(NavigationFeedbackPlugin).api.clear()).toBe(
          true
        );
        expect(views[0].plugin(NavigationFeedbackPlugin).api.clear()).toBe(
          false
        );
      });
      expect(roots[0].querySelector('[data-nav-target]')).toBeNull();
      expect(roots[1].querySelector('[data-nav-target]')).not.toBeNull();
      expect(commit).not.toHaveBeenCalled();
      unsubscribe();
      rendered.unmount();
    }
  );

  it('rejects unmounted, text and foreign targets without replacing valid feedback', () => {
    const { editor, key, rendered, roots, views } = mount();
    const textKey = editor.key([0, 0]);
    const foreign = createEditor({
      initialValue: [{ type: 'paragraph', children: [{ text: 'foreign' }] }],
    });
    const foreignKey = foreign.key([0]);
    if (!textKey || !foreignKey) throw new Error('Missing fixture key');
    const { api } = views[0].plugin(NavigationFeedbackPlugin);
    expect(
      editor.plugin(NavigationFeedbackPlugin).api.flashTarget({ key })
    ).toBe(false);
    act(() => {
      expect(api.flashTarget({ key })).toBe(true);
      expect(api.flashTarget({ key: textKey })).toBe(false);
      expect(api.flashTarget({ key: foreignKey })).toBe(false);
      expect(() => api.flashTarget({ key, duration: -1 })).toThrow(RangeError);
      expect(() => api.flashTarget({ key, duration: Number.NaN })).toThrow(
        RangeError
      );
    });
    expect(roots[0].querySelector('[data-nav-target]')?.textContent).toBe(
      'one'
    );
    rendered.unmount();
    expect(api.flashTarget({ key })).toBe(false);
    expect(api.clear()).toBe(false);
  });

  it('retains the element identity through movement and clears a removed target', () => {
    const { editor, key, rendered, roots, views } = mount();
    act(() => {
      views[0].plugin(NavigationFeedbackPlugin).api.flashTarget({ key });
    });
    act(() => {
      editor.update.nodes.move({ at: [0], to: [2] });
    });
    expect(roots[0].querySelector('[data-nav-target]')?.textContent).toBe(
      'one'
    );
    expect(editor.read.nodes.path(key)).toEqual([1]);
    act(() => {
      editor.update.nodes.remove({ at: key });
    });
    expect(roots[0].querySelector('[data-nav-target]')).toBeNull();
    expect(
      views[0].plugin(NavigationFeedbackPlugin).api.flashTarget({ key })
    ).toBe(false);
    rendered.unmount();
  });

  it('rejects keys from another content root without replacing the current target', () => {
    const FigurePlugin = definePlatePlugin('figure', {
      schema: {
        element: {
          void: 'block',
          contentRoots: {
            caption: {
              content: schema.content.type('paragraph', {
                default: { type: 'paragraph' },
                min: 1,
              }),
              ownership: 'exclusive',
            },
          },
        },
      },
    });
    const editor = createEditor({
      plugins: [FigurePlugin],
      initialValue: {
        children: [
          { type: 'paragraph', children: [{ text: 'main' }] },
          {
            type: 'figure',
            childRoots: { caption: 'caption' },
            children: [{ text: '' }],
          },
        ],
        roots: {
          caption: [{ type: 'paragraph', children: [{ text: 'caption' }] }],
        },
      },
    });
    let view: ReturnType<typeof useEditor> | undefined;
    function Capture() {
      view = useEditor();
      return <PlateContent />;
    }
    const rendered = render(
      <Plate editor={editor}>
        <Capture />
      </Plate>
    );
    if (!view) throw new Error('Missing mounted view');
    const { api } = view.plugin(NavigationFeedbackPlugin);
    const key = editor.key([0]);
    const otherKey = createEditorView(editor, { root: 'caption' }).key([0]);
    if (!key || !otherKey) throw new Error('Missing fixture keys');
    const before = editor.read.lastCommit();
    act(() => {
      expect(api.flashTarget({ key })).toBe(true);
      expect(api.flashTarget({ key: otherKey })).toBe(false);
    });
    expect(
      rendered.container.querySelector('[data-nav-target]')?.textContent
    ).toBe('main');
    expect(editor.read.lastCommit()).toBe(before);
    rendered.unmount();
  });

  it('replaces the timer and ignores retired callbacks', () => {
    const { key, rendered, roots, views } = mount(false, 100_000);
    const timer = spyOn(globalThis, 'setTimeout');
    const { api } = views[0].plugin(NavigationFeedbackPlugin);
    act(() => {
      api.flashTarget({ key });
    });
    act(() => {
      api.flashTarget({ key });
    });
    const callbacks = timer.mock.calls
      .filter((call) => call[1] === 100_000)
      .map((call) => call[0]);
    expect(callbacks).toHaveLength(2);
    expect(
      roots[0]
        .querySelector('[data-nav-target]')
        ?.getAttribute('data-nav-pulse')
    ).toBe('2');
    const [previous, current] = callbacks;
    if (typeof previous !== 'function' || typeof current !== 'function') {
      throw new Error('Missing timers');
    }
    act(() => {
      previous();
    });
    expect(roots[0].querySelector('[data-nav-target]')).not.toBeNull();
    act(() => {
      current();
    });
    expect(roots[0].querySelector('[data-nav-target]')).toBeNull();
    rendered.unmount();
    act(() => {
      current();
    });
    expect(api.flashTarget({ key })).toBe(false);
  });
});
