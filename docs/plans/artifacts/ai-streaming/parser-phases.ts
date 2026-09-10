import { createRequire } from 'node:module';
const require = createRequire(new URL('../../../../packages/platejs/package.json', import.meta.url));
const { unified } = require('unified');
const { default: remarkParse } = require('remark-parse');
import { createTestEditor } from '../../../../apps/www/src/__tests__/package-integration/ai-chat-streaming/__tests__/createTestEditor';
import { MarkdownPlugin } from '../../../../packages/platejs/src/markdown/lib/MarkdownPlugin';
import { withMarkdownRuntime, getMergedOptionsDeserialize } from '../../../../packages/platejs/src/markdown/lib/internal/markdownConversion';
import { mdastToSlate } from '../../../../packages/platejs/src/markdown/lib/deserializer/mdastToSlate';
const { editor } = createTestEditor({children:[{type:'paragraph',children:[{text:''}]}]});
for (const bytes of [10240,102400]) {
  const source='Some **bold** text.\n\n'.repeat(Math.ceil(bytes/20)).slice(0,bytes);
  withMarkdownRuntime(editor, editor.plugin(MarkdownPlugin).store.get(), runtime => {
    for(let i=0;i<4;i++) {
      let start=performance.now();
      const options=getMergedOptionsDeserialize(runtime);
      const processor=unified().use(remarkParse).use(options.remarkPlugins??[]);
      const prepare=performance.now()-start;
      start=performance.now();
      const ast=processor.parse(source);
      const parse=performance.now()-start;
      start=performance.now();
      const tree=processor.runSync(ast);
      const transform=performance.now()-start;
      start=performance.now();
      const value=mdastToSlate(tree,options);
      const decode=performance.now()-start;
      console.log({bytes,prepare,parse,transform,decode,nodes:value.length});
    }
  });
}
