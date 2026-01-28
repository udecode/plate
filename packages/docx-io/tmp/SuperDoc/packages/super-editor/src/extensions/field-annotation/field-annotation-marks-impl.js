import { Node, Attribute } from '@core/index.js';
import { FieldAnnotationView } from './FieldAnnotationView.js';
import { FieldAnnotationPlugin } from './FieldAnnotationPlugin.js';
import { findFieldAnnotationsByFieldId, getAllFieldAnnotations } from './fieldAnnotationHelpers/index.js';
import { toHex } from 'color2k';

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
      },
      annotationClass,
      annotationContentClass,
      types: ['text', 'image', 'signature', 'checkbox', 'html', 'link'], // annotation types
      defaultType: 'text',
      borderColor: '#b015b3',
      visibilityOptions: ['visible', 'hidden'],
      handleDropOutside: true,
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

      displayLabel: {
        default: 'Text field',
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
          if (!attrs.fieldColor) return {};
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

      extras: {
        default: {},
        rendered: false,
      },

      generatorIndex: {
        default: null,
        rendered: false,
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
        (pos, attrs = {}) =>
        ({ editor, dispatch, state, tr }) => {
          if (dispatch) {
            let { schema } = editor;

            let newPos = tr.mapping.map(pos);
            let $pos = state.doc.resolve(newPos);
            let currentMarks = $pos.marks();
            currentMarks = currentMarks.length ? [...currentMarks] : null;

            let node = schema.nodes[this.name].create({ ...attrs }, null, currentMarks);

            state.tr.insert(newPos, node);
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
            return commands.updateFieldAnnotationsAttributes([annotation], attrs);
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
            let currentNode = tr.doc.nodeAt(pos);

            if (node.attrs.fieldId === currentNode.attrs.fieldId) {
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

      deleteFieldAnnotation:
        (annotation) =>
        ({ dispatch, tr }) => {
          if (!annotation) {
            return true;
          }

          if (dispatch) {
            let { pos, node } = annotation;
            tr.delete(pos, node.nodeSize);
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
