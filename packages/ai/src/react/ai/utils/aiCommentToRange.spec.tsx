import type { Range } from 'platejs';

import { createTestEditor } from './__tests__/createTestEditor';
import { aiCommentToRange } from './aiCommentToRange';

describe('applyAIReview', () => {
  it('should apply the AI review to the editor', () => {
    const editor = createTestEditor([
      {
        id: 'gYBjGfssdm',
        children: [
          {
            text: 'Welcome to the Plate Playground!',
          },
        ],
        type: 'h1',
      },
      {
        id: '5zZ8_hM53b',
        children: [
          {
            text: 'Experience a modern rich-text editor built with ',
          },
          {
            children: [
              {
                text: 'Slate',
              },
            ],
            type: 'a',
            url: 'https://slatejs.org',
          },
          {
            text: ' and ',
          },
          {
            children: [
              {
                text: 'React',
              },
            ],
            type: 'a',
            url: 'https://reactjs.org',
          },
          {
            text: ". This playground showcases just a part of Plate's capabilities. ",
          },
          {
            children: [
              {
                text: 'Explore the documentation',
              },
            ],
            type: 'a',
            url: '/docs',
          },
          {
            text: ' to discover more.',
          },
        ],
        type: 'p',
      },
      {
        id: 'GznILN9jX7',
        children: [
          {
            text: 'Collaborative Editing',
          },
        ],
        type: 'h2',
      },
      {
        id: 'YY-HyLNMl-',
        children: [
          {
            text: 'Review and refine content seamlessly. Use ',
          },
          {
            children: [
              {
                suggestion: true,
                suggestion_playground1: {
                  id: 'playground1',
                  createdAt: 1_756_601_648_507,
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
              createdAt: 1_756_601_648_507,
              type: 'insert',
              userId: 'alice',
            },
            text: ' like this added text',
          },
          {
            text: ' or to ',
          },
          {
            suggestion: true,
            suggestion_playground2: {
              id: 'playground2',
              createdAt: 1_756_601_648_507,
              type: 'remove',
              userId: 'bob',
            },
            text: 'mark text for removal',
          },
          {
            text: '. Discuss changes using ',
          },
          {
            children: [
              {
                comment: true,
                comment_discussion1: true,
                text: 'comments',
              },
            ],
            type: 'a',
            url: '/docs/comment',
          },
          {
            comment: true,
            comment_discussion1: true,
            text: ' on many text segments',
          },
          {
            text: '. You can even have ',
          },
          {
            comment: true,
            comment_discussion2: true,
            suggestion: true,
            suggestion_playground3: {
              id: 'playground3',
              createdAt: 1_756_601_648_507,
              type: 'insert',
              userId: 'charlie',
            },
            text: 'overlapping',
          },
          {
            text: ' annotations!',
          },
        ],
        type: 'p',
      },
      {
        id: 'll9QY8QwZe',
        children: [
          {
            text: 'AI-Powered Editing',
          },
        ],
        type: 'h2',
      },
      {
        id: 'gw4Fd3XZU6',
        children: [
          {
            text: 'Boost your productivity with integrated ',
          },
          {
            children: [
              {
                text: 'AI SDK',
              },
            ],
            type: 'a',
            url: '/docs/ai',
          },
          {
            text: '. Press ',
          },
          {
            kbd: true,
            text: '⌘+J',
          },
          {
            text: ' or ',
          },
          {
            kbd: true,
            text: 'Space',
          },
          {
            text: ' in an empty line to:',
          },
        ],
        type: 'p',
      },
      {
        id: 'Hma3jpd732',
        children: [
          {
            text: 'Generate content (continue writing, summarize, explain)',
          },
        ],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        id: 'Z0sWZJvJSK',
        children: [
          {
            text: 'Edit existing text (improve, fix grammar, change tone)',
          },
        ],
        indent: 1,
        listStart: 2,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        id: 'Iu6xPiuKMv',
        children: [
          {
            text: 'Rich Content Editing',
          },
        ],
        type: 'h2',
      },
      {
        id: '-WVMecrPDQ',
        children: [
          {
            text: 'Structure your content with ',
          },
          {
            children: [
              {
                text: 'headings',
              },
            ],
            type: 'a',
            url: '/docs/heading',
          },
          {
            text: ', ',
          },
          {
            children: [
              {
                text: 'lists',
              },
            ],
            type: 'a',
            url: '/docs/list',
          },
          {
            text: ', and ',
          },
          {
            children: [
              {
                text: 'quotes',
              },
            ],
            type: 'a',
            url: '/docs/blockquote',
          },
          {
            text: '. Apply ',
          },
          {
            children: [
              {
                text: 'marks',
              },
            ],
            type: 'a',
            url: '/docs/basic-marks',
          },
          {
            text: ' like ',
          },
          {
            bold: true,
            text: 'bold',
          },
          {
            text: ', ',
          },
          {
            italic: true,
            text: 'italic',
          },
          {
            text: ', ',
          },
          {
            text: 'underline',
            underline: true,
          },
          {
            text: ', ',
          },
          {
            strikethrough: true,
            text: 'strikethrough',
          },
          {
            text: ', and ',
          },
          {
            code: true,
            text: 'code',
          },
          {
            text: '. Use ',
          },
          {
            children: [
              {
                text: 'autoformatting',
              },
            ],
            type: 'a',
            url: '/docs/autoformat',
          },
          {
            text: ' for ',
          },
          {
            children: [
              {
                text: 'Markdown',
              },
            ],
            type: 'a',
            url: '/docs/markdown',
          },
          {
            text: '-like shortcuts (e.g., ',
          },
          {
            kbd: true,
            text: '* ',
          },
          {
            text: ' for lists, ',
          },
          {
            kbd: true,
            text: '# ',
          },
          {
            text: ' for H1).',
          },
        ],
        type: 'p',
      },
      {
        id: 'rpGKu5RVVn',
        children: [
          {
            text: 'Blockquotes are great for highlighting important information.',
          },
        ],
        type: 'blockquote',
      },
      {
        id: 'cfO_TSh8pK',
        children: [
          {
            text: '',
          },
        ],
        type: 'p',
      },
    ]);

    const comments = [
      {
        blockId: 'gYBjGfssdm',
        comment:
          'This is the introductory header for the Plate Playground, setting the stage for the content that follows.',
        content: '# Welcome to the Plate Playground!',
      },
      {
        blockId: '5zZ8_hM53b',
        comment:
          'This sentence introduces the technologies used to build the rich-text editor, Slate and React.',
        content:
          'Experience a modern rich-text editor built with [Slate](https://slatejs.org) and [React](https://reactjs.org).',
      },
      {
        blockId: 'GznILN9jX7',
        comment:
          'This section describes the collaborative editing features, including suggestions and comments, highlighting the ability to annotate and discuss changes.',
        content:
          '## Collaborative Editing\n\nReview and refine content seamlessly. Use [<suggestion>suggestions</suggestion>](/docs/suggestion) <suggestion>like this added text</suggestion> or to <suggestion>mark text for removal</suggestion>. Discuss changes using [<comment>comments</comment>](/docs/comment) <comment>on many text segments</comment>. You can even have <comment><suggestion>overlapping</suggestion></comment> annotations!',
      },
      {
        blockId: 'll9QY8QwZe',
        comment:
          'This section highlights the AI-powered editing capabilities, including content generation and text editing features, accessible via keyboard shortcuts.',
        content:
          '## AI-Powered Editing\n\nBoost your productivity with integrated [AI SDK](/docs/ai). Press <kbd>⌘+J</kbd> or <kbd>Space</kbd> in an empty line to:\n\n* Generate content (continue writing, summarize, explain)\n* Edit existing text (improve, fix grammar, change tone)',
      },
      {
        blockId: 'Iu6xPiuKMv',
        comment:
          'This section explains the rich content editing features, including structuring content with headings and lists, applying text marks, and using autoformatting for Markdown-like shortcuts.',
        content:
          '## Rich Content Editing\n\nStructure your content with [headings](/docs/heading), [lists](/docs/list), and [quotes](/docs/blockquote). Apply [marks](/docs/basic-marks) like **bold**, _italic_, <u>underline</u>, ~~strikethrough~~, and `code`. Use [autoformatting](/docs/autoformat) for [Markdown](/docs/markdown)-like shortcuts (e.g., <kbd>*</kbd> for lists, <kbd>#</kbd> for H1).',
      },
    ];

    const ranges: Range[] = [];
    comments.forEach((aiComment) =>
      ranges.push(aiCommentToRange(editor, aiComment)!)
    );

    expect(ranges).toMatchSnapshot();
  });
});
