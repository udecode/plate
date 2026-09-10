import { writeFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { AIChatPlugin } from './LegacyAIChatPlugin';
import { createTestEditor } from './createBaselineEditor';

const fixtures = {
  marks: 'A **bold** word and _italic_ text.\n\nLast paragraph.',
  reference: '[link][target]\n\n[target]: https://example.com',
  setext: 'Heading\n=======\n\nParagraph',
  columns: 'paragraph\n\n<column_group>\n<column width="50%">\nleft\n</column>\n<column width="50%">\nright\n</column>\n</column_group>\n\nlast',
  code: '```js\nconst x = "**literal**";\n```\n\nlast',
  whitespace: 'first  \nline\n\nlast  ',
};
const rows = [];
for (const [name, source] of Object.entries(fixtures)) {
  for (const size of [1, 16, 128]) {
    const { editor } = createTestEditor({children:[{type:'paragraph',children:[{text:''}]}]});
    const full = editor.api.markdown.deserialize(source);
    if(full.children.length===0){rows.push({name,size,equal:false,error:'Full Markdown parser returned no nodes',full});continue;}
    const { editor: oracle } = createTestEditor(full);
    let error: string | undefined;
    try {
      for (let offset = 0; offset < source.length; offset += size) {
        editor.plugin(AIChatPlugin).update.insertChunk(source.slice(offset, offset + size));
      }
    } catch (cause) { error = String(cause); }
    const actual = editor.read.children();
    const expected = oracle.read.children();
    rows.push({ name, size, equal: isDeepStrictEqual(actual, expected), error,
      ...(isDeepStrictEqual(actual, expected) ? {} : { actual, expected }) });
  }
}
const history = [];
for (const blocks of [1, 2]) {
  const original = Array.from({ length: blocks }, (_, i) => ({type:'paragraph', children:[{text:`original ${i}`}]}));
  const { editor } = createTestEditor({ children: original });
  const ai = editor.plugin(AIChatPlugin);
  if (blocks === 1) editor.update.selection.set({anchor:{path:[0,0],offset:0},focus:{path:[0,0],offset:10}});
  else editor.update.selection.setNodes([[0],[1]]);
  ai.store.set({mode:'chat',chatNodes:editor.read.children().map((node,i)=>({node,nodeKey:editor.key([i])!}))});
  const before = structuredClone(editor.read.children());
  const counts = [];
  for (const text of ['new', 'new text', blocks === 1 ? 'new text result' : 'new text\n\nsecond result']) {
    ai.update.applySuggestions(text);
    counts.push(editor.read.history.undos().length);
  }
  ai.update.accept();
  const acceptedBatches=editor.read.history.undos().length;
  editor.update.history.undo();
  history.push({blocks,counts,acceptedBatches,oneUndoRestoresOriginal:isDeepStrictEqual(before,editor.read.children()),afterUndo:editor.read.children()});
}
const report = {base:'f03d2b8c23',description:'Current insertion parser and edit history after P0 no-op repair; exact semantic comparison without property exclusions.', rows, history};
writeFileSync('docs/plans/artifacts/ai-streaming/baseline.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({semanticPass:rows.filter(r=>r.equal).length,total:rows.length,history}));
