import type { MdRules } from './types';

describe('MdRules typing', () => {
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
      p: {
        deserialize(node) {
          return {
            children: node.children.map((child) => ({
              text: child.type,
            })),
            type: 'p',
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

    expect(rules.p.deserialize).toBeFunction();
    expect(rules.customWidget.deserialize).toBeFunction();
  });
});
