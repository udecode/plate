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
        type: 'paragraph',
        children: [{ type: 'text', value: 'Hello world' }],
      };

      const result = wrapWithBlockId(mdastNode, 'test-id');

      expect(result).toEqual({
        type: 'mdxJsxFlowElement',
        name: 'block',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'id',
            value: 'test-id',
          },
        ],
        children: [mdastNode],
        data: {
          _mdxExplicitJsx: true,
        },
      });
    });

    it('should convert numeric IDs to strings', () => {
      const mdastNode = {
        type: 'paragraph',
        children: [{ type: 'text', value: 'Test' }],
      };

      const result = wrapWithBlockId(mdastNode, '123') as any;

      expect(result.attributes[0].value).toBe('123');
    });
  });

  describe('integration with serializeMd', () => {
    it('should wrap nodes with IDs in block elements when withBlockId is true', () => {
      const slateNodes = [
        {
          type: 'p',
          id: '123',
          children: [{ text: 'Hello world' }],
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
          type: 'p',
          children: [{ text: 'No ID here' }],
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
          type: 'p',
          id: 'para-with-marks',
          children: [
            { text: 'Text with ' },
            { text: 'bold', bold: true },
            { text: ' and ' },
            { text: 'italic', italic: true },
            { text: ' marks' },
          ],
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
          type: 'p',
          id: 'list-item-1',
          indent: 1,
          listStyleType: 'disc',
          children: [{ text: 'Item 1' }],
        },
        {
          type: 'p',
          id: 'list-item-2',
          indent: 1,
          listStyleType: 'disc',
          children: [{ text: 'Item 2' }],
        },
        {
          type: 'p',
          id: 'list-item-3',
          indent: 2,
          listStyleType: 'disc',
          children: [{ text: 'Nested item' }],
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
          type: 'p',
          id: 'ordered-1',
          indent: 1,
          listStyleType: 'decimal',
          children: [{ text: 'First' }],
        },
        {
          type: 'p',
          id: 'ordered-2',
          indent: 1,
          listStyleType: 'decimal',
          children: [{ text: 'Second' }],
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
