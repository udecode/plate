import type { EditorDocumentValue } from 'platejs';

export const playgroundValue: EditorDocumentValue = {
  children: [
    // Intro
    {
      children: [{ text: '欢迎来到 Plate 演示平台！' }],
      type: 'h1',
    },
    {
      children: [
        { text: '体验使用 ' },
        {
          children: [{ text: 'React' }],
          type: 'link',
          url: 'https://reactjs.org',
        },
        {
          text: ' 构建的现代富文本编辑器。这个演示平台仅展示了 Plate 功能的一部分。',
        },
        {
          children: [{ text: '浏览文档' }],
          type: 'link',
          url: '/docs',
        },
        { text: ' 以了解更多。' },
      ],
      type: 'paragraph',
    },
    // Suggestions & Comments Section
    {
      children: [{ text: '协作编辑' }],
      type: 'h2',
    },
    {
      children: [
        { text: '无缝审阅和优化内容。使用 ' },
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
              text: '建议',
            },
          ],
          type: 'link',
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
          text: '像这样添加文本',
        },
        { text: ' 或者 ' },
        {
          suggestion: true,
          suggestion_playground2: {
            id: 'playground2',
            createdAt: Date.now(),
            type: 'remove',
            userId: 'bob',
          },
          text: '标记要删除的文本',
        },
        { text: '。使用 ' },
        {
          children: [
            { comment: true, comment_discussion1: true, text: '评论' },
          ],
          type: 'link',
          url: '/docs/comment',
        },
        {
          comment: true,
          comment_discussion1: true,
          text: ' 讨论多个文本段落的变更',
        },
        { text: '。你甚至可以有 ' },
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
          text: '重叠的',
        },
        { text: ' 评论！' },
      ],
      type: 'paragraph',
    },
    // {
    //   children: [
    //     {
    //       text: 'Block-level suggestions are also supported for broader feedback.',
    //     },
    //   ],
    //   suggestion: {
    //     suggestionId: 'suggestionBlock1',
    //     type: 'block',
    //     userId: 'charlie',
    //   },
    //   type: 'paragraph',
    // },
    // AI Section
    {
      children: [{ text: 'AI 辅助编辑' }],
      type: 'h2',
    },
    {
      children: [
        { text: '通过集成的 ' },
        {
          children: [{ text: 'AI SDK' }],
          type: 'link',
          url: '/docs/ai',
        },
        { text: ' 提高您的生产力。按下 ' },
        { kbd: true, text: '⌘+J' },
        { text: ' 或在空行中按 ' },
        { kbd: true, text: '空格键' },
        { text: ' 可以：' },
      ],
      type: 'paragraph',
    },
    {
      children: [{ text: '生成内容（继续写作、总结、解释）' }],
      indent: 1,
      listStyleType: 'disc',
      type: 'paragraph',
    },
    {
      children: [{ text: '编辑现有文本（改进、修正语法、改变语气）' }],
      indent: 1,
      listStyleType: 'disc',
      type: 'paragraph',
    },
    // Core Features Section (Combined)
    {
      children: [{ text: '丰富的内容编辑' }],
      type: 'h2',
    },
    {
      children: [
        { text: '使用 ' },
        {
          children: [{ text: '标题' }],
          type: 'link',
          url: '/docs/heading',
        },
        { text: '、' },
        {
          children: [{ text: '列表' }],
          type: 'link',
          url: '/docs/list',
        },
        { text: ' 和 ' },
        {
          children: [{ text: '引用' }],
          type: 'link',
          url: '/docs/blockquote',
        },
        { text: ' 来组织您的内容。应用 ' },
        {
          children: [{ text: '标记' }],
          type: 'link',
          url: '/docs/basic-marks',
        },
        { text: ' 如 ' },
        { bold: true, text: '粗体' },
        { text: '、' },
        { italic: true, text: '斜体' },
        { text: '、' },
        { text: '下划线', underline: true },
        { text: '、' },
        { strikethrough: true, text: '删除线' },
        { text: ' 和 ' },
        { code: true, text: '代码' },
        { text: '。使用 ' },
        {
          children: [{ text: '自动格式化' }],
          type: 'link',
          url: '/docs/autoformat',
        },
        { text: ' 实现类似 ' },
        {
          children: [{ text: 'Markdown' }],
          type: 'link',
          url: '/docs/markdown',
        },
        { text: ' 的快捷方式（例如，' },
        { kbd: true, text: '* ' },
        { text: ' 创建列表，' },
        { kbd: true, text: '# ' },
        { text: ' 创建一级标题）。' },
      ],
      type: 'paragraph',
    },
    {
      children: [
        {
          children: [
            {
              text: '引用块可以在同一个容器中组合段落、引用列表和回复链。',
            },
          ],
          type: 'paragraph',
        },
        {
          children: [
            {
              text: 'Markdown 引用会保留这种嵌套结构，而不是把内容压平成纯文本。',
            },
          ],
          type: 'paragraph',
        },
        {
          children: [
            {
              text: '同一个引用容器中的引用列表项。',
            },
          ],
          indent: 1,
          listStyleType: 'disc',
          type: 'paragraph',
        },
        {
          children: [
            {
              children: [{ text: '这里同样支持嵌套引用块。' }],
              type: 'paragraph',
            },
          ],
          type: 'blockquote',
        },
      ],
      type: 'blockquote',
    },
    {
      children: [
        { children: [{ text: 'function hello() {' }], type: 'codeLine' },
        {
          children: [{ text: "  console.info('支持代码块！');" }],
          type: 'codeLine',
        },
        { children: [{ text: '}' }], type: 'codeLine' },
      ],
      lang: 'javascript',
      type: 'codeBlock',
    },
    {
      children: [
        { text: '创建 ' },
        {
          children: [{ text: '链接' }],
          type: 'link',
          url: '/docs/link',
        },
        { text: '、' },
        {
          children: [{ text: '@提及' }],
          type: 'link',
          url: '/docs/mention',
        },
        { text: ' 用户，如 ' },
        { children: [{ text: '' }], type: 'mention', value: 'Alice' },
        { text: '，或插入 ' },
        {
          children: [{ text: '表情符号' }],
          type: 'link',
          url: '/docs/emoji',
        },
        { text: ' ✨。使用 ' },
        {
          children: [{ text: '斜杠命令' }],
          type: 'link',
          url: '/docs/slash-command',
        },
        { text: ' (/) 快速访问元素。' },
      ],
      type: 'paragraph',
    },
    // Table Section
    {
      children: [{ text: 'Plate 的比较优势' }],
      type: 'h3',
    },
    {
      children: [
        {
          text: 'Plate 提供许多开箱即用的免费、开源插件。',
        },
      ],
      type: 'paragraph',
    },
    {
      children: [
        {
          children: [
            {
              children: [
                { children: [{ bold: true, text: '功能' }], type: 'paragraph' },
              ],
              header: true,
              type: 'tableCell',
            },
            {
              children: [
                {
                  children: [{ bold: true, text: 'Plate（免费和开源）' }],
                  type: 'paragraph',
                },
              ],
              header: true,
              type: 'tableCell',
            },
            {
              children: [
                {
                  children: [{ bold: true, text: 'Tiptap' }],
                  type: 'paragraph',
                },
              ],
              header: true,
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
        {
          children: [
            {
              children: [{ children: [{ text: 'AI' }], type: 'paragraph' }],
              type: 'tableCell',
            },
            {
              children: [
                {
                  textAlign: 'center',
                  children: [{ text: '✅' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
            {
              children: [
                { children: [{ text: '付费扩展' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
        {
          children: [
            {
              children: [{ children: [{ text: '评论' }], type: 'paragraph' }],
              type: 'tableCell',
            },
            {
              children: [
                {
                  textAlign: 'center',
                  children: [{ text: '✅' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
            {
              children: [
                { children: [{ text: '付费扩展' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
        {
          children: [
            {
              children: [{ children: [{ text: '建议' }], type: 'paragraph' }],
              type: 'tableCell',
            },
            {
              children: [
                {
                  textAlign: 'center',
                  children: [{ text: '✅' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
            {
              children: [
                {
                  children: [{ text: '付费（评论专业版）' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
        {
          children: [
            {
              children: [
                { children: [{ text: '表情选择器' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
            {
              children: [
                {
                  textAlign: 'center',
                  children: [{ text: '✅' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
            {
              children: [
                { children: [{ text: '付费扩展' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
        {
          children: [
            {
              children: [{ children: [{ text: '目录' }], type: 'paragraph' }],
              type: 'tableCell',
            },
            {
              children: [
                {
                  textAlign: 'center',
                  children: [{ text: '✅' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
            {
              children: [
                { children: [{ text: '付费扩展' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
        {
          children: [
            {
              children: [
                { children: [{ text: '拖拽手柄' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
            {
              children: [
                {
                  textAlign: 'center',
                  children: [{ text: '✅' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
            {
              children: [
                { children: [{ text: '付费扩展' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
        {
          children: [
            {
              children: [
                { children: [{ text: '协作（Yjs）' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
            {
              children: [
                {
                  textAlign: 'center',
                  children: [{ text: '✅' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
            {
              children: [
                {
                  children: [{ text: 'Hocuspocus（开源/付费）' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
      ],
      type: 'table',
    },
    // Media Section
    {
      children: [{ text: '图片和媒体' }],
      type: 'h3',
    },
    {
      children: [
        {
          text: '在内容中直接嵌入丰富的媒体，如图片。支持',
        },
        {
          children: [{ text: '媒体上传' }],
          type: 'link',
          url: '/docs/media',
        },
        {
          text: '和',
        },
        {
          children: [{ text: '拖放' }],
          type: 'link',
          url: '/docs/dnd',
        },
        {
          text: '，提供流畅的体验。',
        },
      ],
      type: 'paragraph',
    },
    {
      textAlign: 'center',
      children: [{ text: '带有说明的图片提供上下文。' }],
      type: 'image',
      url: 'https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      width: '75%',
    },
    {
      children: [{ text: '' }],
      isUpload: true,
      name: 'sample.pdf',
      type: 'file',
      url: 'https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf',
    },
    {
      children: [{ text: '' }],
      type: 'audio',
      url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
    },
    {
      children: [{ text: '目录' }],
      type: 'h3',
    },
    {
      children: [{ text: '' }],
      type: 'toc',
    },
    {
      children: [{ text: '' }],
      type: 'paragraph',
    },
  ],
};
