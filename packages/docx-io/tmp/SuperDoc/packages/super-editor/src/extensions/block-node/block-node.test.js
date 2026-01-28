import { describe, it, expect } from 'vitest';
import { ReplaceStep } from 'prosemirror-transform';
import { nodeAllowsSdBlockIdAttr, nodeNeedsSdBlockId, checkForNewBlockNodesInTrs } from './block-node.js';
import { initTestEditor, loadTestDataForEditorTests } from '../../tests/helpers/helpers.js';

// Mock
class OtherStep {}

describe('block-node: nodeAllowsSdBlockIdAttr', () => {
  it('should return true for block nodes with sdBlockId attribute', () => {
    const mockNode = {
      isBlock: true,
      type: {
        spec: {
          attrs: {
            sdBlockId: {
              default: null,
              keepOnSplit: false,
            },
            otherAttr: { default: 'value' },
          },
        },
      },
    };

    expect(nodeAllowsSdBlockIdAttr(mockNode)).toBe(true);
  });

  it('should return false for inline nodes with sdBlockId attribute', () => {
    const mockNode = {
      isBlock: false,
      type: {
        spec: {
          attrs: {
            sdBlockId: {
              default: null,
              keepOnSplit: false,
            },
          },
        },
      },
    };

    expect(nodeAllowsSdBlockIdAttr(mockNode)).toBe(false);
  });

  it('should return false for block nodes without sdBlockId attribute', () => {
    const mockNode = {
      isBlock: true,
      type: {
        spec: {
          attrs: {
            otherAttr: { default: 'value' },
            anotherAttr: { default: 'another' },
          },
        },
      },
    };

    expect(nodeAllowsSdBlockIdAttr(mockNode)).toBe(false);
  });

  it('should return false for block nodes with no attrs spec', () => {
    const mockNode = {
      isBlock: true,
      type: {
        spec: {},
      },
    };

    expect(nodeAllowsSdBlockIdAttr(mockNode)).toBe(false);
  });

  it('should return false for block nodes with null attrs', () => {
    const mockNode = {
      isBlock: true,
      type: {
        spec: {
          attrs: null,
        },
      },
    };

    expect(nodeAllowsSdBlockIdAttr(mockNode)).toBe(false);
  });

  it('should return false for nodes without type.spec', () => {
    const mockNode = {
      isBlock: true,
      type: {},
    };

    expect(nodeAllowsSdBlockIdAttr(mockNode)).toBe(false);
  });

  it('should handle undefined/null nodes gracefully', () => {
    expect(nodeAllowsSdBlockIdAttr(null)).toBe(false);
    expect(nodeAllowsSdBlockIdAttr(undefined)).toBe(false);
    expect(nodeAllowsSdBlockIdAttr({})).toBe(false);
  });
});

