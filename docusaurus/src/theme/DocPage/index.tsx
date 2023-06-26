/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { ReactNode, useCallback, useState } from 'react';
import type { PropVersionMetadata } from '@docusaurus/plugin-content-docs-types';
import renderRoutes from '@docusaurus/renderRoutes';
import { matchPath } from '@docusaurus/router';
import { docVersionSearchTag, ThemeClassNames } from '@docusaurus/theme-common';
import { translate } from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { MDXProvider } from '@mdx-js/react';
import type { DocumentRoute } from '@theme/DocItem';
import type { Props } from '@theme/DocPage';
import DocSidebar from '@theme/DocSidebar';
import IconArrow from '@theme/IconArrow';
import Layout from '@theme/Layout';
import MDXComponents from '@theme/MDXComponents';
import NotFound from '@theme/NotFound';
import clsx from 'clsx';
import { PoweredByVercel } from '../../components/Home/PoweredByVercel';
import styles from './styles.module.css';

type DocPageContentProps = {
  readonly currentDocRoute: DocumentRoute;
  readonly versionMetadata: PropVersionMetadata;
  readonly children: ReactNode;
};

function DocPageContent({
  currentDocRoute,
  versionMetadata,
  children,
}: DocPageContentProps): JSX.Element {
  const { siteConfig, isClient } = useDocusaurusContext();
  const {
    pluginId,
    permalinkToSidebar,
    docsSidebars,
    version,
  } = versionMetadata;
  const sidebarName = permalinkToSidebar[currentDocRoute.path];
  const sidebar = docsSidebars[sidebarName];

  const [hiddenSidebarContainer, setHiddenSidebarContainer] = useState(false);
  const [hiddenSidebar, setHiddenSidebar] = useState(false);
  const toggleSidebar = useCallback(() => {
    if (hiddenSidebar) {
      setHiddenSidebar(false);
    }

    setHiddenSidebarContainer(!hiddenSidebarContainer);
  }, [hiddenSidebar, hiddenSidebarContainer]);

  return (
    <Layout
      key={isClient}
      wrapperClassName={ThemeClassNames.wrapper.docPages}
      pageClassName={ThemeClassNames.page.docPage}
      searchMetadatas={{
        version,
        tag: docVersionSearchTag(pluginId, version),
      }}
    >
      <div className={styles.docPage}>
        {sidebar && (
          <div
            className={clsx(styles.docSidebarContainer, {
              [styles.docSidebarContainerHidden]: hiddenSidebarContainer,
            })}
            onTransitionEnd={(e) => {
              if (
                !e.currentTarget.classList.contains(styles.docSidebarContainer)
              ) {
                return;
              }

              if (hiddenSidebarContainer) {
                setHiddenSidebar(true);
              }
            }}
            role="complementary"
          >
            <DocSidebar
              key={
                // Reset sidebar state on sidebar changes
                // See https://github.com/facebook/docusaurus/issues/3414
                sidebarName
              }
              sidebar={sidebar}
              path={currentDocRoute.path}
              sidebarCollapsible={
                siteConfig.themeConfig?.sidebarCollapsible ?? true
              }
              onCollapse={toggleSidebar}
              isHidden={hiddenSidebar}
            />

            {hiddenSidebar && (
              <div
                className={styles.collapsedDocSidebar}
                title={translate({
                  id: 'theme.docs.sidebar.expandButtonTitle',
                  message: 'Expand sidebar',
                  description:
                    'The ARIA label and title attribute for expand button of doc sidebar',
                })}
                aria-label={translate({
                  id: 'theme.docs.sidebar.expandButtonAriaLabel',
                  message: 'Expand sidebar',
                  description:
                    'The ARIA label and title attribute for expand button of doc sidebar',
                })}
                tabIndex={0}
                role="button"
                onKeyDown={toggleSidebar}
                onClick={toggleSidebar}
              >
                <IconArrow className={styles.expandSidebarButtonIcon} />
              </div>
            )}
          </div>
        )}
        <main
          className={clsx(styles.docMainContainer, {
            [styles.docMainContainerEnhanced]:
              hiddenSidebarContainer || !sidebar,
          })}
        >
          <div
            className={clsx(
              'container padding-vert--lg',
              styles.docItemWrapper,
              {
                [styles.docItemWrapperEnhanced]: hiddenSidebarContainer,
              }
            )}
          >
            <MDXProvider components={MDXComponents}>{children}</MDXProvider>

            {/* START */}
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <PoweredByVercel />
            </div>
            {/* END */}
          </div>
        </main>
      </div>
    </Layout>
  );
}

function DocPage(props: Props): JSX.Element {
  const {
    route: { routes: docRoutes },
    versionMetadata,
    location,
  } = props;
  const currentDocRoute = docRoutes.find((docRoute) =>
    matchPath(location.pathname, docRoute)
  );
  if (!currentDocRoute) {
    return <NotFound {...props} />;
  }
  return (
    <DocPageContent
      currentDocRoute={currentDocRoute}
      versionMetadata={versionMetadata}
    >
      {renderRoutes(docRoutes)}
    </DocPageContent>
  );
}

export default DocPage;
