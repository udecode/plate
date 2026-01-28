import { Node, Attribute } from '@core/index.js';
import { FieldAnnotationView } from './FieldAnnotationView.js';
import { FieldAnnotationPlugin } from './FieldAnnotationPlugin.js';
import {
  findFieldAnnotationsByFieldId,
  getAllFieldAnnotations,
  findFieldAnnotationsBetween,
} from './fieldAnnotationHelpers/index.js';
import { toHex } from 'color2k';
import { parseSizeUnit, minMax } from '@core/utilities/index.js';
import { NodeSelection, Selection } from 'prosemirror-state';
import { generateDocxRandomId } from '../../core/helpers/index.js';
import { commands as cleanupCommands } from './cleanup-commands/index.js';

export const fieldAnnotationName = 'fieldAnnotation';
export const annotationClass = 'annotation';
export const annotationContentClass = 'annotation-content';

export const FieldAnnotation = Node.create({
  name: 'fieldAnnotation',

  group: 'inline',

  inline: true,

  atom: true,

  draggable: true,

  selectable: true,

  addOptions() {
    return {
      htmlAttributes: {
        class: annotationClass,
        'aria-label': 'Field annotation node',
      },
      annotationClass,
      annotationContentClass,
      types: ['text', 'image', 'signature', 'checkbox', 'html', 'link'], // annotation types
      defaultType: 'text',
      borderColor: '#b015b3',
      visibilityOptions: ['visible', 'hidden'],
      handleDropOutside: true,

      /// for y-prosemirror support
      toggleFormatNames: ['bold', 'italic', 'underline'],
    };
  },

  addAttributes() {
    return {
      type: {
        default: this.options.defaultType,
        parseDOM: (elem) => elem.getAttribute('data-type'),
        renderDOM: (attrs) => {
          if (!attrs.type) return {};
          return {
            'data-type': attrs.type,
          };
        },
      },

      defaultDisplayLabel: {
        default: '',
        parseDOM: (elem) => elem.getAttribute('data-default-display-label'),
        renderDOM: (attrs) => {
          if (!attrs.defaultDisplayLabel) return {};
          return {
            'data-default-display-label': attrs.defaultDisplayLabel,
          };
        },
      },

      displayLabel: {
        default: '',
        parseDOM: (elem) => elem.getAttribute('data-display-label'),
        renderDOM: (attrs) => {
          if (!attrs.displayLabel) return {};
          return {
            'data-display-label': attrs.displayLabel,
          };
        },
      },

      imageSrc: {
        default: null,
        rendered: false,
        parseDOM: (elem) => {
          let img = elem.querySelector('img');
          return img?.getAttribute('src') || null;
        },
      },

      rawHtml: {
        default: null,
        parseDOM: (elem) => {
          try {
            const isHtmlType = elem.getAttribute('data-type') === 'html';
            if (!isHtmlType) return null;
            return JSON.parse(elem.getAttribute('data-raw-html'));
          } catch (e) {
            console.warn('Paste parse error', e);
          }
          return null;
        },
        renderDOM: (attrs) => {
          if (!attrs.rawHtml) return {};
          return {
            'data-raw-html': JSON.stringify(attrs.rawHtml),
          };
        },
      },

      linkUrl: {
        default: null,
        rendered: false,
        parseDOM: (elem) => {
          let link = elem.querySelector('a');
          return link?.getAttribute('href') || null;
        },
      },

      fieldId: {
        default: null,
        parseDOM: (elem) => elem.getAttribute('data-field-id'),
        renderDOM: (attrs) => {
          if (!attrs.fieldId) return {};
          return {
            'data-field-id': attrs.fieldId,
          };
        },
      },

      fieldType: {
        default: null,
        parseDOM: (elem) => elem.getAttribute('data-field-type'),
        renderDOM: (attrs) => {
          if (!attrs.fieldType) return {};
          return {
            'data-field-type': attrs.fieldType,
          };
        },
      },

      fieldColor: {
        default: '#980043',
        parseDOM: (elem) => elem.getAttribute('data-field-color') || elem.style.backgroundColor || null,
        renderDOM: (attrs) => {
          if (!attrs.fieldColor || attrs.fieldColor == 'None') return {};
          let hexColor = toHex(attrs.fieldColor);
          let isSixValueSyntax = hexColor.slice(1).length === 6;

          if (isSixValueSyntax) {
            hexColor = `${hexColor}33`;
          }

          let omitHighlight = attrs.highlighted === false;

          if (omitHighlight) {
            return {
              'data-field-color': hexColor,
            };
          }

          return {
            'data-field-color': hexColor,
            style: `background-color: ${hexColor}`,
          };
        },
      },

      hidden: {
        default: false,
        parseDOM: (elem) => {
          let hasHiddenAttr = elem.hasAttribute('hidden');
          let hasDisplayNoneStyle = elem.style.display === 'none';
          let isHidden = hasHiddenAttr || hasDisplayNoneStyle;
          return isHidden;
        },
        renderDOM: (attrs) => {
          if (!attrs.hidden) return {};
          return {
            style: 'display: none',
          };
        },
      },

      visibility: {
        default: 'visible',
        parseDOM: (el) => {
          let visibility = el.style.visibility || 'visible';
          let containsVisibility = this.options.visibilityOptions.includes(visibility);
          return containsVisibility ? visibility : 'visible';
        },
        renderDOM: (attrs) => {
          if (!attrs.visibility || attrs.visibility === 'visible') return {};
          return { style: `visibility: ${attrs.visibility}` };
        },
      },

      highlighted: {
        default: true,
        rendered: false,
      },

      multipleImage: {
        default: false,
        parseDOM: (elem) => elem.getAttribute('data-multiple-image'),
        renderDOM: (attrs) => {
          if (!attrs.multipleImage) return {};
          return {
            'data-multiple-image': attrs.multipleImage,
          };
        },
      },

      size: {
        default: null,
        renderDOM: ({ size }) => {
          if (!size || !size.width) return {};
          const style = `width: ${size.width}px; height: ${size.height}px; overflow: hidden;`;
          return { style };
        },
      },

      extras: {
        default: {},
        rendered: false,
      },

      /// Formatting attrs for y-prosemirror support.
      bold: {
        default: false,
        parseDOM: (elem) => elem.getAttribute('data-bold') === 'true',
        renderDOM: (attrs) => {
          if (!attrs.bold) return {};
          return {
            'data-bold': 'true',
            style: 'font-weight: bold',
          };
        },
      },

      italic: {
        default: false,
        parseDOM: (elem) => elem.getAttribute('data-italic') === 'true',
        renderDOM: (attrs) => {
          if (!attrs.italic) return {};
          return {
            'data-italic': 'true',
            style: 'font-style: italic',
          };
        },
      },

      underline: {
        default: false,
        parseDOM: (elem) => elem.getAttribute('data-underline') === 'true',
        renderDOM: (attrs) => {
          if (!attrs.underline) return {};
          return {
            'data-underline': 'true',
            style: 'text-decoration: underline',
          };
        },
      },

      fontFamily: {
        default: null,
        parseDOM: (elem) => elem.getAttribute('data-font-family') || elem.style.fontFamily || null,
        renderDOM: (attrs) => {
          if (!attrs.fontFamily) return {};
          return {
            'data-font-family': attrs.fontFamily,
            style: `font-family: ${attrs.fontFamily}`,
          };
        },
      },

      fontSize: {
        default: null,
        parseDOM: (elem) => elem.getAttribute('data-font-size') || elem.style.fontSize || null,
        renderDOM: (attrs) => {
          if (!attrs.fontSize) return {};
          let [value, unit] = parseSizeUnit(attrs.fontSize);
          if (Number.isNaN(value)) return {};
          unit = unit ? unit : 'pt';
          let fontSize = `${value}${unit}`;
          return {
            'data-font-size': fontSize,
            style: `font-size: ${fontSize}`,
          };
        },
      },

      textHighlight: {
        default: null,
        parseDOM: (element) => element.getAttribute('data-text-highlight'),
        renderDOM: (attrs) => {
          if (!attrs.textHighlight) return {};
          return {
            'data-text-highlight': attrs.textHighlight,
            // takes precedence over the fieldColor.
            style: `background-color: ${attrs.textHighlight} !important`,
          };
        },
      },

      textColor: {
        default: null,
        parseDOM: (element) => element.getAttribute('data-text-color'),
        renderDOM: (attrs) => {
          if (!attrs.textColor) return {};
          return {
            'data-text-color': attrs.textColor,
            style: `color: ${attrs.textColor}`,
          };
        },
      },
      /// Formatting attrs - end.

      generatorIndex: {
        rendered: false,
        default: null,
      },

      hash: {
        rendered: false,
        default: null,
      },
    };
  },

  parseDOM() {
    return [
      {
        tag: `span.${this.options.annotationClass}`,
        priority: 60,
      },
    ];
  },

  renderDOM({ node, htmlAttributes }) {
    let { type, displayLabel, imageSrc, linkUrl } = node.attrs;

    let textRenderer = () => {
      return [
        'span',
        Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes),
        [
          'span',
          {
            class: `${this.options.annotationContentClass}`,
          },
          displayLabel,
        ],
      ];
    };

    let imageRenderer = () => {
      let contentRenderer = () => {
        if (!imageSrc) return displayLabel;
        return [
          'img',
          {
            src: imageSrc,
            alt: displayLabel,
          },
        ];
      };

      return [
        'span',
        Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes),
        [
          'span',
          {
            class: `${this.options.annotationContentClass}`,
          },
          contentRenderer(),
        ],
      ];
    };

    let linkRenderer = () => {
      let contentRenderer = () => {
        if (!linkUrl) return displayLabel;
        return [
          'a',
          {
            href: linkUrl,
            target: '_blank',
          },
          linkUrl,
        ];
      };

      return [
        'span',
        Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes),
        [
          'span',
          {
            class: `${this.options.annotationContentClass}`,
          },
          contentRenderer(),
        ],
      ];
    };

    let renderers = {
      text: () => textRenderer(),
      image: () => imageRenderer(),
      signature: () => imageRenderer(),
      checkbox: () => textRenderer(),
      html: () => textRenderer(),
      link: () => linkRenderer(),
      default: () => textRenderer(),
    };

    let renderer = renderers[type] ?? renderers.default;

    return renderer();
  },

  addCommands() {
    const annotationTypes = this.options.types;

    return {
      /**
       * Add field annotation.
       * @param pos The position in the doc.
       * @param attrs The attributes.
       * @example
       * editor.commands.addFieldAnnotation(0, {
       *  displayLabel: 'Enter your info',
       *  fieldId: `123`,
       *  fieldType: 'TEXTINPUT',
       *  fieldColor: '#980043',
       * })
       */
      addFieldAnnotation:
        (pos, attrs = {}, editorFocus = false) =>
        ({ editor, dispatch, state, tr }) => {
          if (dispatch) {
            let { schema } = editor;

            let newPos = tr.mapping.map(pos);
            let $pos = state.doc.resolve(newPos);
            let currentMarks = $pos.marks();
            currentMarks = currentMarks.length ? [...currentMarks] : null;

            /// for y-prosemirror support - attrs instead marks
            let formatAttrs = getFormatAttrsFromMarks(currentMarks);
            ///

            let defaultDisplayLabel = attrs.defaultDisplayLabel ? attrs.defaultDisplayLabel : attrs.displayLabel || '';

            let node = schema.nodes[this.name].create(
              {
                ...attrs,
                ...formatAttrs,
                defaultDisplayLabel,
                hash: attrs.hash || generateDocxRandomId(4),
              },
              null,
              null,
            );

            state.tr.insert(newPos, node).setSelection(Selection.near(tr.doc.resolve(newPos + node.nodeSize)));

            if (editorFocus) {
              this.editor.view.focus();
            }
          }

          return true;
        },

      addFieldAnnotationAtSelection:
        (attrs = {}, editorFocus = false) =>
        ({ state, commands }) => {
          const { from } = state.selection;
          return commands.addFieldAnnotation(from, attrs, editorFocus);
        },

      /**
       * Replace field annotation.
       * @param fieldsArray array of fields with attrs to add as annotation.
       * @example
       * editor.commands.replaceWithFieldAnnotation([
       *  from: 20,
       *  to: 45,
       *  attrs: {
       *    fieldType: 'TEXTINPUT'
       *    fieldColor: '#980043'
       *  }
       * ])
       */
      replaceWithFieldAnnotation:
        (fieldsArray) =>
        ({ editor, dispatch, tr }) => {
          if (!dispatch) return true;

          fieldsArray.forEach((annotation) => {
            let { from, to, attrs } = annotation;
            let { schema } = editor;

            let newPosFrom = tr.mapping.map(from);
            let newPosTo = tr.mapping.map(to);

            let defaultDisplayLabel = attrs.defaultDisplayLabel ? attrs.defaultDisplayLabel : attrs.displayLabel || '';

            attrs.hash = generateDocxRandomId(4);

            let node = schema.nodes[this.name].create(
              {
                ...attrs,
                defaultDisplayLabel,
                hash: attrs.hash || generateDocxRandomId(4),
              },
              null,
              null,
            );

            tr.replaceWith(newPosFrom, newPosTo, node);
          });

          return true;
        },

      /**
       * Replace annotations with a label (as text node) in selection.
       * @param options Additional options.
       * @example
       * editor.commands.replaceFieldAnnotationsWithLabelInSelection()
       */
      replaceFieldAnnotationsWithLabelInSelection:
        (options = {}) =>
        ({ commands }) => {
          return commands.replaceFieldAnnotationsWithLabel(null, {
            ...options,
            isInSelection: true,
          });
        },

      /**
       * Replace annotations with a label (as text node).
       * @param fieldIdOrArray The field ID or array of field IDs.
       * @param options.isInSelection Find in selection instead of field IDs.
       * @param options.addToHistory Add to history or not.
       * @param options.types Annotation types to replace.
       * @example
       * editor.commands.replaceFieldAnnotationsWithLabel(['1', '2'])
       */
      replaceFieldAnnotationsWithLabel:
        (fieldIdOrArray, { isInSelection = false, addToHistory = false, types = annotationTypes } = {}) =>
        ({ dispatch, state, tr }) => {
          let { from, to } = state.selection;

          let annotations = isInSelection
            ? findFieldAnnotationsBetween(from, to, state.doc)
            : findFieldAnnotationsByFieldId(fieldIdOrArray, state);

          annotations = types.length ? annotations.filter(({ node }) => types.includes(node.attrs.type)) : annotations;

          if (!annotations.length) {
            return true;
          }

          if (!addToHistory) {
            tr.setMeta('addToHistory', false);
          }

          if (dispatch) {
            annotations.forEach((annotation) => {
              let { pos, node } = annotation;

              let newPosFrom = tr.mapping.map(pos);
              let newPosTo = tr.mapping.map(pos + node.nodeSize);

              let currentNode = tr.doc.nodeAt(newPosFrom);
              let nodeEqual = node.attrs.fieldId === currentNode?.attrs?.fieldId;

              let $newPosFrom = tr.doc.resolve(newPosFrom);
              let currentMarks = $newPosFrom.marks();
              currentMarks = currentMarks.length ? [...currentMarks] : null;

              if (nodeEqual) {
                // empty text nodes are not allowed.
                let label = node.attrs.displayLabel || ' ';
                let textNode = state.schema.text(label, currentMarks);
                tr.replaceWith(newPosFrom, newPosTo, textNode);
              }
            });
          }

          return true;
        },

      /**
       * Resets all annotations to default values.
       * @example
       * editor.commands.resetFieldAnnotations()
       */
      resetFieldAnnotations:
        () =>
        ({ dispatch, state, tr }) => {
          let annotations = getAllFieldAnnotations(state);

          if (!annotations.length) {
            return true;
          }

          // Specify that we are updating annotations
          // so they are not detected as deletions.
          tr.setMeta('fieldAnnotationUpdate', true);

          if (dispatch) {
            annotations.forEach(({ pos, node }) => {
              let newPos = tr.mapping.map(pos);
              let currentNode = tr.doc.nodeAt(newPos);
              let nodeEqual = node.attrs.fieldId === currentNode?.attrs?.fieldId;

              if (nodeEqual) {
                // if defaultDisplayLabel is not defined then we fallback to displayLabel.
                let displayLabel = node.attrs.defaultDisplayLabel || node.attrs.displayLabel || '';

                tr.setNodeMarkup(newPos, undefined, {
                  ...node.attrs,
                  // reset displayLabel to default.
                  displayLabel,
                  // reset attrs for specific types.
                  imageSrc: null,
                  rawHtml: null,
                  linkUrl: null,
                  hash: null,
                });
              }
            });
          }

          return true;
        },

      /**
       * Update annotations associated with a field.
       * @param fieldIdOrArray The field ID or array of field IDs.
       * @param attrs The attributes.
       * @example
       * editor.commands.updateFieldAnnotations('123', {
       *  displayLabel: 'Updated!',
       * })
       * @example
       * editor.commands.updateFieldAnnotations(['123', '456'], {
       *  displayLabel: 'Updated!',
       * })
       */
      updateFieldAnnotations:
        (fieldIdOrArray, attrs = {}) =>
        ({ dispatch, state, commands }) => {
          let annotations = findFieldAnnotationsByFieldId(fieldIdOrArray, state);

          if (!annotations.length) {
            return true;
          }

          if (dispatch) {
            return commands.updateFieldAnnotationsAttributes(annotations, attrs);
          }

          return true;
        },

      /**
       * Update particular annotation's attributes.
       * @param annotation field annotation node to be updated.
       * @param attrs The attributes.
       *
       * Used for a case when multiple annotations for one input presented
       */
      updateFieldAnnotation:
        (annotation, attrs = {}) =>
        ({ dispatch, commands }) => {
          if (!annotation) {
            return true;
          }

          if (dispatch) {
            commands.updateFieldAnnotationsAttributes([annotation], attrs);

            if (this.editor.options.pagination) {
              setTimeout(() => {
                const newTr = this.editor.view.state.tr;
                newTr.setMeta('forceUpdatePagination', true);
                this.editor.view.dispatch(newTr);
              }, 50);
            }
            return true;
          }

          return true;
        },

      /**
       * Update the attributes of annotations.
       * @param annotations The annotations array [{pos, node}].
       * @param attrs The attributes object.
       */
      updateFieldAnnotationsAttributes:
        (annotations, attrs = {}) =>
        ({ dispatch, tr }) => {
          if (!dispatch) return true;

          // Specify that we are updating annotations
          // so they are not detected as deletions.
          tr.setMeta('fieldAnnotationUpdate', true);

          annotations.forEach((annotation) => {
            let { pos, node } = annotation;
            let newPos = tr.mapping.map(pos);
            let currentNode = tr.doc.nodeAt(newPos);
            let nodeEqual = node.attrs.fieldId === currentNode?.attrs?.fieldId;
            if (nodeEqual) {
              tr.setNodeMarkup(newPos, undefined, {
                ...node.attrs,
                ...attrs,
              });
            }
          });

          return true;
        },

      /**
       * Delete annotations associated with a field.
       * @param fieldIdOrArray The field ID or array of field IDs.
       * @example
       * editor.commands.deleteFieldAnnotations('123')
       * @example
       * editor.commands.deleteFieldAnnotations(['123', '456'])
       */
      deleteFieldAnnotations:
        (fieldIdOrArray) =>
        ({ dispatch, state, tr }) => {
          let annotations = findFieldAnnotationsByFieldId(fieldIdOrArray, state);

          if (!annotations.length) {
            return true;
          }

          if (dispatch) {
            annotations.forEach((annotation) => {
              let { pos, node } = annotation;
              let newPosFrom = tr.mapping.map(pos); // map the position between transaction steps
              let newPosTo = tr.mapping.map(pos + node.nodeSize);

              let currentNode = tr.doc.nodeAt(newPosFrom);
              if (node.eq(currentNode)) {
                tr.delete(newPosFrom, newPosTo);
              }
            });
          }

          return true;
        },

      deleteFieldAnnotationsByNode:
        (annotations) =>
        ({ dispatch, tr }) => {
          if (!annotations.length) {
            return true;
          }

          if (dispatch) {
            annotations.forEach((annotation) => {
              let { pos, node } = annotation;
              let newPosFrom = tr.mapping.map(pos); // map the position between transaction steps
              let newPosTo = tr.mapping.map(pos + node.nodeSize);

              let currentNode = tr.doc.nodeAt(newPosFrom);
              if (node.eq(currentNode)) {
                tr.delete(newPosFrom, newPosTo);
              }
            });
          }

          return true;
        },

      deleteFieldAnnotation:
        (annotation) =>
        ({ dispatch, tr }) => {
          if (!annotation) {
            return true;
          }

          if (dispatch) {
            let { pos, node } = annotation;
            let newPosFrom = tr.mapping.map(pos);
            let newPosTo = tr.mapping.map(pos + node.nodeSize);

            let currentNode = tr.doc.nodeAt(newPosFrom);
            if (node.eq(currentNode)) {
              tr.delete(newPosFrom, newPosTo);
            }
          }

          return true;
        },

      /**
       * Delete a portion of annotations associated with a field.
       * @param fieldIdOrArray The field ID or array of field IDs.
       * @param end index at which to end extraction
       * @example
       * editor.commands.sliceFieldAnnotations('123', 5) - will remove a portion of annotations array starting from index 6
       * @example
       * editor.commands.sliceFieldAnnotations(['123', '456'], 5)
       */
      sliceFieldAnnotations:
        (fieldIdOrArray, end) =>
        ({ dispatch, state, tr }) => {
          let annotations = findFieldAnnotationsByFieldId(fieldIdOrArray, state);

          if (!annotations.length) {
            return true;
          }

          if (dispatch) {
            annotations.forEach((annotation, index) => {
              if (index >= end) {
                let { pos, node } = annotation;
                let newPosFrom = tr.mapping.map(pos); // map the position between transaction steps
                let newPosTo = tr.mapping.map(pos + node.nodeSize);

                let currentNode = tr.doc.nodeAt(newPosFrom);
                if (node.eq(currentNode)) {
                  tr.delete(newPosFrom, newPosTo);
                }
              }
            });
          }

          return true;
        },

      /**
       * Set `hidden` for annotations matching predicate.
       * Other annotations become unhidden.
       * @param predicate The predicate function.
       * @param unsetFromOthers If should unset hidden from other annotations.
       * @example
       * editor.commands.setFieldAnnotationsHiddenByCondition((node) => {
       *   let ids = ['111', '222', '333'];
       *   return ids.includes(node.attrs.fieldId);
       * })
       */
      setFieldAnnotationsHiddenByCondition:
        (predicate = () => false, unsetFromOthers = false) =>
        ({ dispatch, state, chain }) => {
          let annotations = getAllFieldAnnotations(state);

          if (!annotations.length) {
            return true;
          }

          if (dispatch) {
            let otherAnnotations = [];
            let matchedAnnotations = annotations.filter((annotation) => {
              if (predicate(annotation.node)) return annotation;
              else otherAnnotations.push(annotation);
            });

            if (unsetFromOthers) {
              return chain()
                .updateFieldAnnotationsAttributes(matchedAnnotations, { hidden: true })
                .updateFieldAnnotationsAttributes(otherAnnotations, { hidden: false })
                .run();
            } else {
              return chain().updateFieldAnnotationsAttributes(matchedAnnotations, { hidden: true }).run();
            }
          }

          return true;
        },

      /**
       * Unset `hidden` for all annotations.
       * @example
       * editor.commands.unsetFieldAnnotationsHidden()
       */
      unsetFieldAnnotationsHidden:
        () =>
        ({ dispatch, state, commands }) => {
          let annotations = getAllFieldAnnotations(state);

          if (!annotations.length) {
            return true;
          }

          if (dispatch) {
            return commands.updateFieldAnnotationsAttributes(annotations, { hidden: false });
          }

          return true;
        },

      /**
       * Set `visibility` for all annotations (without changing the layout).
       * @param visibility The visibility value (visible, hidden).
       * @example
       * editor.commands.setFieldAnnotationsVisibility('visible');
       * @example
       * editor.commands.setFieldAnnotationsVisibility('hidden');
       */
      setFieldAnnotationsVisibility:
        (visibility = 'visible') =>
        ({ dispatch, state, commands }) => {
          let annotations = getAllFieldAnnotations(state);

          if (!annotations.length) {
            return true;
          }

          let containsVisibility = this.options.visibilityOptions.includes(visibility);

          if (!containsVisibility) {
            return false;
          }

          if (dispatch) {
            return commands.updateFieldAnnotationsAttributes(annotations, {
              visibility,
            });
          }

          return true;
        },

      /**
       * Set `highlighted` for annotations matching predicate.
       * @param predicate The predicate function.
       * @param highlighted The highlighted attribute.
       * @example
       * editor.commands.setFieldAnnotationsHighlighted((node) => {
       *   let ids = ['111', '222', '333'];
       *   return ids.includes(node.attrs.fieldId);
       * }, false)
       * @example Set for all annotations.
       * editor.commands.setFieldAnnotationsHighlighted(() => true, false)
       * editor.commands.setFieldAnnotationsHighlighted(() => true, true)
       */
      setFieldAnnotationsHighlighted:
        (predicate = () => false, highlighted = true) =>
        ({ dispatch, state, commands }) => {
          let annotations = getAllFieldAnnotations(state);

          if (!annotations.length) {
            return true;
          }

          if (dispatch) {
            let matchedAnnotations = annotations.filter((annotation) => {
              if (predicate(annotation.node)) return annotation;
            });

            return commands.updateFieldAnnotationsAttributes(matchedAnnotations, {
              highlighted,
            });
          }

          return true;
        },

      /// Formatting commands for y-prosemirror support.
      toggleFieldAnnotationsFormat:
        (name, setSelection = false) =>
        ({ dispatch, tr, state, commands }) => {
          let formats = this.options.toggleFormatNames;

          if (!formats.includes(name)) {
            return false;
          }

          let { from, to, node } = state.selection;
          let annotations = findFieldAnnotationsBetween(from, to, state.doc);

          if (!annotations.length) {
            return true;
          }

          if (dispatch) {
            annotations.forEach((annotation) => {
              commands.updateFieldAnnotationsAttributes([annotation], {
                [name]: !annotation.node.attrs[name],
              });
            });

            if (setSelection && node?.type.name === this.name) {
              tr.setSelection(NodeSelection.create(tr.doc, from));
            }
          }

          return true;
        },

      setFieldAnnotationsFontFamily:
        (fontFamily, setSelection = false) =>
        ({ dispatch, tr, state, commands }) => {
          let { from, to, node } = state.selection;
          let annotations = findFieldAnnotationsBetween(from, to, state.doc);

          if (!annotations.length) {
            return true;
          }

          if (dispatch) {
            annotations.forEach((annotation) => {
              commands.updateFieldAnnotationsAttributes([annotation], {
                fontFamily,
              });
            });

            if (setSelection && node?.type.name === this.name) {
              tr.setSelection(NodeSelection.create(tr.doc, from));
            }
          }

          return true;
        },

      setFieldAnnotationsFontSize:
        (fontSize, setSelection = false) =>
        ({ dispatch, tr, state, commands }) => {
          let { from, to, node } = state.selection;
          let annotations = findFieldAnnotationsBetween(from, to, state.doc);

          if (!annotations.length) {
            return true;
          }

          let [value, unit] = parseSizeUnit(fontSize);
          let min = 8,
            max = 96,
            defaultUnit = 'pt';

          if (Number.isNaN(value)) {
            return false;
          }

          value = minMax(value, min, max);
          unit = unit ? unit : defaultUnit;

          if (dispatch) {
            annotations.forEach((annotation) => {
              commands.updateFieldAnnotationsAttributes([annotation], {
                fontSize: `${value}${unit}`,
              });
            });

            if (setSelection && node?.type.name === this.name) {
              tr.setSelection(NodeSelection.create(tr.doc, from));
            }
          }

          return true;
        },

      setFieldAnnotationsTextHighlight:
        (color, setSelection = false) =>
        ({ dispatch, tr, state, commands }) => {
          let { from, to, node } = state.selection;
          let annotations = findFieldAnnotationsBetween(from, to, state.doc);

          if (!annotations.length) {
            return true;
          }

          if (dispatch) {
            annotations.forEach((annotation) => {
              commands.updateFieldAnnotationsAttributes([annotation], {
                textHighlight: color,
              });
            });

            if (setSelection && node?.type.name === this.name) {
              tr.setSelection(NodeSelection.create(tr.doc, from));
            }
          }

          return true;
        },

      setFieldAnnotationsTextColor:
        (color, setSelection = false) =>
        ({ dispatch, tr, state, commands }) => {
          let { from, to, node } = state.selection;
          let annotations = findFieldAnnotationsBetween(from, to, state.doc);

          if (!annotations.length) {
            return true;
          }

          if (dispatch) {
            annotations.forEach((annotation) => {
              commands.updateFieldAnnotationsAttributes([annotation], {
                textColor: color,
              });
            });

            if (setSelection && node?.type.name === this.name) {
              tr.setSelection(NodeSelection.create(tr.doc, from));
            }
          }

          return true;
        },
      /// Formatting commands - end.

      // Clean up commands (after field deletion)
      ...cleanupCommands,
    };
  },

  addNodeView() {
    return (props) => {
      return new FieldAnnotationView({
        ...props,
        annotationClass: this.options.annotationClass,
        annotationContentClass: this.options.annotationContentClass,
        borderColor: this.options.borderColor,
      });
    };
  },

  addPmPlugins() {
    return [
      FieldAnnotationPlugin({
        editor: this.editor,
        annotationClass: this.options.annotationClass,
        handleDropOutside: this.options.handleDropOutside,
      }),
    ];
  },
});

/// for y-prosemirror support
function getFormatAttrsFromMarks(marks) {
  if (!marks) {
    return {};
  }

  let formatAttrs = {
    bold: false,
    italic: false,
    underline: false,
    fontFamily: null,
    fontSize: null,
  };

  if (marks && marks.length) {
    formatAttrs.bold = marks.some((mark) => mark.type.name === 'bold');
    formatAttrs.italic = marks.some((mark) => mark.type.name === 'italic');
    formatAttrs.underline = marks.some((mark) => mark.type.name === 'underline');

    let textStyle = marks.find((mark) => mark.type.name === 'textStyle');

    if (textStyle) {
      formatAttrs.fontFamily = textStyle.attrs.fontFamily ?? null;
      formatAttrs.fontSize = textStyle.attrs.fontSize ?? null;
    }
  }

  return formatAttrs;
}
///
