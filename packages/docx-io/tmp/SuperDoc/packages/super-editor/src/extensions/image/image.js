import { Attribute, Node } from '@core/index.js';
import { ImagePlaceholderPlugin } from './imageHelpers/imagePlaceholderPlugin.js';
import { ImagePositionPlugin } from './imageHelpers/imagePositionPlugin.js';

export const Image = Node.create({
  name: 'image',

  group: 'inline',

  inline: true,

  draggable: true,

  addOptions() {
    return {
      allowBase64: true,
      htmlAttributes: {
        style: 'display: inline-block;',
        'aria-label': 'Image node',
      },
    };
  },

  addStorage() {
    return {
      media: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        renderDOM: ({ src }) => {
          return {
            src: this.storage.media[src] ?? src,
          };
        },
      },

      alt: {
        default: 'Uploaded picture',
      },

      id: { rendered: false },

      title: {
        default: null,
      },

      rId: {
        default: null,
        rendered: false,
      },

      originalPadding: {
        default: null,
        rendered: false,
      },
      originalAttributes: { rendered: false },
      wrapTopAndBottom: { rendered: false },

      anchorData: {
        default: null,
        rendered: false,
      },

      isAnchor: { rendered: false },
      simplePos: { rendered: false },
      wrapText: { rendered: false },

      size: {
        default: {},
        renderDOM: ({ size }) => {
          let style = '';
          const { width, height } = size ?? {};
          if (width) style += `width: ${width}px;`;
          if (height) style += 'height: auto;';
          return { style };
        },
      },

      padding: {
        default: {},
        renderDOM: ({ padding, marginOffset }) => {
          const { left = 0, top = 0, bottom = 0, right = 0 } = padding ?? {};
          let style = '';
          if (left && !marginOffset?.left) style += `margin-left: ${left}px;`;
          if (top && !marginOffset?.top) style += `margin-top: ${top}px;`;
          if (bottom) style += `margin-bottom: ${bottom}px;`;
          if (right) style += `margin-right: ${right}px;`;
          return { style };
        },
      },

      marginOffset: {
        default: {},
        renderDOM: ({ marginOffset, anchorData }) => {
          const relativeFromPageV = anchorData?.vRelativeFrom === 'page';
          const maxMarginV = 500;
          const { left = 0, top = 0 } = marginOffset ?? {};

          let style = '';
          if (left) style += `margin-left: ${left}px;`;
          if (top) {
            if (relativeFromPageV && top >= maxMarginV) style += `margin-top: ${maxMarginV}px;`;
            else style += `margin-top: ${top}px;`;
          }
          return { style };
        },
      },

      style: {
        default: null,
        rendered: true,
        renderDOM: ({ style }) => {
          if (!style) return {};
          return { style };
        },
      },
    };
  },

  parseDOM() {
    return [
      {
        tag: this.options.allowBase64 ? 'img[src]' : 'img[src]:not([src^="data:"])',
      },
    ];
  },

  renderDOM({ htmlAttributes }) {
    return ['img', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes)];
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addPmPlugins() {
    return [ImagePlaceholderPlugin(), ImagePositionPlugin({ editor: this.editor })];
  },
});
