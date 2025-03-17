/** @jsx jsxt */

import type { Value } from '@udecode/plate';
import type { SlateEditor } from '@udecode/plate';

import { IndentPlugin } from '@udecode/plate-indent/react';
import { jsxt } from '@udecode/plate-test-utils';
import { ParagraphPlugin } from '@udecode/plate/react';
import { createPlateEditor } from '@udecode/plate/react';
import { omit } from 'lodash';

import { indentListPluginPage } from '../../__tests__/indentListPluginPage';
import { BaseIndentListPlugin } from '../BaseIndentListPlugin';

jsxt;

const createEditor = ({
  normalizeInitial = false,
  pages = false,
  value,
}: {
  value: Value;
  normalizeInitial?: boolean;
  pages?: boolean;
}) =>
  createPlateEditor({
    plugins: [
      ParagraphPlugin,
      IndentPlugin,
      pages ? indentListPluginPage : BaseIndentListPlugin,
    ],
    shouldNormalizeEditor: normalizeInitial,
    value,
  });

const createItem = (
  text: string,
  {
    indent = 1,
    listRestart,
    listStart,
    listStyleType = 'decimal',
  }: {
    indent?: number;
    listRestart?: number;
    listStart?: number;
    listStyleType?: string;
  } = {}
) => (
  <hp
    indent={indent}
    listRestart={listRestart}
    listStart={listStart}
    listStyleType={listStyleType}
  >
    {text}
  </hp>
);

const expectAlreadyNormalized = (editor: SlateEditor) => {
  const before = editor.children;
  editor.tf.normalize({ force: true });
  expect(editor.children).toBe(before);
};

