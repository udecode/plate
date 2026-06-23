/** @jsx jsxt */

import {
  type SlateEditor,
  type Value,
  BaseParagraphPlugin,
  createSlateEditor,
  createTSlatePlugin,
  KEYS,
} from 'platejs';

import { BaseIndentPlugin } from '@platejs/indent';
import { jsxt } from '@platejs/test-utils';
import { omit } from 'lodash';

import { getCurrentRuntimeTransforms } from '../../../../core/src/internal/currentRuntimeBridge';
import { listPluginPage } from '../../__tests__/listPluginPage';
import { BaseListPlugin } from '../BaseListPlugin';

jsxt;

const CUSTOM_H1 = 'heading-one';

const H1Plugin = createTSlatePlugin({
  key: KEYS.h1,
});

const CustomH1Plugin = H1Plugin.extend({
  node: { type: CUSTOM_H1 },
});

const BlockquotePlugin = createTSlatePlugin({
  key: KEYS.blockquote,
});

const createEditor = ({
  headingPlugin = H1Plugin,
  normalizeInitial = false,
  pages = false,
  targetPlugins = [KEYS.p],
  value,
}: {
  value: Value;
  headingPlugin?: any;
  normalizeInitial?: boolean;
  pages?: boolean;
  targetPlugins?: string[];
}) =>
  createSlateEditor({
    plugins: [
      BaseParagraphPlugin,
      headingPlugin,
      BlockquotePlugin,
      BaseIndentPlugin.configure({
        inject: {
          targetPlugins,
        },
      }),
      pages
        ? listPluginPage
        : BaseListPlugin.configure({
            inject: {
              targetPlugins,
            },
          }),
    ],
    shouldNormalizeEditor: normalizeInitial,
    value,
  });

const createItem = (
  text: string,
  {
    indent = 1,
    listRestart,
    listRestartPolite,
    listStart,
    listStyleType = 'decimal',
  }: {
    indent?: number;
    listRestart?: number;
    listRestartPolite?: number;
    listStart?: number;
    listStyleType?: string;
  } = {}
) => (
  <hp
    indent={indent}
    listRestart={listRestart}
    listRestartPolite={listRestartPolite}
    listStart={listStart}
    listStyleType={listStyleType}
  >
    {text}
  </hp>
);

const createHeadingItem = (
  text: string,
  options: {
    indent?: number;
    listStart?: number;
    listStyleType?: string;
    type?: string;
  } = {}
) => {
  const { indent = 1, listStart, type = KEYS.h1 } = options;
  const listStyleType =
    'listStyleType' in options ? options.listStyleType : 'decimal';

  return (
    <element
      indent={indent}
      listStart={listStart}
      listStyleType={listStyleType}
      type={type}
    >
      {text}
    </element>
  );
};

const createBlockquoteItem = (
  text: string,
  {
    indent = 1,
    listStart,
    listStyleType = 'decimal',
  }: {
    indent?: number;
    listStart?: number;
    listStyleType?: string;
  } = {}
) => (
  <hblockquote
    indent={indent}
    listStart={listStart}
    listStyleType={listStyleType}
  >
    {text}
  </hblockquote>
);

const expectAlreadyNormalized = (editor: SlateEditor) => {
  const before = editor.children;
  getCurrentRuntimeTransforms(editor).normalize({ force: true });
  expect(editor.children).toBe(before);
};

