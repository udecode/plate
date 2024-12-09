import EditorSelectForm from '@/registry/default/example/select-editor-demo';

export const description = 'A select editor';

export const descriptionSrc = '/docs/multi-select';

export const iframeHeight = '650px';

export const containerClassName = 'w-full h-full';

export default function Page() {
  return (
    <div className="flex h-screen w-full justify-center" data-registry="plate">
      <EditorSelectForm />
    </div>
  );
}
