import { siteConfig } from '@/config/site';

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 py-6 dark:border-border md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
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
