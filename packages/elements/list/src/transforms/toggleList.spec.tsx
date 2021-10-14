/** @jsx jsx */

import { createEditorPlugins } from '@udecode/plate/src';
import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createListPlugin } from '../createListPlugin';
import { ELEMENT_OL, ELEMENT_UL } from '../defaults';
import { toggleList } from './toggleList';

jsx;

describe('toggle on', () => {
  it('should turn a p to list', () => {
    const input = ((
      <editor>
        <hp>
          1<cursor />
        </hp>
      </editor>
    ) as any) as SPEditor;

    const output = ((
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hul>
      </editor>
    ) as any) as SPEditor;

    const editor = createEditorPlugins({
      editor: input,
      plugins: [createListPlugin()],
    });

    toggleList(editor, { type: getPlatePluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });

  it('should turn a p with a selection to list', () => {
    const input = ((
      <editor>
        <hp>
          Planetas <anchor />
          mori in
          <focus /> gandavum!
        </hp>
      </editor>
    ) as any) as SPEditor;

    const output = ((
      <editor>
        <hul>
          <hli>
            <hlic>
              Planetas <anchor />
              mori in
              <focus /> gandavum!
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any) as SPEditor;

    const editor = createEditorPlugins({
      editor: input,
      plugins: [createListPlugin()],
    });

    toggleList(editor, { type: getPlatePluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });

  it('should turn multiple p to list', () => {
    const input = ((
      <editor>
        <hp>
          <anchor />1
        </hp>
        <hp>2</hp>
        <hp>
          3<focus />
        </hp>
      </editor>
    ) as any) as SPEditor;

    const output = ((
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
          <hli>
            <hlic>2</hlic>
          </hli>
          <hli>
            <hlic>3</hlic>
          </hli>
        </hul>
      </editor>
    ) as any) as SPEditor;

    const editor = createEditorPlugins({
      editor: input,
      plugins: [createListPlugin()],
    });

    toggleList(editor, { type: getPlatePluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });
});

describe('toggle off', () => {
  it('should split a simple list to two', () => {
    const input = ((
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
          <hli>
            <hlic>
              2
              <cursor />
            </hlic>
          </hli>
          <hli>
            <hlic>3</hlic>
          </hli>
        </hul>
      </editor>
    ) as any) as SPEditor;

    const output = ((
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hul>
        <hp>2</hp>
        <hul>
          <hli>
            <hlic>3</hlic>
          </hli>
        </hul>
      </editor>
    ) as any) as SPEditor;

    const editor = createEditorPlugins({
      editor: input,
      plugins: [createListPlugin()],
    });

    toggleList(editor, { type: getPlatePluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });

  it('should split a nested list', () => {
    const input = ((
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
            <hul>
              <hli>
                <hlic>11</hlic>
              </hli>
              <hli>
                <hlic>
                  12
                  <cursor />
                </hlic>
              </hli>
              <hli>
                <hlic>13</hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any) as SPEditor;

    const output = ((
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
            <hul>
              <hli>
                <hlic>11</hlic>
              </hli>
            </hul>
          </hli>
        </hul>
        <hp>12</hp>
        <hul>
          <hli>
            <hlic>13</hlic>
          </hli>
        </hul>
      </editor>
    ) as any) as SPEditor;

    const editor = createEditorPlugins({
      editor: input,
      plugins: [createListPlugin()],
    });

    toggleList(editor, { type: getPlatePluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });

  it('should turn a list to multiple p', () => {
    const input = ((
      <editor>
        <hul>
          <hli>
            <hlic>
              <anchor />1
            </hlic>
          </hli>
          <hli>
            <hlic>2</hlic>
          </hli>
          <hli>
            <hlic>
              3<focus />
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any) as SPEditor;

    const output = ((
      <editor>
        <hp>1</hp>
        <hp>2</hp>
        <hp>3</hp>
      </editor>
    ) as any) as SPEditor;

    const editor = createEditorPlugins({
      editor: input,
      plugins: [createListPlugin()],
    });

    toggleList(editor, { type: getPlatePluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });
});

describe('toggle over', () => {
  it('should toggle different list types', () => {
    const input = ((
      <editor>
        <hul>
          <hli>
            <hlic>
              1<cursor />
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any) as SPEditor;

    const output = ((
      <editor>
        <hol>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hol>
      </editor>
    ) as any) as SPEditor;

    const editor = createEditorPlugins({
      editor: input,
      plugins: [createListPlugin()],
    });

    toggleList(editor, { type: getPlatePluginType(editor, ELEMENT_OL) });

    expect(input.children).toEqual(output.children);
  });

  it('should only toggle the nested list', () => {
    const input = ((
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
            <hul>
              <hli>
                <hlic>
                  11
                  <cursor />
                </hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any) as SPEditor;

    const output = ((
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
            <hol>
              <hli>
                <hlic>11</hlic>
              </hli>
            </hol>
          </hli>
        </hul>
      </editor>
    ) as any) as SPEditor;

    const editor = createEditorPlugins({
      editor: input,
      plugins: [createListPlugin()],
    });

    toggleList(editor, { type: getPlatePluginType(editor, ELEMENT_OL) });

    expect(input.children).toEqual(output.children);
  });

  it('should only toggle everything that is selected', () => {
    const input = ((
      <editor>
        <hul>
          <hli>
            <hlic>
              <anchor />1
            </hlic>
            <hul>
              <hli>
                <hlic>
                  11
                  <focus />
                </hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any) as SPEditor;

    const output = ((
      <editor>
        <hol>
          <hli>
            <hlic>1</hlic>
            <hol>
              <hli>
                <hlic>11</hlic>
              </hli>
            </hol>
          </hli>
        </hol>
      </editor>
    ) as any) as SPEditor;

    const editor = createEditorPlugins({
      editor: input,
      plugins: [createListPlugin()],
    });

    toggleList(editor, { type: getPlatePluginType(editor, ELEMENT_OL) });

    expect(input.children).toEqual(output.children);
  });
});
