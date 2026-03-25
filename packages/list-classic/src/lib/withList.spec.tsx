/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { BaseLinkPlugin } from '@platejs/link';
import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { BaseListPlugin } from './BaseListPlugin';
import * as listModule from '.';
import * as transformsModule from './transforms/index';

jsxt;

afterEach(() => {
  mock.restore();
});

const testInsertText = (
  input: any,
  expected: any,
  listConfig: Parameters<typeof BaseListPlugin.configure>[0] = {}
) => {
  const editor = createSlateEditor({
    plugins: [BaseListPlugin.configure(listConfig), BaseLinkPlugin],
    selection: input.selection,
    value: input.children,
  });

  editor.tf.insertText('o');

  // biome-ignore lint/suspicious/noMisplacedAssertion: helper function called inside tests
  expect(editor.children).toEqual(expected.children);
};

const testDeleteBackward = (input: any, expected: any) => {
  const editor = createSlateEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    value: input.children,
  });

  editor.tf.deleteBackward();

  // biome-ignore lint/suspicious/noMisplacedAssertion: helper function called inside tests
  expect(editor.children).toEqual(expected.children);
};

const testDeleteForward = (input: any, expected: any) => {
  const editor = createSlateEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    value: input.children,
  });

  editor.tf.deleteForward();

  // biome-ignore lint/suspicious/noMisplacedAssertion: helper function called inside tests
  expect(editor.children).toEqual(expected.children);
};

