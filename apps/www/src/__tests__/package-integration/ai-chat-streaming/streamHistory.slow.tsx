import { ElementApi, PathApi } from 'platejs';
import { BaseAIPlugin } from 'platejs/ai';
import { AIChatPlugin } from 'platejs/ai/react';

import { createTestEditor } from './__tests__/createTestEditor';

const mdxSamplePreviewChunks = [
  '## ',
  'Basic ',
  'Markdown\n\n',
  '> ',
  'The ',
  'following ',
  'node ',
  'and ',
  'marks ',
  'is ',
  'supported ',
  'by ',
  'the ',
  'Markdown ',
  'standard.\n\n',
  'Format ',
  'text ',
  'with **b',
  'old**, _',
  'italic_,',
  ' _**comb',
  'ined sty',
  'les**_, ',
  '~~strike',
  'through~',
  '~, `code',
  '` format',
  'ting, an',
  'd [hyper',
  'links](https://en.wikipedia.org/wiki/Hypertext).\n\n',
  '```javascript\n',
  '// Use code blocks to showcase code snippets\n',
  'function greet() {\n',
  '  console.info("Hello World!")\n',
  '}\n',
  '```\n\n',
  '- Simple',
  ' lists f',
  'or organ',
  'izing co',
  'ntent\n',
  '1. ',
  'Numbered ',
  'lists ',
  'for ',
  'sequential ',
  'steps\n\n',
  '| **Plugin**  | **Element** | **Inline** | **Void** |\n',
  '| ----------- | ----------- | ---------- | -------- |\n',
  '| **Heading** |             |            | No       |\n',
  '| **Image**   | Yes         | No         | Yes      |\n',
  '| **Ment',
  'ion** | Yes         | Yes        | Yes      |\n\n',
  '![](https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)\n\n',
  '- [x] Co',
  'mpleted ',
  'tasks\n',
  '- [ ] Pe',
  'nding ta',
  'sks\n\n',
  '---\n\n## Advan',
  'ced Feat',
  'ures\n\n',
  '<callout>\n',
  'The ',
  'following ',
  'node ',
  'and ',
  'marks ',
  'are ',
  'not ',
  'supported ',
  'in ',
  'Markdown ',
  'but ',
  'can ',
  'be ',
  'serialized ',
  'and ',
  'deserialized ',
  'using ',
  'MDX ',
  'or ',
  'specialized ',
  'UnifiedJS ',
  'plugins.\n',
  '</callout>\n\n',
  'Advanced ',
  'marks: ',
  '<kbd>⌘ ',
  '+ ',
  'B</kbd>,<u>underlined</u>, ',
  '<mark',
  '>highli',
  'ghted</m',
  'ark',
  '> text, ',
  '<span s',
  'tyle="co',
  'lor: #93',
  'C47D;">c',
  'olored t',
  'ext</spa',
  'n> and ',
  '<spa',
  'n',
  ' style="',
  'backgrou',
  'nd-color',
  ': #6C9EE',
  'B;">back',
  'ground h',
  'ighlight',
  's</spa',
  'n> for ',
  'visual e',
  'mphasis.\n\n',
  'Superscript ',
  'like ',
  'E=mc<sup>2</sup> ',
  'and ',
  'subscript ',
  'like ',
  'H<sub>2</sub>O ',
  'demonstrate ',
  'mathematical ',
  'and ',
  'chemical ',
  'notation ',
  'capabilities.\n\n',
  'Add ',
  'mentions ',
  'like ',
  '@BB-8, d',
  'ates (<d',
  'ate>2025',
  '-05-08</',
  'date>), ',
  'and math',
  ' formula',
  's ($E=mc',
  '^2$).\n\n',
  'The ',
  'table ',
  'of ',
  'contents ',
  'feature ',
  'automatically ',
  'generates ',
  'document ',
  'structure ',
  'for ',
  'easy ',
  'navigation.\n\n',
  '<toc ',
  '/>\n\n',
  'Math ',
  'formula ',
  'support ',
  'makes ',
  'displaying ',
  'complex ',
  'mathematical ',
  'expressions ',
  'simple.\n\n',
  '$$\n',
  'a^2',
  '+b^2',
  '=c^2\n',
  '$$\n\n',
  'Multi-co',
  'lumn lay',
  'out feat',
  'ures ena',
  'ble rich',
  'er page ',
  'designs ',
  'and cont',
  'ent layo',
  'uts.\n\n',
  'PDF ',
  'embedding ',
  'makes ',
  'document ',
  'referencing ',
  'simple ',
  'and ',
  'intuitive.\n\n',
  '<file ',
  'name="sample.pdf" ',
  'src="https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf" width="80%" />\n\n',
  'Audio ',
  'players ',
  'can ',
  'be ',
  'embedded ',
  'directly ',
  'into ',
  'documents, ',
  'supporting ',
  'online ',
  'audio ',
  'resources.\n\n',
  '<audio ',
  'textAlign="center" ',
  'src="https://samplelib.com/lib/preview/mp3/sample-3s.mp3" width="80%" />\n\n',
  'Video ',
  'playback ',
  'features ',
  'support ',
  'embedding ',
  'various ',
  'online ',
  'video ',
  'resources, ',
  'enriching ',
  'document ',
  'content.\n\n',
  '<video ',
  'textAlign="center" ',
  'provider="file" src="https://videos.pexels.com/video-files/6769791/6769791-uhd_2560_1440_24fps.mp4" width="80%" />',
];

