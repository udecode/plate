/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { createLinkPlugin } from './createLinkPlugin';

jsx;

/**
 * TODO: test
 * react:
 * https://github.com/udecode/editor-protocol/issues/44
 * https://github.com/udecode/editor-protocol/issues/45
 * https://github.com/udecode/editor-protocol/issues/49
 * https://github.com/udecode/editor-protocol/issues/51
 * https://github.com/udecode/editor-protocol/issues/54
 * https://github.com/udecode/editor-protocol/issues/55
 * https://github.com/udecode/editor-protocol/issues/57
 * https://github.com/udecode/editor-protocol/issues/61
 *
 * submitFloatingLink:
 * https://github.com/udecode/editor-protocol/issues/48
 *
 * selection:
 * https://github.com/udecode/editor-protocol/issues/52
 * https://github.com/udecode/editor-protocol/issues/53
 *
 * unwrapLink
 * https://github.com/udecode/editor-protocol/issues/56
 */

const url = 'http://google.com';

const createEditor = (editor: any) =>
  createPlateEditor({
    editor,
    plugins: [createLinkPlugin()],
  });

describe('withLink', () => {
  describe('insertData', () => {
    describe('when inserting url text', () => {
      // https://github.com/udecode/editor-protocol/issues/34
      describe('when in a paragraph', () => {
        const input = (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
          </editor>
        ) as any;

        const data: any = { getData: () => 'http://google.com' };

        const output = (
          <editor>
            <hp>
              test
              <ha url="http://google.com">http://google.com</ha>
              <htext />
            </hp>
          </editor>
        ) as any;

        it('should insert link', () => {
          const editor = createEditor(input);

          editor.insertData(data);

          expect(input.children).toEqual(output.children);
        });
      });

      // https://github.com/udecode/editor-protocol/issues/36
      describe('when only one edge in a link', () => {
        const input = (
          <editor>
            <hp>
              test{' '}
              <ha url="http://google.com">
                please
                <anchor />
                click
              </ha>{' '}
              here
              <focus />.
            </hp>
          </editor>
        ) as any;

        const data: any = { getData: () => 'http://google.com/test' };

        const output = (
          <editor>
            <hp>
              test <ha url="http://google.com">please</ha>
              <htext />
              <ha url="http://google.com/test">click here</ha>.
            </hp>
          </editor>
        ) as any;

        it('should insert link', () => {
          jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>docs</fragment>);

          const editor = createEditor(input);

          editor.insertData(data);

          expect(input.children).toEqual(output.children);
        });
      });

      // https://github.com/udecode/editor-protocol/issues/37
      describe('when selection contains a link without the edges inside', () => {
        const input = (
          <editor>
            <hp>
              insert <anchor />
              link <ha url={url}>here</ha>
              <focus />.
            </hp>
          </editor>
        ) as any;

        const urlOutput = 'http://output.com';

        const output = (
          <editor>
            <hp>
              insert <ha url={urlOutput}>link here</ha>.
            </hp>
          </editor>
        ) as any;

        it('should delete and insert link', () => {
          const editor = createEditor(input);

          const data: any = { getData: () => urlOutput };
          editor.insertData(data);

          expect(input.children).toEqual(output.children);
        });
      });
    });

    describe('when inserting non-url text', () => {
      // https://github.com/udecode/editor-protocol/issues/38
      describe('when in a link', () => {
        it('should run default insertText', () => {
          const input = (
            <editor>
              <hp>
                test
                <ha url="http://google.com">
                  http://
                  <cursor />
                  google.com
                </ha>
                <htext />
              </hp>
            </editor>
          ) as any;

          const data: any = { getData: () => 'docs' };

          const output = (
            <editor>
              <hp>
                test
                <ha url="http://google.com">http://docsgoogle.com</ha>
                <htext />
              </hp>
            </editor>
          ) as any;

          jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>docs</fragment>);

          const editor = createEditor(input);

          editor.insertData(data);

          expect(input.children).toEqual(output.children);
        });
      });
    });

    describe('when inserting space', () => {
      // https://github.com/udecode/editor-protocol/issues/41
      describe('when after link', () => {
        const input = (
          <editor>
            <hp>
              link: <ha url="http://google.com">http://google.com</ha>
              <cursor />
            </hp>
          </editor>
        ) as any;

        const text = ' ';

        const output = (
          <editor>
            <hp>
              link: <ha url="http://google.com">http://google.com</ha>{' '}
            </hp>
          </editor>
        ) as any;

        it('should insert text', () => {
          const editor = createEditor(input);

          editor.insertText(text);

          expect(input.children).toEqual(output.children);
        });
      });

      // https://github.com/udecode/editor-protocol/issues/40
      describe('when after non-url text', () => {
        const input = (
          <editor>
            <hp>
              google.com
              <cursor />
            </hp>
          </editor>
        ) as any;

        const text = ' ';

        const output = (
          <editor>
            <hp>google.com </hp>
          </editor>
        ) as any;

        it('should insert text', () => {
          const editor = createEditor(input);

          editor.insertText(text);

          expect(input.children).toEqual(output.children);
        });
      });

      // https://github.com/udecode/editor-protocol/issues/39
      describe('when after url text', () => {
        const input = (
          <editor>
            <hp>
              link: http://google.com
              <cursor />
            </hp>
          </editor>
        ) as any;

        const text = ' ';

        const output = (
          <editor>
            <hp>
              link: <ha url="http://google.com">http://google.com</ha>{' '}
            </hp>
          </editor>
        ) as any;

        it('should wrap the url with a link', () => {
          const editor = createEditor(input);

          editor.insertText(text);

          expect(input.children).toEqual(output.children);
        });
      });

      describe('when cursor is after link in next block', () => {
        const input = (
          <editor>
            <hp>
              link: <ha url="http://google.com">http://google.com</ha>
            </hp>
            <hp>
              test
              <cursor />
            </hp>
          </editor>
        ) as any;

        const text = ' ';

        const output = (
          <editor>
            <hp>
              link: <ha url="http://google.com">http://google.com</ha>
            </hp>
            <hp>
              {'test '}
              {/* keep above as string in quotes to force trailing space */}
              <cursor />
            </hp>
          </editor>
        ) as any;

        it('should run default insertText', () => {
          const editor = createEditor(input);

          editor.insertText(text);

          expect(input.children).toEqual(output.children);
        });
      });

      describe('when creating new block', () => {
        const input = (
          <editor>
            <hp>
              http://google.com
              <cursor />
            </hp>
          </editor>
        ) as any;

        const text = ' ';

        const output = (
          <editor>
            <hp>
              <htext />
              <ha url="http://google.com">http://google.com</ha>
              <htext />
            </hp>
            <hp>
              <cursor />
            </hp>
          </editor>
        ) as any;

        it('should wrap the url with a link ha', () => {
          const editor = createEditor(input);

          editor.insertBreak();

          expect(input.children).toEqual(output.children);
        });
      });
      // https://github.com/udecode/editor-protocol/issues/42
      describe('when after url at start of block', () => {
        const input = (
          <editor>
            <hp>
              http://google.com
              <cursor />
            </hp>
          </editor>
        ) as any;

        const text = ' ';

        const output = (
          <editor>
            <hp>
              <htext />
              <ha url="http://google.com">http://google.com</ha>{' '}
            </hp>
          </editor>
        ) as any;

        it('should wrap the url with a link ha', () => {
          const editor = createEditor(input);

          editor.insertText(text);

          expect(input.children).toEqual(output.children);
        });
      });

      describe('when getUrlHref', () => {
        const input = (
          <editor>
            <hp>
              google.com
              <cursor />
            </hp>
          </editor>
        ) as any;

        const text = ' ';

        const output = (
          <editor>
            <hp>
              <htext />
              <ha url="http://google.com">google.com</ha>{' '}
            </hp>
          </editor>
        ) as any;

        it('should insert link', () => {
          const editor = createPlateEditor({
            editor: input,
            plugins: [
              createLinkPlugin({
                options: {
                  getUrlHref: (_url) => {
                    return 'http://google.com';
                  },
                },
              }),
            ],
          });

          editor.insertText(text);

          expect(input.children).toEqual(output.children);
        });
      });
    });

    // https://github.com/udecode/editor-protocol/issues/62
    describe('when url with bold mark', () => {
      const input = (
        <editor>
          <hp>
            link: http://<htext bold>google</htext>.com
            <cursor />
          </hp>
        </editor>
      ) as any;

      const text = ' ';

      const output = (
        <editor>
          <hp>
            link:{' '}
            <ha url="http://google.com">
              http://<htext bold>google</htext>.com
            </ha>{' '}
          </hp>
        </editor>
      ) as any;

      it('should wrap the url with a link', () => {
        const editor = createEditor(input);

        editor.insertText(text);

        expect(input.children).toEqual(output.children);
      });
    });
  });
});
