import { Extensions } from '@harbour-enterprises/superdoc/super-editor';

// Extensions includes the necessary classes for creating custom nodes
const { Attribute } = Extensions;

export const myCustomNode = Extensions.Node.create({
    name: 'customNode',
      
    group: 'inline',
  
    inline: true,

    atom: true,

    draggable: true,

    selectable: true,

    content: 'inline*',
  
    // Add static node options here
    addOptions() {
      return {
        htmlAttributes: {
          contenteditable: false,
          class: 'my-custom-node-default-class',
        },
      };
    },
  
    // Add custom node attributes here
    addAttributes() {
      return {
        id: {
          default: null,

          // The DOM attribute to be used for this node attribute
          parseDOM: (elem) => elem.getAttribute('id'),

          // Tell the node how to render this attribute in the DOM
          renderDOM: ({ id }) => {
            if (!id) return {};
            return { id };
          },
        }
      };
    },

    // Tell the editor how to parse this node from the DOM
    parseDOM() {
      return [{
        tag: `div[data-node-type="${this.name}"]`,
      }];
    },
  
    // Tell the editor how to render this node in the DOM
    renderDOM({ htmlAttributes }) {
      return ['div', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
    },

    // Add custom commands here
    addCommands() {
      return {
        insertCustomNode: ({ content, id }) => ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { id },

            // Our custom node only renders placeholder text, but in theory it can render any other editor node
            content: [
              { type: 'text', text: content || 'Default Content' },
            ]
          });
        },
      };
    }
  });
