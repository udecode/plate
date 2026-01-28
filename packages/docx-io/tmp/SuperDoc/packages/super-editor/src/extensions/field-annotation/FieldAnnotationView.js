import { Attribute } from '@core/index.js';
import { NodeSelection } from 'prosemirror-state';

export class FieldAnnotationView {
  editor;

  node;

  decorations;

  getPos;

  htmlAttributes;

  dom;

  annotationClass;

  annotationContentClass;

  borderColor;

  constructor(options) {
    this.editor = options.editor;
    this.node = options.node;
    this.decorations = options.decorations;
    this.getPos = options.getPos;

    this.htmlAttributes = options.htmlAttributes;
    this.annotationClass = options.annotationClass;
    this.annotationContentClass = options.annotationContentClass;
    this.borderColor = options.borderColor;

    this.handleAnnotationClick = this.handleAnnotationClick.bind(this);
    this.handleAnnotationDoubleClick = this.handleAnnotationDoubleClick.bind(this);
    this.handleSelectionUpdate = this.handleSelectionUpdate.bind(this);

    this.buildView();
    this.attachEventListeners();
  }

  buildView() {
    let { type } = this.node.attrs;

    let handlers = {
      text: (...args) => this.buildTextView(...args),
      image: (...args) => this.buildImageView(...args),
      signature: (...args) => this.buildSignatureView(...args),
      checkbox: (...args) => this.buildCheckboxView(...args),
      html: (...args) => this.buildHTMLView(...args),
      link: (...args) => this.buildLinkView(...args),
      default: (...args) => this.buildTextView(...args),
    };

    let buildHandler = handlers[type] ?? handlers.default;

    buildHandler();
  }

