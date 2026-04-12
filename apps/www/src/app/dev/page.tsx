import Link from 'next/link';

import { Button } from '@/components/ui/button';

const perfPages = [
  {
    description:
      'Benchmark the captured markdown streaming dataset and inspect end-to-end, burst, render, and streamInsertChunk timings.',
    href: '/dev/markdown-stream-perf',
    title: 'Markdown Stream Perf',
  },
  {
    description:
      'Measure table mount, input latency, and large selection costs for the editor table stack.',
    href: '/dev/table-perf',
    title: 'Table Perf',
  },
];

export default function DevPage() {
  return (
    <main className="container mx-auto space-y-6 p-8">
      <section className="space-y-2">
        <p className="font-semibold text-slate-500 text-xs uppercase tracking-[0.2em]">
          Plate / Dev
        </p>
        <h1 className="font-bold text-3xl text-slate-900">Performance Tools</h1>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {perfPages.map((page) => (
          <article
            key={page.href}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="space-y-3">
              <h2 className="font-semibold text-slate-900 text-xl">
                {page.title}
              </h2>
              <p className="min-h-16 text-slate-600 text-sm">
                {page.description}
              </p>
              <Button asChild>
                <Link href={page.href}>Open</Link>
              </Button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
