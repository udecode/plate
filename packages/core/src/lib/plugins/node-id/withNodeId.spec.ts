await import('./NodeIdPlugin');

const { withNodeId } = await import('./withNodeId');

const createNodeIdOverride = (
  overrides: Record<string, any> = {},
  someImpl: (args: { match: Record<string, any> }) => boolean = () => false
) => {
  const apply = mock();
  const insertNode = mock();
  const insertNodes = mock();
  const editor = {
    api: {
      some: mock(someImpl),
    },
  };
  const options = {
    disableInsertOverrides: false,
    filter: () => true,
    filterText: true,
    idCreator: () => 'generated-id',
    idKey: 'id',
    reuseId: false,
    ...overrides,
  };

  const transforms = withNodeId({
    editor: editor as any,
    getOptions: () => options,
    tf: {
      apply,
      insertNode,
      insertNodes,
    },
  } as any).transforms;

  return {
    apply,
    editor,
    insertNode,
    insertNodes,
    options,
    transforms,
  };
};

describe('withNodeId', () => {
  it('replaces duplicate inserted ids and restores a unique _id override', () => {
    const { apply, transforms } = createNodeIdOverride(
      {},
      ({ match }) => match.id === 'taken-id'
    );

    transforms.apply({
      node: {
        _id: 'preferred-id',
        children: [{ text: 'hello' }],
        id: 'taken-id',
        type: 'p',
      },
      path: [0],
      type: 'insert_node',
    } as any);

    expect(apply).toHaveBeenCalledWith({
      node: {
        _id: undefined,
        children: [{ text: 'hello' }],
        id: 'preferred-id',
        type: 'p',
      },
      path: [0],
      type: 'insert_node',
    });
  });

  it('creates a new id on split when reuse is disabled or the id is duplicated', () => {
    const { apply, transforms } = createNodeIdOverride(
      { reuseId: true },
      ({ match }) => match.id === 'existing-id'
    );

    transforms.apply({
      path: [0],
      properties: {
        id: 'existing-id',
        type: 'p',
      },
      type: 'split_node',
    } as any);

    expect(apply).toHaveBeenCalledWith({
      path: [0],
      properties: {
        id: 'generated-id',
        type: 'p',
      },
      type: 'split_node',
    });
  });

  it('keeps a unique split id when reuseId is enabled', () => {
    const { apply, transforms } = createNodeIdOverride({ reuseId: true });

    transforms.apply({
      path: [0],
      properties: {
        id: 'keep-id',
        type: 'p',
      },
      type: 'split_node',
    } as any);

    expect(apply).toHaveBeenCalledWith({
      path: [0],
      properties: {
        id: 'keep-id',
        type: 'p',
      },
      type: 'split_node',
    });
  });

  it('removes ids from disallowed split nodes before delegating', () => {
    const { apply, transforms } = createNodeIdOverride();
    const operation = {
      path: [0, 0],
      properties: {
        id: 'remove-me',
        text: 'leaf',
      },
      type: 'split_node',
    } as any;

    transforms.apply(operation);

    expect(operation.properties.id).toBeUndefined();
    expect(apply).toHaveBeenCalledWith(operation);
  });

  it('clones frozen insertNode inputs and preserves the original id in _id', () => {
    const { insertNode, transforms } = createNodeIdOverride();
    const node = Object.freeze({
      children: [{ text: 'hello' }],
      id: 'keep-id',
      type: 'p',
    } as any);

    transforms.insertNode(node);

    expect(insertNode).toHaveBeenCalledWith({
      _id: 'keep-id',
      children: [{ text: 'hello' }],
      id: 'keep-id',
      type: 'p',
    });
    expect((node as any)._id).toBeUndefined();
  });

  it('skips insert overrides when configured', () => {
    const { insertNode, transforms } = createNodeIdOverride({
      disableInsertOverrides: true,
    });
    const node = {
      children: [{ text: 'hello' }],
      id: 'keep-id',
      type: 'p',
    } as any;

    transforms.insertNode(node);

    expect(insertNode).toHaveBeenCalledWith(node);
    expect(node._id).toBeUndefined();
  });

  it('filters falsy insertNodes inputs and clones frozen nodes with ids', () => {
    const { insertNodes, transforms } = createNodeIdOverride();
    const frozen = Object.freeze({
      children: [{ text: 'hello' }],
      id: 'keep-id',
      type: 'p',
    } as any);
    const plain = {
      children: [{ text: 'world' }],
      type: 'p',
    } as any;

    transforms.insertNodes([null as any, frozen, undefined as any, plain], {
      at: [0],
    } as any);

    expect(insertNodes).toHaveBeenCalledWith(
      [
        {
          _id: 'keep-id',
          children: [{ text: 'hello' }],
          id: 'keep-id',
          type: 'p',
        },
        plain,
      ],
      { at: [0] }
    );
  });

  it('returns early when insertNodes receives no actual nodes', () => {
    const { insertNodes, transforms } = createNodeIdOverride();

    transforms.insertNodes([null as any, undefined as any], { at: [0] } as any);

    expect(insertNodes).not.toHaveBeenCalled();
  });
});
