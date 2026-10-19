import { ElementApi } from 'platejs';
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

const streamDraft = async (chunks: string[]) => {
  const { editor } = createTestEditor();
  const initialSelection = JSON.parse(JSON.stringify(editor.read.selection()));
  const initialValue = JSON.parse(JSON.stringify(editor.read.children()));
  const aiChat = editor.plugin(AIChatPlugin);
  const requestId = crypto.randomUUID();

  aiChat.store.set({
    _requestId: requestId,
    mode: 'insert',
    open: true,
    streaming: true,
  });

  let response = '';
  for (const chunk of chunks) {
    response += chunk;
    aiChat.api.setPreview(response, { requestId });
  }
  aiChat.store.set({ streaming: false });
  await Promise.resolve();

  return { editor, initialSelection, initialValue };
};

describe('ai chat streaming history', () => {
  it('applies the complete generated MDX draft', async () => {
    const { editor } = await streamDraft(mdxSamplePreviewChunks);
    editor.plugin(AIChatPlugin).api.accept();
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

    expect(blockquote).toBeDefined();
    expect(
      blockquote?.children.every((child) => ElementApi.isElement(child))
    ).toBe(true);
    expect(link).toBeDefined();
    expect(callout).toBeDefined();
    expect(file).toMatchObject({ name: 'sample.pdf', width: '80%' });
    expect(file).not.toHaveProperty('align');
    expect(audio).toMatchObject({ textAlign: 'center', width: '80%' });
    expect(video).toMatchObject({
      provider: 'file',
      textAlign: 'center',
      width: '80%',
    });
  });

  it('discards streamed output without a history entry', async () => {
    const { editor, initialValue, initialSelection } = await streamDraft([
      'hello',
      ' world',
    ]);
    expect(editor.read.history().undos).toHaveLength(0);
    editor.plugin(AIChatPlugin).api.reset();
    expect(editor.read.children()).toEqual(initialValue);
    expect(editor.read.selection()).toEqual(initialSelection);
    expect(editor.read.history().undos).toHaveLength(0);
  });

  it('applies a draft as one reversible edit', async () => {
    const chunks = Array.from({ length: 40 }, () => 'chunk ');
    const { editor, initialSelection, initialValue } =
      await streamDraft(chunks);
    expect(editor.read.history().undos).toHaveLength(0);
    editor.plugin(AIChatPlugin).api.accept();
    expect(editor.read.history().undos).toHaveLength(1);
    editor.api.history.undo();
    expect(editor.read.children()).toEqual(initialValue);
    expect(editor.read.selection()).toEqual(initialSelection);
  });

  it('places the cursor at the end of the accepted proposal', async () => {
    const { editor } = await streamDraft(['hello', ' world']);

    editor.plugin(AIChatPlugin).api.accept();

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 11, path: [0, 0] },
      focus: { offset: 11, path: [0, 0] },
    });
  });

  it('restores the accepted cursor on redo after undo', async () => {
    const { editor } = await streamDraft(['hello', ' world']);

    editor.plugin(AIChatPlugin).api.accept();
    editor.api.history.undo();
    editor.api.history.redo();

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 11, path: [0, 0] },
      focus: { offset: 11, path: [0, 0] },
    });
  });
});
