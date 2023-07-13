import { useMemo } from 'react';
import { EditorCodeGenerator } from '@/components/editor-code-generator';
import { H1 } from '@/components/typography';

export default function GeneratorPage({
  searchParams: { plugins: pluginsString },
}: {
  searchParams: { plugins?: string };
}) {
  const initialPluginIds = useMemo(() => pluginsString?.split(',') ?? [], [pluginsString]);

  return (
    <main className="container relative py-6 space-y-8">
      <H1>Generate Editor Code</H1>
      <EditorCodeGenerator initialPluginIds={initialPluginIds} />
    </main>
  );
}
