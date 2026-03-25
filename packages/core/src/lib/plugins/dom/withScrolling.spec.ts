import { createSlateEditor } from '../../editor';
import { AUTO_SCROLL, DOMPlugin } from './DOMPlugin';
import { withScrolling } from './withScrolling';

describe('withScrolling', () => {
  it('maps temporary scrolling options onto DOMPlugin and restores them after the callback', () => {
    const editor = createSlateEditor();
    const previousOptions = { ...editor.getOptions(DOMPlugin) };
    let callbackOptions: any;
    let callbackScrolling = false;

    withScrolling(
      editor,
      () => {
        callbackOptions = editor.getOptions(DOMPlugin);
        callbackScrolling = AUTO_SCROLL.get(editor) ?? false;
      },
      {
        mode: 'first',
        operations: {
          insert_node: false,
        },
        scrollOptions: {
          block: 'center',
        },
      }
    );

    expect(callbackScrolling).toBe(true);
    expect(callbackOptions.scrollMode).toBe('first');
    expect(callbackOptions.scrollOperations.insert_node).toBe(false);
    expect(callbackOptions.scrollOperations.insert_text).toBe(true);
    expect(callbackOptions.scrollOptions).toEqual({
      block: 'center',
      scrollMode: 'if-needed',
    });
    expect(AUTO_SCROLL.get(editor) ?? false).toBe(false);
    expect(editor.getOptions(DOMPlugin)).toEqual(previousOptions);
  });

  it('restores scrolling state even if the callback throws', () => {
    const editor = createSlateEditor();
    const previousOptions = { ...editor.getOptions(DOMPlugin) };

    expect(() =>
      withScrolling(
        editor,
        () => {
          throw new Error('boom');
        },
        { mode: 'first' }
      )
    ).toThrow('boom');

    expect(AUTO_SCROLL.get(editor) ?? false).toBe(false);
    expect(editor.getOptions(DOMPlugin)).toEqual(previousOptions);
  });
});
