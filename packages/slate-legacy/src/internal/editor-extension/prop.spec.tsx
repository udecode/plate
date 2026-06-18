/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsx;

describe('prop', () => {
  it('returns the default value for empty nodes and missing block props', () => {
    const editor = createEditor({
      children: [
        { children: [{ text: 'one' }], type: 'p' },
        { align: 'center', children: [{ text: 'two' }], type: 'p' },
      ] as any,
    });

    expect(
      editor.api.prop({ defaultValue: 'left', key: 'align', nodes: [] } as any)
    ).toBe('left');
    expect(
      editor.api.prop({
        defaultValue: 'left',
        key: 'align',
        nodes: editor.children as any,
      } as any)
    ).toBe('left');
  });

  it('returns the shared block prop and undefined when block values differ', () => {
    const sharedEditor = createEditor({
      children: [
        { align: 'center', children: [{ text: 'one' }], type: 'p' },
        { align: 'center', children: [{ text: 'two' }], type: 'p' },
      ] as any,
    });

    const mixedEditor = createEditor({
      children: [
        { align: 'center', children: [{ text: 'one' }], type: 'p' },
        { align: 'right', children: [{ text: 'two' }], type: 'p' },
      ] as any,
    });

    expect(
      sharedEditor.api.prop({
        key: 'align',
        nodes: sharedEditor.children as any,
      } as any)
    ).toBe('center');
    expect(
      mixedEditor.api.prop({
        key: 'align',
        nodes: mixedEditor.children as any,
      } as any)
    ).toBeUndefined();
  });

  it('reads text props in text mode and custom props in all mode', () => {
    const textEditor = createEditor(
      (
        <editor>
          <hp>
            <htext bold>one</htext>
          </hp>
          <hp>
            <htext bold>two</htext>
          </hp>
        </editor>
      ) as any
    );
    const allEditor = createEditor({
      children: [
        {
          children: [{ color: 'red', text: 'one' }],
          color: 'red',
          type: 'p',
        },
        {
          children: [{ color: 'blue', text: 'two' }],
          color: 'red',
          type: 'p',
        },
      ] as any,
    });

    expect(
      textEditor.api.prop({
        key: 'bold',
        mode: 'text',
        nodes: textEditor.children as any,
      } as any)
    ).toBe(true as any);
    expect(
      allEditor.api.prop({
        getProp: (node: any) => node.color,
        mode: 'all',
        nodes: allEditor.children as any,
      } as any)
    ).toBeUndefined();
  });
});