describe('block-node: nodeNeedsSdBlockId', () => {
  it('should return true when node has no sdBlockId attribute', () => {
    const mockNode = {
      attrs: {
        otherAttr: 'value',
        anotherAttr: 'another',
      },
    };

    expect(nodeNeedsSdBlockId(mockNode)).toBe(true);
  });

  it('should return true when sdBlockId is null', () => {
    const mockNode = {
      attrs: {
        sdBlockId: null,
        otherAttr: 'value',
      },
    };

    expect(nodeNeedsSdBlockId(mockNode)).toBe(true);
  });

  it('should return true when sdBlockId is undefined', () => {
    const mockNode = {
      attrs: {
        sdBlockId: undefined,
        otherAttr: 'value',
      },
    };

    expect(nodeNeedsSdBlockId(mockNode)).toBe(true);
  });

  it('should return true when sdBlockId is empty string', () => {
    const mockNode = {
      attrs: {
        sdBlockId: '',
        otherAttr: 'value',
      },
    };

    expect(nodeNeedsSdBlockId(mockNode)).toBe(true);
  });

  it('should return true when sdBlockId is 0', () => {
    const mockNode = {
      attrs: {
        sdBlockId: 0,
        otherAttr: 'value',
      },
    };

    expect(nodeNeedsSdBlockId(mockNode)).toBe(true);
  });

  it('should return true when sdBlockId is false', () => {
    const mockNode = {
      attrs: {
        sdBlockId: false,
        otherAttr: 'value',
      },
    };

    expect(nodeNeedsSdBlockId(mockNode)).toBe(true);
  });

  it('should return false when sdBlockId has a valid string value', () => {
    const mockNode = {
      attrs: {
        sdBlockId: 'block-id-123',
        otherAttr: 'value',
      },
    };

    expect(nodeNeedsSdBlockId(mockNode)).toBe(false);
  });

  it('should return false when sdBlockId has a valid numeric value', () => {
    const mockNode = {
      attrs: {
        sdBlockId: 42,
        otherAttr: 'value',
      },
    };

    expect(nodeNeedsSdBlockId(mockNode)).toBe(false);
  });

  it('should return false when sdBlockId is true', () => {
    const mockNode = {
      attrs: {
        sdBlockId: true,
        otherAttr: 'value',
      },
    };

    expect(nodeNeedsSdBlockId(mockNode)).toBe(false);
  });

  it('should return false when sdBlockId is an object', () => {
    const mockNode = {
      attrs: {
        sdBlockId: { id: 'block-123' },
        otherAttr: 'value',
      },
    };

    expect(nodeNeedsSdBlockId(mockNode)).toBe(false);
  });

  it('should return false when sdBlockId is an array', () => {
    const mockNode = {
      attrs: {
        sdBlockId: ['block-id'],
        otherAttr: 'value',
      },
    };

    expect(nodeNeedsSdBlockId(mockNode)).toBe(false);
  });

  it('should return true when node has no attrs property', () => {
    const mockNode = {};

    expect(nodeNeedsSdBlockId(mockNode)).toBe(true);
  });

  it('should return true when node attrs is null', () => {
    const mockNode = {
      attrs: null,
    };

    expect(nodeNeedsSdBlockId(mockNode)).toBe(true);
  });

  it('should return true when node attrs is undefined', () => {
    const mockNode = {
      attrs: undefined,
    };

    expect(nodeNeedsSdBlockId(mockNode)).toBe(true);
  });

  it('should handle null/undefined nodes gracefully', () => {
    expect(nodeNeedsSdBlockId(null)).toBe(true);
    expect(nodeNeedsSdBlockId(undefined)).toBe(true);
  });

  it('should return true when attrs is empty object', () => {
    const mockNode = {
      attrs: {},
    };

    expect(nodeNeedsSdBlockId(mockNode)).toBe(true);
  });
});

