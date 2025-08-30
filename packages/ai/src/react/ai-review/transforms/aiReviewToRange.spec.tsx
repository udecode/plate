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
import { aiReviewToRange } from './aiReviewToRange';

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

describe('applyAIReview', () => {
  it('should apply the AI review to the editor', () => {
    const editor = createSlateEditor({
      plugins: BasePlugins,
      value: [
        {
          id: 'test',
          children: [
            { text: 'Review and refine content seamlessly. Use ' },
            {
              children: [
                {
                  suggestion: true,
                  suggestion_playground1: {
                    id: 'playground1',
                    createdAt: Date.now(),
                    type: 'insert',
                    userId: 'alice',
                  },
                  text: 'suggestions',
                },
              ],
              type: 'a',
              url: '/docs/suggestion',
            },
            {
              suggestion: true,
              suggestion_playground1: {
                id: 'playground1',
                createdAt: Date.now(),
                type: 'insert',
                userId: 'alice',
              },
              text: ' ',
            },
            {
              suggestion: true,
              suggestion_playground1: {
                id: 'playground1',
                createdAt: Date.now(),
                type: 'insert',
                userId: 'alice',
              },
              text: 'like this added text',
            },
            { text: ' or to ' },
            {
              suggestion: true,
              suggestion_playground2: {
                id: 'playground2',
                createdAt: Date.now(),
                type: 'remove',
                userId: 'bob',
              },
              text: 'mark text for removal',
            },
            { text: '. Discuss changes using ' },
            {
              children: [
                { comment: true, comment_discussion1: true, text: 'comments' },
              ],
              type: 'a',
              url: '/docs/comment',
            },
            {
              comment: true,
              comment_discussion1: true,
              text: ' on many text segments',
            },
            { text: '. You can even have ' },
            {
              comment: true,
              comment_discussion2: true,
              suggestion: true,
              suggestion_playground3: {
                id: 'playground3',
                createdAt: Date.now(),
                type: 'insert',
                userId: 'charlie',
              },
              text: 'overlapping',
            },
            { text: ' annotations!' },
          ],
          type: 'p',
        },
      ],
    });

    const aiComment = {
      blockId: 'test',
      content:
        '## Collaborative Editing\n\nReview and refine content seamlessly. Use [<suggestion>suggestions</suggestion>](/docs/suggestion) <suggestion>like this added text</suggestion> or to <suggestion>mark text for removal</suggestion>. Discuss changes using [<comment>comments</comment>](/docs/comment) <comment>on many text segments</comment>. You can even have <comment><suggestion>overlapping</suggestion></comment> annotations!',
      comment:
        'This section explains the suggestion feature, which allows users to add or mark text for removal, enhancing collaborative editing.',
    };

    aiReviewToRange(editor, aiComment, ({ comment, range }) => {});
  });
});
