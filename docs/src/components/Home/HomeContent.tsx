import React from 'react';
import useThemeContext from '@theme/hooks/useThemeContext';
import clsx from 'clsx';
import { Demo } from './Demo';
import { DemoHeader } from './DemoHeader';
import { Header } from './Header';
import { MacroFeatures } from './MacroFeatures';
import { MicroFeatures } from './MicroFeatures';

export const HomeContent = () => {
  const { isDarkTheme } = useThemeContext();

  return (
    <div id="tailwind">
      <div className={clsx({ dark: isDarkTheme })}>
        <Header />
        <main>
          <MacroFeatures />

          <DemoHeader />

          <section className="bg-gray-800 dark:bg-gray-900">
            <Demo />

            <MicroFeatures />
          </section>
        </main>
      </div>
    </div>
  );
};
