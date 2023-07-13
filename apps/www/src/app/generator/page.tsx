import { useMemo } from 'react';
import { EditorCodeGenerator } from '@/components/editor-code-generator';

export default function GeneratorPage({
  searchParams: { plugins: pluginsString },
}: {
  searchParams: { plugins?: string };
}) {
  const initialPluginIds = useMemo(() => pluginsString?.split(',') ?? [], [pluginsString]);

  return (
    <main className="container relative py-6 space-y-8">
      <h1 className="mt-2 scroll-m-20 font-heading text-4xl font-bold">
        Generate Editor Code
      </h1>

      <EditorCodeGenerator initialPluginIds={initialPluginIds} />
    </main>
  );
}
