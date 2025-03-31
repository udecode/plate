import type { Descendant } from '@udecode/plate';

import type { SerializeMdOptions } from './serializeMd';

import { defaultNodes } from '../nodesRule';
import { convertNodesSerialize } from './convertNodesSerialize';

describe('convertNodesSerialize', () => {
  const mockParagraphNodeSlate: Descendant = {
    children: [{ text: 'Hello' }],
    type: 'p',
  };

  const mockHeadingNodeSlate: Descendant = {
    children: [{ text: 'Title' }],
    type: 'h1',
  };

  const mockThematicBreakNodeSlate: Descendant = {
    children: [{ text: '' }],
    type: 'hr',
  };

  const mockBoldNodeSlate: Descendant = {
    children: [{ bold: true, text: 'Hello' }, { text: 'World' }],
    type: 'p',
  };

  const mockNodesSlate = [
    mockParagraphNodeSlate,
    mockHeadingNodeSlate,
    mockThematicBreakNodeSlate,
    mockBoldNodeSlate,
  ];

  const mockParagraphNodeMd = {
    children: [{ type: 'text', value: 'Hello' }],
    type: 'paragraph',
  };

  const mockHeadingNodeMd = {
    children: [{ type: 'text', value: 'Title' }],
    depth: 1,
    type: 'heading',
  };

  const mockThematicBreakNodeMd = {
    type: 'thematicBreak',
  };

  const mockBoldNodeMd = {
    children: [
      { children: [{ type: 'text', value: 'Hello' }], type: 'strong' },
      { type: 'text', value: 'World' },
    ],
    type: 'paragraph',
  };

  const mockNodesMd = [
    mockParagraphNodeMd,
    mockHeadingNodeMd,
    mockThematicBreakNodeMd,
    mockBoldNodeMd,
  ];

  const baseOptions: SerializeMdOptions = {
    nodes: defaultNodes,
  };

  describe('allowedNodes option', () => {
    it('should only include nodes specified in allowedNodes', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        allowedNodes: ['h1', 'text'],
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expect(result).toHaveLength(1);
      expect(result).toEqual([mockHeadingNodeMd]);
    });

    it('should include all nodes when allowedNodes is null or undefined', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        allowedNodes: null,
      };

      const result = convertNodesSerialize(mockNodesSlate, options);
      expect(result).toHaveLength(mockNodesMd.length);
      expect(result).toEqual(mockNodesMd);
    });

    it('should include no nodes when allowedNodes is empty', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        allowedNodes: [],
      };

      const result = convertNodesSerialize(mockNodesSlate, options);
      expect(result).toHaveLength(0);
    });
  });

  describe('disallowedNodes option', () => {
    it('should exclude nodes specified in disallowedNodes', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        disallowedNodes: ['h1'],
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expect(result).toEqual([
        mockParagraphNodeMd,
        mockThematicBreakNodeMd,
        mockBoldNodeMd,
      ]);
    });

    it('should exclude text marks specified in disallowedNodes', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        disallowedNodes: ['bold'],
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expect(result).toEqual([
        mockParagraphNodeMd,
        mockHeadingNodeMd,
        mockThematicBreakNodeMd,
        {
          children: [{ type: 'text', value: 'World' }],
          type: 'paragraph',
        },
      ]);
    });
  });

  describe('allowNode option', () => {
    it('should exclude nodes specified in allowNode', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        allowNode: {
          serialize(node) {
            if (node.type === 'hr') return false;
            return true;
          },
        },
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expect(result).toEqual([
        mockParagraphNodeMd,
        mockHeadingNodeMd,
        mockBoldNodeMd,
      ]);
    });

    it('should exclude text marks specified in allowNode', () => {
      const options: SerializeMdOptions = {
        ...baseOptions,
        allowNode: {
          serialize(node) {
            if ('bold' in node && node.bold) return false;
            return true;
          },
        },
      };

      const result = convertNodesSerialize(mockNodesSlate, options);

      expect(result).toEqual([
        mockParagraphNodeMd,
        mockHeadingNodeMd,
        mockThematicBreakNodeMd,
        {
          children: [{ type: 'text', value: 'World' }],
          type: 'paragraph',
        },
      ]);
    });
  });
});
