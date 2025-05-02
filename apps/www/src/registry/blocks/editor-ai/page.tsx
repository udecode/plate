import { Toaster } from 'sonner';

import { PlateEditor } from '@/registry/blocks/editor-ai/components/editor/plate-editor';
import { SettingsProvider } from '@/registry/components/editor/settings';

export const description = 'An AI editor';

export const iframeHeight = '650px';

export const containerClassName = 'w-full h-full';

export default function Page() {
  return (
    <div className="h-screen w-full" data-registry="plate">
      <SettingsProvider>
        <PlateEditor />
      </SettingsProvider>

      <Toaster />
    </div>
  );
}
