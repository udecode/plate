import { PlateEditor } from '@/registry/default/block/editor-basic/components/editor/plate-editor';

export const description = 'A simple editor';

export const iframeHeight = '650px';

export const containerClassName = 'w-full h-full';

export default function Page() {
  return (
    <div className="h-screen w-full" data-registry="plate">
      <PlateEditor />
    </div>
  );
}
