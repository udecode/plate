import { describe, expect, it } from 'bun:test';
import { createSlateEditor } from 'platejs';

import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';
import {
  DEFAULT_MARKDOWN_STREAMING_DEMO_SCENARIO_ID,
  getNextPlaybackIndex,
  getPlaybackDelayInMs,
  markdownStreamingDemoScenarios,
} from '@/registry/lib/markdown-streaming-demo-data';
import { transformMarkdownStreamingChunks } from '@/registry/lib/markdown-streaming-chunks';
import { deserializeMd } from '../../../../../packages/markdown/src/lib/deserializer';

const createDemoMarkdownEditor = () =>
  createSlateEditor({
    plugins: BaseEditorKit,
    value: [{ children: [{ text: '' }], type: 'p' }],
  });

const getNodeTypes = (nodes: any[]): string[] => {
  const types: string[] = [];

  for (const node of nodes) {
    if (typeof node?.type === 'string') {
      types.push(node.type);
    }

    if (Array.isArray(node?.children)) {
      types.push(...getNodeTypes(node.children));
    }
  }

  return types;
};

const findNodesByType = (nodes: any[], type: string): any[] => {
  const matches: any[] = [];

  for (const node of nodes) {
    if (node?.type === type) {
      matches.push(node);
    }

    if (Array.isArray(node?.children)) {
      matches.push(...findNodesByType(node.children, type));
    }
  }

  return matches;
};

const getTextLeaves = (nodes: any[]): any[] => {
  const leaves: any[] = [];

  for (const node of nodes) {
    if (typeof node?.text === 'string') {
      leaves.push(node);
    }

    if (Array.isArray(node?.children)) {
      leaves.push(...getTextLeaves(node.children));
    }
  }

  return leaves;
};

describe('getPlaybackDelayInMs', () => {
  it('uses the selected playback delay as the minimum interval', () => {
    expect(getPlaybackDelayInMs(50, 10)).toBe(50);
    expect(getPlaybackDelayInMs(16, undefined)).toBe(16);
  });

  it('preserves larger chunk-specific delays from the joiner', () => {
    expect(getPlaybackDelayInMs(10, 100)).toBe(100);
    expect(getPlaybackDelayInMs(50, 200)).toBe(200);
  });
});

describe('getNextPlaybackIndex', () => {
  it('advances by the selected burst size', () => {
    expect(getNextPlaybackIndex(0, 20, 1)).toBe(1);
    expect(getNextPlaybackIndex(0, 20, 5)).toBe(5);
    expect(getNextPlaybackIndex(3, 20, 10)).toBe(13);
  });

  it('caps the next index at the total chunk count', () => {
    expect(getNextPlaybackIndex(17, 20, 5)).toBe(20);
    expect(getNextPlaybackIndex(20, 20, 5)).toBe(20);
  });
});

