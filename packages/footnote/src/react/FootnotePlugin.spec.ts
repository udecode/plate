import {
  createPlateEditor,
  NavigationFeedbackPlugin,
} from '@platejs/core/react';
import { DOMEditor } from '@platejs/plite-dom/internal';

import {
  FootnoteDefinitionPlugin,
  FootnoteInputPlugin,
  FootnotePlugin,
} from './FootnotePlugin';

describe('FootnotePlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('declares its exact React dependencies', () => {
    expect(FootnotePlugin.dependencies.map(({ name }) => name)).toEqual([
      FootnoteInputPlugin.name,
      NavigationFeedbackPlugin.name,
    ]);
  });

  it('runs typed navigation feedback only after the headless selection commits', () => {
    const focusSpy = spyOn(DOMEditor, 'focus').mockImplementation(() => {});
    const scrollSpy = spyOn(DOMEditor, 'scrollIntoView').mockImplementation(
      () => {}
    );
    const editor = createPlateEditor({
      plugins: [FootnotePlugin, FootnoteDefinitionPlugin] as const,
      initialValue: [
        {
          children: [
            { text: 'a' },
            {
              children: [{ text: '' }],
              ref: '1',
              type: 'footnoteReference',
            },
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

    editor.update((tx) => {
      expect(tx.footnote.focusDefinition({ ref: '1' })).toBe(true);
      expect(tx.selection()).toEqual({
        kind: 'text',
        anchor: { offset: 0, path: [1, 0, 0] },
        focus: { offset: 0, path: [1, 0, 0] },
      });
      expect(focusSpy).not.toHaveBeenCalled();
      expect(scrollSpy).not.toHaveBeenCalled();
    });

    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(scrollSpy).toHaveBeenLastCalledWith(
      editor,
      {
        offset: 0,
        path: [1, 0, 0],
      },
      undefined
    );
    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('activeTarget')
    ).toMatchObject({
      path: [1],
      type: 'node',
      variant: 'navigated',
    });

    editor.update((tx) => {
      expect(tx.footnote.focusReference({ ref: '1' })).toBe(true);
      expect(tx.selection()).toEqual({
        kind: 'text',
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      });
      expect(focusSpy).toHaveBeenCalledTimes(1);
      expect(scrollSpy).toHaveBeenCalledTimes(1);
    });

    expect(focusSpy).toHaveBeenCalledTimes(2);
    expect(scrollSpy).toHaveBeenLastCalledWith(
      editor,
      {
        offset: 0,
        path: [0, 2],
      },
      undefined
    );
    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('activeTarget')
    ).toMatchObject({
      path: [0, 1],
      type: 'node',
      variant: 'navigated',
    });
  });
});
