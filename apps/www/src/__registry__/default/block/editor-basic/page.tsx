import PlateEditor from '@/registry/default/block/basic-editor/components/plate-editor';

export const description = 'A simple editor.';

export const iframeHeight = '650px';

export const containerClassName = 'w-full h-full';

export default function Page() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      {/* <div className="max-w-[calc(100vw-32px)] rounded-lg border bg-background shadow sm:max-w-[min(calc(100vw-64px),1336px)]"> */}
      <PlateEditor />
      {/* </div> */}
    </div>
  );
}
