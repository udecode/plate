import { KEYS, NODES } from './plate-keys';

describe('Plate keys', () => {
  it('separates camelCase plugin identities from serialized node types', () => {
    expect(KEYS).toMatchObject({
      codeBlock: 'codeBlock',
      codeDrawing: 'codeDrawing',
      codeLine: 'codeLine',
      codeSyntax: 'codeSyntax',
      columnGroup: 'columnGroup',
      emojiInput: 'emojiInput',
      inlineEquation: 'inlineEquation',
      listTodoClassic: 'listTodoClassic',
      mediaEmbed: 'mediaEmbed',
      mentionInput: 'mentionInput',
      searchHighlight: 'searchHighlight',
      slashCommand: 'slashCommand',
      slashInput: 'slashInput',
    });

    expect(NODES).toMatchObject({
      codeBlock: 'code_block',
      codeDrawing: 'code_drawing',
      codeLine: 'code_line',
      codeSyntax: 'code_syntax',
      columnGroup: 'column_group',
      emojiInput: 'emoji_input',
      inlineEquation: 'inline_equation',
      listTodoClassic: 'action_item',
      mediaEmbed: 'media_embed',
      mentionInput: 'mention_input',
      searchHighlight: 'search_highlight',
      slashInput: 'slash_input',
    });
  });
});
