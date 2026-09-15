/** @jsxRuntime classic */
/** @jsx jsxt */
import type { Value } from '../../core';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { definePlugin, DOMPlugin } from '../../lib';
import { jsxt } from '../../testing';
import { createStaticEditor } from './withStatic';

jsxt;

describe('createStaticEditor', () => {
  it('uses the core DOM capability', () => {
    const editor = createStaticEditor({ id: 'static' });

    expect(editor.id).toBe('static');
    expect(editor.plugin(DOMPlugin)).toBeDefined();
    expect(editor.api.dom.clipboard.writeSlice).toBeDefined();
  });

  it('installs custom plugins after core plugins', () => {
    const customPlugin = definePlugin('custom', {});
    const editor = createStaticEditor({ plugins: [customPlugin] });
    const names = getPlateRuntime(editor).pluginList.map(({ name }) => name);

    expect(editor.plugin(customPlugin)).toBeDefined();
    expect(names.indexOf('custom')).toBeGreaterThan(
      names.indexOf(DOMPlugin.name)
    );
  });

  it('initializes value and selection through the shared editor owner', () => {
    const value = (
      <editor>
        <hp>
          <htext>Hello world</htext>
        </hp>
      </editor>
    );
    const selection = {
      kind: 'text' as const,
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    };
    const editor = createStaticEditor({
      initialValue: value.children as Value,
      selection,
    });

    expect(editor.read.children()).toEqual(value.children);
    expect(editor.read.selection()).toEqual({
      anchor: selection.anchor,
      focus: selection.focus,
    });
  });

  it('preserves standard editor options', () => {
    const editor = createStaticEditor({
      autoSelect: 'end',
      initialValue: [{ children: [{ text: 'content' }], type: 'paragraph' }],
      shouldNormalizeEditor: true,
    });
    const end = editor.read.points.end([]);

    expect(editor.read.selection()).toEqual({ anchor: end, focus: end });
  });
});
