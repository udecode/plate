/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createLinkPlugin } from '../createLinkPlugin';
import { upsertLink } from './upsertLink';

jsx;

const url = 'http://google.com';

const createEditor = (editor: any) =>
  createPlateEditor({
    editor,
    plugins: [createLinkPlugin()],
  });

describe('upsertLink', () => {
  describe('when selection is collapsed', () => {
    // done
    describe('when not in link, url only', () => {
      const input = (
        <editor>
          <hp>
            insert link
            <cursor />.
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            insert link<ha url={url}>{url}</ha>.
          </hp>
        </editor>
      ) as any;

      it('should insert link', () => {
        const editor = createEditor(input);
        upsertLink(editor, { url });

        expect(input.children).toEqual(output.children);
      });
    });

    // https://github.com/udecode/editor-protocol/issues/35
    describe('when in a link', () => {
      const input = (
        <editor>
          <hp>
            .
            <ha url={url}>
              insert link
              <cursor />
            </ha>
            .
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            .<ha url={url}>insert link{url}</ha>.
          </hp>
        </editor>
      ) as any;

      it('should insert text', () => {
        const editor = createEditor(input);
        upsertLink(editor, { url });

        expect(input.children).toEqual(output.children);
      });
    });
  });

  describe('when selection is expanded', () => {
    // https://github.com/udecode/editor-protocol/issues/43
    describe('when not in link, url only', () => {
      const input = (
        <editor>
          <hp>
            .<anchor />
            insert link
            <focus />.
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            .<ha url={url}>insert link</ha>.
          </hp>
        </editor>
      ) as any;

      it('should wrap link', () => {
        const editor = createEditor(input);
        upsertLink(editor, { url });

        expect(input.children).toEqual(output.children);
      });
    });

    // done
    describe('when not in link, url+text', () => {
      const input = (
        <editor>
          <hp>
            .<anchor />
            insert link
            <focus />.
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            .<ha url={url}>another</ha>.
          </hp>
        </editor>
      ) as any;

      it('should insert link', () => {
        const editor = createEditor(input);
        upsertLink(editor, { url, text: 'another' });

        expect(input.children).toEqual(output.children);
      });
    });

    // done
    describe('when in a link', () => {
      const input = (
        <editor>
          <hp>
            .
            <ha url={url}>
              insert <anchor />
              link
              <focus />
            </ha>
            .
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            .<ha url={url}>insert {url}</ha>.
          </hp>
        </editor>
      ) as any;

      it('should insert text', () => {
        const editor = createEditor(input);
        upsertLink(editor, { url });

        expect(input.children).toEqual(output.children);
      });
    });

    // done
    describe('when containing a link', () => {
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
        upsertLink(editor, { url: urlOutput });

        expect(input.children).toEqual(output.children);
      });
    });
  });
});
