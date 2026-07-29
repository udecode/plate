import {
  createPlateEditor,
  NavigationFeedbackPlugin,
} from '@platejs/core/react';
import { defineEditorExtension } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import {
  FootnoteDefinitionPlugin,
  FootnoteInputPlugin,
  FootnotePlugin,
} from './FootnotePlugin';

describe('FootnotePlugin', () => {
  it('declares its exact React dependencies', () => {
    expect(FootnotePlugin.dependencies.map(({ key }) => key)).toEqual([
      FootnoteInputPlugin.key,
      NavigationFeedbackPlugin.key,
    ]);
  });

  it('runs typed navigation feedback only after the headless selection commits', () => {
    const focus = mock();
    const scrollIntoView = mock();
    const editor = createPlateEditor({
      plugins: [FootnotePlugin, FootnoteDefinitionPlugin] as const,
      initialValue: [
        {
          children: [
            { text: 'a' },
            {
              children: [{ text: '' }],
              identifier: '1',
              type: KEYS.footnoteReference,
            },
            { text: 'b' },
          ],
          type: KEYS.p,
        },
        {
          children: [{ children: [{ text: 'body' }], type: KEYS.p }],
          identifier: '1',
          type: KEYS.footnoteDefinition,
        },
      ],
    });

    editor.extend(
      defineEditorExtension({
        api: { dom: { focus, scrollIntoView } },
        name: 'test:footnote-navigation-feedback',
      })
    );

    editor.update((tx) => {
      expect(tx.footnote.focusDefinition({ identifier: '1' })).toBe(true);
      expect(tx.selection()).toEqual({
        kind: 'text',
        anchor: { offset: 0, path: [1, 0, 0] },
        focus: { offset: 0, path: [1, 0, 0] },
      });
      expect(focus).not.toHaveBeenCalled();
      expect(scrollIntoView).not.toHaveBeenCalled();
    });

    expect(focus).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenLastCalledWith({
      offset: 0,
      path: [1, 0, 0],
    });
    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('activeTarget')
    ).toMatchObject({
      path: [1],
      type: 'node',
      variant: 'navigated',
    });

    editor.update((tx) => {
      expect(tx.footnote.focusReference({ identifier: '1' })).toBe(true);
      expect(tx.selection()).toEqual({
        kind: 'text',
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      });
      expect(focus).toHaveBeenCalledTimes(1);
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });

    expect(focus).toHaveBeenCalledTimes(2);
    expect(scrollIntoView).toHaveBeenLastCalledWith({
      offset: 0,
      path: [0, 2],
    });
    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('activeTarget')
    ).toMatchObject({
      path: [0, 1],
      type: 'node',
      variant: 'navigated',
    });
  });
});
