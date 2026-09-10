import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { parse } from '@babel/parser';

const root = process.cwd();
const out = path.dirname(new URL(import.meta.url).pathname);
const roots = ['packages', 'tooling', 'apps', 'benchmarks', '.agents/rules', '.github', 'config'];
const raw = execFileSync('rg', ['--files', ...roots], { encoding: 'utf8', maxBuffer: 16e6 }).trim().split('\n');
const excluded = /(?:^|\/)(?:node_modules|dist|out|\.tmp|\.next|generated|artifacts|__generated__|public)(?:\/|$)|^benchmarks\/slate-v2\/donor\/|^tooling\/plite\/donor\//;
const files = raw.filter(f => /\.[cm]?[jt]sx?$/.test(f) && !/\.d\.ts$/.test(f) && !excluded.test(f));
const clean = v => Array.isArray(v) ? v.map(clean) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).filter(([k]) => !['start','end','loc','extra','leadingComments','trailingComments','innerComments','comments','tokens','errors'].includes(k)).map(([k,x]) => [k,clean(x)])) : v;
const hash = x => createHash('sha256').update(x).digest('hex');
const groups = new Map();
const rows = [];
const wrappers = [];
const errors = [];
const fnTypes = new Set(['FunctionDeclaration','FunctionExpression','ArrowFunctionExpression','ObjectMethod','ClassMethod']);
for (const file of files) {
 const source = fs.readFileSync(path.join(root,file),'utf8');
 if (/(?:automatically generated|auto-generated|@generated)/i.test(source.slice(0,700))) continue;
 const row = {file, lines:source.split('\n').length, bytes:Buffer.byteLength(source), sha256:hash(source), test:/\.(?:spec|test|slow)\./.test(file)||/\/test(?:s)?\//.test(file), functions:0, tests:0, skips:[], readsSource:/readFile(?:Sync)?\(/.test(source), textAssertions:(source.match(/assert\.(?:doesNotMatch|match)\(|\.to(?:Contain|Match)\(/g)||[]).length};
 rows.push(row);
 let ast;
 try { ast=parse(source,{sourceType:'unambiguous',plugins:['typescript','jsx','decorators-legacy','importAttributes'],errorRecovery:true}); }
 catch(e) { errors.push({file,error:e.message});continue; }
 const stack = [[ast,null]];
 while(stack.length) {
  const [n,parent] = stack.pop();
  if(!n||typeof n!=='object')continue;
  if(n.type==='CallExpression') {
   let c=n.callee; let name=c?.name ?? (c?.object?.name ? `${c.object.name}.${c.property?.name}` : '');
   if (/^(it|test)(?:\.(?:skip|only|todo|each))?$/.test(name)) {
    row.tests++;
    if (/\.(skip|todo)$/.test(name))row.skips.push({line:n.loc?.start.line,title:n.arguments[0]?.value});
    const callback=n.arguments.find(a=>a?.type==='ArrowFunctionExpression'||a?.type==='FunctionExpression');
    if(callback?.body) {
     const key='test:'+hash(JSON.stringify(clean(callback.body)));
     const list=groups.get(key)||[];list.push({kind:'test',file,line:n.loc?.start.line,end:n.loc?.end.line,name:n.arguments[0]?.value,lines:n.loc?.end.line-n.loc?.start.line+1});groups.set(key,list);
    }
   }
  }
  if(fnTypes.has(n.type)&&n.body) {
   row.functions++;
   const name=n.id?.name ?? (parent?.type==='VariableDeclarator'?parent.id?.name:n.key?.name);
   const lines=n.loc.end.line-n.loc.start.line+1;
   if(name&&lines>=5) {
    const key='function:'+hash(JSON.stringify(clean({params:n.params,body:n.body,async:n.async,generator:n.generator})));
    const list=groups.get(key)||[]; list.push({kind:'function',file,line:n.loc.start.line,end:n.loc.end.line,name,lines});groups.set(key,list);
   }
   const ret=n.body.type==='BlockStatement'&&n.body.body.length===1&&n.body.body[0].type==='ReturnStatement'?n.body.body[0].argument:n.body;
   if(name&&ret?.type==='CallExpression'&&n.params.every(p=>p.type==='Identifier')&&ret.arguments.length===n.params.length&&ret.arguments.every((a,i)=>a.type==='Identifier'&&a.name===n.params[i].name)) wrappers.push({file,line:n.loc.start.line,name,lines,callee:source.slice(ret.callee.start,ret.callee.end),test:row.test});
  }
  for(const [k,v] of Object.entries(n)) {
   if(['loc','extra','comments','tokens','errors'].includes(k))continue;
   if(Array.isArray(v))for(const a of v)if(a?.type)stack.push([a,n]);
   else {}
   if(v?.type)stack.push([v,n]);
  }
 }
}
const duplicates=[...groups.values()].filter(g=>g.length>1).map(g=>({redundantLines:g.reduce((s,r)=>s+r.lines,0)-g[0].lines,instances:g})).sort((a,b)=>b.redundantLines-a.redundantLines);
const summary={root,at:new Date().toISOString(),files:rows.length,lines:rows.reduce((s,r)=>s+r.lines,0),testFiles:rows.filter(r=>r.test).length,testCalls:rows.reduce((s,r)=>s+r.tests,0),parseErrors:errors.length,duplicateGroups:duplicates.length,forwardingFunctions:wrappers.length};
fs.writeFileSync(path.join(out,'scan.json'),JSON.stringify({summary,rows,duplicates,wrappers,errors},null,2)+'\n');
console.log(JSON.stringify(summary));
console.log(JSON.stringify({duplicates:duplicates.slice(0,15),wrappers:wrappers.filter(r=>!r.test).slice(0,30),textTests:rows.filter(r=>r.test&&r.readsSource&&r.textAssertions>5).sort((a,b)=>b.textAssertions-a.textAssertions).slice(0,15)},null,2));
