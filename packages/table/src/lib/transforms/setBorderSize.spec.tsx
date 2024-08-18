/** @jsx jsx */

import type { SlateEditor } from '@udecode/plate-common';

import { createPlateEditor } from '@udecode/plate-common/react';
import { jsx } from '@udecode/plate-test-utils';

import { TablePlugin } from '../TablePlugin';
import { setBorderSize } from './setBorderSize';

jsx;

// These tests cover the various border cases: top, bottom, left, and right.
// Each test creates an input editor with a cursor in a specific cell,
// sets the border size for the given border,
// and then checks if the output matches the expected output.
describe('setBorderSize', () => {
  const createTablePluginWithOptions = () => TablePlugin;

  const createEditorInstance = (input: any) => {
    return createPlateEditor({
      editor: input,
      plugins: [createTablePluginWithOptions()],
    });
  };

  describe('when in cell 11', () => {
    it('should set border top', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  11
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd borders={{ top: { size: 2 } }}>
                <hp>
                  11
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createEditorInstance(input);
      setBorderSize(editor, 2, { border: 'top' });

      expect(editor.children).toEqual(output.children);
    });

    it('should set border left', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  11
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd borders={{ left: { size: 2 } }}>
                <hp>
                  11
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createEditorInstance(input);
      setBorderSize(editor, 2, { border: 'left' });

      expect(editor.children).toEqual(output.children);
    });

    describe('when in cell 21', () => {
      it('should set border left', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    21
                    <cursor />
                  </hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const output = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd borders={{ left: { size: 3 } }}>
                  <hp>
                    21
                    <cursor />
                  </hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createEditorInstance(input);
        setBorderSize(editor, 3, { border: 'left' });

        expect(editor.children).toEqual(output.children);
      });

      describe('set border top', () => {
        // ... other tests in this describe block

        it('should set border bottom on cell 11', () => {
          const input = (
            <editor>
              <htable>
                <htr>
                  <htd>
                    <hp>11</hp>
                  </htd>
                  <htd>
                    <hp>12</hp>
                  </htd>
                </htr>
                <htr>
                  <htd>
                    <hp>
                      21
                      <cursor />
                    </hp>
                  </htd>
                  <htd>
                    <hp>22</hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as any as SlateEditor;

          const output = (
            <editor>
              <htable>
                <htr>
                  <htd borders={{ bottom: { size: 2 } }}>
                    <hp>11</hp>
                  </htd>
                  <htd>
                    <hp>12</hp>
                  </htd>
                </htr>
                <htr>
                  <htd>
                    <hp>
                      21
                      <cursor />
                    </hp>
                  </htd>
                  <htd>
                    <hp>22</hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as any as SlateEditor;

          const editor = createEditorInstance(input);
          setBorderSize(editor, 2, { border: 'top' });

          expect(editor.children).toEqual(output.children);
        });
      });

      describe('when in cell 12', () => {
        it('should set border right', () => {
          const input = (
            <editor>
              <htable>
                <htr>
                  <htd>
                    <hp>11</hp>
                  </htd>
                  <htd>
                    <hp>
                      12
                      <cursor />
                    </hp>
                  </htd>
                </htr>
                <htr>
                  <htd>
                    <hp>21</hp>
                  </htd>
                  <htd>
                    <hp>22</hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as any as SlateEditor;

          const output = (
            <editor>
              <htable>
                <htr>
                  <htd>
                    <hp>11</hp>
                  </htd>
                  <htd borders={{ right: { size: 1 } }}>
                    <hp>
                      12
                      <cursor />
                    </hp>
                  </htd>
                </htr>
                <htr>
                  <htd>
                    <hp>21</hp>
                  </htd>
                  <htd>
                    <hp>22</hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as any as SlateEditor;

          const editor = createEditorInstance(input);
          setBorderSize(editor, 1, { border: 'right' });

          expect(editor.children).toEqual(output.children);
        });

        describe('set border left', () => {
          it('should set border right on cell 11', () => {
            const input = (
              <editor>
                <htable>
                  <htr>
                    <htd>
                      <hp>11</hp>
                    </htd>
                    <htd>
                      <hp>
                        12
                        <cursor />
                      </hp>
                    </htd>
                  </htr>
                  <htr>
                    <htd>
                      <hp>21</hp>
                    </htd>
                    <htd>
                      <hp>22</hp>
                    </htd>
                  </htr>
                </htable>
              </editor>
            ) as any as SlateEditor;

            const output = (
              <editor>
                <htable>
                  <htr>
                    <htd borders={{ right: { size: 2 } }}>
                      <hp>11</hp>
                    </htd>
                    <htd>
                      <hp>
                        12
                        <cursor />
                      </hp>
                    </htd>
                  </htr>
                  <htr>
                    <htd>
                      <hp>21</hp>
                    </htd>
                    <htd>
                      <hp>22</hp>
                    </htd>
                  </htr>
                </htable>
              </editor>
            ) as any as SlateEditor;

            const editor = createEditorInstance(input);
            setBorderSize(editor, 2, { border: 'left' });

            expect(editor.children).toEqual(output.children);
          });
        });
      });

      describe('when in cell 22', () => {
        it('should set border bottom', () => {
          const input = (
            <editor>
              <htable>
                <htr>
                  <htd>
                    <hp>11</hp>
                  </htd>
                  <htd>
                    <hp>12</hp>
                  </htd>
                </htr>
                <htr>
                  <htd>
                    <hp>21</hp>
                  </htd>
                  <htd>
                    <hp>
                      22
                      <cursor />
                    </hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as any as SlateEditor;

          const output = (
            <editor>
              <htable>
                <htr>
                  <htd>
                    <hp>11</hp>
                  </htd>
                  <htd>
                    <hp>12</hp>
                  </htd>
                </htr>
                <htr>
                  <htd>
                    <hp>21</hp>
                  </htd>
                  <htd borders={{ bottom: { size: 4 } }}>
                    <hp>
                      22
                      <cursor />
                    </hp>
                  </htd>
                </htr>
              </htable>
            </editor>
          ) as any as SlateEditor;

          const editor = createEditorInstance(input);
          setBorderSize(editor, 4, { border: 'bottom' });

          expect(editor.children).toEqual(output.children);
        });
      });
    });
  });
});
