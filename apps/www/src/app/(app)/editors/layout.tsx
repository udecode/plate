import type { Metadata } from 'next';

import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import { Button } from '@/registry/default/plate-ui/button';

export const metadata: Metadata = {
  description:
    'Beautifully designed. Copy and paste into your apps. Open Source.',
  title: 'Building Editors.',
};

export default function BlocksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container relative">
      <PageHeader>
        {/* <Announcement /> */}
        <PageHeaderHeading>Building Editors for the Web</PageHeaderHeading>
        <PageHeaderDescription>
          Beautifully designed. Copy and paste into your apps. Open Source.
        </PageHeaderDescription>
        <PageActions>
          <Button asChild size="md">
            <a href="#blocks">Browse Editors</a>
          </Button>
          {/* <Button asChild size="sm" variant="ghost">
            <a
              href="https://github.com/shadcn-ui/ui/discussions/new?category=blocks-request"
              rel="noreferrer"
              target="_blank"
            >
              Request a block
            </a>
          </Button> */}
        </PageActions>
      </PageHeader>
      <section id="blocks" className="scroll-mt-24">
        {children}
      </section>
    </div>
  );
}
