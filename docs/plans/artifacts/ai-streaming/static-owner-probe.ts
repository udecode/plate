import { createTestEditor } from '../../../../apps/www/src/__tests__/package-integration/ai-chat-streaming/__tests__/createTestEditor';
import { BaseEditorRenderers } from '../../../../apps/www/src/registry/components/editor/plugins-static';
import { getStaticRenderRuntime } from '../../../../packages/platejs/src/static/renderers';
const {editor}=createTestEditor();
console.log(getStaticRenderRuntime(editor,BaseEditorRenderers).pluginCache.decorate);
