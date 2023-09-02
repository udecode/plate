// eslint-disable-next-line import/extensions,import/no-unresolved
import '../../../public/registry/themes.css';

import { Metadata } from 'next';

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import { ThemeCustomizer } from '@/components/theme-customizer';
import { ThemeWrapper } from '@/components/theme-wrapper';

import { ThemesTabs } from './tabs';

export const metadata: Metadata = {
  title: 'Themes',
  description: 'Hand-picked themes that you can copy and paste into your apps.',
};

export default function ThemesPage() {
  return (
    <div className="container">
      <ThemeWrapper
        defaultTheme="slate"
        className="relative flex flex-col items-start md:flex-row md:items-center"
      >
        <PageHeader className="relative pb-4 md:pb-8 lg:pb-12">
          <PageHeaderHeading>Make it yours.</PageHeaderHeading>
          <PageHeaderDescription>
            Hand-picked themes that you can copy and paste into your apps.
          </PageHeaderDescription>
        </PageHeader>
        <div className="px-4 pb-8 md:ml-auto md:pb-0">
          <ThemeCustomizer />
        </div>
      </ThemeWrapper>
      <ThemesTabs />
    </div>
  );
}
