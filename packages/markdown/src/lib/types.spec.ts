import type { MdNodeParser, MdRules } from './types';

describe('MdRules typing', () => {
  it('keeps typed media rule keys', () => {
    for (const rule of [
      {} satisfies MdNodeParser<'audio'>,
      {} satisfies MdNodeParser<'break'>,
      {} satisfies MdNodeParser<'codeDrawing'>,
      {} satisfies MdNodeParser<'file'>,
      {} satisfies MdNodeParser<'mediaEmbed'>,
      {} satisfies MdNodeParser<'video'>,
    ]) {
      expect(rule).toEqual({});
    }
  });

  it('infers known rules and accepts custom rule keys', () => {
    const rules = {
      customWidget: {
        deserialize(node) {
          return { text: node.type };
        },
        serialize(node) {
          return {
            type: 'text',
            value:
              'text' in node && typeof node.text === 'string' ? node.text : '',
          };
        },
      },
      paragraph: {
        deserialize(node) {
          return {
            children: node.children.map((child) => ({
              text: child.type,
            })),
            type: 'paragraph',
          };
        },
        serialize(node) {
          return {
            children: node.children.map(() => ({
              type: 'text',
              value: '',
            })),
            type: 'paragraph',
          };
        },
      },
    } satisfies MdRules;

    expect(rules.paragraph.deserialize).toBeFunction();
    expect(rules.customWidget.deserialize).toBeFunction();
  });
});
