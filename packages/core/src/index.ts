/** @platejs-curated-entrypoint */

export * from './lib/editor/index';
export * from './lib/libs/nanoid';
export * from './lib/plugin/index';
export * from './lib/plugins/HistoryPlugin';
export * from './lib/plugins/getCorePlugins';
export * from './lib/plugins/affinity/index';
export * from './lib/plugins/debug/index';
export * from './lib/plugins/dom/index';
export * from './lib/plugins/element-state/index';
export {
  collapseWhiteSpace,
  type HtmlApi,
  htmlBrToNewLine,
  HtmlPlugin,
  htmlStringToDOMNode,
  htmlTextNodeToString,
} from './lib/plugins/html/HtmlPlugin';
export { someHtmlElement } from './lib/plugins/html/htmlDom';
export * from './lib/plugins/input-rules/index';
export * from './lib/plugins/node-id/index';
export * from './lib/plugins/override/index';
export * from './lib/plugins/paragraph/index';
export * from './lib/types/index';
export * from './lib/utils/index';
export type { PliteElementProps } from './static/components/plite-nodes';
