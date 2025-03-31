import type { MdHeading, MdRootContent } from '../mdast';
import type { DeserializeMdOptions } from './deserializeMd';

import { defaultNodes } from '../nodesRule';
import { convertNodesDeserialize } from './convertNodesDeserialize';

describe('convertNodesDeserialize', () => {
  const mockParagraphNode: MdRootContent = {
    children: [{ type: 'text', value: 'Hello' }],
    type: 'paragraph',
  };

  const mockHeadingNode: MdHeading = {
    children: [{ type: 'text', value: 'Title' }],
    depth: 1,
    type: 'heading',
  };

  const mockThematicBreakNode: MdRootContent = {
    type: 'thematicBreak',
  };

  const mockBoldNode: MdRootContent = {
    children: [
      { children: [{ type: 'text', value: 'Hello' }], type: 'strong' },
      { type: 'text', value: 'World' },
    ],
    type: 'paragraph',
  };

  const mockNodes = [
    mockParagraphNode,
    mockHeadingNode,
    mockThematicBreakNode,
    mockBoldNode,
  ];

  const baseOptions: DeserializeMdOptions = {
    nodes: defaultNodes,
  };

  const mockParagraphNodeSlate = {
    children: [{ text: 'Hello' }],
    type: 'p',
  };

  const mockHeadingNodeSlate = {
    children: [{ text: 'Title' }],
    type: 'h1',
  };

  const mockThematicBreakNodeSlate = {
    children: [{ text: '' }],
    type: 'hr',
  };

  const mockBoldNodeSlate = {
    children: [{ bold: true, text: 'Hello' }, { text: 'World' }],
    type: 'p',
  };

  const mockNodesSlate = [
    mockParagraphNodeSlate,
    mockHeadingNodeSlate,
    mockThematicBreakNodeSlate,
    mockBoldNodeSlate,
  ];

  describe('allowedNodes option', () => {
    it('should only include nodes specified in allowedNodes', () => {
      const options: DeserializeMdOptions = {
        ...baseOptions,
        allowedNodes: ['heading', 'text'],
      };

      const result = convertNodesDeserialize(mockNodes, {}, options);

      expect(result).toHaveLength(1);
      expect(result).toEqual([mockHeadingNodeSlate]);
    });

    it('should include all nodes when allowedNodes is null or undefined', () => {
      const options: DeserializeMdOptions = {
        ...baseOptions,
        allowedNodes: null,
      };

      const result = convertNodesDeserialize(mockNodes, {}, options);
      expect(result).toHaveLength(mockNodesSlate.length);
      expect(result).toEqual(mockNodesSlate);
    });

    it('should include no nodes when allowedNodes is empty', () => {
      const options: DeserializeMdOptions = {
        ...baseOptions,
        allowedNodes: [],
      };

      const result = convertNodesDeserialize(mockNodes, {}, options);
      expect(result).toHaveLength(0);
    });
  });

  describe('disabledNodes option', () => {
    it('should exclude nodes specified in disabledNodes', () => {
      const options: DeserializeMdOptions = {
        ...baseOptions,
        disallowedNodes: ['heading'],
      };

      const result = convertNodesDeserialize(mockNodes, {}, options);

      expect(result).toEqual([
        mockParagraphNodeSlate,
        mockThematicBreakNodeSlate,
        mockBoldNodeSlate,
      ]);
    });

    it('should exclude inline nodes specified in disallowedNodes', () => {
      const options: DeserializeMdOptions = {
        ...baseOptions,
        disallowedNodes: ['bold'],
      };

      const result = convertNodesDeserialize(mockNodes, {}, options);

      expect(result).toEqual([
        mockParagraphNodeSlate,
        mockHeadingNodeSlate,
        mockThematicBreakNodeSlate,
        {
          children: [{ text: 'World' }],
          type: 'p',
        },
      ]);
    });
  });

  describe('allowNode option', () => {
    it('should exclude nodes specified in allowNode', () => {
      const options: DeserializeMdOptions = {
        ...baseOptions,
        allowNode: {
          deserialize(node) {
            if (node.type === 'hr') return false;

            return true;
          },
        },
      };
      const result = convertNodesDeserialize(mockNodes, {}, options);

      expect(result).toEqual([
        mockParagraphNodeSlate,
        mockHeadingNodeSlate,
        mockBoldNodeSlate,
      ]);
    });

    it('should exclude inline nodes specified in allowNode', () => {
      const options: DeserializeMdOptions = {
        ...baseOptions,
        allowNode: {
          deserialize(node) {
            if (node.type === 'bold') return false;

            return true;
          },
        },
      };
      const result = convertNodesDeserialize(mockNodes, {}, options);

      expect(result).toEqual([
        mockParagraphNodeSlate,
        mockHeadingNodeSlate,
        mockThematicBreakNodeSlate,
        {
          children: [{ text: 'World' }],
          type: 'p',
        },
      ]);
    });
  });
});
