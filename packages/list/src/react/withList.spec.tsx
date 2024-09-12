/** @jsx jsx */

import type { SlateEditor } from '@udecode/plate-common';

import {
  ParagraphPlugin,
  createPlateEditor,
} from '@udecode/plate-common/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { jsx } from '@udecode/plate-test-utils';

import { ListPlugin } from './ListPlugin';

jsx;

const testInsertText = (
  input: any,
  expected: any,
  listConfig: Parameters<typeof ListPlugin.configure>[0] = {}
) => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [ParagraphPlugin, ListPlugin.configure(listConfig), LinkPlugin],
  });

  editor.insertText('o');

  expect(editor.children).toEqual(expected.children);
};

const testDeleteBackward = (input: any, expected: any) => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [ParagraphPlugin, ListPlugin],
  });

  editor.deleteBackward('character');

  expect(editor.children).toEqual(expected.children);
};

const testDeleteForward = (input: any, expected: any) => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [ParagraphPlugin, ListPlugin],
  });

  editor.deleteForward('character');

  expect(editor.children).toEqual(expected.children);
};

describe('withList', () => {
  describe('normalizeList', () => {
    describe('when there is no lic in li', () => {
      it('should insert lic', () => {
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
      it('should be li > lic > children', () => {
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
      it('should be li > lic > children', () => {
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
      it('should be li > lic > children', () => {
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
      it('should be li > lic > children merged', () => {
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
      it('should keep the block untouched', () => {
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
      it('should be unindent li children and unwrap the list', () => {
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
      it('should delete the li and merge the text nodes to the previous li', () => {
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
      it('should move li up', () => {
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
    // it('should move a nested list into previous sibling li', () => {
    //   const input = ((
    //     <editor>
    //       <hul>
    //         <hli>
    //           <hlic>level 1.1</hlic>
    //         </hli>
    //         <hul>
    //           <hli>
    //             <hlic>
    //               level 2 <cursor />
    //             </hlic>
    //           </hli>
    //         </hul>
    //         <hli>
    //           <hlic>level 1.2</hlic>
    //         </hli>
    //       </hul>
    //     </editor>
    //   ) as any) as SlateEditor;
    //
    //   const expected = ((
    //     <editor>
    //       <hul>
    //         <hli>
    //           <hlic>level 1.1</hlic>
    //         </hli>
    //         <hul>
    //           <hli>
    //             <hlic>level 2</hlic>
    //           </hli>
    //         </hul>
    //         <hli>
    //           <hlic>level 1.2</hlic>
    //         </hli>
    //       </hul>
    //     </editor>
    //   ) as any) as SlateEditor;
    //
    //   testDeleteBackward(input, expected);
    // });

    //   it('should skip a nested list if there is no previous sibling li', () => {
    //     const input = ((
    //       <editor>
    //         <hul>
    //           <hul>
    //             <hli>
    //               <hlic>
    //                 level 2 <cursor />
    //               </hlic>
    //             </hli>
    //           </hul>
    //           <hli>
    //             <hlic>level 1.2</hlic>
    //           </hli>
    //         </hul>
    //       </editor>
    //     ) as any) as SlateEditor;
    //
    //     const expected = ((
    //       <editor>
    //         <hul>
    //           <hul>
    //             <hli>
    //               <hlic>level 2</hlic>
    //             </hli>
    //           </hul>
    //           <hli>
    //             <hlic>level 1.2</hlic>
    //           </hli>
    //         </hul>
    //       </editor>
    //     ) as any) as SlateEditor;
    //
    //     testDeleteBackward(input, expected);
    //   });
    // });

    describe('when deleteForward at block end', () => {
      it('should merge the next element when last child', () => {
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

      it('should merge next sibling li', () => {
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

      it('should merge next li and shift one level up', () => {
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

      it('should shift all nested lists one level up', () => {
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
