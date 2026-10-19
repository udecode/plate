import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { incrementalParser } from './probe';
import { createTestEditor } from '../../../../../packages/platejs/src/markdown/lib/__tests__/createTestEditor';

const editor=createTestEditor();
const full=(s:string)=>editor.api.markdown.parseSlice(s,{partial:true,lossPolicy:'allow'});
const {fixtures}=JSON.parse(readFileSync(`${import.meta.dir}/correctness.json`,'utf8'));
const rows=[];
for(const [name,source] of Object.entries(fixtures) as [string,string][]){
  const candidate=incrementalParser(full);
  let previous:any, equal=0,reused=0, admittedEqual=0,admittedReused=0,firstLoss:any=null;
  for(let end=1;end<=source.length;end++){
    const current=candidate(source.slice(0,end),previous);
    assert.deepEqual(current.result,full(source.slice(0,end)));
    if(previous?.ok && current.result.ok) previous.slice.content.forEach((node:any,index:number)=>{
      const next=current.result.slice.content[index];
      if(!isDeepStrictEqual(node,next))return;
      equal++;
      reused+=+(node===next);
      if(!current.fallback){admittedEqual++;admittedReused+=+(node===next);}
      if(node!==next && !firstLoss)firstLoss={end,index,fallback:current.fallback,source:source.slice(0,end),node};
    });
    previous=current.result;
  }
  rows.push({name,equal,reused,admittedEqual,admittedReused,firstLoss});
}
const totals=rows.reduce((s,r)=>({equal:s.equal+r.equal,reused:s.reused+r.reused,admittedEqual:s.admittedEqual+r.admittedEqual,admittedReused:s.admittedReused+r.admittedReused}),{equal:0,reused:0,admittedEqual:0,admittedReused:0});
writeFileSync(`${import.meta.dir}/identity-oracle.json`,JSON.stringify({rows,totals,allUnchangedIdentityPreserved:totals.equal===totals.reused,scope:'One-character prefixes, content-equal top-level nodes at the same position. This audits the general identity promise, not only committed checkpoints.',prototypeSHA256:createHash('sha256').update(readFileSync(`${import.meta.dir}/probe.ts`)).digest('hex')},null,2)+'\n');
console.log(JSON.stringify({totals,allUnchangedIdentityPreserved:totals.equal===totals.reused}));
