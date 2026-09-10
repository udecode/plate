import { writeFileSync } from 'node:fs';
import { createTestEditor } from '../../../../apps/www/src/__tests__/package-integration/ai-chat-streaming/__tests__/createTestEditor';

// Embedded pre-acceptance owner probe. This measures parsing only, not UI latency.
// Frozen guard: a 100 KB parse above 16 ms already exhausts the full preview budget.
const { editor } = createTestEditor({children:[{type:'paragraph',children:[{text:''}]}]});
const rows = [];
for (const bytes of [1024, 10240, 102400, 1048576]) {
  for (const shape of ['paragraphs', 'single-paragraph', 'code']) {
    const unit = shape === 'paragraphs' ? 'Some **bold** text.\n\n' : 'Some plain text. ';
    let source = unit.repeat(Math.ceil(bytes/unit.length)).slice(0,bytes);
    if(shape==='code')source='```text\n'+source.slice(0,bytes-12)+'\n```';
    const durations = [];
    let nodes = 0;
    for(let run=0;run<14;run++) {
      const start=performance.now();
      const value=editor.api.markdown.deserialize(source);
      const duration=performance.now()-start;
      nodes=value.children.length;
      if(run===0)durations.push(duration);
      else if(run>=4)durations.push(duration);
    }
    const [cold,...warm]=durations;
    const sorted=warm.toSorted((a,b)=>a-b);
    const row={bytes:source.length,shape,nodes,cold,warm,p50:sorted[4],p95:sorted[9],samples:10,warmups:3};
    rows.push(row);
    console.log(JSON.stringify({bytes:row.bytes,shape,p95:row.p95}));
    writeFileSync('docs/plans/artifacts/ai-streaming/parse-probe.json',JSON.stringify({base:'f03d2b8c23',runtime:'Bun source-first',scope:'Parser-only lower bound for full raw-source reparsing; not a production UI benchmark.',budget:{preview100KB:16,finish:100},rows},null,2)+'\n');
  }
}