describe('checkForNewBlockNodesInTrs', () => {
  // Helper function to create mock nodes
  const createMockNode = (isBlock, hasAttribute) => ({
    isBlock,
    type: {
      spec: {
        attrs: hasAttribute ? { sdBlockId: { default: null } } : {},
      },
    },
  });

  // Helper function to create mock transactions
  const createMockTransaction = (steps) => ({ steps });

  it('should return true when ReplaceStep contains block nodes with sdBlockId attribute', () => {
    const blockNode = createMockNode(true, true);
    const replaceStep = new ReplaceStep(0, 1, {
      content: {
        content: [blockNode],
      },
    });

    const transaction = createMockTransaction([replaceStep]);
    const transactions = [transaction];

    expect(checkForNewBlockNodesInTrs(transactions)).toBe(true);
  });

  it('should return false when ReplaceStep contains only inline nodes', () => {
    const inlineNode = createMockNode(false, true);
    const replaceStep = new ReplaceStep(0, 1, {
      content: {
        content: [inlineNode],
      },
    });

    const transaction = createMockTransaction([replaceStep]);
    const transactions = [transaction];

    expect(checkForNewBlockNodesInTrs(transactions)).toBe(false);
  });

  it('should return false when ReplaceStep contains block nodes without sdBlockId attribute', () => {
    const blockNodeWithoutAttr = createMockNode(true, false);
    const replaceStep = new ReplaceStep(0, 1, {
      content: {
        content: [blockNodeWithoutAttr],
      },
    });

    const transaction = createMockTransaction([replaceStep]);
    const transactions = [transaction];

    expect(checkForNewBlockNodesInTrs(transactions)).toBe(false);
  });

  it('should return false when step is not a ReplaceStep', () => {
    const blockNode = createMockNode(true, true);
    const otherStep = new OtherStep();
    otherStep.slice = {
      content: {
        content: [blockNode],
      },
    };

    const transaction = createMockTransaction([otherStep]);
    const transactions = [transaction];

    expect(checkForNewBlockNodesInTrs(transactions)).toBe(false);
  });

  it('should return false when ReplaceStep has no slice', () => {
    const replaceStep = new ReplaceStep(0, 1, null);

    const transaction = createMockTransaction([replaceStep]);
    const transactions = [transaction];

    expect(checkForNewBlockNodesInTrs(transactions)).toBe(false);
  });

  it('should return false when slice has no content', () => {
    const replaceStep = new ReplaceStep(0, 1, {});

    const transaction = createMockTransaction([replaceStep]);
    const transactions = [transaction];

    expect(checkForNewBlockNodesInTrs(transactions)).toBe(false);
  });

  it('should return false when content has no content array', () => {
    const replaceStep = new ReplaceStep(0, 1, {
      content: {},
    });

    const transaction = createMockTransaction([replaceStep]);
    const transactions = [transaction];

    expect(checkForNewBlockNodesInTrs(transactions)).toBe(false);
  });

  it('should return false when content array is empty', () => {
    const replaceStep = new ReplaceStep(0, 1, {
      content: {
        content: [],
      },
    });

    const transaction = createMockTransaction([replaceStep]);
    const transactions = [transaction];

    expect(checkForNewBlockNodesInTrs(transactions)).toBe(false);
  });

  it('should return true when multiple transactions contain valid block nodes', () => {
    const blockNode = createMockNode(true, true);
    const replaceStep = new ReplaceStep(0, 1, {
      content: {
        content: [blockNode],
      },
    });

    const transaction1 = createMockTransaction([new OtherStep()]);
    const transaction2 = createMockTransaction([replaceStep]);
    const transactions = [transaction1, transaction2];

    expect(checkForNewBlockNodesInTrs(transactions)).toBe(true);
  });

  it('should return true when transaction has multiple steps with valid block nodes', () => {
    const blockNode = createMockNode(true, true);
    const replaceStep = new ReplaceStep(0, 1, {
      content: {
        content: [blockNode],
      },
    });

    const transaction = createMockTransaction([new OtherStep(), replaceStep]);
    const transactions = [transaction];

    expect(checkForNewBlockNodesInTrs(transactions)).toBe(true);
  });

  it('should return true when ReplaceStep contains mixed nodes but at least one valid block', () => {
    const inlineNode = createMockNode(false, true);
    const blockNodeWithoutAttr = createMockNode(true, false);
    const validBlockNode = createMockNode(true, true);

    const replaceStep = new ReplaceStep(0, 1, {
      content: {
        content: [inlineNode, blockNodeWithoutAttr, validBlockNode],
      },
    });

    const transaction = createMockTransaction([replaceStep]);
    const transactions = [transaction];

    expect(checkForNewBlockNodesInTrs(transactions)).toBe(true);
  });

  it('should handle empty transactions array', () => {
    expect(checkForNewBlockNodesInTrs([])).toBe(false);
  });

  it('should handle transactions with empty steps arrays', () => {
    const transaction = createMockTransaction([]);
    const transactions = [transaction];

    expect(checkForNewBlockNodesInTrs(transactions)).toBe(false);
  });

  it('should handle null/undefined values gracefully', () => {
    const replaceStep = new ReplaceStep(0, 1, {
      content: {
        content: [null, undefined],
      },
    });

    const transaction = createMockTransaction([replaceStep]);
    const transactions = [transaction];

    // This should not throw an error
    expect(checkForNewBlockNodesInTrs(transactions)).toBe(false);
  });
});

