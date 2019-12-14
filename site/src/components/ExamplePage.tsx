import React, { useState } from 'react';
import ErrorBoundary from 'react-error-boundary';
import { Link, useLocation } from 'react-router-dom';
import { css, cx } from 'emotion';
import { Icon } from '../../../src/slate-plugins/common/components/components';
import { CheckLists } from '../../../stories/check-lists';
import { Embeds } from '../../../stories/embeds';
import { ForcedLayout } from '../../../stories/forced-layout';
import { HoveringMenu } from '../../../stories/hovering-toolbar';
import { HugeDocument } from '../../../stories/huge-document';
import { Images } from '../../../stories/images';
import { Links } from '../../../stories/links';
import { MarkdownPreview } from '../../../stories/markdown-preview';
import { MarkdownShortcuts } from '../../../stories/markdown-shortcuts';
import { Mentions } from '../../../stories/mentions';
import { PasteHtml } from '../../../stories/paste-html';
import { PlainText } from '../../../stories/plain-text';
import { PluginsExample } from '../../../stories/plugins';
import { ReadOnly } from '../../../stories/read-only.stories';
import { RichText } from '../../../stories/richtext';
import { SearchHighlighting } from '../../../stories/search-highlighting';
import { Tables } from '../../../stories/tables';

const EXAMPLES = [
  ['Plugins', PluginsExample, 'plugins'],
  ['Checklists', CheckLists, 'check-lists'],
  ['Embeds', Embeds, 'embeds'],
  ['Forced Layout', ForcedLayout, 'forced-layout'],
  ['Hovering Toolbar', HoveringMenu, 'hovering-toolbar'],
  ['Huge Document', HugeDocument, 'huge-document'],
  ['Images', Images, 'images'],
  ['Links', Links, 'links'],
  ['Markdown Preview', MarkdownPreview, 'markdown-preview'],
  ['Markdown Shortcuts', MarkdownShortcuts, 'markdown-shortcuts'],
  ['Mentions', Mentions, 'mentions'],
  ['Paste HTML', PasteHtml, 'paste-html'],
  ['Plain Text', PlainText, 'plain-text'],
  ['Read-only', ReadOnly, 'read-only'],
  ['Rich Text', RichText, 'rich-text'],
  ['Search Highlighting', SearchHighlighting, 'search-highlighting'],
  ['Tables', Tables, 'tables'],
];

const Header = (props: any) => (
  <div
    {...props}
    className={css`
      align-items: center;
      background: #000;
      color: #aaa;
      display: flex;
      height: 42px;
      position: relative;
      z-index: 1; /* To appear above the underlay */
    `}
  />
);

const Title = (props: any) => (
  <span
    {...props}
    className={css`
      margin-left: 1em;
    `}
  />
);

const LinkList = (props: any) => (
  <div
    {...props}
    className={css`
      margin-left: auto;
      margin-right: 1em;
    `}
  />
);

const A = ({ children, ...props }: any) => (
  <a
    {...props}
    className={css`
      margin-left: 1em;
      color: #aaa;
      text-decoration: none;
      &:hover {
        background-color: rgb(47, 69, 102);
        color: #fff;
        text-decoration: underline;
      }
    `}
  >
    {children}
  </a>
);

const TabList = ({ isVisible, ...props }: any) => (
  <div
    {...props}
    className={css`
      background-color: rgb(24, 48, 85);
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      padding-top: 0.2em;
      position: absolute;
      transition: width 0.2s;
      width: ${isVisible ? '200px' : '0'};
      white-space: nowrap;
      max-height: 70vh;
      z-index: 1; /* To appear above the underlay */
    `}
  />
);

const TabListUnderlay = ({ isVisible, ...props }: any) => (
  <div
    {...props}
    className={css`
      background-color: rgba(200, 200, 200, 0.8);
      display: ${isVisible ? 'block' : 'none'};
      height: 100%;
      top: 0;
      position: fixed;
      width: 100%;
    `}
  />
);

