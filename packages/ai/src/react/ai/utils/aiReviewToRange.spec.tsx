import { Range } from 'platejs';
import { aiReviewToRange } from './aiReviewToRange';
import { createTestEditor } from './__tests__/createTestEditor';

describe('applyAIReview', () => {
  it('should apply the AI review to the editor', () => {
    const editor = createTestEditor([
      {
        children: [
          {
            text: 'Welcome to the Plate Playground!',
          },
        ],
        type: 'h1',
        id: 'gYBjGfssdm',
      },
      {
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
        id: '5zZ8_hM53b',
      },
      {
        children: [
          {
            text: 'Collaborative Editing',
          },
        ],
        type: 'h2',
        id: 'GznILN9jX7',
      },
      {
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
                  createdAt: 1756601648507,
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
              createdAt: 1756601648507,
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
              createdAt: 1756601648507,
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
              createdAt: 1756601648507,
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
        id: 'YY-HyLNMl-',
      },
      {
        children: [
          {
            text: 'AI-Powered Editing',
          },
        ],
        type: 'h2',
        id: 'll9QY8QwZe',
      },
      {
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
        id: 'gw4Fd3XZU6',
      },
      {
        children: [
          {
            text: 'Generate content (continue writing, summarize, explain)',
          },
        ],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
        id: 'Hma3jpd732',
      },
      {
        children: [
          {
            text: 'Edit existing text (improve, fix grammar, change tone)',
          },
        ],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
        listStart: 2,
        id: 'Z0sWZJvJSK',
      },
      {
        children: [
          {
            text: 'Rich Content Editing',
          },
        ],
        type: 'h2',
        id: 'Iu6xPiuKMv',
      },
      {
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
        id: '-WVMecrPDQ',
      },
      {
        children: [
          {
            text: 'Blockquotes are great for highlighting important information.',
          },
        ],
        type: 'blockquote',
        id: 'rpGKu5RVVn',
      },
      {
        children: [
          {
            text: '',
          },
        ],
        type: 'p',
        id: 'cfO_TSh8pK',
      },
    ]);

    const comments = [
      {
        blockId: 'gYBjGfssdm',
        content: '# Welcome to the Plate Playground!',
        comment:
          'This is the introductory header for the Plate Playground, setting the stage for the content that follows.',
      },
      {
        blockId: '5zZ8_hM53b',
        content:
          'Experience a modern rich-text editor built with [Slate](https://slatejs.org) and [React](https://reactjs.org).',
        comment:
          'This sentence introduces the technologies used to build the rich-text editor, Slate and React.',
      },
      {
        blockId: 'GznILN9jX7',
        content:
          '## Collaborative Editing\n\nReview and refine content seamlessly. Use [<suggestion>suggestions</suggestion>](/docs/suggestion) <suggestion>like this added text</suggestion> or to <suggestion>mark text for removal</suggestion>. Discuss changes using [<comment>comments</comment>](/docs/comment) <comment>on many text segments</comment>. You can even have <comment><suggestion>overlapping</suggestion></comment> annotations!',
        comment:
          'This section describes the collaborative editing features, including suggestions and comments, highlighting the ability to annotate and discuss changes.',
      },
      {
        blockId: 'll9QY8QwZe',
        content:
          '## AI-Powered Editing\n\nBoost your productivity with integrated [AI SDK](/docs/ai). Press <kbd>⌘+J</kbd> or <kbd>Space</kbd> in an empty line to:\n\n* Generate content (continue writing, summarize, explain)\n* Edit existing text (improve, fix grammar, change tone)',
        comment:
          'This section highlights the AI-powered editing capabilities, including content generation and text editing features, accessible via keyboard shortcuts.',
      },
      {
        blockId: 'Iu6xPiuKMv',
        content:
          '## Rich Content Editing\n\nStructure your content with [headings](/docs/heading), [lists](/docs/list), and [quotes](/docs/blockquote). Apply [marks](/docs/basic-marks) like **bold**, _italic_, <u>underline</u>, ~~strikethrough~~, and `code`. Use [autoformatting](/docs/autoformat) for [Markdown](/docs/markdown)-like shortcuts (e.g., <kbd>*</kbd> for lists, <kbd>#</kbd> for H1).',
        comment:
          'This section explains the rich content editing features, including structuring content with headings and lists, applying text marks, and using autoformatting for Markdown-like shortcuts.',
      },
    ];

    const ranges: Range[] = [];
    comments.forEach((aiComment) =>
      aiReviewToRange(editor, aiComment, ({ comment, range }) => {
        ranges.push(range);
      })
    );

    expect(ranges).toMatchSnapshot();
  });
});
