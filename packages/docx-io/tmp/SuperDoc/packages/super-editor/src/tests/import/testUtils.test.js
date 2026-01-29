/**
 *
 * @returns {NodeListHandler}
 */
export const createNodeListHandlerMock = () => {
  return {
    handlerEntities: [
      {
        handlerName: 'standardNodeHandler',
        handler: () => ({
          nodes: [
            {
              type: 'standardNodeHandler',
              content: {},
              attrs: {},
              marks: [],
            },
          ],
          consumed: 1,
        }),
      },
      {
        handlerName: 'textNodeHandler',
        handler: () => ({
          nodes: [
            {
              type: 'textNodeHandler',
              content: {},
              attrs: {},
              marks: [],
            },
          ],
          consumed: 1,
        }),
      },
    ],
    handler: () => [{ type: 'dummyNode', content: {}, attrs: {} }],
  };
};

test.skip('', () => {});
