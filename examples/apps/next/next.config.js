const path = require('path');

const alias = {
  '@udecode/plate': 'plate',
  '@udecode/plate-alignment': 'nodes/alignment',
  '@udecode/plate-autoformat': 'editor/autoformat',
  '@udecode/plate-basic-elements': 'nodes/basic-elements',
  '@udecode/plate-basic-marks': 'nodes/basic-marks',
  '@udecode/plate-block-quote': 'nodes/block-quote',
  '@udecode/plate-break': 'editor/break',
  '@udecode/plate-code-block': 'nodes/code-block',
  '@udecode/plate-combobox': 'editor/combobox',
  '@udecode/plate-core': 'core',
  '@udecode/plate-serializer-csv': 'serializers/csv',
  '@udecode/plate-serializer-docx': 'serializers/docx',
  '@udecode/plate-excalidraw': 'ui/nodes/excalidraw',
  '@udecode/plate-find-replace': 'decorators/find-replace',
  '@udecode/plate-floating': 'floating',
  '@udecode/plate-font': 'nodes/font',
  '@udecode/plate-headless': 'headless',
  '@udecode/plate-heading': 'nodes/heading',
  '@udecode/plate-highlight': 'nodes/highlight',
  '@udecode/plate-horizontal-rule': 'nodes/horizontal-rule',
  '@udecode/plate-image': 'nodes/image',
  '@udecode/plate-indent': 'nodes/indent',
  '@udecode/plate-indent-list': 'nodes/indent-list',
  '@udecode/plate-juice': 'serializers/juice',
  '@udecode/plate-kbd': 'nodes/kbd',
  '@udecode/plate-line-height': 'nodes/line-height',
  '@udecode/plate-link': 'nodes/link',
  '@udecode/plate-list': 'nodes/list',
  '@udecode/plate-serializer-md': 'serializers/md',
  '@udecode/plate-media-embed': 'nodes/media-embed',
  '@udecode/plate-mention': 'nodes/mention',
  '@udecode/plate-node-id': 'editor/node-id',
  '@udecode/plate-normalizers': 'editor/normalizers',
  '@udecode/plate-paragraph': 'nodes/paragraph',
  '@udecode/plate-reset-node': 'editor/reset-node',
  '@udecode/plate-select': 'editor/select',
  '@udecode/plate-styled-components': 'ui/styled-components',
  '@udecode/plate-table': 'nodes/table',
  '@udecode/plate-test-utils': 'test-utils',
  '@udecode/plate-trailing-block': 'editor/trailing-block',
  '@udecode/plate-ui': 'ui/plate',
  '@udecode/plate-ui-alignment': 'ui/nodes/alignment',
  '@udecode/plate-ui-block-quote': 'ui/nodes/block-quote',
  '@udecode/plate-ui-button': 'ui/button',
  '@udecode/plate-ui-code-block': 'ui/nodes/code-block',
  '@udecode/plate-ui-combobox': 'ui/combobox',
  '@udecode/plate-ui-cursor': 'ui/cursor',
  '@udecode/plate-ui-dnd': 'ui/dnd',
  '@udecode/plate-ui-find-replace': 'ui/find-replace',
  '@udecode/plate-ui-font': 'ui/nodes/font',
  '@udecode/plate-ui-horizontal-rule': 'ui/nodes/horizontal-rule',
  '@udecode/plate-ui-image': 'ui/nodes/image',
  '@udecode/plate-ui-line-height': 'ui/nodes/line-height',
  '@udecode/plate-ui-link': 'ui/nodes/link',
  '@udecode/plate-ui-list': 'ui/nodes/list',
  '@udecode/plate-ui-media-embed': 'ui/nodes/media-embed',
  '@udecode/plate-ui-mention': 'ui/nodes/mention',
  '@udecode/plate-ui-placeholder': 'ui/placeholder',
  '@udecode/plate-ui-popover': 'ui/popover',
  '@udecode/plate-ui-table': 'ui/nodes/table',
  '@udecode/plate-ui-toolbar': 'ui/toolbar',
};

Object.keys(alias).forEach((key) => {
  alias[key] = path.resolve(__dirname, `../../../packages/${alias[key]}/src`);
});

/**
 * @type {import('next').NextConfig}
 */
const config = {
  experimental: {
    // Prefer loading of ES Modules over CommonJS
    // @link {https://nextjs.org/blog/next-11-1#es-modules-support|Blog 11.1.0}
    // @link {https://github.com/vercel/next.js/discussions/27876|Discussion}
    esmExternals: true,
    // Experimental monorepo support
    // @link {https://github.com/vercel/next.js/pull/22867|Original PR}
    // @link {https://github.com/vercel/next.js/discussions/26420|Discussion}
    externalDir: true,
  },
  webpack(cfg) {
    cfg.resolve.alias = {
      ...cfg.resolve.alias,
      ...alias,
    };
    return cfg;
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = config;
