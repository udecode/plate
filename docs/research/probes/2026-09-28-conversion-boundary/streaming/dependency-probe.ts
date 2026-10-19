import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { createEditor, definePlugin, BaseParagraphPlugin, schema } from 'platejs';
import { MarkdownPlugin } from 'platejs/markdown';
import { createTestEditor } from '../../../../../packages/platejs/src/markdown/lib/__tests__/createTestEditor';
import { MarkdownJoiner } from '../../../../../apps/www/src/registry/lib/markdown-joiner-transform';

const preview = {partial:true,lossPolicy:'allow'} as const;
const first = (r:any) => {assert(r.ok);return r.slice.content[0];};
const editor=createTestEditor();
const dependencies:any[]=[];
for(const [name,a,b] of [
  ['reference','[read][later]\n\nOther.\n\n','[later]: /target\n'],
  ['footnote','Note[^a].\n\nOther.\n\n','[^a]: Body.\n'],
  ['list','- one\n\n','  continuation\n'],
  ['fence','```js\nfirst\n\n','second\n```\n'],
] as const){
  const before=editor.api.markdown.parseSlice(a,preview);
  const after=editor.api.markdown.parseSlice(a+b,preview);
  const suffix=editor.api.markdown.parseSlice(b,preview);
  assert(before.ok && after.ok && suffix.ok);
  const independentlyAssembled=[...before.slice.content,...suffix.slice.content];
  assert.notDeepEqual(independentlyAssembled,after.slice.content);
  dependencies.push({name,prefix:a,append:b,before:before.slice.content,after:after.slice.content,independentlyAssembled});
}

// A legal global remark transform makes even independent prose context-dependent.
const globalTransform = () => (tree:any) => {
  const count=tree.children.length;
  const visit=(n:any)=>{if(n.type==='text')n.value+=` (${count})`;n.children?.forEach(visit);};
  visit(tree);
};
editor.plugin(MarkdownPlugin).store.set({remarkPlugins:[globalTransform]});
const independent=first(editor.api.markdown.parseSlice('One.\n\n',preview));
const global=first(editor.api.markdown.parseSlice('One.\n\nTwo.',preview));
assert.notDeepEqual(independent,global);

const Stateful=definePlugin('streamProbe',{
  initialState:{label:'first'},
  schema:{element:{type:'streamProbe',content:schema.content.text({default:'text',min:1})}},
  formats:({defineFormats,schema:{type}})=>defineFormats({markdown:{
    tag:type,
    decode:({pluginState})=>({type,children:[{text:pluginState.label}]}),
  }}),
});
const stateEditor=createEditor({plugins:[BaseParagraphPlugin,Stateful,MarkdownPlugin]});
const stateBefore=stateEditor.api.markdown.parseSlice('<streamProbe />',preview);
stateEditor.plugin(Stateful).store.set({label:'second'});
const stateAfter=stateEditor.api.markdown.parseSlice('<streamProbe />',preview);
assert.notDeepEqual(first(stateBefore),first(stateAfter));

const answerUnit=(i:number)=>`## Step ${i}\n\nUse a \`Map<string, number>\` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/${i}>.\n\n- keep **order**\n- avoid _churn_\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const source=Array.from({length:1000},(_,i)=>answerUnit(i)).join('\n');
const schedule=[10_000,50_000].map(size=>{
  const text=source.slice(0,size), j=new MarkdownJoiner();
  let output='',emissions=0,delayMs=0,first100:null|number=null;
  for(let i=0;i<text.length;i+=64){
    const part=j.processText(text.slice(i,i+64));
    if(part){output+=part;emissions++;delayMs+=j.delayInMs;if(j.delayInMs===100&&first100===null)first100=i+64;}
  }
  const tail=j.flush();output+=tail;
  assert.equal(output,text);
  return {size,rawChunks:Math.ceil(size/64),emissionsBeforeFlush:emissions,flushBytes:tail.length,requestedDelayMs:delayMs,first100AtReceivedBytes:first100};
});
writeFileSync(`${import.meta.dir}/dependencies.json`,JSON.stringify({dependencies,globalTransform:{independent,global},stateChange:{before:stateBefore,after:stateAfter},schedule,claims:'Backward dependencies and configuration/state sensitivity, not a general invalidation algorithm.'},null,2)+'\n');
console.log('PASS: four backward dependency cases, global remark context, plugin state change, joiner schedules.');
