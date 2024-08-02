/** @jsx jsx */

import {
  type PlateEditor,
  createPlateEditor,
  getPluginType,
} from '@udecode/plate-common';
import { ELEMENT_OL, ELEMENT_UL, ListPlugin } from '@udecode/plate-list';
import { ELEMENT_IMAGE } from '@udecode/plate-media';
import { jsx } from '@udecode/plate-test-utils';

import { toggleList } from './toggleList';

jsx;

describe('toggle on', () => {
  it('should turn a p to list', () => {
    const input = (
      <editor>
        <hp>
          1<cursor />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    toggleList(editor, { type: getPluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });

  it('should turn validLiChildrenTypes to list', () => {
    const input = (
      <editor>
        <himg>
          <htext>
            <cursor />
          </htext>
        </himg>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hul>
          <hli>
            <himg>
              <htext />
            </himg>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [
        ListPlugin.extendPlugin(ELEMENT_UL, {
              options: {
                validLiChildrenTypes: [ELEMENT_IMAGE],
          },
        }),
      ],
    });

    toggleList(editor, { type: getPluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });

  it('should turn a p with a selection to list', () => {
    const input = (
      <editor>
        <hp>
          Planetas <anchor />
          mori in
          <focus /> gandavum!
        </hp>
      </editor>
    ) as any as PlateEditor;

    const output = (
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
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    toggleList(editor, { type: getPluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });

  it('should turn multiple p to list', () => {
    const input = (
      <editor>
        <hp>
          <anchor />1
        </hp>
        <hp>2</hp>
        <hp>
          3<focus />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const output = (
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
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    toggleList(editor, { type: getPluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });

  it('should turn multiple validLiChildrenTypes to list', () => {
    const input = (
      <editor>
        <himg>
          <htext>
            <anchor />
          </htext>
        </himg>
        <himg>
          <htext />
        </himg>
        <himg>
          <htext>
            <focus />
          </htext>
        </himg>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hul>
          <hli>
            <himg>
              <htext />
            </himg>
          </hli>
          <hli>
            <himg>
              <htext />
            </himg>
          </hli>
          <hli>
            <himg>
              <htext />
            </himg>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [
        ListPlugin.extendPlugin(ELEMENT_UL, {
              options: {
                validLiChildrenTypes: [ELEMENT_IMAGE],
              },
        }),
      ],
    });

    toggleList(editor, { type: getPluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });

  it('should turn multiple p to list in the same order', () => {
    const input = (
      <editor>
        <hp>
          <anchor />
          AAA
        </hp>
        <hp>BBB</hp>
        <hp>CCC</hp>
        <hp>DDD</hp>
        <hp>EEE</hp>
        <hp>
          FFF
          <focus />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>AAA</hlic>
          </hli>
          <hli>
            <hlic>BBB</hlic>
          </hli>
          <hli>
            <hlic>CCC</hlic>
          </hli>
          <hli>
            <hlic>DDD</hlic>
          </hli>
          <hli>
            <hlic>EEE</hlic>
          </hli>
          <hli>
            <hlic>FFF</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    toggleList(editor, { type: getPluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });

  it('should turn multiple p to list in the same order', () => {
    const input = (
      <editor>
        <hp>
          <focus />
          AAA
        </hp>
        <hp>BBB</hp>
        <hp>CCC</hp>
        <hp>DDD</hp>
        <hp>EEE</hp>
        <hp>
          FFF
          <anchor />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>AAA</hlic>
          </hli>
          <hli>
            <hlic>BBB</hlic>
          </hli>
          <hli>
            <hlic>CCC</hlic>
          </hli>
          <hli>
            <hlic>DDD</hlic>
          </hli>
          <hli>
            <hlic>EEE</hlic>
          </hli>
          <hli>
            <hlic>FFF</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    toggleList(editor, { type: getPluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });
});

describe('toggle off', () => {
  it('should split a simple list to two', () => {
    const input = (
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
    ) as any as PlateEditor;

    const output = (
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
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    toggleList(editor, { type: getPluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });

  it('should split a nested list', () => {
    const input = (
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
    ) as any as PlateEditor;

    const output = (
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
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    toggleList(editor, { type: getPluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });

  it('should turn a list to multiple p', () => {
    const input = (
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
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hp>1</hp>
        <hp>2</hp>
        <hp>3</hp>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    toggleList(editor, { type: getPluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });

  it('should turn multiple lists to validLiChildrenTypes', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              <htext>
                <anchor />
              </htext>
            </hlic>
          </hli>
          <hli>
            <himg>
              <htext />
            </himg>
          </hli>
          <hli>
            <himg>
              <htext>
                <focus />
              </htext>
            </himg>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hp>
          <htext>
            <anchor />
          </htext>
        </hp>
        <himg>
          <htext />
        </himg>
        <himg>
          <htext>
            <focus />
          </htext>
        </himg>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [
        ListPlugin.extendPlugin(ELEMENT_UL, {
              options: {
                validLiChildrenTypes: [ELEMENT_IMAGE],
          },
        }),
      ],
    });

    toggleList(editor, { type: getPluginType(editor, ELEMENT_UL) });

    expect(input.children).toEqual(output.children);
  });
});

describe('toggle over', () => {
  it('should toggle different list types', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              1<cursor />
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hol>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hol>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    toggleList(editor, { type: getPluginType(editor, ELEMENT_OL) });

    expect(input.children).toEqual(output.children);
  });

  it('should only toggle the nested list', () => {
    const input = (
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
    ) as any as PlateEditor;

    const output = (
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
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    toggleList(editor, { type: getPluginType(editor, ELEMENT_OL) });

    expect(input.children).toEqual(output.children);
  });

  it('should only toggle everything that is selected', () => {
    const input = (
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
    ) as any as PlateEditor;

    const output = (
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
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    toggleList(editor, { type: getPluginType(editor, ELEMENT_OL) });

    expect(input.children).toEqual(output.children);
  });

  it('should fully toggle a nested list when the selection contains a p', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              <anchor />1
            </hlic>
            <hul>
              <hli>
                <hlic>11</hlic>
              </hli>
            </hul>
          </hli>
        </hul>
        <hp>
          body
          <focus />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const output = (
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
          <hli>
            <hlic>body</hlic>
          </hli>
        </hol>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [ListPlugin],
    });

    toggleList(editor, { type: getPluginType(editor, ELEMENT_OL) });

    expect(input.children).toEqual(output.children);
  });
});
