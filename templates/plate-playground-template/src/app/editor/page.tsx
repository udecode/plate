import { PlateEditor } from '@/components/editor/plate-editor';
import { OpenAIProvider } from '@/components/editor/use-chat';

export default function Page() {
  return (
    <div className="h-screen w-full" data-registry="plate">
      <OpenAIProvider>
        <PlateEditor />
      </OpenAIProvider>
    </div>
  );
}
