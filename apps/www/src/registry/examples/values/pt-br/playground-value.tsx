import type { Value } from 'platejs';

export const playgroundValue: Value = [
  // Intro
  {
    children: [{ text: 'Bem-vindo ao Plate Playground!' }],
    type: 'h1',
  },
  {
    children: [
      { text: 'Experimente um editor de rich-text moderno construído com ' },
      { children: [{ text: 'Slate' }], type: 'a', url: 'https://slatejs.org' },
      { text: ' e ' },
      { children: [{ text: 'React' }], type: 'a', url: 'https://reactjs.org' },
      {
        text: ". Este playground mostra apenas uma parte das capacidades do Plate. ",
      },
      {
        children: [{ text: 'Explore a documentação' }],
        type: 'a',
        url: '/docs',
      },
      { text: ' para descobrir mais.' },
    ],
    type: 'p',
  },
  // Suggestions & Comments Section
  {
    children: [{ text: 'Edição Colaborativa' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'Revise e refine o conteúdo perfeitamente. Use ' },
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
            text: 'sugestões',
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
        text: 'como este texto adicionado',
      },
      { text: ' ou para ' },
      {
        suggestion: true,
        suggestion_playground2: {
          id: 'playground2',
          createdAt: Date.now(),
          type: 'remove',
          userId: 'bob',
        },
        text: 'marcar texto para remoção',
      },
      { text: '. Discuta alterações usando ' },
      {
        children: [
          { comment: true, comment_discussion1: true, text: 'comentários' },
        ],
        type: 'a',
        url: '/docs/comment',
      },
      {
        comment: true,
        comment_discussion1: true,
        text: ' em muitos segmentos de texto',
      },
      { text: '. Você pode até ter ' },
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
        text: 'anotações',
      },
      { text: ' sobrepostas!' },
    ],
    type: 'p',
  },
  // AI Section
  {
    children: [{ text: 'Edição com IA' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'Aumente sua produtividade com o ' },
      {
        children: [{ text: 'AI SDK' }],
        type: 'a',
        url: '/docs/ai',
      },
      { text: ' integrado. Pressione ' },
      { kbd: true, text: '⌘+J' },
      { text: ' ou ' },
      { kbd: true, text: 'Espaço' },
      { text: ' em uma linha vazia para:' },
    ],
    type: 'p',
  },
  {
    children: [
      { text: 'Gerar conteúdo (continuar escrevendo, resumir, explicar)' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: 'Editar texto existente (melhorar, corrigir gramática, mudar tom)' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  // Core Features Section (Combined)
  {
    children: [{ text: 'Edição de Conteúdo Rico' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'Estruture seu conteúdo com ' },
      {
        children: [{ text: 'títulos' }],
        type: 'a',
        url: '/docs/heading',
      },
      { text: ', ' },
      {
        children: [{ text: 'listas' }],
        type: 'a',
        url: '/docs/list',
      },
      { text: ', e ' },
      {
        children: [{ text: 'citações' }],
        type: 'a',
        url: '/docs/blockquote',
      },
      { text: '. Aplique ' },
      {
        children: [{ text: 'marcas' }],
        type: 'a',
        url: '/docs/basic-marks',
      },
      { text: ' como ' },
      { bold: true, text: 'negrito' },
      { text: ', ' },
      { italic: true, text: 'itálico' },
      { text: ', ' },
      { text: 'sublinhado', underline: true },
      { text: ', ' },
      { strikethrough: true, text: 'tachado' },
      { text: ', e ' },
      { code: true, text: 'código' },
      { text: '. Use ' },
      {
        children: [{ text: 'formatação automática' }],
        type: 'a',
        url: '/docs/autoformat',
      },
      { text: ' para atalhos tipo ' },
      {
        children: [{ text: 'Markdown' }],
        type: 'a',
        url: '/docs/markdown',
      },
      { text: ' (ex: ' },
      { kbd: true, text: '* ' },
      { text: ' para listas, ' },
      { kbd: true, text: '# ' },
      { text: ' para H1).' },
    ],
    type: 'p',
  },
  {
    children: [
      {
        text: 'Citações em bloco são ótimas para destacar informações importantes.',
      },
    ],
    type: 'blockquote',
  },
  {
    children: [
      { children: [{ text: 'function hello() {' }], type: 'code_line' },
      {
        children: [{ text: "  console.info('Blocos de código são suportados!');" }],
        type: 'code_line',
      },
      { children: [{ text: '}' }], type: 'code_line' },
    ],
    lang: 'javascript',
    type: 'code_block',
  },
  {
    children: [
      { text: 'Crie ' },
      {
        children: [{ text: 'links' }],
        type: 'a',
        url: '/docs/link',
      },
      { text: ', ' },
      {
        children: [{ text: '@menção' }],
        type: 'a',
        url: '/docs/mention',
      },
      { text: ' usuários como ' },
      { children: [{ text: '' }], type: 'mention', value: 'Alice' },
      { text: ', ou insira ' },
      {
        children: [{ text: 'emojis' }],
        type: 'a',
        url: '/docs/emoji',
      },
      { text: ' ✨. Use o ' },
      {
        children: [{ text: 'comando de barra' }],
        type: 'a',
        url: '/docs/slash-command',
      },
      { text: ' (/) para acesso rápido aos elementos.' },
    ],
    type: 'p',
  },
  // Table Section
  {
    children: [{ text: 'Como o Plate se Compara' }],
    type: 'h3',
  },
  {
    children: [
      {
        text: 'O Plate oferece muitos recursos prontos para uso como plugins gratuitos e de código aberto.',
      },
    ],
    type: 'p',
  },
  {
    children: [
      {
        children: [
          {
            children: [
              { children: [{ bold: true, text: 'Recurso' }], type: 'p' },
            ],
            type: 'th',
          },
          {
            children: [
              {
                children: [{ bold: true, text: 'Plate (Grátis & OSS)' }],
                type: 'p',
              },
            ],
            type: 'th',
          },
          {
            children: [
              { children: [{ bold: true, text: 'Tiptap' }], type: 'p' },
            ],
            type: 'th',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'IA' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Extensão Paga' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Comentários' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Extensão Paga' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Sugestões' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [
              { children: [{ text: 'Pago (Comments Pro)' }], type: 'p' },
            ],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Seletor de Emoji' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Extensão Paga' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [
              { children: [{ text: 'Índice (TOC)' }], type: 'p' },
            ],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Extensão Paga' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Alça de Arrastar' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Extensão Paga' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [
              { children: [{ text: 'Colaboração (Yjs)' }], type: 'p' },
            ],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [
              { children: [{ text: 'Hocuspocus (OSS/Pago)' }], type: 'p' },
            ],
            type: 'td',
          },
        ],
        type: 'tr',
      },
    ],

    colSizes: [160, 170, 200],
    type: 'table',
  },
  // Media Section
  {
    children: [{ text: 'Imagens e Mídia' }],
    type: 'h3',
  },
  {
    children: [
      {
        text: 'Incorpore mídia rica como imagens diretamente em seu conteúdo. Suporta ',
      },
      {
        children: [{ text: 'Uploads de mídia' }],
        type: 'a',
        url: '/docs/media',
      },
      {
        text: ' e ',
      },
      {
        children: [{ text: 'arrastar e soltar' }],
        type: 'a',
        url: '/docs/dnd',
      },
      {
        text: ' para uma experiência suave.',
      },
    ],
    type: 'p',
  },
  {
    attributes: { align: 'center' },
    caption: [
      {
        children: [{ text: 'Imagens com legendas fornecem contexto.' }],
        type: 'p',
      },
    ],
    children: [{ text: '' }],
    type: 'img',
    url: 'https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    width: '75%',
  },
  {
    children: [{ text: '' }],
    isUpload: true,
    name: 'exemplo.pdf',
    type: 'file',
    url: 'https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf',
  },
  {
    children: [{ text: '' }],
    type: 'audio',
    url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
  },
  {
    children: [{ text: 'Índice' }],
    type: 'h3',
  },
  {
    children: [{ text: '' }],
    type: 'toc',
  },
  {
    children: [{ text: '' }],
    type: 'p',
  },
];
