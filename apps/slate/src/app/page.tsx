import Link from 'next/link';

import { EXAMPLE_NAMES_AND_PATHS } from '../../../www/src/app/(app)/examples/slate/slate-example-registry';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Slate browser routes</h1>
      <ul className="grid gap-2">
        {EXAMPLE_NAMES_AND_PATHS.map(([name, example]) => (
          <li key={example}>
            <Link className="underline" href={`/examples/slate/${example}`}>
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
