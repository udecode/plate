import { MenuIcon } from 'lucide-react'
import Link from 'next/link'
import React, { type ErrorInfo, useState } from 'react'

import { cn } from '@/utils/cn'

import { type ExampleBadge, NON_HIDDEN_EXAMPLES } from '../constants/examples'

const Header = (props: React.ComponentProps<'div'>) => (
  <div {...props} className="example-header" />
)

const Title = (props: React.ComponentProps<'span'>) => (
  <span {...props} className="example-title" />
)

const LinkList = (props: React.ComponentProps<'div'>) => (
  <div {...props} className="example-link-list" />
)

const A = (props: React.ComponentProps<'a'>) => (
  <a {...props} className="example-link" />
)

const Pill = (props: React.ComponentProps<'span'>) => (
  <span {...props} className="example-pill" />
)

const ExampleBadgeLabel = ({ badge }: { badge: ExampleBadge }) => (
  <span className={cn('example-badge', `example-badge-${badge}`)}>Alpha</span>
)

const TabList = ({
  isVisible,
  ...props
}: React.ComponentProps<'div'> & { isVisible?: boolean }) => (
  <div
    aria-hidden={!isVisible}
    aria-label="Examples navigation"
    role="menu"
    {...props}
    className={cn('example-tab-list', isVisible ? 'visible' : 'hidden')}
  />
)

const TabListUnderlay = ({
  isVisible,
  ...props
}: React.ComponentProps<'div'> & { isVisible?: boolean }) => (
  <div
    {...props}
    className={cn(
      'example-tab-list-underlay',
      isVisible ? 'visible' : 'hidden'
    )}
  />
)

const TabButton = ({
  children: _children,
  ...props
}: React.ComponentProps<'button'>) => (
  <button
    {...props}
    aria-haspopup="menu"
    aria-label="Toggle examples menu"
    className="example-tab-button"
  >
    <MenuIcon aria-hidden />
  </button>
)

const Tab = ({
  active,
  className,
  ...props
}: React.ComponentProps<typeof Link> & {
  active: boolean
}) => (
  <Link
    aria-current={active ? 'page' : undefined}
    role="menuitem"
    {...props}
    className={cn('example-tab', active && 'active', className)}
  />
)

const ExampleHeader = (props: React.ComponentProps<'div'>) => (
  <div {...props} className="example-page-header" />
)

const ExampleTitle = (props: React.ComponentProps<'span'>) => (
  <span {...props} className="example-page-title" />
)

const ExampleContent = (props: React.ComponentProps<'div'>) => (
  <div {...props} className="example-content" />
)

export const Warning = (props: React.ComponentProps<'div'>) => (
  <div {...props} className="example-warning" />
)

interface ExampleLayoutProps {
  children: React.ReactNode
  exampleName?: string
  examplePath?: string
  error?: Error | null
  stackTrace?: ErrorInfo | null
}

export function ExampleLayout({
  children,
  exampleName,
  examplePath,
  error,
  stackTrace,
}: ExampleLayoutProps) {
  const [showTabs, setShowTabs] = useState<boolean>(false)

  return (
    <div>
      <Header>
        <Title>Slate Examples</Title>
        <LinkList>
          <A href="https://github.com/ianstormtaylor/slate">GitHub</A>
          <A href="https://docs.slatejs.org/">Docs</A>
        </LinkList>
      </Header>

      {exampleName && examplePath && (
        <ExampleHeader>
          <TabButton
            aria-expanded={showTabs}
            onClick={(e) => {
              e.stopPropagation()
              setShowTabs(!showTabs)
            }}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Escape') {
                setShowTabs(false)
              }
            }}
          />
          <ExampleTitle>
            {exampleName}
            <A
              href={`https://github.com/ianstormtaylor/slate/blob/main/site/examples/ts/${examplePath}.tsx`}
            >
              <Pill>Code</Pill>
            </A>
          </ExampleTitle>
        </ExampleHeader>
      )}

      <TabList isVisible={showTabs}>
        {NON_HIDDEN_EXAMPLES.map(([n, p, metadata]) => (
          <Tab
            active={p === examplePath}
            as={`/examples/${p}`}
            href="/examples/[example]"
            key={p as string}
            onClick={() => setShowTabs(false)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Escape') {
                setShowTabs(false)
              }
            }}
          >
            <span>{n}</span>
            {metadata?.badge ? (
              <ExampleBadgeLabel badge={metadata.badge} />
            ) : null}
          </Tab>
        ))}
      </TabList>

      {error && stackTrace ? (
        <Warning>
          <p>An error was thrown by one of the example's React components!</p>
          <pre>
            <code>
              {error.stack}
              {'\n'}
              {stackTrace.componentStack}
            </code>
          </pre>
        </Warning>
      ) : (
        <ExampleContent>{children}</ExampleContent>
      )}

      <TabListUnderlay
        isVisible={showTabs}
        onClick={() => setShowTabs(false)}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Escape') {
            setShowTabs(false)
          }
        }}
      />
    </div>
  )
}
