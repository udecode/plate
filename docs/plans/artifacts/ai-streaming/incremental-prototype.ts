import { createRequire } from 'node:module';
import { isDeepStrictEqual } from 'node:util';
import { writeFileSync } from 'node:fs';
import { createTestEditor } from '../../../../apps/www/src/__tests__/package-integration/ai-chat-streaming/__tests__/createTestEditor';
import { MarkdownPlugin } from '../../../../packages/platejs/src/markdown/lib/MarkdownPlugin';
import { withMarkdownRuntime, getMergedOptionsDeserialize, deserializeMdWithRuntime } from '../../../../packages/platejs/src/markdown/lib/internal/markdownConversion';
import { mdastToSlate } from '../../../../packages/platejs/src/markdown/lib/deserializer/mdastToSlate';
import { htmlToJsx } from '../../../../packages/platejs/src/markdown/lib/deserializer/utils/htmlToJsx';
const require = createRequire(new URL('../../../../packages/platejs/package.json', import.meta.url));
const { unified } = require('unified');
const { default: remarkParse } = require('remark-parse');

// Disposable prototype; allowLocal represents a verified block-local remark set.
export function createPrototype(editor: ReturnType<typeof createTestEditor>['editor'], allowLocal = true) {
  let source = '';
  let offset = 0;
  let prefix: any[] = [];
  let value: any[] = [];
  let plain = false;
  let parsedBytes = 0;
  let parses = 0;
  return {
    get source() { return source; },
    get stats() { return {parsedBytes,parses}; },
    append(chunk: string) {
      if (!chunk) return value;
      source += chunk;
      return withMarkdownRuntime(editor, editor.plugin(MarkdownPlugin).store.get(), runtime => {
        const tail = source.slice(offset);
        if (allowLocal && plain && /^[A-Za-z][A-Za-z0-9 ,.!?'()-]*$/.test(tail) && !tail.includes('www.')) {
          value = [...prefix, {type:runtime.registry.type('paragraph')??'paragraph', children:[{text:tail.trimEnd()}]}];
          return value;
        }
        const global = !allowLocal || /[\[\]]/.test(source);
        if(global) { offset = 0; prefix = []; }
        const input = source.slice(offset);
        parsedBytes += input.length;
        parses++;
        try {
          const options = getMergedOptionsDeserialize(runtime);
          const processed = htmlToJsx(input);
          const processor=unified().use(remarkParse).use(options.remarkPlugins??[]);
          const ast=processor.parse(processed);
          const tree=processor.runSync(ast);
          const nodes = mdastToSlate(tree, options);
          const last = tree.children.at(-1);
          const boundary = last?.position?.start.offset ?? 0;
          if(!global && processed===input && boundary>0) {
            const stable = mdastToSlate({...tree,children:tree.children.slice(0,-1)},options);
            prefix = [...prefix,...stable];
            offset += boundary;
            value = [...prefix,...mdastToSlate({...tree,children:[last]},options)];
          } else value = [...prefix,...nodes];
          const lastSource=source.slice(offset);
          plain = !global && tree.children.length>0 && last?.type==='paragraph' && last.children.length===1 && last.children[0].type==='text' && /^[A-Za-z][A-Za-z0-9 ,.!?'()-]*$/.test(lastSource) && !lastSource.includes('www.');
          return value;
        } catch {
          plain = false;
          value = [...prefix,...deserializeMdWithRuntime(runtime,input).children];
          return value;
        }
      });
    }
  };
}

const fixtures = [
  'A **bold** word and _italic_ text.\n\nLast paragraph.',
  'Heading\n=======\n\nParagraph',
  '[link][target]\n\n[target]: https://example.com',
  'first  \nline\n\nlast  ',
  'paragraph\n\n<columnGroup>\n<column width="50%">\nleft\n</column>\n<column width="50%">\nright\n</column>\n</columnGroup>\n\nlast',
  '```js\nconst x = "**literal**";\n```\n\nlast',
  '- first\n\n  continued\n- second\n\nlast',
  '| a | b |\n| - | - |\n| c | d |\n\nlast',
  'Hello :smile: and @bob\n\nlast',
  'Math\n\n$$\nx+y\n$$\n\nlast',
];
const rows=[];
for(const source of fixtures) for(const size of [1,16,128]) {
  const {editor}=createTestEditor({children:[{type:'paragraph',children:[{text:''}]}]});
  const parser=createPrototype(editor);
  let value:any[]=[];
  for(let i=0;i<source.length;i+=size) value=parser.append(source.slice(i,i+size));
  const expected=editor.api.markdown.deserialize(source).children;
  rows.push({source,size,equal:isDeepStrictEqual(value,expected),...(!isDeepStrictEqual(value,expected)?{value,expected}:{})});
}
writeFileSync('docs/plans/artifacts/ai-streaming/incremental-prototype.json',JSON.stringify({scope:'Disposable known-plugin prototype; no production adoption',rows},null,2)+'\n');
console.log({pass:rows.filter(r=>r.equal).length,total:rows.length,failures:rows.filter(r=>!r.equal)});
