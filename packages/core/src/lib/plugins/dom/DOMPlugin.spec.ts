import { createSlateEditor } from '../../editor';
import { DOMPlugin } from './DOMPlugin';

describe('DOMPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('scrolls enabled operations while auto-scrolling is active', () => {
    const editor = createSlateEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: 'p' }],
    } as any);
    const scrollSpy = spyOn(editor.api, 'scrollIntoView').mockImplementation(
      () => {}
    );

    (editor.getTransforms(DOMPlugin) as any).withScrolling(
      () => {
        editor.tf.insertText('a');
        editor.tf.insertText('b');
      },
      {
        mode: 'first',
        scrollOptions: { block: 'center' },
      }
    );

    expect(scrollSpy).toHaveBeenCalledTimes(2);
    expect(scrollSpy.mock.calls).toEqual([
      [
        { offset: 0, path: [0, 0] },
        { block: 'center', scrollMode: 'if-needed' },
      ],
      [
        { offset: 0, path: [0, 0] },
        { block: 'center', scrollMode: 'if-needed' },
      ],
    ]);
  });

  it('skips scrolling when the current operation type is disabled', () => {
    const editor = createSlateEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: 'p' }],
    } as any);
    const scrollSpy = spyOn(editor.api, 'scrollIntoView').mockImplementation(
      () => {}
    );

    (editor.getTransforms(DOMPlugin) as any).withScrolling(
      () => {
        editor.tf.insertText('a');
      },
      {
        operations: { insert_text: false },
      }
    );

    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it('stores prevSelection and clears currentKeyboardEvent on set_selection', () => {
    const editor = createSlateEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: 'ab' }], type: 'p' }],
    } as any);
    const previousSelection = structuredClone(editor.selection);

    editor.dom.currentKeyboardEvent = {} as any;
    editor.tf.select({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });

    expect(editor.dom.prevSelection).toEqual(previousSelection);
    expect(editor.dom.currentKeyboardEvent).toBeNull();
  });
});
