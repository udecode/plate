import { createTestEditor } from '../../../../apps/www/src/__tests__/package-integration/ai-chat-streaming/__tests__/createTestEditor';
import { AIChatPlugin } from 'platejs/ai/react';
import { MarkdownPlugin } from 'platejs/markdown';
const {editor}=createTestEditor({children:[{type:'paragraph',children:[{text:''}]}]});
const source='<columnGroup>\n  <column width="50%">\n    Some text.\n  </column>\n  <column width="50%">\n    Other text.\n  </column>\n</columnGroup>\n\n';
console.log(JSON.stringify(editor.plugin(MarkdownPlugin).api.deserialize(source),null,2));
editor.update.selection.set({anchor:{path:[0,0],offset:0},focus:{path:[0,0],offset:0}});
const ai=editor.plugin(AIChatPlugin); const id=ai.api.start({mode:'insert',toolName:'generate'}); ai.api.receive(id,source); ai.api.finish(id);console.log(ai.api.accept(),ai.store.get('operation'));
