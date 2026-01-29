import { SuperConverter } from '@converter/SuperConverter.js';
import { handleLineBreakNode } from '@converter/v2/importer/lineBreakImporter.js';
import { createNodeListHandlerMock } from './testUtils.test.js';

describe('LineBreakNodeImporter', () => {
  it('parses only line break nodes', () => {
    const names = Object.keys(SuperConverter.allowedElements).filter((name) => name !== 'w:br');
    const nodesOfNodes = names.map((name) => [{ name }]);
    for (const nodes of nodesOfNodes) {
      const result = handleLineBreakNode({ nodes });
      expect(result.nodes.length).toBe(0);
      expect(result.consumed).toBe(0);
    }
  });

  it('parses line break nodes and w:br attributes', () => {
    const nodes = [{ name: 'w:br' }];
    const result = handleLineBreakNode({ nodes, nodeListHandler: createNodeListHandlerMock() });
    expect(result.nodes.length).toBe(1);
    expect(result.consumed).toBe(1);
    expect(result.nodes[0].type).toBe('lineBreak');
  });
});
