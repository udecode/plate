import { ElementApi, NodeApi } from 'platejs';
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
  const initialSelection = editor.read.selection();
  const initialValue = editor.read.value();
  const ai = editor.plugin(AIChatPlugin);
  const id = ai.api.start({ mode: 'insert', toolName: 'generate' });
  let source = '';
  for (const chunk of chunks) {
    source += chunk;
    ai.api.receive(id, source);
    expect(ai.store.get('operation')?.source).toBe(source);
    expect(editor.read.value()).toEqual(initialValue);
    expect(editor.read.selection()).toEqual(initialSelection);
    expect(editor.read.history.undos()).toHaveLength(0);
  }
  ai.api.finish(id);
  const operation = ai.store.get('operation');
  expect(operation?.status).toBe('ready');
  if (!operation) throw new Error('Expected a detached draft.');
  expect(operation.value).toEqual(
    editor.api.markdown.deserialize(source).children
  );
  return { editor, initialSelection, initialValue, operation };
};

describe('ai chat streaming history', () => {
  it('streams the generated MDX sample into an independent rich-text draft', () => {
    const { operation } = streamPreview(mdxSamplePreviewChunks);
    const nodes = [
      ...NodeApi.elements({ type: 'document', children: operation.value }),
    ].map(([node]) => node);
    const blockquote = nodes.find((node) => node.type === 'blockquote');
    const link = nodes.find(
      (node) => node.url === 'https://en.wikipedia.org/wiki/Hypertext'
    );
    const callout = nodes.find((node) => node.type === 'callout');
    const file = nodes.find((node) => node.type === 'file');
    const audio = nodes.find((node) => node.type === 'audio');
    const video = nodes.find((node) => node.type === 'video');

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

  it('keeps the draft out of history and discards without changing the document', () => {
    const { editor, initialSelection, initialValue, operation } = streamPreview(
      ['hello', ' world']
    );
    expect(operation.value).toEqual([
      { type: 'paragraph', children: [{ text: 'hello world' }] },
    ]);
    expect(editor.read.history.undos()).toHaveLength(0);
    editor.plugin(AIChatPlugin).api.discard();
    expect(editor.plugin(AIChatPlugin).store.get('operation')).toBeNull();
    expect(editor.read.value()).toEqual(initialValue);
    expect(editor.read.selection()).toEqual(initialSelection);
    expect(editor.read.history.undos()).toHaveLength(0);
  });

  it('accepts streamed preview as one compact undoable batch', () => {
    const chunks = Array.from({ length: 40 }, () => 'chunk ');
    const { editor, initialSelection, initialValue, operation } =
      streamPreview(chunks);
    expect(
      editor.plugin(AIChatPlugin).api.accept({ placement: 'replace' })
    ).toBe(true);
    expect(editor.read.children()).toEqual(operation.value);
    expect(editor.read.history.undos()).toHaveLength(1);
    const [batch] = editor.read.history.undos();
    const mainChange = batch!.change.toJSON().primary;
    expect(mainChange).toBeDefined();
    expect(mainChange!.length).toBeLessThan(chunks.length);
    const accepted = editor.read.value();
    const acceptedSelection = editor.read.selection();
    editor.update.history.undo();
    expect(editor.read.value()).toEqual(initialValue);
    expect(editor.read.selection()).toEqual(initialSelection);
    editor.update.history.redo();
    expect(editor.read.value()).toEqual(accepted);
    expect(editor.read.selection()).toEqual(acceptedSelection);
  });

  it('places the cursor at the end of the accepted preview', () => {
    const { editor } = streamPreview(['hello', ' world']);
    expect(
      editor.plugin(AIChatPlugin).api.accept({ placement: 'replace' })
    ).toBe(true);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 11, path: [0, 0] },
      focus: { offset: 11, path: [0, 0] },
    });
  });

  it('restores the accepted cursor on redo after undo', () => {
    const { editor, initialSelection, initialValue } = streamPreview([
      'hello',
      ' world',
    ]);
    expect(
      editor.plugin(AIChatPlugin).api.accept({ placement: 'replace' })
    ).toBe(true);
    const accepted = editor.read.value();
    editor.update.history.undo();
    expect(editor.read.value()).toEqual(initialValue);
    expect(editor.read.selection()).toEqual(initialSelection);
    editor.update.history.redo();
    expect(editor.read.value()).toEqual(accepted);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 11, path: [0, 0] },
      focus: { offset: 11, path: [0, 0] },
    });
  });
});
