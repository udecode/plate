import { Registry } from './schema';

const ui: Registry = [
  {
    name: 'cloud',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: [
      'ui/cloud/cloud-attachment-element.tsx',
      'ui/cloud/cloud-image-element.tsx',
      'ui/cloud/cloud-resize-controls.tsx',
      'ui/cloud/cloud-status-bar.tsx',
      'ui/cloud/cloud-toolbar-buttons.tsx',
    ],
    items: [
      'cloud-attachment-element',
      'cloud-image-element',
      'cloud-resize-controls',
      'cloud-status-bar',
      'cloud-toolbar-buttons',
    ],
  },
  {
    name: 'code-block-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: [
      'ui/code-block-element/code-block-element.tsx',
      'ui/code-block-element/code-block-element.css',
      'ui/code-block-element/code-block-combobox.tsx',
    ],
    items: [
      'code-block-element',
      'code-block-element.css',
      'code-block-combobox',
    ],
  },
  {
    name: 'color-dropdown-menu',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: [
      'ui/color-dropdown-menu/color-dropdown-menu.tsx',
      'ui/color-dropdown-menu/color-constants.ts',
      'ui/color-dropdown-menu/color-dropdown-menu-items.tsx',
      'ui/color-dropdown-menu/color-input.tsx',
      'ui/color-dropdown-menu/color-picker.tsx',
      'ui/color-dropdown-menu/colors-custom.tsx',
    ],
    items: [
      'color-dropdown-menu',
      'color-constants',
      'color-dropdown-menu-items',
      'color-input',
      'color-picker',
      'colors-custom',
    ],
  },
  {
    name: 'comments-popover',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: [
      'ui/comments-popover/comments-popover.tsx',
      'ui/comments-popover/comment-avatar.tsx',
      'ui/comments-popover/comment-create-form.tsx',
      'ui/comments-popover/comment-item.tsx',
      'ui/comments-popover/comment-more-dropdown.tsx',
      'ui/comments-popover/comment-reply-items.tsx',
      'ui/comments-popover/comment-resolve-button.tsx',
      'ui/comments-popover/comment-value.tsx',
    ],
    items: [
      'comments-popover',
      'comment-avatar',
      'comment-create-form',
      'comment-item',
      'comment-more-dropdown',
      'comment-reply-items',
      'comment-resolve-button',
      'comment-value',
    ],
  },
  {
    name: 'draggable',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/draggable/draggable.tsx', 'ui/draggable/with-draggables.tsx'],
    items: ['draggable', 'with-draggables'],
  },
  {
    name: 'emoji-dropdown-menu',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: [
      'ui/emoji-dropdown-menu/emoji-dropdown-menu.tsx',
      'ui/emoji-dropdown-menu/emoji-icons.tsx',
      'ui/emoji-dropdown-menu/emoji-picker.tsx',
      'ui/emoji-dropdown-menu/emoji-picker-content.tsx',
      'ui/emoji-dropdown-menu/emoji-picker-navigation.tsx',
      'ui/emoji-dropdown-menu/emoji-picker-preview.tsx',
      'ui/emoji-dropdown-menu/emoji-picker-search-and-clear.tsx',
      'ui/emoji-dropdown-menu/emoji-picker-search-bar.tsx',
    ],
    items: [
      'emoji-dropdown-menu',
      'emoji-icons',
      'emoji-picker',
      'emoji-picker-content',
      'emoji-picker-navigation',
      'emoji-picker-preview',
      'emoji-picker-search-and-clear',
      'emoji-picker-search-bar',
    ],
  },
  {
    name: 'align-dropdown-menu',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/align-dropdown-menu.tsx'],
  },
  {
    name: 'avatar',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/avatar.tsx'],
  },
  {
    name: 'blockquote-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/blockquote-element.tsx'],
  },
  {
    name: 'button',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/button.tsx'],
  },
  {
    name: 'checkbox',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/checkbox.tsx'],
  },
  {
    name: 'code-leaf',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/code-leaf.tsx'],
  },
  {
    name: 'code-line-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/code-line-element.tsx'],
  },
  {
    name: 'code-syntax-leaf',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/code-syntax-leaf.tsx'],
  },
  {
    name: 'combobox',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/combobox.tsx'],
  },
  {
    name: 'command',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/command.tsx'],
  },
  {
    name: 'comment-leaf',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/comment-leaf.tsx'],
  },
  {
    name: 'comment-toolbar-button',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/comment-toolbar-button.tsx'],
  },
  {
    name: 'cursor-overlay',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/cursor-overlay.tsx'],
  },
  {
    name: 'dialog',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/dialog.tsx'],
  },
  {
    name: 'dropdown-menu',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/dropdown-menu.tsx'],
  },

  {
    name: 'emoji-combobox',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/emoji-combobox.tsx'],
  },
  {
    name: 'emoji-toolbar-dropdown',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/emoji-toolbar-dropdown.tsx'],
  },
  {
    name: 'excalidraw-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/excalidraw-element.tsx'],
  },
  {
    name: 'fixed-toolbar',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/fixed-toolbar.tsx'],
  },
  {
    name: 'fixed-toolbar-buttons',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/fixed-toolbar-buttons.tsx'],
  },
  {
    name: 'floating-toolbar',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/floating-toolbar.tsx'],
  },
  {
    name: 'floating-toolbar-buttons',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/floating-toolbar-buttons.tsx'],
  },
  {
    name: 'heading-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/heading-element.tsx'],
  },
  {
    name: 'highlight-leaf',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/highlight-leaf.tsx'],
  },
  {
    name: 'hr-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/hr-element.tsx'],
  },
  {
    name: 'image-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/image-element.tsx'],
  },
  {
    name: 'indent-list-toolbar-button',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/indent-list-toolbar-button.tsx'],
  },
  {
    name: 'indent-toolbar-button',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/indent-toolbar-button.tsx'],
  },
  {
    name: 'input',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/input.tsx'],
  },
  {
    name: 'insert-dropdown-menu',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/insert-dropdown-menu.tsx'],
  },
  {
    name: 'kbd-leaf',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/kbd-leaf.tsx'],
  },
  {
    name: 'line-height-dropdown-menu',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/line-height-dropdown-menu.tsx'],
  },
  {
    name: 'link-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/link-element.tsx'],
  },
  {
    name: 'link-floating-toolbar',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/link-floating-toolbar.tsx'],
  },
  {
    name: 'link-toolbar-button',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/link-toolbar-button.tsx'],
  },
  {
    name: 'list-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/list-element.tsx'],
  },
  {
    name: 'list-toolbar-button',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/list-toolbar-button.tsx'],
  },
  {
    name: 'mark-toolbar-button',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/mark-toolbar-button.tsx'],
  },
  {
    name: 'media-embed-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/media-embed-element.tsx'],
  },
  {
    name: 'media-floating-toolbar',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/media-floating-toolbar.tsx'],
  },
  {
    name: 'media-toolbar-button',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/media-toolbar-button.tsx'],
  },
  {
    name: 'mention-combobox',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/mention-combobox.tsx'],
  },
  {
    name: 'mention-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/mention-element.tsx'],
  },
  {
    name: 'mention-input-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/mention-input-element.tsx'],
  },
  {
    name: 'mode-dropdown-menu',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/mode-dropdown-menu.tsx'],
  },
  {
    name: 'more-dropdown-menu',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/more-dropdown-menu.tsx'],
  },
  {
    name: 'outdent-toolbar-button',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/outdent-toolbar-button.tsx'],
  },
  {
    name: 'paragraph-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/paragraph-element.tsx'],
  },
  {
    name: 'placeholders',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/placeholders.tsx'],
  },
  {
    name: 'popover',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/popover.tsx'],
  },
  {
    name: 'scroll-area',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/scroll-area.tsx'],
  },
  {
    name: 'search-highlight-leaf',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/search-highlight-leaf.tsx'],
  },
  {
    name: 'separator',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/separator.tsx'],
  },
  {
    name: 'table-cell-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/table-cell-element.tsx'],
  },
  {
    name: 'table-dropdown-menu',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/table-dropdown-menu.tsx'],
  },

  {
    name: 'table-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/table-element.tsx'],
  },
  {
    name: 'table-row-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/table-row-element.tsx'],
  },
  {
    name: 'todo-list-element',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/todo-list-element.tsx'],
  },
  {
    name: 'toggle',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/toggle.tsx'],
  },
  {
    name: 'toolbar',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/toolbar.tsx'],
  },
  {
    name: 'tooltip',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/tooltip.tsx'],
  },
  {
    name: 'turn-into-dropdown-menu',
    type: 'components:ui',
    dependencies: [],
    registryDependencies: [],
    files: ['ui/turn-into-dropdown-menu.tsx'],
  },
];

