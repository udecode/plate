import { PlateEditor } from '@/registry/default/block/basic-editor/components/plate-editor';

export const description = 'A simple editor.';

export const iframeHeight = '650px';

export const containerClassName = 'w-full h-full';

export default function Page() {
  return (
    <div className="flex h-screen w-full">
      <PlateEditor />
    </div>
  );
}
