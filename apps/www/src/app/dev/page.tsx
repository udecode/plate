import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { MarkdownStreamDemo } from './markdownStreamDemo';

export default async function DevPage() {
  return (
    <main className="space-y-4">
      <section className="flex flex-wrap justify-end gap-2 px-10 pt-10">
        <Button asChild size="sm" variant="outline">
          <Link href="/dev/table-perf">Table Perf</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/dev/markdown-stream-perf">Markdown Stream Perf</Link>
        </Button>
      </section>

      <MarkdownStreamDemo />
    </main>
  );
}
