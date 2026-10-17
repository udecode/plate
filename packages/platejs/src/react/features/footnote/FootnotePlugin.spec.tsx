import { act, render } from '@testing-library/react';
import React from 'react';

import { DOMEditor } from '../../../dom/plite-dom.internal';
import { TestPlate as EditorRoot } from '../../__tests__/TestPlate';
import { EditorContent } from '../../components/PlateContent';
import { createEditor } from '../../core';
import { useEditor } from '../../stores';
import { FootnoteDefinitionPlugin, FootnotePlugin } from './FootnotePlugin';

describe('FootnotePlugin', () => {
  afterEach(() => mock.restore());

  it.each([true, false])(
    'commits selection before focusing and scrolling the calling view (feedback: %s)',
    (feedback) => {
      const editor = createEditor({
        navigationFeedback: feedback,
        plugins: [FootnotePlugin, FootnoteDefinitionPlugin],
        initialValue: [
          {
            children: [
              { text: 'a' },
              { children: [{ text: '' }], ref: '1', type: 'footnoteReference' },
              { text: 'b' },
            ],
            type: 'paragraph',
          },
          {
            children: [{ children: [{ text: 'body' }], type: 'paragraph' }],
            ref: '1',
            type: 'footnoteDefinition',
          },
        ],
      });
      const views: Array<ReturnType<typeof useEditor>> = [];
      function Capture({
        index,
        readOnly,
      }: {
        index: number;
        readOnly: boolean;
      }) {
        const view = useEditor();
        React.useLayoutEffect(() => {
          views[index] = view;
        }, [index, view]);
        return <EditorContent readOnly={readOnly} />;
      }
      const tree = (readOnly = false) => (
        <>
          <EditorRoot editor={editor}>
            <Capture index={0} readOnly={false} />
          </EditorRoot>
          <EditorRoot editor={editor} readOnly={readOnly}>
            <Capture index={1} readOnly={readOnly} />
          </EditorRoot>
        </>
      );
      const rendered = render(tree());
      const roots = rendered.getAllByRole('textbox');
      const selections: unknown[] = [];
      const focusSpy = spyOn(DOMEditor, 'focus').mockImplementation((view) => {
        selections.push(view.read.selection());
      });
      const scrollSpy = spyOn(DOMEditor, 'scrollIntoView').mockImplementation(
        () => () => {}
      );
      const { api } = views[1].plugin(FootnotePlugin);
      expect(
        editor.plugin(FootnotePlugin).api.focusDefinition({ ref: '1' })
      ).toBe(false);

      act(() => {
        expect(api.focusDefinition({ ref: '1' })).toBe(true);
      });
      const definitionPoint = { offset: 0, path: [1, 0, 0] };
      expect(selections[0]).toEqual({
        anchor: definitionPoint,
        focus: definitionPoint,
      });
      expect(focusSpy.mock.calls[0][0]).toBe(views[1]);
      expect(scrollSpy).toHaveBeenLastCalledWith(
        views[1],
        definitionPoint,
        undefined
      );
      expect(roots[0].querySelector('[data-nav-target]')).toBeNull();
      expect(
        roots[1].querySelector('[data-nav-target]')?.textContent ?? null
      ).toBe(feedback ? 'body' : null);

      act(() => {
        expect(api.focusReference({ ref: '1' })).toBe(true);
      });
      const referencePoint = { offset: 0, path: [0, 2] };
      expect(selections[1]).toEqual({
        anchor: referencePoint,
        focus: referencePoint,
      });
      expect(scrollSpy).toHaveBeenLastCalledWith(
        views[1],
        referencePoint,
        undefined
      );
      expect(roots[0].querySelector('[data-nav-target]')).toBeNull();
      expect(
        roots[1]
          .querySelector('[data-nav-target]')
          ?.getAttribute('data-nav-pulse') ?? null
      ).toBe(feedback ? '2' : null);

      act(() => {
        expect(api.focusReference({ ref: 'missing' })).toBe(false);
      });
      expect(focusSpy).toHaveBeenCalledTimes(2);
      rendered.rerender(tree(true));
      const before = views[1].read.selection();
      const history = editor.read.history();
      scrollSpy.mockClear();
      act(() => {
        expect(api.focusDefinition({ ref: '1' })).toBe(true);
      });
      expect(scrollSpy).toHaveBeenCalledTimes(1);
      expect(scrollSpy).toHaveBeenLastCalledWith(
        views[1],
        definitionPoint,
        undefined
      );
      expect(views[1].read.selection()).toEqual(before);
      expect(roots[0].querySelector('[data-nav-target]')).toBeNull();
      expect(
        roots[1].querySelector('[data-nav-target]')?.textContent ?? null
      ).toBe(feedback ? 'body' : null);
      scrollSpy.mockClear();
      act(() => {
        expect(api.focusReference({ ref: '1' })).toBe(true);
      });
      expect(scrollSpy).toHaveBeenCalledTimes(1);
      expect(scrollSpy).toHaveBeenLastCalledWith(
        views[1],
        referencePoint,
        undefined
      );
      expect(
        roots[1]
          .querySelector('[data-nav-target]')
          ?.getAttribute('data-nav-pulse') ?? null
      ).toBe(feedback ? '4' : null);
      expect(roots[0].querySelector('[data-nav-target]')).toBeNull();
      expect(views[1].read.selection()).toEqual(before);
      expect(editor.read.history()).toEqual(history);
      expect(focusSpy).toHaveBeenCalledTimes(2);
      expect(api.focusDefinition({ ref: 'missing' })).toBe(false);
      expect(api.focusReference({ ref: 'missing' })).toBe(false);
      rendered.unmount();
      expect(api.focusDefinition({ ref: '1' })).toBe(false);
      expect(api.focusReference({ ref: '1' })).toBe(false);
    }
  );

  it('jumps in a read-only view without moving the editable view caret or focus', () => {
    const editor = createEditor({
      plugins: [FootnotePlugin, FootnoteDefinitionPlugin],
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: 'a' },
            { type: 'footnoteReference', ref: '1', children: [{ text: '' }] },
            { text: 'b' },
          ],
        },
        {
          type: 'footnoteDefinition',
          ref: '1',
          children: [{ type: 'paragraph', children: [{ text: 'body' }] }],
        },
      ],
    });
    const views: Array<ReturnType<typeof useEditor>> = [];
    function Capture({ index }: { index: number }) {
      const view = useEditor();
      React.useLayoutEffect(() => {
        views[index] = view;
      }, [index, view]);
      return <EditorContent readOnly={index === 1} />;
    }
    const rendered = render(
      <>
        <EditorRoot editor={editor}>
          <Capture index={0} />
        </EditorRoot>
        <EditorRoot editor={editor} readOnly>
          <Capture index={1} />
        </EditorRoot>
      </>
    );
    act(() => {
      views[0].update((tx) => tx.selection.set({ offset: 1, path: [0, 0] }));
    });
    act(() => views[0].api.dom.focus());
    const before = views[0].read.selection();
    const focus = document.activeElement;
    const focusSpy = spyOn(DOMEditor, 'focus');
    const scrollSpy = spyOn(DOMEditor, 'scrollIntoView').mockReturnValue(
      () => {}
    );
    act(() => {
      expect(
        views[1].plugin(FootnotePlugin).api.focusDefinition({ ref: '1' })
      ).toBe(true);
      expect(
        views[1].plugin(FootnotePlugin).api.focusReference({ ref: '1' })
      ).toBe(true);
    });
    expect(scrollSpy).toHaveBeenCalledTimes(2);
    expect(views[0].read.selection()).toEqual(before);
    expect(document.activeElement).toBe(focus);
    expect(focus).toBe(rendered.getAllByRole('textbox')[0]);
    expect(focusSpy).not.toHaveBeenCalled();
    rendered.unmount();
  });
});
