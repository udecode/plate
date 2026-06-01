import { siteConfig } from '@/config/site';

export function SiteFooter() {
  return (
    <footer className="3xl:fixed:bg-transparent group-has-[[data-slot=designer]]/body:hidden group-has-[[data-slot=designer]]/layout:hidden group-has-[[data-slot=docs]]/body:hidden group-has-[[data-slot=docs]]/layout:hidden group-has-[.section-soft]/body:bg-surface/40 group-has-[[data-home-page]]/layout:bg-muted group-has-[.docs-nav]/body:pb-20 group-has-[.docs-nav]/body:sm:pb-0 dark:bg-transparent dark:group-has-[.section-soft]/body:bg-surface/40">
      <div className="container-wrapper px-4 xl:px-6">
        <div className="flex h-(--footer-height) items-center justify-center">
          <p className="px-1 text-center text-muted-foreground text-sm leading-loose">
            <span>From </span>
            <a
              className="font-medium underline underline-offset-4"
              href={siteConfig.links.twitter}
              rel="noreferrer"
              target="_blank"
            >
              {siteConfig.author}
            </a>
            <span>. The source code is available on </span>
            <a
              className="font-medium underline underline-offset-4"
              href={siteConfig.links.github}
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
            <span>.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
