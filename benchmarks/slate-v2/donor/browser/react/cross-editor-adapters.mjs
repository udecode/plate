export const surfaces = [
  'plite',
  'plate',
  'slate',
  'prosemirror',
  'tiptap',
  'prosekit',
  'wordgard',
  'lexical',
  'quill',
];

const reactImports = `
import React from 'react';
import { createRoot } from 'react-dom/client';
`;

const treeHelpers = `
const value = lines.map(text => ({ type: 'paragraph', children: [{ text }] }));
const renderElement = ({attributes, children}) => React.createElement('p', attributes, children);
const renderLeaf = ({attributes, children, leaf}) => React.createElement(leaf.bold ? 'strong' : 'span', attributes, children);
const treePoint = (current,block,offset) => {
  let remaining=offset;const children=current[block].children;
  for(let i=0;i<children.length;i++){if(remaining<=children[i].text.length)return {path:[block,i],offset:remaining};remaining-=children[i].text.length}
  throw new Error('Selection offset exceeds paragraph');
};
const range = (current,block,from,to=from) => ({anchor:treePoint(current,block,from),focus:treePoint(current,block,to)});
const fromRange = (r,current) => {
  const point=p=>({block:p.path[0],offset:p.offset+current[p.path[0]].children.slice(0,p.path[1]).reduce((sum,node)=>sum+node.text.length,0)});
  return r&&({anchor:point(r.anchor),focus:point(r.focus)});
};
`;

const pmHelpers = `
const fromPM = (doc, position) => {
  const resolved = doc.resolve(position);
  return {block:resolved.index(0),offset:resolved.parentOffset};
};
const pmPosition = (doc, block, offset) => {
  let position = 1;
  for (let i = 0; i < block; i++) position += doc.child(i).nodeSize;
  return position + offset;
};
const pmLines = doc => {const result=[];doc.forEach(node=>result.push(node.textContent));return result};
const pmBold=(doc,block,from,to)=>{const runs=[];doc.child(block).forEach(node=>runs.push({text:node.textContent,bold:node.marks.some(mark=>mark.type.name==='bold'||mark.type.name==='strong')}));return boldRange(runs,from,to)};
`;