const streamPreview = (chunks: string[]) => {
  const { editor } = createTestEditor();
  const initialSelection = JSON.parse(JSON.stringify(editor.read.selection()));
  const initialValue = JSON.parse(JSON.stringify(editor.read.children()));

  editor.plugin(AIChatPlugin).store.set({ mode: 'insert', open: true });

  const aiChat = editor.plugin(AIChatPlugin);
  const { startBlock, startInEmptyParagraph } = aiChat.read.insertStart();

  editor.plugin(BaseAIPlugin).update.beginPreview({
    originalBlocks:
      startInEmptyParagraph && startBlock && ElementApi.isElement(startBlock)
        ? [structuredClone(startBlock)]
        : [],
  });

  const selection = editor.read.selection();

  if (!selection) {
    throw new Error('Expected an initial text selection.');
  }

  const insertAt = PathApi.next(selection.focus.path.slice(0, 1));

  editor.update({ history: 'skip' }).nodes.insert(
    {
      children: [{ text: '' }],
      type: editor.plugin(AIChatPlugin).schema.type,
    },
    {
      at: insertAt,
    }
  );

  editor.plugin(AIChatPlugin).store.set({ streaming: true });

  for (const chunk of chunks) {
    aiChat.update.insertChunk(chunk, {
      textProps: {
        [editor.plugin(BaseAIPlugin).schema.key]: true,
      },
    });
  }

  editor.plugin(AIChatPlugin).store.set({
    _blockChunks: '',
    _blockPath: null,
    _mdxName: null,
    streaming: false,
  });

  return { editor, initialSelection, initialValue };
};

describe('ai chat streaming history', () => {
  it('streams the generated MDX sample through insert preview', () => {
    const { editor } = streamPreview(mdxSamplePreviewChunks);
    const blockquote = editor.read.nodes.find({
      at: [],
      type: 'blockquote',
    })?.[0];
    const link = editor.read.nodes.find({
      at: [],
      match: (node) =>
        ElementApi.isElement(node) &&
        node.url === 'https://en.wikipedia.org/wiki/Hypertext',
    })?.[0];
    const callout = editor.read.nodes.find({ at: [], type: 'callout' })?.[0];
    const file = editor.read.nodes.find({ at: [], type: 'file' })?.[0];
    const audio = editor.read.nodes.find({ at: [], type: 'audio' })?.[0];
    const video = editor.read.nodes.find({ at: [], type: 'video' })?.[0];

    expect(blockquote).toMatchObject({ aiPreview: true });
    expect(
      blockquote?.children.every((child) => ElementApi.isElement(child))
    ).toBe(true);
    expect(link).toBeDefined();
    expect(link).not.toHaveProperty('aiPreview');
    expect(callout).toMatchObject({ aiPreview: true });
    expect(file).toMatchObject({ name: 'sample.pdf', width: '80%' });
    expect(file).not.toHaveProperty('align');
    expect(audio).toMatchObject({ textAlign: 'center', width: '80%' });
    expect(video).toMatchObject({
      provider: 'file',
      textAlign: 'center',
      width: '80%',
    });
  });

  it('keeps insert-mode preview out of history and restores the snapshot on ai undo', () => {
    const { editor, initialValue } = streamPreview(['hello', ' world']);

    expect(editor.read.history.undos()).toHaveLength(0);

    editor.plugin(BaseAIPlugin).update.undo();

    expect(editor.read.children()).toEqual(initialValue);
    expect(editor.read.history.undos()).toHaveLength(0);
  });

  it('accepts streamed preview as a compact undoable batch', () => {
    const chunks = Array.from({ length: 40 }, () => 'chunk ');
    const { editor, initialSelection, initialValue } = streamPreview(chunks);

    editor.plugin(AIChatPlugin).update.accept();

    expect(editor.read.history.undos()).toHaveLength(1);
    const [batch] = editor.read.history.undos();
    const mainChange = batch!.change.toJSON().primary;

    expect(mainChange).toBeDefined();
    expect(mainChange!.length).toBeLessThan(chunks.length);
    expect(
      editor.read.nodes.some({
        at: [],
        match: (n: any) =>
          ElementApi.isElement(n) &&
          n.type === editor.plugin(AIChatPlugin).schema.type,
      })
    ).toBe(false);
    expect(
      editor.read.nodes.some({
        at: [],
        match: (n: any) => !!n[editor.plugin(BaseAIPlugin).schema.key],
      })
    ).toBe(false);
    expect(
      editor.read.nodes.some({
        at: [],
        match: (n: any) => ElementApi.isElement(n) && !!n.aiPreview,
      })
    ).toBe(false);

    editor.update.history.undo();

    expect(editor.read.children()).toEqual(initialValue);
    expect(editor.read.selection()).toEqual(initialSelection);
  });

  it('places the cursor at the end of the accepted preview', () => {
    const { editor } = streamPreview(['hello', ' world']);

    editor.plugin(AIChatPlugin).update.accept();

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 11, path: [0, 0] },
      focus: { offset: 11, path: [0, 0] },
    });
  });

  it('restores the accepted cursor on redo after undo', () => {
    const { editor } = streamPreview(['hello', ' world']);

    editor.plugin(AIChatPlugin).update.accept();
    editor.update.history.undo();
    editor.update.history.redo();

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 11, path: [0, 0] },
      focus: { offset: 11, path: [0, 0] },
    });
  });
});
