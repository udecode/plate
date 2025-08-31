/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { createTestEditor } from '../__tests__/createTestEditor';
import { serializeMd } from './serializeMd';
import { wrapWithBlockId } from './wrapWithBlockId';

jsx;

const editor = createTestEditor();

describe('wrapWithBlockId', () => {
  describe('unit tests', () => {
    it('should wrap a node with block element and ID attribute', () => {
      const mdastNode = {
        children: [{ type: 'text', value: 'Hello world' }],
        type: 'paragraph',
      };

      const result = wrapWithBlockId(mdastNode, 'test-id');

      expect(result).toEqual({
        attributes: [
          {
            name: 'id',
            type: 'mdxJsxAttribute',
            value: 'test-id',
          },
        ],
        children: [mdastNode],
        data: {
          _mdxExplicitJsx: true,
        },
        name: 'block',
        type: 'mdxJsxFlowElement',
      });
    });

    it('should convert numeric IDs to strings', () => {
      const mdastNode = {
        children: [{ type: 'text', value: 'Test' }],
        type: 'paragraph',
      };

      const result = wrapWithBlockId(mdastNode, '123') as any;

      expect(result.attributes[0].value).toBe('123');
    });
  });

  describe('integration with serializeMd', () => {
    it('should wrap nodes with IDs in block elements when withBlockId is true', () => {
      const slateNodes = [
        {
          id: '123',
          children: [{ text: 'Hello world' }],
          type: 'p',
        },
      ];

      const result = serializeMd(editor as any, {
        value: slateNodes,
        withBlockId: true,
      });

      expect(result).toMatchSnapshot();
    });

    it('should not wrap nodes without IDs', () => {
      const slateNodes = [
        {
          children: [{ text: 'No ID here' }],
          type: 'p',
        },
      ];

      const result = serializeMd(editor as any, {
        value: slateNodes,
        withBlockId: true,
      });

      expect(result).toMatchSnapshot();
    });

    it('should handle complex nested structures', () => {
      const slateNodes = [
        {
          id: 'para-with-marks',
          children: [
            { text: 'Text with ' },
            { bold: true, text: 'bold' },
            { text: ' and ' },
            { italic: true, text: 'italic' },
            { text: ' marks' },
          ],
          type: 'p',
        },
      ];

      const result = serializeMd(editor as any, {
        value: slateNodes,
        withBlockId: true,
      });

      expect(result).toMatchSnapshot();
    });

    it('should not wrap nested block elements in tables', () => {
      const slateNodes = (
        <htable id="wX11A61CZN">
          <htr id="Q1LgIIFN3Q">
            <htd id="9gnGaBxtE_">
              <hp id="U8i7WkT4O4">td1</hp>
            </htd>
            <htd id="gPanekRFP8">
              <hp id="t8-eEle3Y-">td2</hp>
            </htd>
          </htr>
          <htr id="xjI2n84Qz9">
            <htd id="zsCvPVVyaI">
              <hp id="SDNQL3h_Or">td3</hp>
            </htd>
            <htd id="KZnBaSppxO">
              <hp id="NuCtsYJdZP">td4</hp>
            </htd>
          </htr>
        </htable>
      );

      const result = serializeMd(editor as any, {
        value: [slateNodes],
        withBlockId: true,
      });

      expect(result).toMatch(
        `<block id="wX11A61CZN">
  | td1 | td2 |
  | --- | --- |
  | td3 | td4 |
</block>`
      );
    });

    it('should wrap indent lists with IDs in block elements when withBlockId is true', () => {
      const slateNodes = [
        {
          id: 'list-item-1',
          children: [{ text: 'Item 1' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'p',
        },
        {
          id: 'list-item-2',
          children: [{ text: 'Item 2' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'p',
        },
        {
          id: 'list-item-3',
          children: [{ text: 'Nested item' }],
          indent: 2,
          listStyleType: 'disc',
          type: 'p',
        },
      ];

      const result = serializeMd(editor as any, {
        value: slateNodes,
        withBlockId: true,
      });

      expect(result).toMatchSnapshot();
    });

    it('should wrap ordered indent lists with IDs when withBlockId is true', () => {
      const slateNodes = [
        {
          id: 'ordered-1',
          children: [{ text: 'First' }],
          indent: 1,
          listStyleType: 'decimal',
          type: 'p',
        },
        {
          id: 'ordered-2',
          children: [{ text: 'Second' }],
          indent: 1,
          listStyleType: 'decimal',
          type: 'p',
        },
      ];

      const result = serializeMd(editor as any, {
        value: slateNodes,
        withBlockId: true,
      });

      expect(result).toMatchSnapshot();
    });
  });
});
