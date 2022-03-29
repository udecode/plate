/** @jsx jsx */

import { createPlateEditor, getNode, TElement } from '@udecode/plate-core';
import { createIndentPlugin } from '@udecode/plate-indent';
import { jsx } from '@udecode/plate-test-utils';
import { Editor, Path } from 'slate';
import { getPreviousPath } from '../../../../core/src/common/queries/getPreviousPath';
import { createParagraphPlugin } from '../../../paragraph/src/createParagraphPlugin';
import { createIndentListPlugin } from '../createIndentListPlugin';

jsx;

describe('normalizeIndentListStart', () => {
  describe('when all cases', () => {
    const input = ((
      <editor>
        <hp indent={1} listStyleType="decimal">
          11
        </hp>
        <hp indent={1} listStyleType="decimal">
          12
        </hp>
        <hp indent={2} listStyleType="lower-alpha">
          2a
        </hp>
        <hp indent={2} listStyleType="lower-alpha">
          2b
        </hp>
        <hp indent={1} listStyleType="disc">
          11
        </hp>
        <hp indent={1} listStyleType="disc">
          12
        </hp>
        <hp indent={2} listStyleType="disc">
          21
        </hp>
        <hp indent={3} listStyleType="disc">
          31
        </hp>
        <hp indent={3}>31</hp>
        <hp indent={1} listStyleType="disc">
          13
        </hp>
        <hp indent={1} listStyleType="disc">
          14
        </hp>
      </editor>
    ) as any) as Editor;

    const output = ((
      <editor>
        <hp indent={1} listStyleType="decimal">
          11
        </hp>
        <hp indent={1} listStyleType="decimal" listStart={2}>
          12
        </hp>
        <hp indent={2} listStyleType="lower-alpha">
          2a
        </hp>
        <hp indent={2} listStyleType="lower-alpha" listStart={2}>
          2b
        </hp>
        <hp indent={1} listStyleType="disc">
          11
        </hp>
        <hp indent={1} listStyleType="disc" listStart={2}>
          12
        </hp>
        <hp indent={2} listStyleType="disc">
          21
        </hp>
        <hp indent={3} listStyleType="disc">
          31
        </hp>
        <hp indent={3}>31</hp>
        <hp indent={1} listStyleType="disc" listStart={3}>
          13
        </hp>
        <hp indent={1} listStyleType="disc" listStart={4}>
          14
        </hp>
      </editor>
    ) as any) as Editor;

    it('should be', async () => {
      const editor = createPlateEditor({
        editor: input,
        plugins: [
          createParagraphPlugin(),
          createIndentPlugin(),
          createIndentListPlugin(),
        ],
        normalizeInitialValue: true,
      });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when options', () => {
    const input = ((
      <editor>
        <element type="page">
          <hp indent={1} listStyleType="decimal">
            11
          </hp>
          <hp indent={1} listStyleType="decimal">
            12
          </hp>
        </element>
        <element type="page">
          <hp indent={1} listStyleType="decimal">
            13
            <cursor />
          </hp>
        </element>
        <element type="page">
          <hp indent={1} listStyleType="decimal">
            14
          </hp>
        </element>
      </editor>
    ) as any) as Editor;

    const output = ((
      <editor>
        <element type="page">
          <hp indent={1} listStyleType="decimal">
            11
          </hp>
          <hp indent={1} listStyleType="decimal" listStart={2}>
            12
          </hp>
        </element>
        <element type="page">
          <hp indent={1} listStyleType="decimal" listStart={3}>
            13
          </hp>
        </element>
        <element type="page">
          <hp indent={1} listStyleType="decimal" listStart={4}>
            14
          </hp>
        </element>
      </editor>
    ) as any) as Editor;

    it('should be', async () => {
      const editor = createPlateEditor({
        editor: input,
        plugins: [
          createParagraphPlugin(),
          createIndentPlugin(),
          createIndentListPlugin({
            then: (e) => ({
              options: {
                getSiblingIndentListOptions: {
                  getPreviousEntry: ([, path]) => {
                    const prevPath = getPreviousPath(path);
                    if (!prevPath) {
                      if (path[0] === 0) return;

                      const prevPagePath = [path[0] - 1];

                      const node = getNode(e, prevPagePath) as
                        | TElement
                        | undefined;
                      if (!node) return;

                      const lastNode = node.children[node.children.length - 1];
                      return [
                        lastNode,
                        prevPagePath.concat(node.children.length - 1),
                      ];
                    }

                    const prevNode = getNode(e, prevPath);
                    if (!prevNode) return;

                    return [prevNode, prevPath];
                  },
                  getNextEntry: ([, path]) => {
                    const nextPath = Path.next(path);
                    const nextNode = getNode(e, nextPath);
                    if (!nextNode) {
                      const nextPagePath = [path[0] + 1];
                      const nextPageNode = getNode(e, nextPagePath) as
                        | TElement
                        | undefined;

                      if (!nextPageNode) return;

                      return [
                        nextPageNode.children[0],
                        nextPagePath.concat([0]),
                      ];
                    }

                    return [nextNode, nextPath];
                  },
                },
              },
            }),
          }),
        ],
        normalizeInitialValue: true,
      }) as any;

      expect(editor.children).toEqual(output.children);
    });
  });
});
