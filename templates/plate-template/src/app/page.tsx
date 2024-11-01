import Link from 'next/link';

import { siteConfig } from '@/config/site';
import { PlateEditor } from '@/components/plate-editor';
import { buttonVariants } from '@/components/plate-ui/button';

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Plate Template.
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Minimal Editor · Next 15
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href={siteConfig.links.docs}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants()}
        >
          Documentation
        </Link>
        <Link
          target="_blank"
          rel="noreferrer"
          href={siteConfig.links.github}
          className={buttonVariants({ variant: 'outline' })}
        >
          GitHub
        </Link>
      </div>

      <div className="flex w-[600px] flex-col gap-4">
        <PlateEditor />
      </div>
    </section>
  );
}
