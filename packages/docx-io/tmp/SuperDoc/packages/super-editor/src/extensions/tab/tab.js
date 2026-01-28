import { Node, Attribute } from '@core/index.js';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { ReplaceStep, ReplaceAroundStep, StepMap } from 'prosemirror-transform';
import { DOMSerializer } from 'prosemirror-model';

export const TabNode = Node.create({
  name: 'tab',
  group: 'inline',
  inline: true,
  // need this prop so Prosemirror doesn't treat tab as an
  // empty node and doesn't insert separator after
  content: 'inline*',
  selectable: false,
  atom: true,

  addOptions() {
    return {
      htmlAttributes: {
        class: 'sd-editor-tab',
        // this works together with content prop:
        // since tab can't have content inside but content prop is defined I have to manually add attribute
        contentEditable: false,
      },
    };
  },

  parseDOM() {
    return [{ tag: 'span.sd-editor-tab' }];
  },

  renderDOM({ htmlAttributes }) {
    return ['span', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
  },

  addAttributes() {
    return {
      tabSize: {
        renderDOM: ({ tabSize }) => {
          if (!tabSize) return {};
          const style = `width: ${tabSize}px; min-width: ${tabSize}px;`;
          return { style };
        },
      },
    };
  },

  addPmPlugins() {
    const { view, schema } = this.editor;
    const domSerializer = DOMSerializer.fromSchema(schema);

    const tabPlugin = new Plugin({
      name: 'tabPlugin',
      key: new PluginKey('tabPlugin'),
      state: {
        init() {
          return { decorations: false };
        },
        apply(tr, { decorations }, _oldState, newState) {
          if (!decorations) {
            decorations = DecorationSet.create(
              newState.doc,
              getTabDecorations(newState.doc, StepMap.empty, view, domSerializer),
            );
          }

          if (!tr.docChanged) {
            return { decorations };
          }
          decorations = decorations.map(tr.mapping, tr.doc);

          let rangesToRecalculate = [];
          tr.steps.forEach((step, index) => {
            const stepMap = step.getMap();
            if (step instanceof ReplaceStep || step instanceof ReplaceAroundStep) {
              const $from = tr.docs[index].resolve(step.from);
              const $to = tr.docs[index].resolve(step.to);
              const start = $from.start(Math.min($from.depth, 1)); // start of node at level 1
              const end = $to.end(Math.min($to.depth, 1)); // end of node at level 1
              let addRange = false;
              tr.docs[index].nodesBetween(start, end, (node) => {
                if (node.type.name === 'tab') {
                  // Node contains or contained a tab
                  addRange = true;
                }
              });
              if (!addRange && step.slice?.content) {
                step.slice.content.descendants((node) => {
                  if (node.type.name === 'tab') {
                    // A tab was added.
                    addRange = true;
                  }
                });
              }
              if (addRange) {
                rangesToRecalculate.push([start, end]);
              }
            }
            rangesToRecalculate = rangesToRecalculate.map(([from, to]) => {
              const mappedFrom = stepMap.map(from, -1);
              const mappedTo = stepMap.map(to, 1);
              return [mappedFrom, mappedTo];
            });
          });
          rangesToRecalculate.forEach(([start, end]) => {
            const oldDecorations = decorations.find(start, end);
            decorations = decorations.remove(oldDecorations);
            const invertMapping = tr.mapping.invert();
            const newDecorations = getTabDecorations(newState.doc, invertMapping, view, domSerializer, start, end);
            decorations = decorations.add(newState.doc, newDecorations);
          });
          return { decorations };
        },
      },
      props: {
        decorations(state) {
          return this.getState(state).decorations;
        },
      },
    });
    return [tabPlugin];
  },
});

const defaultTabDistance = 48;
const defaultLineLength = 816;

const getTabDecorations = (doc, invertMapping, view, domSerializer, from = 0, to = null) => {
  // TODO: Render "bar".
  if (!to) {
    to = doc.content.size;
  }
  const nodeWidthCache = {};
  let decorations = [];
  doc.nodesBetween(from, to, (node, pos, parent) => {
    if (node.type.name === 'tab') {
      let extraStyles = '';
      const $pos = doc.resolve(pos);
      const tabIndex = $pos.index($pos.depth);
      const fistlineIndent = parent.attrs?.indent?.firstLine || 0;
      const currentWidth =
        calcChildNodesWidth(
          parent,
          pos - $pos.parentOffset,
          0,
          tabIndex,
          domSerializer,
          view,
          invertMapping,
          nodeWidthCache,
        ) + fistlineIndent;
      let tabWidth;
      if ($pos.depth === 1 && parent.attrs.tabStops && parent.attrs.tabStops.length > 0) {
        const tabStop = parent.attrs.tabStops.find((tabStop) => tabStop.pos > currentWidth && tabStop.val !== 'clear');
        if (tabStop) {
          tabWidth = tabStop.pos - currentWidth;
          if (['end', 'center'].includes(tabStop.val)) {
            let nextTabIndex = tabIndex + 1;
            while (nextTabIndex < parent.childCount && parent.child(nextTabIndex).type.name !== 'tab') {
              nextTabIndex++;
            }
            const tabSectionWidth = calcChildNodesWidth(
              parent,
              pos - $pos.parentOffset,
              tabIndex,
              nextTabIndex,
              domSerializer,
              view,
              invertMapping,
              nodeWidthCache,
            );
            tabWidth -= tabStop.val === 'end' ? tabSectionWidth : tabSectionWidth / 2;
          } else if (['decimal', 'num'].includes(tabStop.val)) {
            const breakChar = '.'; // TODO: The break character should likely be document language dependent.
            let nodeIndex = tabIndex + 1;
            let integralWidth = 0;
            let nodePos = pos - $pos.parentOffset;
            while (nodeIndex < parent.childCount) {
              const node = parent.child(nodeIndex);
              if (node.type.name === 'tab') {
                break;
              }
              const oldPos = invertMapping.map(nodePos);
              if (node.type.name === 'text' && node.text.includes(breakChar)) {
                // Only include text before the break character
                const modifiedNode = node.cut(0, node.text.indexOf(breakChar));
                integralWidth += calcNodeWidth(domSerializer, modifiedNode, view, oldPos);
                break;
              }
              integralWidth += calcNodeWidth(domSerializer, node, view, oldPos);
              nodeWidthCache[nodePos] = integralWidth;
              nodePos += node.nodeSize;
              nodeIndex += 1;
            }
            tabWidth -= integralWidth;
          }
          if (tabStop.leader) {
            // TODO: The following styles will likely not correspond 1:1 to the original. Adjust as needed.
            if (tabStop.leader === 'dot') {
              extraStyles += `border-bottom: 1px dotted black;`;
            } else if (tabStop.leader === 'heavy') {
              extraStyles += `border-bottom: 2px solid black;`;
            } else if (tabStop.leader === 'hyphen') {
              extraStyles += `border-bottom: 1px solid black;`;
            } else if (tabStop.leader === 'middleDot') {
              extraStyles += `border-bottom: 1px dotted black; margin-bottom: 2px;`;
            } else if (tabStop.leader === 'underscore') {
              extraStyles += `border-bottom: 1px solid black;`;
            }
          }
        }
      }

      if (!tabWidth || tabWidth < 1) {
        tabWidth = defaultTabDistance - ((currentWidth % defaultLineLength) % defaultTabDistance);
        if (tabWidth === 0) {
          tabWidth = defaultTabDistance;
        }
      }

      nodeWidthCache[pos] = tabWidth; // Update width with final tab width - important for subsequent tabs.

      const tabHeight = calcTabHeight($pos);

      decorations.push(
        Decoration.node(pos, pos + node.nodeSize, {
          style: `width: ${tabWidth}px; height: ${tabHeight};${extraStyles}`,
        }),
      );
    }
  });
  return decorations;
};

function calcNodeWidth(domSerializer, node, view, oldPos) {
  // Create dom node of node. Then calculate width.
  const oldDomNode = view.nodeDOM(oldPos);
  const styleReference = oldDomNode ? (oldDomNode.nodeName === '#text' ? oldDomNode.parentNode : oldDomNode) : view.dom;
  const temp = document.createElement('div');
  const style = window.getComputedStyle(styleReference);
  // Copy relevant styles
  temp.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        white-space: nowrap;
        font-family: ${style.fontFamily};
        font-size: ${style.fontSize};
        font-weight: ${style.fontWeight};
        font-style: ${style.fontStyle};
        letter-spacing: ${style.letterSpacing};
        word-spacing: ${style.wordSpacing};
        text-transform: ${style.textTransform};
        display: inline-block;
    `;

  const domNode = domSerializer.serializeNode(node);

  temp.appendChild(domNode);
  document.body.appendChild(temp);

  const width = temp.offsetWidth;
  document.body.removeChild(temp);

  return width;
}

function calcChildNodesWidth(
  parent,
  parentPos,
  startIndex,
  endIndex,
  domSerializer,
  view,
  invertMapping,
  nodeWidthCache,
) {
  let pos = parentPos;
  let width = 0;
  for (let i = 0; i < endIndex; i++) {
    const node = parent.child(i);
    if (i >= startIndex) {
      if (!nodeWidthCache[pos]) {
        nodeWidthCache[pos] = calcNodeWidth(domSerializer, node, view, invertMapping.map(pos));
      }
      width += nodeWidthCache[pos];
    }
    pos += node.nodeSize;

    // TODO: This assumes no space between inline sibling nodes.
  }
  return width;
}

function calcTabHeight(pos) {
  const ptToPxRatio = 1.333;
  const defaultFontSize = 16;
  const defaultLineHeight = 1.1;

  const blockParent = pos.node(1);
  const parentTextStyleMark = blockParent.firstChild.marks.find((mark) => mark.type.name === 'textStyle');

  const fontSize = parseInt(parentTextStyleMark?.attrs.fontSize) * ptToPxRatio || defaultFontSize;

  return `${fontSize * defaultLineHeight}px`;
}