describe('BlockNode helpers', () => {
  const filename = 'doc_with_spaces_from_styles.docx';
  let docx, media, mediaFiles, fonts, editor;
  beforeAll(async () => ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(filename)));
  beforeEach(() => ({ editor } = initTestEditor({ content: docx, media, mediaFiles, fonts })));

  it('getBlockNodes returns only nodes that allow sdBlockId', () => {
    const blocks = editor.helpers.blockNode.getBlockNodes();
    expect(blocks.length).toBeGreaterThan(0);
    blocks.forEach(({ node }) => {
      expect(node.type?.spec?.attrs?.sdBlockId).not.toBeUndefined();
      expect(node.isBlock).toBe(true);
    });
  });

  it('getBlockNodeById finds node by sdBlockId', () => {
    const blocks = editor.helpers.blockNode.getBlockNodes();
    const sample = blocks.find((b) => !!b.node.attrs.sdBlockId);
    expect(sample).toBeTruthy();
    const id = sample.node.attrs.sdBlockId;
    const byId = editor.helpers.blockNode.getBlockNodeById(id);
    expect(byId.length).toBe(1);
    expect(byId[0].node.eq(sample.node)).toBe(true);
  });

  it('getBlockNodesByType returns nodes of the given type', () => {
    const blocks = editor.helpers.blockNode.getBlockNodes();
    const targetType = blocks[0].node.type.name;
    const byType = editor.helpers.blockNode.getBlockNodesByType(targetType);
    const expectedCount = blocks.filter((b) => b.node.type.name === targetType).length;
    expect(byType.length).toBe(expectedCount);
    byType.forEach((entry) => expect(entry.node.type.name).toBe(targetType));
  });

  it('getBlockNodesInRange returns nodes within the specified range', () => {
    const allBlocks = editor.helpers.blockNode.getBlockNodes();
    const allInDoc = editor.helpers.blockNode.getBlockNodesInRange(0, editor.state.doc.content.size);
    expect(allInDoc.length).toBe(allBlocks.length);

    const sample = allBlocks[0];
    const from = sample.pos;
    const to = sample.pos + sample.node.nodeSize;
    const inRange = editor.helpers.blockNode.getBlockNodesInRange(from, to);
    expect(inRange.length).toBe(1);
    expect(inRange[0].node.eq(sample.node)).toBe(true);
  });
});

describe('BlockNode commands', () => {
  const filename = 'doc_with_spaces_from_styles.docx';
  let docx, media, mediaFiles, fonts, editor;
  beforeAll(async () => ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(filename)));
  beforeEach(() => ({ editor } = initTestEditor({ content: docx, media, mediaFiles, fonts })));

  it('replaceBlockNodeById replaces node content', () => {
    const blocks = editor.helpers.blockNode.getBlockNodes();
    const target = blocks.find((b) => ['paragraph', 'heading'].includes(b.node.type.name));
    expect(target).toBeTruthy();
    const oldId = target.node.attrs.sdBlockId;
    const newId = `${oldId}-new`;

    const typeName = target.node.type.name;
    const replacement = editor.schema.nodes[typeName].create({ sdBlockId: newId }, editor.schema.text('Replaced'));

    const result = editor.commands.replaceBlockNodeById(oldId, replacement);
    expect(result).toBe(true);

    const oldNode = editor.helpers.blockNode.getBlockNodeById(oldId);
    expect(oldNode.length).toBe(0);
    const newNode = editor.helpers.blockNode.getBlockNodeById(newId);
    expect(newNode.length).toBe(1);
    expect(newNode[0].node.textContent).toBe('Replaced');
  });

  it('deleteBlockNodeById removes the node', () => {
    const blocks = editor.helpers.blockNode.getBlockNodes();
    const target = blocks.find((b) => ['paragraph', 'heading'].includes(b.node.type.name));
    expect(target).toBeTruthy();
    const id = target.node.attrs.sdBlockId;

    const before = editor.helpers.blockNode.getBlockNodeById(id);
    expect(before.length).toBe(1);

    const result = editor.commands.deleteBlockNodeById(id);
    expect(result).toBe(true);

    const after = editor.helpers.blockNode.getBlockNodeById(id);
    expect(after.length).toBe(0);
  });

  it('updateBlockNodeAttributes updates node attributes', () => {
    const blocks = editor.helpers.blockNode.getBlockNodes();
    const target = blocks.find((b) => ['paragraph', 'heading'].includes(b.node.type.name));
    expect(target).toBeTruthy();
    const oldId = target.node.attrs.sdBlockId;
    const newId = `${oldId}-updated`;

    const before = editor.helpers.blockNode.getBlockNodeById(oldId);
    expect(before.length).toBe(1);

    const result = editor.commands.updateBlockNodeAttributes(oldId, { sdBlockId: newId });
    expect(result).toBe(true);

    const oldNode = editor.helpers.blockNode.getBlockNodeById(oldId);
    expect(oldNode.length).toBe(0);
    const updated = editor.helpers.blockNode.getBlockNodeById(newId);
    expect(updated.length).toBe(1);
    expect(['heading', 'paragraph']).toContain(updated[0].node.type.name);
  });
});
