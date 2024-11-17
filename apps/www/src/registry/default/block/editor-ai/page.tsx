import { PlateEditor } from '@/registry/default/block/editor-ai/components/editor/plate-editor';
import { OpenAIProvider } from '@/registry/default/components/editor/use-chat';

export const description = 'An AI editor';

export const iframeHeight = '650px';

export const containerClassName = 'w-full h-full';

export default function Page() {
  return (
    <div className="h-screen w-full" data-registry="plate">
      <OpenAIProvider>
        <PlateEditor />
      </OpenAIProvider>
    </div>
  );
}