describe('normalizeListStart', () => {
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
        createItem('12', { listStyleType: 'disc' }),
        createItem('21', { indent: 2, listStyleType: 'disc' }),
        createItem('31', { indent: 3, listStyleType: 'disc' }),
        createItem('31', { indent: 3, listStyleType: undefined }),
        createItem('13', { listStyleType: 'disc' }),
        createItem('14', { listStyleType: 'disc' }),
      ];

      const editor = createEditor({
        normalizeInitial: true,
        value: input,
      });

      expect(editor.children).toEqual(output);
    });

    it('does not assign listStart to unordered list items', () => {
      const input = [
        createItem('one', { listStyleType: 'disc' }),
        createItem('two', { listStyleType: 'disc' }),
        createItem('three', { listStyleType: 'circle' }),
        createItem('four', { listStyleType: 'square' }),
      ];

      const editor = createEditor({
        normalizeInitial: true,
        value: input,
      });

      expect(editor.children).toEqual(input);
    });

    it('strips previously-assigned listStart from unordered list items', () => {
      const input = [
        createItem('one', { listStart: 1, listStyleType: 'disc' }),
        createItem('two', { listStart: 2, listStyleType: 'disc' }),
      ];

      const output = [
        createItem('one', { listStyleType: 'disc' }),
        createItem('two', { listStyleType: 'disc' }),
      ];

      const editor = createEditor({
        normalizeInitial: true,
        value: input,
      });

      expect(editor.children).toEqual(output);
    });

    it('resumes ordered numbering after an unordered interruption', () => {
      const input = [
        createItem('one'),
        createItem('two'),
        createItem('bullet', { listStyleType: 'disc' }),
        createItem('three'),
      ];

      const output = [
        createItem('one'),
        createItem('two', { listStart: 2 }),
        createItem('bullet', { listStyleType: 'disc' }),
        createItem('three', { listStart: 3 }),
      ];

      const editor = createEditor({
        normalizeInitial: true,
        value: input,
      });

      expect(editor.children).toEqual(output);
    });

    it('starts paragraph numbering independently after numbered headings', () => {
      const input = [
        createHeadingItem('heading one'),
        createHeadingItem('heading two'),
        createItem('paragraph one'),
        createItem('paragraph two'),
      ];

      const output = [
        createHeadingItem('heading one'),
        createHeadingItem('heading two', { listStart: 2 }),
        createItem('paragraph one'),
        createItem('paragraph two', { listStart: 2 }),
      ];

      const editor = createEditor({
        normalizeInitial: true,
        targetPlugins: [KEYS.h1, KEYS.p],
        value: input,
      });

      expect(editor.children).toEqual(output);
    });

    it('does not resume paragraph numbering across numbered headings', () => {
      const input = [
        createItem('paragraph before'),
        createHeadingItem('heading one'),
        createItem('paragraph after'),
      ];

      const output = [
        createItem('paragraph before'),
        createHeadingItem('heading one'),
        createItem('paragraph after'),
      ];

      const editor = createEditor({
        normalizeInitial: true,
        targetPlugins: [KEYS.h1, KEYS.p],
        value: input,
      });

      expect(editor.children).toEqual(output);
    });

    it('continues paragraph numbering across nested numbered headings', () => {
      const input = [
        createItem('paragraph one'),
        createHeadingItem('nested heading', { indent: 2 }),
        createItem('paragraph two'),
      ];

      const output = [
        createItem('paragraph one'),
        createHeadingItem('nested heading', { indent: 2 }),
        createItem('paragraph two', { listStart: 2 }),
      ];

      const editor = createEditor({
        normalizeInitial: true,
        targetPlugins: [KEYS.h1, KEYS.p],
        value: input,
      });

      expect(editor.children).toEqual(output);
    });

    it('continues paragraph numbering across non-numbered headings', () => {
      const input = [
        createItem('paragraph one'),
        createHeadingItem('plain heading', { listStyleType: undefined }),
        createHeadingItem('bullet heading', { listStyleType: 'disc' }),
        createItem('paragraph two'),
      ];

      const output = [
        createItem('paragraph one'),
        createHeadingItem('plain heading', { listStyleType: undefined }),
        createHeadingItem('bullet heading', { listStyleType: 'disc' }),
        createItem('paragraph two', { listStart: 2 }),
      ];

      const editor = createEditor({
        normalizeInitial: true,
        targetPlugins: [KEYS.h1, KEYS.p],
        value: input,
      });

      expect(editor.children).toEqual(output);
    });

    it('uses configured heading node types for heading sequence boundaries', () => {
      const input = [
        createHeadingItem('heading one', { type: CUSTOM_H1 }),
        createHeadingItem('heading two', { type: CUSTOM_H1 }),
        createItem('paragraph one'),
      ];

      const output = [
        createHeadingItem('heading one', { type: CUSTOM_H1 }),
        createHeadingItem('heading two', { listStart: 2, type: CUSTOM_H1 }),
        createItem('paragraph one'),
      ];

      const editor = createEditor({
        headingPlugin: CustomH1Plugin,
        normalizeInitial: true,
        targetPlugins: [KEYS.h1, KEYS.p],
        value: input,
      });

      expect(editor.children).toEqual(output);
    });

    it('continues paragraph numbering across non-heading list blocks', () => {
      const input = [
        createItem('one'),
        createBlockquoteItem('two'),
        createItem('three'),
      ];

      const output = [
        createItem('one'),
        createBlockquoteItem('two', { listStart: 2 }),
        createItem('three', { listStart: 3 }),
      ];

      const editor = createEditor({
        normalizeInitial: true,
        targetPlugins: [KEYS.blockquote, KEYS.p],
        value: input,
      });

      expect(editor.children).toEqual(output);
    });

    it('honors listRestart on an ordered item following an unordered interruption', () => {
      const input = [
        createItem('one'),
        createItem('two'),
        createItem('bullet', { listStyleType: 'disc' }),
        createItem('five', { listRestart: 5 }),
        createItem('six'),
      ];

      const output = [
        createItem('one'),
        createItem('two', { listStart: 2 }),
        createItem('bullet', { listStyleType: 'disc' }),
        createItem('five', { listRestart: 5, listStart: 5 }),
        createItem('six', { listStart: 6 }),
      ];

      const editor = createEditor({
        normalizeInitial: true,
        value: input,
      });

      expect(editor.children).toEqual(output);
    });

    it('removes listStart from the first items', () => {
      const input = [
        createItem('one', { listStart: 1 }),
        createItem('two'),
        createItem('three > one', { indent: 2, listStart: 1 }),
        createItem('four > two', { indent: 2 }),
        <hp>-</hp>,
        createItem('one 2', { listStart: 1 }),
      ];

      const output = [
        createItem('one'),
        createItem('two', { listStart: 2 }),
        createItem('three > one', { indent: 2 }),
        createItem('four > two', { indent: 2, listStart: 2 }),
        <hp>-</hp>,
        createItem('one 2'),
      ];

      const editor = createEditor({
        normalizeInitial: true,
        value: input,
      });

      expect(editor.children).toEqual(output);
    });

    it('restarts listStart when encountering listRestart', () => {
      const input = [
        createItem('three', { listRestart: 3 }),
        createItem('four'),
        createItem('four > one', { indent: 2 }),
        createItem('four > three', { indent: 2, listRestart: 3 }),
        createItem('four > one', { indent: 2, listRestart: 1 }),
        createItem('five'),
      ];

      const output = [
        createItem('three', { listRestart: 3, listStart: 3 }),
        createItem('four', { listStart: 4 }),
        createItem('four > one', { indent: 2 }),
        createItem('four > three', { indent: 2, listRestart: 3, listStart: 3 }),
        createItem('four > one', { indent: 2, listRestart: 1 }),
        createItem('five', { listStart: 5 }),
      ];

      const editor = createEditor({
        normalizeInitial: true,
        value: input,
      });

      expect(editor.children).toEqual(output);
    });

    it('restarts listStart when encountering listRestartPolite at the start of a list', () => {
      const input = [
        createItem('three', { listRestartPolite: 3 }),
        createItem('four', { listRestartPolite: 1000 }),
        createItem('four > five', { indent: 2, listRestartPolite: 5 }),
        createItem('four > six', { indent: 2 }),
        createItem('four > seven', { indent: 2, listRestartPolite: 1 }),
        createItem('five'),
      ];

      const output = [
        createItem('three', { listRestartPolite: 3, listStart: 3 }),
        createItem('four', { listRestartPolite: 1000, listStart: 4 }),
        createItem('four > five', {
          indent: 2,
          listRestartPolite: 5,
          listStart: 5,
        }),
        createItem('four > six', { indent: 2, listStart: 6 }),
        createItem('four > seven', {
          indent: 2,
          listRestartPolite: 1,
          listStart: 7,
        }),
        createItem('five', { listStart: 5 }),
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
          <element type="page">{createItem('1', { listRestart: 1 })}</element>,
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

        getCurrentRuntimeTransforms(editor).insertNode(createItem('x'), {
          at: [0],
        });

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

        getCurrentRuntimeTransforms(editor).insertNode(createItem('x'), {
          at: [0, 2],
        });

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

        getCurrentRuntimeTransforms(editor).insertNode(<hp>x</hp>, { at: [3] });

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

        getCurrentRuntimeTransforms(editor).removeNodes({ at: [0] });

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

        getCurrentRuntimeTransforms(editor).removeNodes({ at: [3] });

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

        getCurrentRuntimeTransforms(editor).removeNodes({ at: [2] });

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

        getCurrentRuntimeTransforms(editor).moveNodes({
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

        getCurrentRuntimeTransforms(editor).moveNodes({
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

        getCurrentRuntimeTransforms(editor).moveNodes({
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

        getCurrentRuntimeTransforms(editor).moveNodes({
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

        getCurrentRuntimeTransforms(editor).moveNodes({
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

        getCurrentRuntimeTransforms(editor).moveNodes({
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

        getCurrentRuntimeTransforms(editor).setNodes(
          { indent: 2 },
          { at: [1] }
        );

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

        getCurrentRuntimeTransforms(editor).setNodes(
          { indent: 1 },
          { at: [1] }
        );

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
        getCurrentRuntimeTransforms(editor).setNodes(itemProps, { at: [2] });

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

        getCurrentRuntimeTransforms(editor).setNodes(
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

        getCurrentRuntimeTransforms(editor).mergeNodes({
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

        getCurrentRuntimeTransforms(editor).mergeNodes({
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

        getCurrentRuntimeTransforms(editor).mergeNodes({
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

        getCurrentRuntimeTransforms(editor).splitNodes({
          at: { offset: 1, path: [2, 0] },
        });

        expect(editor.children).toEqual(output);
        expectAlreadyNormalized(editor);
      });
    });
  });
});
