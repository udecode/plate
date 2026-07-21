import { NODES } from '@platejs/utils';

import { htmlDeserializerCodeBlock } from './htmlDeserializerCodeBlock';

describe('htmlDeserializerCodeBlock', () => {
  it('defines both pre and Consolas paragraph rules', () => {
    expect(htmlDeserializerCodeBlock.rules).toEqual([
      { validNodeName: 'PRE' },
      {
        validNodeName: 'P',
        validStyle: {
          fontFamily: 'Consolas',
        },
      },
    ]);
  });

  it('removes language selector text and preserves blank code lines', () => {
    const element = new DOMParser().parseFromString(
      '<pre><select>TypeScript</select>const a = 1;\n\nconst b = 2;</pre>',
      'text/html'
    ).body.firstElementChild as HTMLElement;

    expect(
      htmlDeserializerCodeBlock.parse?.({
        element,
      } as any)
    ).toEqual({
      children: [
        {
          children: [{ text: 'const a = 1;' }],
          type: NODES.codeLine,
        },
        {
          children: [{ text: '' }],
          type: NODES.codeLine,
        },
        {
          children: [{ text: 'const b = 2;' }],
          type: NODES.codeLine,
        },
      ],
      type: NODES.codeBlock,
    });
  });
});
