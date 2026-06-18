import dynamic from 'next/dynamic'
import Head from 'next/head'
import type React from 'react'
import {
  ComponentLoader,
  HugeDocumentLoader,
} from '../../components/ComponentLoader'
import { EXAMPLE_NAMES_AND_PATHS } from '../../constants/examples'
// node
import { getAllExamples } from '../api'

type ExampleTuple = [name: string, component: React.ComponentType, path: string]

const EXAMPLE_IMPORTERS: Record<
  string,
  () => Promise<{ default: React.ComponentType }>
> = {
  'android-tests': () => import('../../examples/ts/android-tests'),
  'check-lists': () => import('../../examples/ts/check-lists'),
  'code-highlighting': () => import('../../examples/ts/code-highlighting'),
  'custom-placeholder': () => import('../../examples/ts/custom-placeholder'),
  'decorations-async': () => import('../../examples/ts/decorations-async'),
  'document-state': () => import('../../examples/ts/document-state'),
  'dom-coverage-boundaries': () =>
    import('../../examples/ts/dom-coverage-boundaries'),
  'editable-voids': () => import('../../examples/ts/editable-voids'),
  embeds: () => import('../../examples/ts/embeds'),
  'hidden-content-blocks': () =>
    import('../../examples/ts/hidden-content-blocks'),
  linting: () => import('../../examples/ts/linting'),
  'forced-layout': () => import('../../examples/ts/forced-layout'),
  'hovering-toolbar': () => import('../../examples/ts/hovering-toolbar'),
  'huge-document': () => import('../../examples/ts/huge-document'),
  images: () => import('../../examples/ts/images'),
  inlines: () => import('../../examples/ts/inlines'),
  'markdown-preview': () => import('../../examples/ts/markdown-preview'),
  'markdown-shortcuts': () => import('../../examples/ts/markdown-shortcuts'),
  mentions: () => import('../../examples/ts/mentions'),
  'multi-root-document': () => import('../../examples/ts/multi-root-document'),
  'paste-html': () => import('../../examples/ts/paste-html'),
  'persistent-annotation-anchors': () =>
    import('../../examples/ts/persistent-annotation-anchors'),
  pagination: () => import('../../examples/ts/pagination'),
  plaintext: () => import('../../examples/ts/plaintext'),
  'read-only': () => import('../../examples/ts/read-only'),
  'comment-mode': () => import('../../examples/ts/comment-mode'),
  iframe: () => import('../../examples/ts/iframe'),
  richtext: () => import('../../examples/ts/richtext'),
  'search-highlighting': () => import('../../examples/ts/search-highlighting'),
  'shadow-dom': () => import('../../examples/ts/shadow-dom'),
  styling: () => import('../../examples/ts/styling'),
  'synced-blocks': () => import('../../examples/ts/synced-blocks'),
  tables: () => import('../../examples/ts/tables'),
  'yjs-collaboration': () => import('../../examples/ts/yjs-collaboration'),
  'yjs-hocuspocus': () => import('../../examples/ts/yjs-hocuspocus'),
}

const EXAMPLES: ExampleTuple[] = EXAMPLE_NAMES_AND_PATHS.map(([name, path]) => [
  name,
  dynamic(EXAMPLE_IMPORTERS[path], {
    loading: path === 'huge-document' ? HugeDocumentLoader : ComponentLoader,
  }),
  path,
])

const ExamplePage = ({ example }: { example: string }) => {
  const EXAMPLE = EXAMPLES.find((e) => e[2] === example)
  const [name, Component] = EXAMPLE!

  return (
    <>
      <Head>
        <title>Slate Examples - {name}</title>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>
      <Component />
    </>
  )
}

// Disable SSR so example debugging sees one client-owned editor mount.
const NoSsrExamplePage = dynamic(() => Promise.resolve(ExamplePage), {
  ssr: false,
})

export async function getStaticPaths() {
  const paths = getAllExamples()

  return {
    paths: paths.map((path) => ({
      params: {
        example: path,
      },
    })),
    fallback: false,
  }
}

export async function getStaticProps({
  params,
}: {
  params: { example: string }
}) {
  const EXAMPLE = EXAMPLES.find((e) => e[2] === params.example)
  const [name, , path] = EXAMPLE || [params.example, null, params.example]
  return {
    props: {
      example: params.example,
      exampleName: name,
      examplePath: path,
    },
  }
}

export default NoSsrExamplePage
