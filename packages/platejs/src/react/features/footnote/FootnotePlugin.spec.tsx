import { act, render } from '@testing-library/react';
import React from 'react';

import { DOMEditor } from '../../../dom/plite-dom.internal';
import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { PlateContent } from '../../components/PlateContent';
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
        return <PlateContent readOnly={readOnly} />;
      }
      const tree = (readOnly = false) => (
        <>
          <Plate editor={editor}>
            <Capture index={0} readOnly={false} />
          </Plate>
          <Plate editor={editor} readOnly={readOnly}>
            <Capture index={1} readOnly={readOnly} />
          </Plate>
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
      const before = editor.read.selection();
      expect(api.focusDefinition({ ref: '1' })).toBe(false);
      expect(editor.read.selection()).toEqual(before);
      expect(focusSpy).toHaveBeenCalledTimes(2);
      rendered.unmount();
      expect(api.focusReference({ ref: '1' })).toBe(false);
    }
  );
});
