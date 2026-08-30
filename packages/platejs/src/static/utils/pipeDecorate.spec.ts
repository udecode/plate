import type { Element, NodeEntry, Range } from '../../core';
import { createEditor } from '../../lib/editor';
import { defineBasePlugin } from '../../lib/plugin';
import { pipeDecorate } from './pipeDecorate';

describe('pipeDecorate', () => {
  it('returns undefined when there are no decorate hooks', () => {
    const editor = createEditor();

    expect(pipeDecorate(editor)).toBeUndefined();
  });

  it('merges plugin decorations with the decorate prop', () => {
    const rangeFromPlugin = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
      highlight: true,
    } satisfies Range & { highlight: true };
    const rangeFromProp = {
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
      comment: true,
    } satisfies Range & { comment: true };
    const HighlightPlugin = defineBasePlugin('highlight', {
      decorate: () => [rangeFromPlugin],
    });
    const editor = createEditor({
      plugins: [HighlightPlugin],
    });
    const decorate = pipeDecorate(editor, () => [rangeFromProp])!;
    const entry = [
      { children: [{ text: 'alpha' }], type: 'paragraph' },
      [0],
    ] satisfies NodeEntry<Element>;

    expect(decorate(entry)).toEqual([rangeFromPlugin, rangeFromProp]);
  });

  it('reuses the plugin context across decorated entries', () => {
    const contexts: object[] = [];
    const HighlightPlugin = defineBasePlugin('highlight', {
      decorate: (context) => {
        contexts.push(context);

        return [];
      },
    });
    const editor = createEditor({ plugins: [HighlightPlugin] });
    const decorate = pipeDecorate(editor)!;
    const first = [
      { children: [{ text: 'alpha' }], type: 'paragraph' },
      [0],
    ] satisfies NodeEntry<Element>;
    const second = [
      { children: [{ text: 'beta' }], type: 'paragraph' },
      [1],
    ] satisfies NodeEntry<Element>;

    decorate(first);
    decorate(second);

    expect(contexts).toHaveLength(2);
    expect(Object.getPrototypeOf(contexts[0])).toBe(
      Object.getPrototypeOf(contexts[1])
    );
    expect(Reflect.get(contexts[0], 'entry')).toBe(first);
    expect(Reflect.get(contexts[1], 'entry')).toBe(second);
  });
});