export const adapterSource = (surface) => {
  if (surface === 'plite' || surface === 'plate')
    return `${reactImports}
import { history } from 'plitejs/history';
import { createPliteReactRenderCounter } from 'cross-plite-render-profiler';
import { getMountedEditableDOMRuntime } from 'cross-plite-dom-runtime';
import { getEditableKernelTrace } from 'cross-plite-kernel';
${
  surface === 'plite'
    ? "import {createEditor, Editable, Plite, setDOMTextSyncRendererCapability} from 'plitejs/react';"
    : "import {createEditor, Plate, PlateContent, BoldPlugin, ParagraphPlugin} from 'platejs/react';"
}
export async function mount(host, lines, options) {
  ${treeHelpers}
  const counter = createPliteReactRenderCounter();
  if (options.counters) globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;
  const editor = createEditor(${
    surface === 'plite'
      ? '{initialValue:value,extensions:[history()]}'
      : "{initialValue:value,plugins:[ParagraphPlugin.configure({component:renderElement}),BoldPlugin.configure({component:({attributes,children})=>React.createElement('strong',attributes,children)})]}"
  });
  let commits = 0;
  const unsubscribe = editor.subscribeCommit(() => {commits++;globalThis.__crossRecordModel?.()});
  const root = createRoot(host);
  const props = {spellCheck:false,domStrategy:options.domStrategy ?? 'full',renderElement,renderLeaf};
  ${
    surface === 'plite'
      ? `if(options.retained) {
    setDOMTextSyncRendererCapability(renderLeaf,()=>true);
    Object.defineProperty(renderLeaf,Symbol.for('plitejs/react/retained-text-flow-renderer-capability'),{value:({marks})=>Object.keys(marks).length===0});
  }
  props.onKeyDown = event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault();editor.update.marks.toggle('bold');
    }
  };`
      : ''
  }
  root.render(${
    surface === 'plite'
      ? 'React.createElement(Plite,{editor},React.createElement(Editable,props))'
      : 'React.createElement(Plate,{editor,suppressInstanceWarning:true},React.createElement(PlateContent,{...props,disableDefaultStyles:true}))'
  });
  const dom = await until(() => host.querySelector('[contenteditable="true"]'));
  const handle = await until(() => dom.__pliteBrowserHandle);
  return {
    dom,
    lines:()=>handle.getBlockTexts(),
    selection:()=>fromRange(handle.getSelection(),handle.getValue().children),
    waitForSelectionIdle: options.selectionIdle,
    selectionReadiness: options.counters || options.selectionIdle ? ()=>{const runtime=getMountedEditableDOMRuntime(editor,dom);if(!runtime)throw new Error('Missing mounted runtime for selection readiness');const state=runtime.inputController.state;return {ready:!state.isUpdatingSelection&&!state.pendingDOMSelectionImport,isUpdatingSelection:state.isUpdatingSelection,pendingDOMSelectionImport:state.pendingDOMSelectionImport,selectionChangeOrigin:state.selectionChangeOrigin,selectionSource:state.selectionSource,activeIntent:state.activeIntent,isProjectingSelection:state.isProjectingSelection,isComposing:state.isComposing,isDraggingInternally:state.isDraggingInternally,modelSelectionPreference:state.modelSelectionPreference,pendingTasks:runtime.domPhaseScheduler.pending()}} : undefined,
    kernelTrace:options.counters || options.selectionIdle ? ()=>getEditableKernelTrace(editor) : undefined,
    select(block,from,to=from){handle.selectRange(range(handle.getValue().children,block,from,to));handle.focus()},
    bold:(block,from,to)=>boldRange(handle.getValue().children[block].children.map(node=>({text:node.text,bold:node.bold===true})),from,to),
    json:()=>handle.getValue(),
    counters:()=>({commits,...counter.snapshot(),strategy:handle.getDOMStrategyMetrics?.()}),
    resetCounters(){commits=0;counter.reset()},
    destroy(){unsubscribe();root.unmount();globalThis.__PLITE_REACT_RENDER_PROFILER__=undefined},
  };
}
`;
  if (surface === 'slate')
    return `${reactImports}
import {createEditor,Node,Transforms,Editor} from 'slate';
import {withHistory} from 'slate-history';
import {withReact,Slate,Editable,ReactEditor} from 'slate-react';
export async function mount(host,lines) {
  ${treeHelpers}
  const editor = withHistory(withReact(createEditor()));
  editor.getChunkSize = node => Editor.isEditor(node) ? 1000 : null;
  let commits=0;
  const root=createRoot(host);
  const onKeyDown=event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='b'){
    event.preventDefault();const active=Editor.marks(editor)?.bold;
    if(active)Editor.removeMark(editor,'bold');else Editor.addMark(editor,'bold',true);
  }};
  root.render(React.createElement(Slate,{editor,initialValue:value,onChange(){commits++;globalThis.__crossRecordModel?.()}},
    React.createElement(Editable,{renderElement,renderLeaf,onKeyDown,spellCheck:false})));
  const dom=await until(()=>host.querySelector('[contenteditable="true"]'));
  return {dom,lines:()=>editor.children.map(Node.string),selection:()=>fromRange(editor.selection,editor.children),
    select(block,from,to=from){Transforms.select(editor,range(editor.children,block,from,to));ReactEditor.focus(editor)},
    bold:(block,from,to)=>boldRange(editor.children[block].children.map(node=>({text:node.text,bold:node.bold===true})),from,to),
    json:()=>editor.children,counters:()=>({commits,rootChunkSize:editor.getChunkSize(editor)}),resetCounters(){commits=0},destroy(){root.unmount()}};
}
`;
  if (surface === 'prosemirror')
    return `
import {Schema} from 'prosemirror-model';
import {EditorState,TextSelection} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {baseKeymap,toggleMark} from 'prosemirror-commands';
import {keymap} from 'prosemirror-keymap';
import {history,undo,redo} from 'prosemirror-history';
${pmHelpers}
export async function mount(host,lines) {
  const schema=new Schema({nodes:{doc:{content:'paragraph+'},paragraph:{content:'text*',parseDOM:[{tag:'p'}],toDOM:()=>['p',0]},text:{}},marks:{bold:{parseDOM:[{tag:'strong'},{tag:'b'}],toDOM:()=>['strong',0]}}});
  let commits=0;
  const state=EditorState.create({schema,doc:schema.node('doc',null,lines.map(text=>schema.node('paragraph',null,text?schema.text(text):null))),
    plugins:[history(),keymap({'Mod-z':undo,'Mod-Shift-z':redo,'Mod-b':toggleMark(schema.marks.bold)}),keymap(baseKeymap)]});
  const view=new EditorView(host,{state,attributes:{spellcheck:'false'},dispatchTransaction(tr){view.updateState(view.state.apply(tr));commits++;globalThis.__crossRecordModel?.()}});
  return {dom:view.dom,lines:()=>pmLines(view.state.doc),selection:()=>({anchor:fromPM(view.state.doc,view.state.selection.anchor),focus:fromPM(view.state.doc,view.state.selection.head)}),
    select(block,from,to=from){view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc,pmPosition(view.state.doc,block,from),pmPosition(view.state.doc,block,to))));view.focus()},
    bold:(block,from,to)=>pmBold(view.state.doc,block,from,to),
    json:()=>view.state.doc.toJSON(),counters:()=>({commits}),resetCounters(){commits=0},destroy(){view.destroy()}};
}
`;
  if (surface === 'tiptap')
    return `
import {Editor} from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import {TextSelection} from 'prosemirror-state';
${pmHelpers}
export async function mount(host,lines) {
  let commits=0;
  const editor=new Editor({element:host,extensions:[StarterKit.configure({blockquote:false,bulletList:false,code:false,codeBlock:false,dropcursor:false,gapcursor:false,hardBreak:false,heading:false,horizontalRule:false,italic:false,link:false,listItem:false,listKeymap:false,orderedList:false,strike:false,underline:false,trailingNode:false})],
    content:{type:'doc',content:lines.map(text=>({type:'paragraph',content:text?[{type:'text',text}]:[]}))},editorProps:{attributes:{spellcheck:'false'}},onTransaction(){commits++;globalThis.__crossRecordModel?.()}});
  const view=editor.view;
  return {dom:view.dom,lines:()=>pmLines(view.state.doc),selection:()=>({anchor:fromPM(view.state.doc,view.state.selection.anchor),focus:fromPM(view.state.doc,view.state.selection.head)}),
    select(block,from,to=from){view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc,pmPosition(view.state.doc,block,from),pmPosition(view.state.doc,block,to))));view.focus()},
    bold:(block,from,to)=>pmBold(view.state.doc,block,from,to),
    json:()=>editor.getJSON(),counters:()=>({commits,extensions:editor.extensionManager.extensions.map(x=>x.name)}),resetCounters(){commits=0},destroy(){editor.destroy()}};
}
`;
  if (surface === 'prosekit')
    return `
import {createEditor,union,defineBaseCommands,defineBaseKeymap,defineHistory} from '@prosekit/core';
import {defineDoc} from '@prosekit/extensions/doc';
import {defineText} from '@prosekit/extensions/text';
import {defineParagraph} from '@prosekit/extensions/paragraph';
import {defineBold} from '@prosekit/extensions/bold';
import {TextSelection} from 'prosemirror-state';
${pmHelpers}
export async function mount(host,lines) {
  const editor=createEditor({extension:union(defineDoc(),defineText(),defineParagraph(),defineBold(),defineBaseCommands(),defineBaseKeymap(),defineHistory()),
    defaultContent:{type:'doc',content:lines.map(text=>({type:'paragraph',content:text?[{type:'text',text}]:[]}))}});
  editor.mount(host);
  const view=editor.view;
  let commits=0;
  const dispatch=view.dispatch;
  view.dispatch=tr=>{dispatch(tr);commits++;globalThis.__crossRecordModel?.()};
  view.dom.spellcheck=false;
  return {dom:view.dom,lines:()=>pmLines(view.state.doc),selection:()=>({anchor:fromPM(view.state.doc,view.state.selection.anchor),focus:fromPM(view.state.doc,view.state.selection.head)}),
    select(block,from,to=from){view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc,pmPosition(view.state.doc,block,from),pmPosition(view.state.doc,block,to))));view.focus()},
    bold:(block,from,to)=>pmBold(view.state.doc,block,from,to),
    json:()=>editor.getDocJSON(),counters:()=>({commits}),resetCounters(){commits=0},destroy(){editor.unmount()}};
}
`;
  if (surface === 'wordgard')
    return `
import {Wordgard} from 'wordgard/editor';
import {blockDoc,paragraph,strong} from 'wordgard/schema';
import {history} from 'wordgard/history';
import {GardSelection} from 'wordgard/state';
export async function mount(host,lines) {
  const editor=Wordgard.create({parent:host,doc:lines.map(text=>'<p>'+escapeHTML(text)+'</p>').join(''),config:[blockDoc(),paragraph(),strong(),history()]});
  let commits=0;
  const dispatch=editor.dispatch.bind(editor);
  const pos=(block,offset)=>1+editor.state.doc.content.slice(0,block).reduce((sum,node)=>sum+node.length,0)+offset;
  const point=position=>{let base=1;for(let block=0;block<editor.state.doc.content.length;block++){const node=editor.state.doc.content[block];if(position<base+node.length-1)return {block,offset:position-base};base+=node.length}return null};
  editor.dispatch=(...args)=>{const result=dispatch(...args);commits++;globalThis.__crossRecordModel?.();return result};
  editor.contentDOM.spellcheck=false;
  return {dom:editor.contentDOM,lines:()=>editor.state.doc.content.map(node=>node.textContent()),selection:()=>({anchor:point(editor.state.selection.anchor),focus:point(editor.state.selection.head)}),
    select(block,from,to=from){editor.dispatch({selection:GardSelection.range(pos(block,from),pos(block,to))});editor.focus();editor.flush()},
    bold:(block,from,to)=>boldRange(editor.state.doc.content[block].content.map(node=>({text:node.isText?node.param:node.textContent(),bold:node.marks.some(mark=>mark.name==='Strong')})),from,to),
    json:()=>editor.state.doc.toJSON(),counters:()=>({commits}),resetCounters(){commits=0},destroy(){editor.destroy()}};
}
`;
  if (surface === 'lexical')
    return `
import {createEditor,$getRoot,$createParagraphNode,$createTextNode,$getSelection,$createRangeSelection,$setSelection} from 'lexical';
import {registerRichText} from '@lexical/rich-text';
import {registerHistory,createEmptyHistoryState} from '@lexical/history';
export async function mount(host,lines) {
  const dom=document.createElement('div');dom.contentEditable='true';dom.spellcheck=false;host.append(dom);
  const editor=createEditor({namespace:'cross-editor',onError(error){throw error}});
  editor.setRootElement(dom);
  const richCleanup=registerRichText(editor),historyCleanup=registerHistory(editor,createEmptyHistoryState(),1000);
  let commits=0;
  const unsubscribe=editor.registerUpdateListener(()=>{commits++;globalThis.__crossRecordModel?.()});
  editor.update(()=>{$getRoot().clear();for(const text of lines)$getRoot().append($createParagraphNode().append($createTextNode(text)))},{discrete:true});
  const read=fn=>editor.getEditorState().read(fn);
  const point=p=>{const node=p.getNode();const block=node.getTopLevelElementOrThrow();const index=$getRoot().getChildren().findIndex(n=>n.getKey()===block.getKey());
    let offset=p.offset;if(p.type==='text'){for(const child of block.getChildren()){if(child.getKey()===node.getKey())break;offset+=child.getTextContentSize()}}return {block:index,offset}};
  return {dom,lines:()=>read(()=>$getRoot().getChildren().map(n=>n.getTextContent())),selection:()=>read(()=>{const s=$getSelection();return s?.anchor?{anchor:point(s.anchor),focus:point(s.focus)}:null}),
    select(block,from,to=from){editor.update(()=>{
      const children=$getRoot().getChildAtIndex(block).getChildren();const s=$createRangeSelection();
      const set=(point,offset)=>{let remaining=offset;for(const child of children){if(remaining<=child.getTextContentSize()){point.set(child.getKey(),remaining,'text');return}remaining-=child.getTextContentSize()}throw new Error('Selection offset exceeds paragraph')};
      set(s.anchor,from);set(s.focus,to);$setSelection(s);
    },{discrete:true});dom.focus()},
    bold:(block,from,to)=>read(()=>boldRange($getRoot().getChildAtIndex(block).getChildren().map(node=>({text:node.getTextContent(),bold:node.hasFormat?.('bold')===true})),from,to)),
    json:()=>editor.getEditorState().toJSON(),counters:()=>({commits}),resetCounters(){commits=0},destroy(){unsubscribe();historyCleanup();richCleanup();editor.setRootElement(null);host.replaceChildren()}};
}
`;
  if (surface === 'quill')
    return `
import Quill from 'quill/core';
import Bold from 'quill/formats/bold';
Quill.register({'formats/bold':Bold});
export async function mount(host,lines) {
  const editor=new Quill(host,{modules:{toolbar:false,history:{delay:1000}},formats:['bold'],theme:null});
  editor.setText(lines.join('\\n')+'\\n','silent');editor.history.clear();editor.root.spellcheck=false;
  let commits=0;
  editor.on('editor-change',()=>{commits++;globalThis.__crossRecordModel?.()});
  const getLines=()=>editor.getText().slice(0,-1).split('\\n');
  const point=index=>{let base=0;const current=getLines();for(let block=0;block<current.length;block++){if(index<=base+current[block].length)return {block,offset:index-base};base+=current[block].length+1}return null};
  return {dom:editor.root,lines:getLines,selection:()=>{const s=editor.getSelection();return s?{anchor:point(s.index),focus:point(s.index+s.length)}:null},
    select(block,from,to=from){const index=getLines().slice(0,block).reduce((sum,line)=>sum+line.length+1,0)+from;editor.setSelection(index,to-from,'api');editor.focus()},
    bold:(block,from,to)=>{const base=getLines().slice(0,block).reduce((sum,line)=>sum+line.length+1,0);return editor.getFormat(base+from,to-from).bold===true},
    json:()=>editor.getContents(),counters:()=>({commits}),resetCounters(){commits=0},destroy(){editor.disable();host.replaceChildren()}};
}
`;
  throw new Error(`Unknown cross-editor surface ${surface}`);
};

export const adapterHelpers = `
const boldRange=(runs,from,to)=>{
  let offset=0,covered=0,bold=true;
  for(const run of runs){const overlap=Math.max(0,Math.min(offset+run.text.length,to)-Math.max(offset,from));if(overlap){covered+=overlap;bold&&=run.bold}offset+=run.text.length}
  return bold&&covered===to-from&&covered>0;
};
const until = async predicate => {
  const start=performance.now();
  while(performance.now()-start<30000){const value=predicate();if(value)return value;await new Promise(requestAnimationFrame)}
  throw new Error('Adapter readiness timed out');
};
const escapeHTML = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
`;