  buildTextView() {
    let { displayLabel } = this.node.attrs;

    let { annotation } = this.#createAnnotation({
      displayLabel,
    });

    this.dom = annotation;
  }

  buildImageView() {
    let { displayLabel, imageSrc } = this.node.attrs;

    let { annotation, content } = this.#createAnnotation();

    if (imageSrc) {
      let img = document.createElement('img');
      img.src = imageSrc;
      img.alt = displayLabel;

      img.style.height = 'auto';
      img.style.maxWidth = '100%';
      img.style.pointerEvents = 'none';
      img.style.verticalAlign = 'middle';

      content.append(img);

      annotation.style.display = 'inline-block';
      content.style.display = 'inline-block';
    } else {
      content.textContent = displayLabel;
    }

    this.dom = annotation;
  }

  buildSignatureView() {
    let { displayLabel, imageSrc } = this.node.attrs;

    displayLabel = displayLabel || 'Signature';

    let { annotation, content } = this.#createAnnotation();

    if (imageSrc) {
      let img = document.createElement('img');
      img.src = imageSrc;
      img.alt = displayLabel;

      img.style.height = 'auto';
      img.style.maxWidth = '100%';
      img.style.maxHeight = '28px';
      img.style.pointerEvents = 'none';
      img.style.verticalAlign = 'middle';

      content.append(img);

      annotation.style.display = 'inline-block';
      content.style.display = 'inline-block';
    } else {
      content.textContent = displayLabel;
    }

    this.dom = annotation;
  }

  buildCheckboxView() {
    let { displayLabel } = this.node.attrs;

    let { annotation } = this.#createAnnotation({
      displayLabel,
    });

    this.dom = annotation;
  }

  buildHTMLView() {
    let { displayLabel, rawHtml } = this.node.attrs;

    if (!this.editor.options.isHeadless && !!rawHtml) {
      try {
        const tempDiv = document.createElement('div');
        const childEditor = this.editor.createChildEditor({
          element: tempDiv,
          html: rawHtml,
        });
        rawHtml = childEditor.view.dom.innerHTML;
      } catch (error) {
        console.warn('Error parsing HTML in FieldAnnotationView:', error);
      }
    }

    let { annotation, content } = this.#createAnnotation();

    if (rawHtml) {
      content.innerHTML = rawHtml.trim();

      annotation.style.display = 'inline-block';
      content.style.display = 'inline-block';
    } else {
      content.textContent = displayLabel;
    }

    this.dom = annotation;
  }

  buildLinkView() {
    let { displayLabel, linkUrl } = this.node.attrs;

    let { annotation, content } = this.#createAnnotation();

    if (linkUrl) {
      let link = document.createElement('a');

      link.href = linkUrl;
      link.target = '_blank';
      link.textContent = linkUrl;
      link.style.textDecoration = 'none';

      content.append(link);

      content.style.pointerEvents = 'all';
    } else {
      content.textContent = displayLabel;
    }

    this.dom = annotation;
  }

  #createAnnotation({ displayLabel } = {}) {
    let { highlighted } = this.node.attrs;

    let annotation = document.createElement('span');
    annotation.classList.add(this.annotationClass);

    let content = document.createElement('span');
    content.classList.add(this.annotationContentClass);
    content.style.pointerEvents = 'none';
    content.contentEditable = 'false';

    if (displayLabel) {
      content.textContent = displayLabel;
    }

    annotation.append(content);

    let omitHighlight = highlighted === false;
    let styles = [
      `border: 2px solid ${this.borderColor}`,
      `border-radius: 2px`,
      `padding: 1px 2px`,
      `box-sizing: border-box`,
    ];

    let annotationStyle = styles.join('; ');

    let mergedAttrs = Attribute.mergeAttributes(this.htmlAttributes, {
      style: omitHighlight ? '' : annotationStyle,
    });

    for (let [key, value] of Object.entries(mergedAttrs)) {
      if (key === 'style') {
        annotation.style.cssText = value;
      } else {
        annotation.setAttribute(key, value);
      }
    }

    return {
      annotation,
      content,
    };
  }

  attachEventListeners() {
    this.dom.addEventListener('click', this.handleAnnotationClick);
    this.dom.addEventListener('dblclick', this.handleAnnotationDoubleClick);
    this.editor.on('selectionUpdate', this.handleSelectionUpdate);
  }

  removeEventListeners() {
    this.dom.removeEventListener('click', this.handleAnnotationClick);
    this.dom.removeEventListener('dblclick', this.handleAnnotationDoubleClick);
    this.editor.off('selectionUpdate', this.handleSelectionUpdate);
  }

  handleSelectionUpdate({ editor }) {
    if (!this.editor.isEditable) {
      return;
    }

    let { selection } = editor.state;

    if (selection instanceof NodeSelection) {
      let currentNode = selection.node;

      if (this.node.eq(currentNode)) {
        this.editor.emit('fieldAnnotationSelected', {
          editor: this.editor,
          node: this.node,
          nodePos: this.getPos(),
          target: this.dom,
        });
      }
    }
  }

  handleAnnotationClick(event) {
    if (!this.editor.isEditable) {
      return;
    }

    this.editor.emit('fieldAnnotationClicked', {
      editor: this.editor,
      node: this.node,
      nodePos: this.getPos(),
      event,
      currentTarget: event.currentTarget,
    });
  }

  handleAnnotationDoubleClick(event) {
    if (!this.editor.isEditable) {
      return;
    }

    this.editor.emit('fieldAnnotationDoubleClicked', {
      editor: this.editor,
      node: this.node,
      nodePos: this.getPos(),
      event,
      currentTarget: event.currentTarget,
    });
  }

  stopEvent(event) {
    if (!this.editor.isEditable) {
      event.preventDefault();
      return true;
    }

    return false;
  }

  // Can be used to manually update the NodeView.
  // Otherwise the NodeView is recreated.
  update() {
    return false;
  }

  ignoreMutation() {
    // https://github.com/ueberdosis/tiptap/blob/main/packages/core/src/NodeView.ts
    // a leaf/atom node is like a black box for ProseMirror
    // and should be fully handled by the node view
    return true;
  }

  destroy() {
    this.removeEventListeners();
  }

  updateAttributes(attributes) {
    this.editor.commands.command(({ tr }) => {
      tr.setNodeMarkup(this.getPos(), undefined, {
        ...this.node.attrs,
        ...attributes,
      });
      return true;
    });
  }
}