describe('normalizeIndentListStart', () => {
  describe('when normalizing initial value', () => {
    it('assigns listStart to items according to their indent', () => {
      const input = [
        createItem('11'),
        createItem('12'),
        createItem('2a', { indent: 2, listStyleType: 'lower-alpha' }),
        createItem('2b', { indent: 2, listStyleType: 'lower-alpha' }),
        createItem('11', { listStyleType: 'disc' }),
        createItem('12', { listStyleType: 'disc' }),
        createItem('21', { indent: 2, listStyleType: 'disc' }),
        createItem('31', { indent: 3, listStyleType: 'disc' }),
        createItem('31', { indent: 3, listStyleType: undefined }),
        createItem('13', { listStyleType: 'disc' }),
        createItem('14', { listStyleType: 'disc' }),
      ];

      const output = [
        createItem('11'),
        createItem('12', { listStart: 2 }),
        createItem('2a', { indent: 2, listStyleType: 'lower-alpha' }),
        createItem('2b', {
          indent: 2,
          listStart: 2,
          listStyleType: 'lower-alpha',
        }),
        createItem('11', { listStyleType: 'disc' }),
        createItem('12', { listStart: 2, listStyleType: 'disc' }),
        createItem('21', { indent: 2, listStyleType: 'disc' }),
        createItem('31', { indent: 3, listStyleType: 'disc' }),
        createItem('31', { indent: 3, listStyleType: undefined }),
        createItem('13', { listStart: 3, listStyleType: 'disc' }),
        createItem('14', { listStart: 4, listStyleType: 'disc' }),
      ];

      const editor = createEditor({
        normalizeInitial: true,
        value: input,
      });

      expect(editor.children).toEqual(output);
    });

    describe('when configured to continue lists across multiple pages', () => {
      it('does so', () => {
        const input = [
          <element type="page">
            {createItem('11')}
            {createItem('12')}
          </element>,
          <element type="page">
            {createItem('13')}
            {createItem('14')}
          </element>,
        ];

        const output = [
          <element type="page">
            {createItem('11')}
            {createItem('12', { listStart: 2 })}
          </element>,
          <element type="page">
            {createItem('13', { listStart: 3 })}
            {createItem('14', { listStart: 4 })}
          </element>,
        ];

        const editor = createEditor({
          normalizeInitial: true,
          pages: true,
          value: input,
        });

        expect(editor.children).toEqual(output);
      });

      it('respects listRestart', () => {
        const input = [
          <element type="page">
            {createItem('1')}
            {createItem('2')}
          </element>,
          <element type="page">
            {createItem('1', { listRestart: 1, listStart: 2 })}
          </element>,
        ];

        const output = [
          <element type="page">
            {createItem('1')}
            {createItem('2', { listStart: 2 })}
          </element>,
          <element type="page">
            {createItem('1', { listRestart: 1, listStart: 1 })}
          </element>,
        ];

        const editor = createEditor({
          normalizeInitial: true,
          pages: true,
          value: input,
        });

        expect(editor.children).toEqual(output);
      });
    });
  });

  describe('when normalizing after operations', () => {
    describe('insert_node', () => {
      it('inserts at the start', () => {
        const input = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { indent: 2 }),
          createItem('4', { listStart: 3 }),
          createItem('5', { listStart: 4 }),
        ];

        const output = [
          createItem('x'),
          createItem('1', { listStart: 2 }),
          createItem('2', { listStart: 3 }),
          createItem('3', { indent: 2 }),
          createItem('4', { listStart: 4 }),
          createItem('5', { listStart: 5 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.insertNode(createItem('x'), { at: [0] });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });

      it('inserts in the middle', () => {
        const input = [
          <element type="page">
            {createItem('1')}
            {createItem('2', { listStart: 2 })}
            {createItem('3', { indent: 2 })}
            {createItem('4', { listStart: 3 })}
            {createItem('5', { listStart: 4 })}
          </element>,
          <element type="page">{createItem('5', { listStart: 5 })}</element>,
        ];

        const output = [
          <element type="page">
            {createItem('1')}
            {createItem('2', { listStart: 2 })}
            {createItem('x', { listStart: 3 })}
            {createItem('3', { indent: 2 })}
            {createItem('4', { listStart: 4 })}
            {createItem('5', { listStart: 5 })}
          </element>,
          <element type="page">{createItem('5', { listStart: 6 })}</element>,
        ];

        const editor = createEditor({ pages: true, value: input });
        expectAlreadyNormalized(editor);

        editor.tf.insertNode(createItem('x'), { at: [0, 2] });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });

      it('splits a list', () => {
        const input = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { indent: 2 }),
          createItem('4', { listStart: 3 }),
          createItem('5', { listStart: 4 }),
        ];

        const output = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { indent: 2 }),
          <hp>x</hp>,
          createItem('4'),
          createItem('5', { listStart: 2 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.insertNode(<hp>x</hp>, { at: [3] });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });
    });

    describe('remove_node', () => {
      it('removes from the start', () => {
        const input = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { indent: 2 }),
          createItem('4', { listStart: 3 }),
          createItem('5', { listStart: 4 }),
        ];

        const output = [
          createItem('2'),
          createItem('3', { indent: 2 }),
          createItem('4', { listStart: 2 }),
          createItem('5', { listStart: 3 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.removeNodes({ at: [0] });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });

      it('removes from the middle', () => {
        const input = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { indent: 2 }),
          createItem('4', { listStart: 3 }),
          createItem('5', { listStart: 4 }),
        ];

        const output = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { indent: 2 }),
          createItem('5', { listStart: 3 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.removeNodes({ at: [3] });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });

      it('merges two previously separate lists', () => {
        const input = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          <hp>-</hp>,
          createItem('3'),
          createItem('4', { listStart: 2 }),
        ];

        const output = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { listStart: 3 }),
          createItem('4', { listStart: 4 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.removeNodes({ at: [2] });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });
    });

    describe('move_node', () => {
      it('moves from the outside to start', () => {
        const input = [
          createItem('x'),
          <hp>-</hp>,
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { indent: 2 }),
          createItem('4', { listStart: 3 }),
          createItem('5', { listStart: 4 }),
        ];

        const output = [
          <hp>-</hp>,
          createItem('x'),
          createItem('1', { listStart: 2 }),
          createItem('2', { listStart: 3 }),
          createItem('3', { indent: 2 }),
          createItem('4', { listStart: 4 }),
          createItem('5', { listStart: 5 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.moveNodes({
          at: [0],
          to: [1],
        });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });

      it('moves from the start to out', () => {
        const input = [
          <hp>-</hp>,
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { indent: 2 }),
          createItem('4', { listStart: 3 }),
          createItem('5', { listStart: 4 }),
        ];

        const output = [
          createItem('1'),
          <hp>-</hp>,
          createItem('2'),
          createItem('3', { indent: 2 }),
          createItem('4', { listStart: 2 }),
          createItem('5', { listStart: 3 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.moveNodes({
          at: [1],
          to: [0],
        });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });

      it('moves from the start down', () => {
        const input = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { indent: 2 }),
          createItem('4', { listStart: 3 }),
          createItem('5', { listStart: 4 }),
        ];

        const output = [
          createItem('2'),
          createItem('3', { indent: 2 }),
          createItem('1', { listStart: 2 }),
          createItem('4', { listStart: 3 }),
          createItem('5', { listStart: 4 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.moveNodes({
          at: [0],
          to: [2],
        });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });

      it('moves from the middle to start', () => {
        const input = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { indent: 2 }),
          createItem('4', { listStart: 3 }),
          createItem('5', { listStart: 4 }),
        ];

        const output = [
          createItem('4'),
          createItem('1', { listStart: 2 }),
          createItem('2', { listStart: 3 }),
          createItem('3', { indent: 2 }),
          createItem('5', { listStart: 4 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.moveNodes({
          at: [3],
          to: [0],
        });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });

      it('merges two previously separate lists', () => {
        const input = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          <hp>-</hp>,
          createItem('3'),
          createItem('4', { listStart: 2 }),
        ];

        const output = [
          <hp>-</hp>,
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { listStart: 3 }),
          createItem('4', { listStart: 4 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.moveNodes({
          at: [2],
          to: [0],
        });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });

      it('splits a list', () => {
        const input = [
          <hp>-</hp>,
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { listStart: 3 }),
          createItem('4', { listStart: 4 }),
        ];

        const output = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          <hp>-</hp>,
          createItem('3'),
          createItem('4', { listStart: 2 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.moveNodes({
          at: [0],
          to: [2],
        });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });
    });

    describe('set_node', () => {
      it('increases indent', () => {
        const input = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { listStart: 3 }),
          createItem('4', { listStart: 4 }),
        ];

        const output = [
          createItem('1'),
          createItem('2', { indent: 2 }),
          createItem('3', { listStart: 2 }),
          createItem('4', { listStart: 3 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.setNodes({ indent: 2 }, { at: [1] });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });

      it('decreases indent', () => {
        const input = [
          createItem('1'),
          createItem('2', { indent: 2 }),
          createItem('3', { listStart: 2 }),
          createItem('4', { listStart: 3 }),
        ];

        const output = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { listStart: 3 }),
          createItem('4', { listStart: 4 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.setNodes({ indent: 1 }, { at: [1] });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });

      it('merges two previously separate lists', () => {
        const input = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          <hp>x</hp>,
          createItem('3'),
          createItem('4', { listStart: 2 }),
        ];

        const output = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('x', { listStart: 3 }),
          createItem('3', { listStart: 4 }),
          createItem('4', { listStart: 5 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        const itemProps = omit(createItem(''), ['type', 'children']);
        editor.tf.setNodes(itemProps, { at: [2] });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });

      it('splits a list', () => {
        const input = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('x', { listStart: 3 }),
          createItem('3', { listStart: 4 }),
          createItem('4', { listStart: 5 }),
        ];

        const output = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          <hp>x</hp>,
          createItem('3'),
          createItem('4', { listStart: 2 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.setNodes(
          { indent: undefined, listStyleType: undefined },
          { at: [2] }
        );

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });
    });

    describe('merge_node', () => {
      it('merges in the middle of a list', () => {
        const input = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { listStart: 3 }),
          createItem('4', { listStart: 4 }),
        ];

        const output = [
          createItem('1'),
          createItem('23', { listStart: 2 }),
          createItem('4', { listStart: 3 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.mergeNodes({
          at: [2],
        });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });

      it('merges at the start of a list', () => {
        const input = [
          <hp>0</hp>,
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { listStart: 3 }),
          createItem('4', { listStart: 4 }),
        ];

        const output = [
          <hp>01</hp>,
          createItem('2'),
          createItem('3', { listStart: 2 }),
          createItem('4', { listStart: 3 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.mergeNodes({
          at: [1],
        });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });

      it('merges two previously separate lists', () => {
        const input = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          <hp>-</hp>,
          createItem('3'),
          createItem('4', { listStart: 2 }),
        ];

        const output = [
          createItem('1'),
          createItem('2-', { listStart: 2 }),
          createItem('3', { listStart: 3 }),
          createItem('4', { listStart: 4 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.mergeNodes({
          at: [2],
        });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });
    });

    describe('split_node', () => {
      it('splits in the middle of a list', () => {
        const input = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('34', { listStart: 3 }),
          createItem('5', { listStart: 4 }),
        ];

        const output = [
          createItem('1'),
          createItem('2', { listStart: 2 }),
          createItem('3', { listStart: 3 }),
          createItem('4', { listStart: 4 }),
          createItem('5', { listStart: 5 }),
        ];

        const editor = createEditor({ value: input });
        expectAlreadyNormalized(editor);

        editor.tf.splitNodes({
          at: { offset: 1, path: [2, 0] },
        });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });
    });
  });
});
