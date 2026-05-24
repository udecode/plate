import { siteConfig } from '@/config/site';

export function SiteFooter() {
  return (
    <footer className="3xl:fixed:bg-transparent group-has-[[data-slot=designer]]/body:hidden group-has-[[data-slot=designer]]/layout:hidden group-has-[[data-slot=docs]]/body:hidden group-has-[[data-slot=docs]]/layout:hidden group-has-[.section-soft]/body:bg-surface/40 group-has-[.docs-nav]/body:pb-20 group-has-[.docs-nav]/body:sm:pb-0 dark:bg-transparent dark:group-has-[.section-soft]/body:bg-surface/40">
      <div className="container-wrapper px-4 xl:px-6">
        <p className="flex h-(--footer-height) items-center justify-center px-1 text-center text-muted-foreground text-sm leading-loose">
          From{' '}
          <a
            className="font-medium underline underline-offset-4"
            href={siteConfig.links.twitter}
            rel="noreferrer"
            target="_blank"
          >
            {siteConfig.author}
          </a>
          . The source code is available on{' '}
          <a
            className="font-medium underline underline-offset-4"
            href={siteConfig.links.github}
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
