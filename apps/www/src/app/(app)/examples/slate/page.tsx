import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import { NON_HIDDEN_EXAMPLES } from "./slate-example-registry";
import { SlateExamplesShell } from "./slate-examples-shell";

export default function SlateExamplesPage() {
  return (
    <SlateExamplesShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Slate examples
          </h1>
          <p className="text-muted-foreground">
            First-party Slate v2 examples running inside the Plate docs app.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {NON_HIDDEN_EXAMPLES.map(([name, slug, metadata]) => (
            <Link
              className="rounded-md border bg-background p-4 text-sm font-medium transition-colors hover:bg-muted"
              data-slate-example-link={slug}
              href={`/examples/slate/${slug}`}
              key={slug}
            >
              <span>{name}</span>
              {metadata?.badge ? (
                <Badge
                  className="ml-2 h-5 px-1.5 text-[10px]"
                  variant="secondary"
                >
                  {metadata.badge}
                </Badge>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </SlateExamplesShell>
  );
}
