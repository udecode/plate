import { CodePlugin } from 'elements/code';
import { ListPlugin } from 'elements/list';
import { ParagraphPlugin } from 'elements/paragraph';
import { BoldPlugin } from 'marks/bold';
import { htmlDeserialize } from './htmlDeserialize';

describe('when htmlDeserialize', () => {
  it('should deserialize html node using plugins', () => {
    const body = document.createElement('body');
    const h1 = document.createElement('h1');
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    const ul = document.createElement('ul');
    const li = document.createElement('li');
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const text = document.createTextNode('test');
    body.appendChild(pre);
    pre.appendChild(code);
    body.appendChild(h1);
    body.appendChild(ul);
    ul.appendChild(li);
    li.appendChild(p);
    p.append(strong);
    strong.append(text);

    expect(
      htmlDeserialize([
        ListPlugin(),
        CodePlugin(),
        ParagraphPlugin(),
        BoldPlugin(),
      ])(body)
    ).toEqual([
      {
        children: [],
        type: 'code',
      },
      {
        type: 'ul',
        children: [
          {
            type: 'li',
            children: [
              {
                children: [
                  {
                    bold: true,
                    text: 'test',
                  },
                ],
                type: 'p',
              },
            ],
          },
        ],
      },
    ]);
  });

  describe('when giving a node without plugins', () => {
    it('should ', () => {
      const body = document.createElement('body');
      const h1 = document.createElement('h1');
      const text = document.createTextNode('test');
      body.appendChild(h1);
      h1.appendChild(text);

      expect(htmlDeserialize([])(body)).toEqual([{ text: 'test' }]);
    });
  });
});