const TabButton = (props: any) => (
  <span
    {...props}
    className={css`
      margin-left: 0.8em;
      &:hover {
        cursor: pointer;
      }
      .material-icons {
        color: #aaa;
        font-size: 24px;
      }
    `}
  />
);

const Tab = React.forwardRef(({ active, href, ...props }: any, ref) => (
  <Link
    ref={ref}
    to={`/examples/${href}`}
    {...props}
    className={css`
      display: inline-block;
      margin-bottom: 0.2em;
      padding: 0.2em 1em;
      border-radius: 0.2em;
      text-decoration: none;
      color: #ddd;
      background: ${active ? 'rgb(47, 69, 102)' : 'transparent'};
      &:hover {
        background: rgb(47, 69, 102);
      }
    `}
  />
));

const Wrapper = ({ className, ...props }: any) => (
  <div
    {...props}
    className={cx(
      className,
      css`
        max-width: 42em;
        margin: 20px auto;
        padding: 20px;
      `
    )}
  />
);

const ExampleHeader = (props: any) => (
  <div
    {...props}
    className={css`
      align-items: center;
      background-color: rgb(24, 48, 85);
      color: #ddd;
      display: flex;
      height: 42px;
      position: relative;
      z-index: 1; /* To appear above the underlay */
    `}
  />
);

const ExampleTitle = (props: any) => (
  <span
    {...props}
    className={css`
      margin-left: 1em;
    `}
  />
);

const ExampleContent = (props: any) => (
  <Wrapper
    {...props}
    className={css`
      background: #fff;
    `}
  />
);

const Warning = (props: any) => (
  <Wrapper
    {...props}
    className={css`
      background: #fffae0;
      & > pre {
        background: #fbf1bd;
        white-space: pre;
        overflow-x: scroll;
        margin-bottom: 0;
      }
    `}
  />
);

export const ExamplePage = () => {
  const [error, setError] = useState<Error>();
  const [stacktrace, setStacktrace] = useState<string>();
  const [showTabs, setShowTabs] = useState<boolean>();

  const location = useLocation();
  const example = location.pathname.split('/')[2] || 'plugins';

  const EXAMPLE = EXAMPLES.find(e => e[2] === example);

  if (!EXAMPLE) return null;

  const [name, Component, path] = EXAMPLE;

  return (
    <ErrorBoundary
      onError={(errorValue, stacktraceValue) => {
        setError(errorValue);
        setStacktrace(stacktraceValue);
      }}
    >
      <div>
        <Header>
          <Title>Slate Plugins - 0.52</Title>
          <LinkList>
            <A href="https://github.com/ianstormtaylor/slate">GitHub</A>
            <A href="https://docs.slatejs.org/">Docs</A>
          </LinkList>
        </Header>
        <ExampleHeader>
          <TabButton
            onClick={(e: any) => {
              e.stopPropagation();
              setShowTabs(!showTabs);
            }}
          >
            <Icon>menu</Icon>
          </TabButton>
          <ExampleTitle>
            {name}
            <A
              href={`https://github.com/ianstormtaylor/slate/blob/master/site/examples/${path}.js`}
            >
              (View Source)
            </A>
          </ExampleTitle>
        </ExampleHeader>
        <TabList isVisible={showTabs}>
          {EXAMPLES.map(([n, , p]) => (
            <Tab key={p.toString()} href={p} onClick={() => setShowTabs(false)}>
              {n}
            </Tab>
          ))}
        </TabList>
        {error ? (
          <Warning>
            <p>An error was thrown by one of the example React components!</p>
            <pre>
              <code>
                {error.stack}
                {'\n'}
                {stacktrace}
              </code>
            </pre>
          </Warning>
        ) : (
          <ExampleContent>
            <Component />
          </ExampleContent>
        )}
        <TabListUnderlay
          isVisible={showTabs}
          onClick={() => setShowTabs(false)}
        />
      </div>
    </ErrorBoundary>
  );
};
