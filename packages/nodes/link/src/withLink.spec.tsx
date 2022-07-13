/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createLinkPlugin } from './createLinkPlugin';

jsx;

const url = 'http://google.com';

const createEditor = (editor: any) =>
  createPlateEditor({
    editor,
    plugins: [createLinkPlugin()],
  });

describe('withLink', () => {
  describe('insertData', () => {
    describe('when url', () => {
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

      it('should run default insertText', () => {
        const editor = createEditor(input);

        editor.insertData(data);

        expect(input.children).toEqual(output.children);
      });
    });

    describe('when not url', () => {
      const input = (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any;

      const data: any = { getData: () => 'test' };

      const output = (
        <editor>
          <hp>testtest</hp>
        </editor>
      ) as any;

      it('should run default insertText', () => {
        jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>test</fragment>);

        const editor = createEditor(input);

        editor.insertData(data);

        expect(input.children).toEqual(output.children);
      });
    });

    describe('when in a link', () => {
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
            test <ha url="http://google.com">please</ha>http://google.com/test.
          </hp>
        </editor>
      ) as any;

      it('should insert text', () => {
        jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>docs</fragment>);

        const editor = createEditor(input);

        editor.insertData(data);

        expect(input.children).toEqual(output.children);
      });
    });

    describe('when inserting string inside url', () => {
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

    describe('when inserting a link above a link', () => {
      const input = (
        <editor>
          <hp>
            insert link <anchor />
            <ha url={url}>here</ha>
            <focus />.
          </hp>
        </editor>
      ) as any;

      const urlOutput = 'http://output.com';

      const output = (
        <editor>
          <hp>
            insert link <ha url={urlOutput}>here</ha>.
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
});
