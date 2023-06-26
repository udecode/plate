/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { upsertLink } from './upsertLink';

import {
  createLinkPlugin,
  LinkPlugin,
} from '@/packages/link/src/createLinkPlugin';

jsx;

const url = 'http://google.com';
const urlOutput = 'http://output.com';

const createEditor = (editor: any, options?: LinkPlugin) =>
  createPlateEditor({
    editor,
    plugins: [
      createLinkPlugin({
        options,
      }),
    ],
  });

describe('upsertLink', () => {
  describe('when selection is collapsed', () => {
    // https://github.com/udecode/editor-protocol/issues/46
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

    // https://github.com/udecode/editor-protocol/issues/47
    describe('when not in link, url+text', () => {
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
            insert link<ha url={url}>another</ha>.
          </hp>
        </editor>
      ) as any;

      it('should insert link with text', () => {
        const editor = createEditor(input);
        upsertLink(editor, { url, text: 'another' });

        expect(input.children).toEqual(output.children);
      });
    });

    // https://github.com/udecode/editor-protocol/issues/35
    describe('when in a link, insert url', () => {
      const input = (
        <editor>
          <hp>
            .
            <ha url={url}>
              insert <cursor /> link
            </ha>
            .
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            .<ha url={url}>insert {url} link</ha>.
          </hp>
        </editor>
      ) as any;

      it('should insert text', () => {
        const editor = createEditor(input);
        upsertLink(editor, { url, insertTextInLink: true });

        expect(input.children).toEqual(output.children);
      });
    });

    describe('when in a link, edit same url, same text', () => {
      const input = (
        <editor>
          <hp>
            .
            <ha url={url}>
              insert <cursor />
              link
            </ha>
            .
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

      it('should do nothing', () => {
        const editor = createEditor(input);
        upsertLink(editor, { url, text: 'insert link' });

        expect(input.children).toEqual(output.children);
      });
    });

    // https://github.com/udecode/editor-protocol/issues/59
    describe('when in a link, edit url', () => {
      const input = (
        <editor>
          <hp>
            .
            <ha url={url}>
              insert <cursor />
              link
            </ha>
            .
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            .<ha url={urlOutput}>insert link</ha>.
          </hp>
        </editor>
      ) as any;

      it('should update link url', () => {
        const editor = createEditor(input);
        upsertLink(editor, { url: urlOutput });

        expect(input.children).toEqual(output.children);
      });
    });

    // https://github.com/udecode/editor-protocol/issues/58
    describe('when in a link, edit text + same url', () => {
      const input = (
        <editor>
          <hp>
            .
            <ha url={url}>
              <htext bold>
                insert <cursor /> link
              </htext>
            </ha>
            .
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            .
            <ha url={url}>
              <htext bold>edit link</htext>
            </ha>
            .
          </hp>
        </editor>
      ) as any;

      it('should insert text', () => {
        const editor = createEditor(input);
        upsertLink(editor, { url, text: 'edit link' });

        expect(input.children).toEqual(output.children);
      });
    });

    describe('when in a link, insertTextInLink + same url', () => {
      const input = (
        <editor>
          <hp>
            .
            <ha url={url}>
              insert <cursor /> link
            </ha>
            .
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            .<ha url={url}>insert {url} link</ha>.
          </hp>
        </editor>
      ) as any;

      it('should insert text', () => {
        const editor = createEditor(input);
        upsertLink(editor, { url, insertTextInLink: true });

        expect(input.children).toEqual(output.children);
      });
    });

    // https://github.com/udecode/editor-protocol/issues/60
    describe('when in a link, set empty text', () => {
      const input = (
        <editor>
          <hp>
            .
            <ha url={url}>
              insert <cursor /> link
            </ha>
            .
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            .<ha url={url}>{url}</ha>.
          </hp>
        </editor>
      ) as any;

      it('should set text to url', () => {
        const editor = createEditor(input);
        upsertLink(editor, { url, text: '' });

        expect(input.children).toEqual(output.children);
      });
    });
  });

  describe('when selection is expanded', () => {
    // https://github.com/udecode/editor-protocol/issues/50
    describe('when not in link, insert url + same text', () => {
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

      it('should insert link', () => {
        const editor = createEditor(input);
        upsertLink(editor, { url, text: 'insert link' });

        expect(input.children).toEqual(output.children);
      });
    });

    // https://github.com/udecode/editor-protocol/issues/50
    describe('when not in link, insert url+text', () => {
      const input = (
        <editor>
          <hp>
            .<anchor />
            insert <htext>bold</htext> link
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
            .<ha url={url}>insert link</ha>.
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

    // https://github.com/udecode/editor-protocol/issues/70
    describe('when inserting a link in a marked text', () => {
      const input = (
        <editor>
          <hp>
            insert{' '}
            <htext bold>
              link <cursor /> here
            </htext>
            .
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            insert <htext bold>link </htext>
            <ha url={urlOutput}>
              <htext bold>{urlOutput}</htext>
            </ha>
            <htext bold> here</htext>.
          </hp>
        </editor>
      ) as any;

      it('the new link should keep the marks', () => {
        const editor = createEditor(input);
        upsertLink(editor, { url: urlOutput });

        expect(input.children).toEqual(output.children);
      });
    });
  });

  describe('when skipValidation is false and url is invalid', () => {
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
        <hp>insert link.</hp>
      </editor>
    ) as any;

    it('should do nothing', () => {
      const editor = createEditor(input);
      upsertLink(editor, {
        url: 'invalid',
        skipValidation: false,
      });

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when skipValidation is true and url is invalid', () => {
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
          insert link<ha url="invalid">invalid</ha>.
        </hp>
      </editor>
    ) as any;

    it('should insert', () => {
      const editor = createEditor(input);
      upsertLink(editor, {
        url: 'invalid',
        skipValidation: true,
      });

      expect(input.children).toEqual(output.children);
    });
  });
});