describe('withList', () => {
  it('unwraps list items on resetBlock instead of delegating', () => {
    const unwrapSpy = spyOn(listModule, 'unwrapList').mockImplementation(
      () => {}
    );
    const resetBlock = mock();
    const editor = {
      api: {
        block: mock(() => [{ type: 'li' }, [0]]),
      },
      getType: (key: string) => key,
      selection: null,
      tf: {},
    } as any;
    const transforms = (
      listModule.withList({
        editor,
        getOptions: () => ({}),
        tf: { resetBlock, tab: mock() },
      } as any) as any
    ).transforms;

    expect(transforms.resetBlock({ at: [0] } as any)).toBeUndefined();
    expect(unwrapSpy).toHaveBeenCalledWith(editor);
    expect(resetBlock).not.toHaveBeenCalled();
  });

  it('delegates tab when the selection is not in a list context', () => {
    const tab = mock(() => true);
    const editor = {
      api: {
        isCollapsed: mock(() => true),
        some: mock(() => false),
      },
      getType: (key: string) => key,
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      tf: {
        select: mock(),
      },
    } as any;
    const transforms = (
      listModule.withList({
        editor,
        getOptions: () => ({ enableResetOnShiftTab: true }),
        tf: { resetBlock: mock(), tab },
      } as any) as any
    ).transforms;

    expect(transforms.tab({ reverse: false } as any)).toBe(true);
    expect(tab).toHaveBeenCalledWith({ reverse: false });
  });

  it('unhangs expanded selections and moves list items on tab', () => {
    const moveListItemsSpy = spyOn(
      transformsModule,
      'moveListItems'
    ).mockImplementation(() => true);
    const unhangRange = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };
    const editor = {
      api: {
        isCollapsed: mock(() => false),
        some: mock(() => true),
        unhangRange: mock(() => unhangRange),
      },
      getType: (key: string) => key,
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      tf: {
        select: mock(),
      },
    } as any;
    const transforms = (
      listModule.withList({
        editor,
        getOptions: () => ({ enableResetOnShiftTab: true }),
        tf: { resetBlock: mock(), tab: mock() },
      } as any) as any
    ).transforms;

    expect(transforms.tab({ reverse: true } as any)).toBe(true);
    expect(editor.tf.select).toHaveBeenCalledWith(unhangRange);
    expect(moveListItemsSpy).toHaveBeenCalledWith(editor, {
      at: unhangRange,
      enableResetOnShiftTab: true,
      increase: false,
    });
  });

  describe('normalizeList', () => {
    describe('when there is no lic in li', () => {
      it('insert lic', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                hell
                <cursor /> <ha>link</ha>
                <htext />
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  hello <ha>link</ha>
                  <htext />
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        testInsertText(input, expected);
      });
    });

    describe('when li > p > children', () => {
      it('normalizes li > p children to li > lic > children', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hp>
                  hell
                  <cursor />
                </hp>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>hello</hlic>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        testInsertText(input, expected);
      });
    });

    describe('when li > lic > p > children', () => {
      it('normalizes li > lic > p children to li > lic > children', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  <hp>
                    hell
                    <cursor />
                  </hp>
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>hello</hlic>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        testInsertText(input, expected);
      });
    });

    describe('when li > lic > block > block > children', () => {
      it('unwraps nested blocks into li > lic > children', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  <element>
                    <hp>
                      hell
                      <cursor />
                    </hp>
                  </element>
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>hello</hlic>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        testInsertText(input, expected);
      });
    });

    describe('when li > lic > many block > block > children', () => {
      it('merges multiple blocks into li > lic > children', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  <element>
                    <hp>
                      hell
                      <cursor />
                    </hp>
                  </element>
                  <element>
                    <hp> world</hp>
                  </element>
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>hello world</hlic>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        testInsertText(input, expected);
      });
    });

    describe('when li > block, with block in validLiChildrenTypes', () => {
      it('keep the block untouched', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hp>world</hp>
                <hul>
                  <hli>
                    <hblockquote>
                      hell
                      <cursor />
                    </hblockquote>
                  </hli>
                </hul>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        const expected = (
          <editor>
            <hul>
              <hli>
                <hp>world</hp>
                <hul>
                  <hli>
                    <hblockquote>hello</hblockquote>
                  </hli>
                </hul>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        testInsertText(input, expected, {
          options: {
            validLiChildrenTypes: ['p', 'blockquote'],
          },
        });
      });
    });
  });

  describe('when deleteBackward at block start', () => {
    describe('when at first li', () => {
      it('unindents li children and unwraps the list', () => {
        const input = (
          <editor>
            <hp>test</hp>
            <hul>
              <hli>
                <hlic>
                  <cursor />
                  hello
                </hlic>
                <hul>
                  <hli>
                    <hlic>world</hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        const expected = (
          <editor>
            <hp>test</hp>
            <hp>hello</hp>
            <hul>
              <hli>
                <hlic>world</hlic>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        testDeleteBackward(input, expected);
      });
    });

    describe('when at nested li without li children', () => {
      it('delete the li and merge the text nodes to the previous li', () => {
        const input = (
          <editor>
            <hp>test</hp>
            <hul>
              <hli>
                <hlic>hello</hlic>
                <hul>
                  <hli>
                    <hlic>
                      <cursor />
                      world
                    </hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        const expected = (
          <editor>
            <hp>test</hp>
            <hul>
              <hli>
                <hlic>helloworld</hlic>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        testDeleteBackward(input, expected);
      });
    });

    describe('when the list is not nested and li is not the first child', () => {
      it('move li up', () => {
        const input = (
          <editor>
            <hp>test</hp>
            <hul>
              <hli>
                <hlic>hello</hlic>
              </hli>
              <hli>
                <hlic>
                  <cursor />
                  world
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        const expected = (
          <editor>
            <hp>test</hp>
            <hul>
              <hli>
                <hlic>hello</hlic>
              </hli>
            </hul>
            <hp>world</hp>
          </editor>
        ) as any as SlateEditor;

        testDeleteBackward(input, expected);
      });
    });
  });

  describe('when the list is nested and its children list is not wrapped in li', () => {
    describe('when deleteForward at block end', () => {
      it('merge the next element when last child', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  level 1<cursor />
                </hlic>
              </hli>
            </hul>
            <hp>level 2</hp>
          </editor>
        ) as any as SlateEditor;

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  level 1
                  <cursor />
                  level 2
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        testDeleteForward(input, expected);
      });

      it('merge next sibling li', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  level 1<cursor />
                </hlic>
              </hli>
              <hli>
                <hlic>level 2</hlic>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  level 1
                  <cursor />
                  level 2
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        testDeleteForward(input, expected);
      });

      it('merge next li and shift one level up', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>level 1</hlic>
                <hul>
                  <hli>
                    <hlic>
                      level 2<cursor />
                    </hlic>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>level 3</hlic>
                <hul>
                  <hli>
                    <hlic>level 4</hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>level 1</hlic>
                <hul>
                  <hli>
                    <hlic>level 2level 3</hlic>
                  </hli>
                  <hli>
                    <hlic>level 4</hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        testDeleteForward(input, expected);
      });

      it('shift all nested lists one level up', () => {
        const input = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  level 1<cursor />
                </hlic>
                <hul>
                  <hli>
                    <hlic>level 2</hlic>
                    <hul>
                      <hli>
                        <hlic>level 3</hlic>
                        <hul>
                          <hli>
                            <hlic>level 4</hlic>
                          </hli>
                        </hul>
                      </hli>
                      <hli>
                        <hlic>level 5</hlic>
                      </hli>
                    </hul>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>level 1</hlic>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        const expected = (
          <editor>
            <hul>
              <hli>
                <hlic>
                  level 1
                  <cursor />
                  level 2
                </hlic>
                <hul>
                  <hli>
                    <hlic>level 3</hlic>
                    <hul>
                      <hli>
                        <hlic>level 4</hlic>
                      </hli>
                    </hul>
                  </hli>
                  <hli>
                    <hlic>level 5</hlic>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hlic>level 1</hlic>
              </hli>
            </hul>
          </editor>
        ) as any as SlateEditor;

        testDeleteForward(input, expected);
      });
    });
  });
});
