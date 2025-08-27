/** @ts-nocheck */
import { getCommentKey } from '@platejs/comment';
import {
  convertChildrenDeserialize,
  deserializeMd,
  parseAttributes,
} from '@platejs/markdown';
import {
  BaseParagraphPlugin,
  createSlateEditor,
  getPluginType,
  KEYS,
  TextApi,
} from 'platejs';

import { getAIReviewCommentKey } from '../utils/getAIReviewKey';
import { applyAIReview } from './applyAIReview';
import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseHighlightPlugin,
  BaseHorizontalRulePlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from '@platejs/basic-nodes';
import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '@platejs/code-block';
import { BaseListPlugin } from '@platejs/list';
import {
  BaseTablePlugin,
  BaseTableRowPlugin,
  BaseTableCellPlugin,
  BaseTableCellHeaderPlugin,
} from '@platejs/table';
import { MarkdownKit } from '../../../../../../apps/www/src/registry/components/editor/plugins/markdown-kit';

const BasePlugins = [
  BaseParagraphPlugin,
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
  BaseTableCellPlugin,
  BaseTableCellHeaderPlugin,
  // BaseColumnPlugin,
  // BaseColumnItemPlugin,
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseCodePlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseHighlightPlugin,
  BaseKbdPlugin,
  BaseListPlugin,
  ...MarkdownKit,
];

function createPreviewEditor(value: string) {
  const previewEditor = createSlateEditor({
    plugins: BasePlugins,
  });

  previewEditor.children = deserializeMd(previewEditor, value, {
    memoize: true,
    rules: {
      [KEYS.comment]: {
        mark: true,
        deserialize: (mdastNode, deco, options) => {
          const props = parseAttributes(mdastNode.attributes);
          const aiCommentContent = props.value;
          return convertChildrenDeserialize(
            mdastNode.children,
            {
              [getAIReviewCommentKey()]: aiCommentContent,
              [getPluginType(options.editor!, KEYS.comment)]: true,
              ...deco,
            },
            options
          ) as any;
        },
      },
    },
  });

  return previewEditor;
}

describe('applyAIReview', () => {
  it('should apply the AI review to the editor', () => {
    const previewEditor = createPreviewEditor(
      'hello,<comment value="test">hello</comment>,hello,hello.'
    );

    const editor = createSlateEditor({
      plugins: BasePlugins,
      value: [
        {
          children: [{ text: 'hello,hello,hello,hello.' }],
          type: 'p',
        },
      ],
    });

    applyAIReview(editor, previewEditor, {
      onComment: ({ content, range, text }) => {
        editor.tf.setNodes(
          {
            [getCommentKey('test')]: true,
            [KEYS.comment]: true,
          },
          {
            at: range,
            match: TextApi.isText,
            split: true,
          }
        );
      },
    });

    expect(editor.children).toEqual([
      {
        children: [
          { text: 'hello,' },
          {
            [getCommentKey('test')]: true,
            [KEYS.comment]: true,
            text: 'hello',
          },
          { text: ',hello,hello.' },
        ],
        type: 'p',
      },
    ]);
  });

  // it.only('should apply the AI review to the editor', () => {
  //   const previewEditor = createPreviewEditor('markdown string');

  //   const editor = createSlateEditor({
  //     plugins: BaseEditorKit,
  //   });

  //   editor.children = deserializeMd(editor, 'markdown string orginal');

  //   applyAIReview(editor, previewEditor, {
  //     onComment: ({ range, content, text }) => {
  //       editor.tf.setNodes(
  //         {
  //           [KEYS.comment]: true,
  //           [getCommentKey('test')]: true,
  //         },
  //         {
  //           at: range,
  //           match: TextApi.isText,
  //           split: true,
  //         }
  //       );
  //     },
  //   });
  // });
});
