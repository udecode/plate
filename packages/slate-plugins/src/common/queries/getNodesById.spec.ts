import { createEditor, Element } from 'slate';
import { getNodesById } from './getNodesById';

const nodesFixture1: Element[] = [
  {
    id: '1',
    type: 'p',
    children: [
      {
        text: 'A',
      },
      {
        text: 'B',
        bold: true,
      },
      {
        text: 'C',
      },
    ],
  },
  {
    id: '2',
    type: 'ul',
    children: [
      {
        id: '3',
        type: 'li',
        children: [
          {
            id: '4',
            children: [
              {
                text: 'a',
              },
            ],
            type: 'p',
          },
        ],
      },
      {
        id: '5',
        type: 'li',
        children: [
          {
            id: '6',
            type: 'p',
            children: [
              {
                text: 'b',
              },
            ],
          },
          {
            id: '7',
            type: 'ul',
            children: [
              {
                id: '8',
                type: 'li',
                children: [
                  {
                    id: '9',
                    type: 'p',
                    children: [
                      {
                        text: 'c',
                      },
                    ],
                  },
                  {
                    id: '10',
                    type: 'ul',
                    children: [
                      {
                        id: '11',
                        type: 'li',
                        children: [
                          {
                            id: '12',
                            type: 'p',
                            children: [
                              {
                                text: 'd',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        id: '13',
                        type: 'li',
                        children: [
                          {
                            id: '14',
                            type: 'p',
                            children: [
                              {
                                text: 'e',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe('when getNodeById', () => {
  it('should be ', () => {
    const editor = createEditor();
    editor.children = nodesFixture1;
    expect(getNodesById(editor, '2')?.[0]).toEqual([nodesFixture1[1], [1]]);
  });
});
