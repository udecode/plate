import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { createEditor, Plate } from '../../../../packages/platejs/src/react';
import { AIChatPlugin } from '../../../../packages/platejs/src/ai/react';
import { Editor, EditorContainer } from '../../../../apps/www/src/registry/components/editor/editor';
import { EditorKit } from '../../../../apps/www/src/registry/components/editor/plugins';
import { TooltipProvider } from '../../../../apps/www/src/components/ui/tooltip';

const editor = createEditor({ plugins: EditorKit, initialValue: [{type:'paragraph',children:[{text:''}]}] });
const source = 'Some **bold** text.\n\n'.repeat(5120);
const ai=editor.plugin(AIChatPlugin);
for(let run=0;run<5;run++) {
  flushSync(()=> { ai.api.reset(); editor.update.value.replace({children:[{type:'paragraph',children:[{text:''}]}]}); editor.update.selection.set({anchor:{path:[0,0],offset:0},focus:{path:[0,0],offset:0}}); });
  const id=ai.api.start();flushSync(()=>{ai.api.receive(id,source);ai.api.finish(id);});
  const start=performance.now();
  ai.api.accept();
  console.log({run, accept:performance.now()-start, nodes:editor.read.children().length});
}
