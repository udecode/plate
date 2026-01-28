import { SuperConverter } from '@converter/SuperConverter.js';
import { handleBookmarkNode } from '@converter/v2/importer/bookmarkNodeImporter.js';
import { createNodeListHandlerMock } from './testUtils.test.js';

describe('BookmarkNodeImporter', () => {
  it('parses only bookmark nodes', () => {
    const names = Object.keys(SuperConverter.allowedElements).filter((name) => name !== 'w:bookmarkStart');
    const nodesOfNodes = names.map((name) => [{ name }]);
    for (const nodes of nodesOfNodes) {
      const result = handleBookmarkNode({ nodes });
      expect(result.nodes.length).toBe(0);
      expect(result.consumed).toBe(0);
    }
  });
  it('parses bookmark nodes and w:name attributes', () => {
    const nodes = [{ name: 'w:bookmarkStart', attributes: { 'w:name': 'bookmarkName' } }];
    const result = handleBookmarkNode({ nodes, nodeListHandler: createNodeListHandlerMock() });
    expect(result.nodes.length).toBe(1);
    expect(result.consumed).toBe(1);
    expect(result.nodes[0].type).toBe('standardNodeHandler');
    expect(result.nodes[0].attrs.name).toBe('bookmarkName');
  });
  it('parser relies on handleStandardNode', () => {
    const consoleMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const nodes = [{ name: 'w:bookmarkStart', attributes: { 'w:name': 'bookmarkName' } }];
    const result = handleBookmarkNode({ nodes, nodeListHandler: { handlerEntities: [] } });
    expect(result.nodes.length).toBe(0);
    expect(result.consumed).toBe(0);
    expect(consoleMock).toHaveBeenCalledOnce();
  });
});