describe('markdownStreamingDemoScenarios', () => {
  const mergedScenario =
    markdownStreamingDemoScenarios[DEFAULT_MARKDOWN_STREAMING_DEMO_SCENARIO_ID];

  const getMergedMarkdown = () =>
    transformMarkdownStreamingChunks([...mergedScenario.chunks])
      .map((chunk) => chunk.chunk)
      .join('');

  it('exports a single merged preset scenario', () => {
    const scenarioEntries = Object.entries(markdownStreamingDemoScenarios);

    expect(scenarioEntries).toHaveLength(1);
    expect(markdownStreamingDemoScenarios).toHaveProperty(
      DEFAULT_MARKDOWN_STREAMING_DEMO_SCENARIO_ID
    );
    expect(mergedScenario.label).toBe('All Scenarios Combined');
    expect(mergedScenario.syntax).toBe('mdx');
  });

  it('preserves the full merged markdown text when transformed', () => {
    const transformed = transformMarkdownStreamingChunks([
      ...mergedScenario.chunks,
    ]);

    expect(transformed.length).toBeGreaterThan(0);
    expect(transformed.map((chunk) => chunk.chunk).join('')).toBe(
      mergedScenario.chunks.join('')
    );
  });

  it('keeps the merged scenario inside the supported editor node set', () => {
    const editor = createDemoMarkdownEditor();
    const nodeTypes = getNodeTypes(deserializeMd(editor, getMergedMarkdown()));

    for (const expectedType of [
      'audio',
      'callout',
      'code_block',
      'column',
      'column_group',
      'date',
      'file',
      'toc',
      'video',
    ]) {
      expect(nodeTypes).toContain(expectedType);
    }
  });

  it('keeps representative attrs and inline marks in the merged scenario', () => {
    const editor = createDemoMarkdownEditor();
    const document = deserializeMd(editor, getMergedMarkdown());
    const leaves = getTextLeaves(document);
    const links = findNodesByType(document, 'a');
    const images = findNodesByType(document, 'img');
    const callouts = findNodesByType(document, 'callout');
    const columnGroups = findNodesByType(document, 'column_group');
    const columns = findNodesByType(document, 'column');
    const codeBlocks = findNodesByType(document, 'code_block');
    const dates = findNodesByType(document, 'date');
    const files = findNodesByType(document, 'file');
    const audioNodes = findNodesByType(document, 'audio');
    const tables = findNodesByType(document, 'table');
    const videoNodes = findNodesByType(document, 'video');
    const tocNodes = findNodesByType(document, 'toc');

    expect(callouts).toHaveLength(1);
    expect(callouts[0]?.variant).toBe('warning');
    expect(callouts[0]?.title).toBe('Chunky props');
    expect(callouts[0]?.icon).toBe('ℹ️');
    expect(dates).toHaveLength(1);
    expect(dates[0]?.date).toBe('2026-04-01');
    expect(columnGroups).toHaveLength(1);
    expect(JSON.stringify(columnGroups[0]?.layout)).toBe('[70,30]');
    expect(columns).toHaveLength(2);
    expect(columns.some((column) => column?.sticky === true)).toBe(true);
    expect(codeBlocks).toHaveLength(1);
    expect(files).toHaveLength(1);
    expect(files[0]?.name).toBe('spec.pdf');
    expect(files[0]?.url).toBe('https://example.com/spec.pdf');
    expect(audioNodes).toHaveLength(1);
    expect(audioNodes[0]?.url).toBe('https://example.com/clip.mp3');
    expect(tables).toHaveLength(1);
    expect(videoNodes).toHaveLength(1);
    expect(videoNodes[0]?.url).toBe('https://example.com/demo.mp4');
    expect(videoNodes[0]?.width).toBe('80%');
    expect(videoNodes[0]?.align).toBe('center');
    expect(tocNodes).toHaveLength(1);
    expect(links).toHaveLength(1);
    expect(images).toHaveLength(1);
    expect(leaves.find((leaf) => leaf.text === 'commented')?.comment).toBe(
      true
    );
    expect(leaves.find((leaf) => leaf.text === 'suggested')?.suggestion).toBe(
      true
    );
    expect(leaves.find((leaf) => leaf.text === 'Cmd')?.kbd).toBe(true);
    expect(leaves.find((leaf) => leaf.text === 'K')?.kbd).toBe(true);
    expect(leaves.find((leaf) => leaf.text === 'highlight')?.highlight).toBe(
      true
    );
    expect(leaves.find((leaf) => leaf.text === 'underline')?.underline).toBe(
      true
    );
    expect(leaves.find((leaf) => leaf.text === 'low')?.subscript).toBe(true);
    expect(leaves.find((leaf) => leaf.text === 'high')?.superscript).toBe(true);
    expect(leaves.find((leaf) => leaf.text === 'styled')?.fontWeight).toBe(
      '700'
    );
    expect(leaves.find((leaf) => leaf.text === 'styled')?.color).toBe('tomato');
    expect(
      leaves.some(
        (leaf) =>
          typeof leaf.text === 'string' && leaf.text.includes('Primary lane')
      )
    ).toBe(true);
    expect(
      leaves.some(
        (leaf) =>
          typeof leaf.text === 'string' &&
          leaf.text.includes('Nested markdown still streams')
      )
    ).toBe(true);
    expect(
      leaves.some(
        (leaf) =>
          typeof leaf.text === 'string' &&
          leaf.text.includes('Keep the editor alive')
      )
    ).toBe(true);
    expect(
      leaves.some(
        (leaf) =>
          typeof leaf.text === 'string' &&
          leaf.text.includes(
            'Streaming code fences after MDX tags should still parse.'
          )
      )
    ).toBe(true);
    expect(
      leaves.some(
        (leaf) =>
          typeof leaf.text === 'string' &&
          leaf.text.includes('Paragraph should exist from table')
      )
    ).toBe(true);
    expect(
      leaves.some(
        (leaf) => typeof leaf.text === 'string' && leaf.text.includes('Typora')
      )
    ).toBe(true);
    expect(
      leaves.some(
        (leaf) => typeof leaf.text === 'string' && leaf.text.includes('Task C')
      )
    ).toBe(true);
    expect(
      leaves.some(
        (leaf) =>
          typeof leaf.text === 'string' && leaf.text.includes('Visit OpenAI')
      )
    ).toBe(true);
  });
});
