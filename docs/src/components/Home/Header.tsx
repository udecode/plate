import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useThemeContext from '@theme/hooks/useThemeContext';
import clsx from 'clsx';
import Logo from './logo.svg';
import DarkLogo from './logo-dark.svg';
import styles from './styles.module.scss';

export const Header = () => {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  const { isDarkTheme } = useThemeContext();

  return (
    <header className="relative bg-white dark:bg-gray-800 overflow-hidden">
      <div className="py-24 mx-auto container px-4 relative">
        <div className="jsx-2867072947 w-96 h-auto absolute transform right-20 top-1/2 h-0 -translate-y-1/2">
          {!isDarkTheme ? (
            <Logo className="w-full h-full" />
          ) : (
            <DarkLogo className="w-full h-full" />
          )}
        </div>
        <div className="grid grid-cols-12 lg:gap-8">
          <div className="col-span-12 lg:col-span-6">
            <div className="text-center lg:text-left md:max-w-2xl md:mx-auto sm:mt-12">
              <h1 className="text-4xl tracking-tight leading-10 font-extrabold text-gray-900 dark:text-white sm:leading-none sm:text-6xl lg:text-5xl xl:text-6xl">
                Rich text editor <br />
                plugin system for
                <br /> Slate & React
              </h1>
              <p className="mt-3 text-base text-gray-700 dark:text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                {siteConfig.tagline}
              </p>
              <div className="mt-5  mx-auto sm:flex sm:justify-center lg:justify-start lg:mx-0 md:mt-8">
                <Link
                  className={clsx(
                    'button  button--primary button--lg mr-2',
                    styles.getStarted
                  )}
                  to={useBaseUrl('docs/')}
                >
                  Get Started
                </Link>
                <Link
                  className={clsx(
                    'button button--outline button--primary button--lg',
                    styles.getStarted
                  )}
                  to={useBaseUrl('docs/')}
                >
                  GitHub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
