import Link from 'next/link';

import PlateEditor from '@/components/plate-editor';
import { buttonVariants } from '@/components/plate-ui/button';
import { siteConfig } from '@/config/site';

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 px-4 pb-8 pt-6 sm:px-8 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
          Plate Playground
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          AI · Plugins · Components · Next 15
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          className={buttonVariants()}
          href={siteConfig.links.docs}
          rel="noreferrer"
          target="_blank"
        >
          Documentation
        </Link>
        <Link
          className={buttonVariants({ variant: 'outline' })}
          href={siteConfig.links.github}
          rel="noreferrer"
          target="_blank"
        >
          GitHub
        </Link>
      </div>

      <div className="max-w-[calc(100vw-32px)] rounded-lg border bg-background shadow sm:max-w-[min(calc(100vw-64px),1336px)]">
        <PlateEditor />
      </div>
    </section>
  );
}
