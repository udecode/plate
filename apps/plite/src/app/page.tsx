import Link from 'next/link';

import { EXAMPLE_NAMES_AND_PATHS } from '../../../www/src/app/(app)/examples/plite/plite-example-registry';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Plite browser routes</h1>
      <ul className="grid gap-2">
        {EXAMPLE_NAMES_AND_PATHS.map(([name, example]) => (
          <li key={example}>
            <Link className="underline" href={`/examples/plite/${example}`}>
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