const example: Registry = [
  {
    name: 'basic-editor-default-demo',
    type: 'components:example',
    registryDependencies: [],
    files: ['example/basic-editor-default-demo.tsx'],
  },
  {
    name: 'basic-editor-handler-demo',
    type: 'components:example',
    registryDependencies: [],
    files: ['example/basic-editor-handler-demo.tsx'],
  },
  {
    name: 'basic-editor-value-demo',
    type: 'components:example',
    registryDependencies: [],
    files: ['example/basic-editor-value-demo.tsx'],
  },
  {
    name: 'basic-plugins-components-demo',
    type: 'components:example',
    registryDependencies: [],
    files: ['example/basic-plugins-components-demo.tsx'],
  },
  {
    name: 'basic-plugins-default-demo',
    type: 'components:example',
    registryDependencies: [],
    files: ['example/basic-plugins-default-demo.tsx'],
  },
  {
    name: 'cloud-demo',
    type: 'components:example',
    registryDependencies: [],
    files: ['example/cloud-demo.tsx'],
  },
  {
    name: 'editable-voids-demo',
    type: 'components:example',
    registryDependencies: [],
    files: ['example/editable-voids-demo.tsx'],
  },
  {
    name: 'find-replace-demo',
    type: 'components:example',
    registryDependencies: [],
    files: ['example/find-replace-demo.tsx'],
  },
  {
    name: 'hundreds-blocks-demo',
    type: 'components:example',
    registryDependencies: [],
    files: ['example/hundreds-blocks-demo.tsx'],
  },
  {
    name: 'hundreds-editors-demo',
    type: 'components:example',
    registryDependencies: [],
    files: ['example/hundreds-editors-demo.tsx'],
  },
  {
    name: 'iframe-demo',
    type: 'components:example',
    registryDependencies: [],
    files: ['example/iframe-demo.tsx'],
  },
  {
    name: 'mode-toggle',
    type: 'components:example',
    files: ['example/mode-toggle.tsx'],
  },
  {
    name: 'multiple-editors-demo',
    type: 'components:example',
    registryDependencies: [],
    files: ['example/multiple-editors-demo.tsx'],
  },
  {
    name: 'playground-demo',
    type: 'components:example',
    registryDependencies: [],
    files: ['example/playground-demo.tsx'],
  },
  {
    name: 'preview-md-demo',
    type: 'components:example',
    registryDependencies: [],
    files: ['example/preview-md-demo.tsx'],
  },
  {
    name: 'createPlateUI',
    type: 'components:component',
    external: true,
    files: ['lib/plate/createPlateUI.ts'],
  },
  {
    name: 'globals',
    type: 'components:component',
    external: true,
    files: ['styles/globals.css'],
  },
  {
    name: 'plate-types',
    type: 'components:component',
    external: true,
    files: ['types/plate-types.ts'],
  },
];

export const registry: Registry = [...ui, ...example];
