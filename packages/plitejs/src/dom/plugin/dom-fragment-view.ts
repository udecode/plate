import { readAuthoredFragmentView } from '../../core/authored-runtime';
import type { AnyEditor, Value } from '../../interfaces/editor';
import {
  closestShadowAware,
  containsShadowAware,
  isDOMElement,
} from '../utils/dom';
import { ELEMENT_TO_EDITOR } from '../utils/weak-maps';
import type { DOMEditor } from './dom-editor';
import { markDOMSyncMutationTarget } from './dom-sync-mutation-ownership';

const FRAGMENT_ELEMENTS = new WeakMap<
  HTMLElement,
  {
    authoredAuthor: string | null;
    authoredChange: string | null;
    contentEditable: string | null;
    editor: DOMEditor<any>;
    owners: Set<object>;
  }
>();
const FRAGMENT_VIEWS = new WeakMap<
  DOMEditor<any>,
  {
    editor: DOMEditor<any>;
    elements: Set<HTMLElement>;
    fragmentId: string;
    parent: DOMEditor<any>;
  }
>();
const PARENT_FRAGMENT_EDITORS = new WeakMap<
  DOMEditor<any>,
  Map<string, Set<DOMEditor<any>>>
>();
type RetainedDOMRegistration = {
  element: HTMLElement;
  changeId: string;
  root: string;
  dispose: () => void;
  fragmentId: string;
  parent: DOMEditor<any>;
};
const RETAINED_ELEMENTS = new WeakMap<HTMLElement, RetainedDOMRegistration>();
const PARENT_RETAINED_ELEMENTS = new WeakMap<
  DOMEditor<any>,
  Map<string, Set<RetainedDOMRegistration>>
>();

const releaseFragmentView = (editor: DOMEditor<any>) => {
  const binding = FRAGMENT_VIEWS.get(editor);
  if (!binding || binding.elements.size) return;
  FRAGMENT_VIEWS.delete(editor);
  const fragments = PARENT_FRAGMENT_EDITORS.get(binding.parent);
  const editors = fragments?.get(binding.fragmentId);
  editors?.delete(binding.editor);
  if (!editors?.size) fragments?.delete(binding.fragmentId);
  if (!fragments?.size) PARENT_FRAGMENT_EDITORS.delete(binding.parent);
};

export const getMountedDOMFragmentEditors = (
  parent: DOMEditor<any>,
  fragmentId: string
): Iterable<DOMEditor<any>> => {
  const editors = [
    ...(PARENT_FRAGMENT_EDITORS.get(parent)?.get(fragmentId) ?? []),
  ];

  return editors;
};

export const bindDOMRetainedElement = (
  element: HTMLElement,
  {
    authorId,
    changeId,
    fragmentId,
    fragmentKind,
    root,
    parent,
    readOnly = true,
  }: {
    authorId: string;
    changeId: string;
    fragmentId: string;
    fragmentKind: string;
    root: string;
    parent: AnyEditor;
    readOnly?: boolean;
  }
) => {
  RETAINED_ELEMENTS.get(element)?.dispose();
  const fragmentParent = parent as DOMEditor<any>;
  const previousRetained = element.getAttribute('data-editor-retained');
  const previousAuthor = element.getAttribute('data-editor-authored-author');
  const previousChange = element.getAttribute('data-editor-authored-change');
  const previousContentEditable = element.getAttribute('contenteditable');
  let disposed = false;
  const removeFromParent = () => {
    const fragments = PARENT_RETAINED_ELEMENTS.get(fragmentParent);
    const registrations = fragments?.get(fragmentId);
    registrations?.delete(registration);
    if (!registrations?.size) fragments?.delete(fragmentId);
    if (!fragments?.size) {
      PARENT_RETAINED_ELEMENTS.delete(fragmentParent);
    }
  };
  const registration: RetainedDOMRegistration = {
    dispose: () => {
      if (disposed) return;
      disposed = true;
      if (RETAINED_ELEMENTS.get(element) === registration) {
        RETAINED_ELEMENTS.delete(element);
      }
      removeFromParent();
      markDOMSyncMutationTarget(
        element,
        'attributes',
        'data-editor-authored-author'
      );
      if (previousAuthor === null) {
        element.removeAttribute('data-editor-authored-author');
      } else {
        element.setAttribute('data-editor-authored-author', previousAuthor);
      }
      markDOMSyncMutationTarget(
        element,
        'attributes',
        'data-editor-authored-change'
      );
      if (previousChange === null) {
        element.removeAttribute('data-editor-authored-change');
      } else {
        element.setAttribute('data-editor-authored-change', previousChange);
      }
      markDOMSyncMutationTarget(element, 'attributes', 'data-editor-retained');
      if (previousRetained === null) {
        element.removeAttribute('data-editor-retained');
      } else {
        element.setAttribute('data-editor-retained', previousRetained);
      }
      markDOMSyncMutationTarget(element, 'attributes', 'contenteditable');
      if (previousContentEditable === null) {
        element.removeAttribute('contenteditable');
      } else {
        element.setAttribute('contenteditable', previousContentEditable);
      }
    },
    element,
    changeId,
    root,
    fragmentId,
    parent: fragmentParent,
  };
  const fragments =
    PARENT_RETAINED_ELEMENTS.get(fragmentParent) ??
    new Map<string, Set<RetainedDOMRegistration>>();
  const registrations =
    fragments.get(fragmentId) ?? new Set<RetainedDOMRegistration>();
  registrations.add(registration);
  fragments.set(fragmentId, registrations);
  PARENT_RETAINED_ELEMENTS.set(fragmentParent, fragments);
  RETAINED_ELEMENTS.set(element, registration);
  if (readOnly) {
    markDOMSyncMutationTarget(
      element,
      'attributes',
      'data-editor-authored-author'
    );
    element.setAttribute('data-editor-authored-author', authorId);
    markDOMSyncMutationTarget(
      element,
      'attributes',
      'data-editor-authored-change'
    );
    element.setAttribute('data-editor-authored-change', changeId);
    markDOMSyncMutationTarget(element, 'attributes', 'data-editor-retained');
    element.setAttribute('data-editor-retained', fragmentKind);
  }

  return registration.dispose;
};

/** Retained nodes share their parent's DOM lifecycle, with separate native coordinates. */
export const bindDOMFragmentElement = <V extends Value>(
  editor: DOMEditor<V>,
  element: HTMLElement,
  { parent, readOnly = true }: { parent?: AnyEditor; readOnly?: boolean } = {}
) => {
  const fragment = readAuthoredFragmentView(editor);
  if (!fragment || !editor.read.view.isReadOnly()) {
    throw new Error(
      'A retained DOM node requires a readonly native fragment view.'
    );
  }
  const fragmentParent = (parent ?? fragment.parent) as DOMEditor<any>;
  let binding = FRAGMENT_VIEWS.get(editor);
  if (!binding) {
    binding = {
      editor,
      elements: new Set(),
      fragmentId: fragment.fragment.id,
      parent: fragmentParent,
    };
    FRAGMENT_VIEWS.set(editor, binding);
    const fragments =
      PARENT_FRAGMENT_EDITORS.get(fragmentParent) ??
      new Map<string, Set<DOMEditor<any>>>();
    const editors =
      fragments.get(binding.fragmentId) ?? new Set<DOMEditor<any>>();
    editors.add(editor);
    fragments.set(binding.fragmentId, editors);
    PARENT_FRAGMENT_EDITORS.set(fragmentParent, fragments);
  } else if (binding.parent !== fragmentParent) {
    throw new Error('A retained DOM view cannot change its mounted parent.');
  }
  binding.elements.add(element);
  const previous = FRAGMENT_ELEMENTS.get(element);
  const sameView = previous?.editor === editor;
  const registration = sameView
    ? previous
    : {
        authoredAuthor: previous
          ? previous.authoredAuthor
          : element.getAttribute('data-editor-authored-author'),
        authoredChange: previous
          ? previous.authoredChange
          : element.getAttribute('data-editor-authored-change'),
        contentEditable: previous
          ? previous.contentEditable
          : element.getAttribute('contenteditable'),
        editor,
        owners: new Set<object>(),
      };
  if (previous && !sameView) {
    const previousBinding = FRAGMENT_VIEWS.get(previous.editor);
    previousBinding?.elements.delete(element);
    releaseFragmentView(previous.editor);
  }
  const owner = {};
  registration.owners.add(owner);
  FRAGMENT_ELEMENTS.set(element, registration);
  if (readOnly) {
    markDOMSyncMutationTarget(
      element,
      'attributes',
      'data-editor-authored-author'
    );
    element.setAttribute(
      'data-editor-authored-author',
      fragment.fragment.authorId
    );
    markDOMSyncMutationTarget(
      element,
      'attributes',
      'data-editor-authored-change'
    );
    element.setAttribute(
      'data-editor-authored-change',
      fragment.fragment.changeId
    );
    markDOMSyncMutationTarget(element, 'attributes', 'data-editor-retained');
    element.setAttribute('data-editor-retained', fragment.fragment.kind);
  }
  return () => {
    if (
      FRAGMENT_ELEMENTS.get(element) !== registration ||
      !registration.owners.delete(owner)
    ) {
      return;
    }
    if (registration.owners.size) return;
    FRAGMENT_ELEMENTS.delete(element);
    binding.elements.delete(element);
    markDOMSyncMutationTarget(
      element,
      'attributes',
      'data-editor-authored-author'
    );
    if (registration.authoredAuthor === null) {
      element.removeAttribute('data-editor-authored-author');
    } else {
      element.setAttribute(
        'data-editor-authored-author',
        registration.authoredAuthor
      );
    }
    markDOMSyncMutationTarget(
      element,
      'attributes',
      'data-editor-authored-change'
    );
    if (registration.authoredChange === null) {
      element.removeAttribute('data-editor-authored-change');
    } else {
      element.setAttribute(
        'data-editor-authored-change',
        registration.authoredChange
      );
    }
    markDOMSyncMutationTarget(element, 'attributes', 'data-editor-retained');
    element.removeAttribute('data-editor-retained');
    markDOMSyncMutationTarget(element, 'attributes', 'contenteditable');
    if (registration.contentEditable === null) {
      element.removeAttribute('contenteditable');
    } else {
      element.setAttribute('contenteditable', registration.contentEditable);
    }
    releaseFragmentView(editor);
  };
};

export const readDOMFragmentTarget = (node: globalThis.Node) => {
  const element = isDOMElement(node) ? node : node.parentElement;
  const retained =
    element && closestShadowAware(element, '[data-editor-retained]');
  const root = element && closestShadowAware(element, '[data-editor]');
  if (
    !retained ||
    (root && root !== retained && containsShadowAware(retained, root))
  ) {
    return null;
  }
  const lazy = RETAINED_ELEMENTS.get(retained as HTMLElement);
  if (lazy) {
    return {
      parent: lazy.parent,
      target: { id: lazy.fragmentId, changeId: lazy.changeId },
      root: lazy.root,
    };
  }
  const mounted = FRAGMENT_ELEMENTS.get(retained as HTMLElement);
  const fragment = mounted && readAuthoredFragmentView(mounted.editor);
  return fragment
    ? {
        parent: fragment.parent,
        target: {
          id: fragment.fragment.id,
          changeId: fragment.fragment.changeId,
        },
        root: fragment.fragment.root,
      }
    : null;
};

export const getMountedDOMFragmentElements = (
  parent: DOMEditor<any>,
  fragmentId: string
): readonly HTMLElement[] => [
  ...Array.from(
    PARENT_FRAGMENT_EDITORS.get(parent)?.get(fragmentId) ?? []
  ).flatMap((editor) => [...(FRAGMENT_VIEWS.get(editor)?.elements ?? [])]),
  ...Array.from(
    PARENT_RETAINED_ELEMENTS.get(parent)?.get(fragmentId) ?? []
  ).map((entry) => entry.element),
];

export const readDOMFragmentEditor = (node: globalThis.Node) => {
  const element = isDOMElement(node) ? node : node.parentElement;
  const nodeElement =
    element && closestShadowAware(element, '[data-editor-node]');
  const nodeEditor =
    nodeElement && ELEMENT_TO_EDITOR.get(nodeElement as HTMLElement);
  if (nodeEditor) {
    return readAuthoredFragmentView(nodeEditor)
      ? (nodeEditor as DOMEditor<any>)
      : null;
  }
  const retained =
    element && closestShadowAware(element, '[data-editor-retained]');
  const root = element && closestShadowAware(element, '[data-editor]');
  if (
    retained &&
    root &&
    root !== retained &&
    containsShadowAware(retained, root)
  ) {
    return null;
  }
  return retained
    ? (FRAGMENT_ELEMENTS.get(retained as HTMLElement)?.editor ?? null)
    : null;
};

export const readDOMFragmentParent = <V extends Value>(editor: DOMEditor<V>) =>
  FRAGMENT_VIEWS.get(editor)?.parent ?? null;

/** Null leaves ordinary DOM-root ownership to the mounted editor. */
export const isDOMFragmentNode = <V extends Value>(
  editor: DOMEditor<V>,
  node: globalThis.Node
) => {
  const target = readDOMFragmentTarget(node);
  if (target) {
    const fragment = readAuthoredFragmentView(editor);
    return (
      fragment?.fragment.id === target.target.id &&
      fragment.parent === target.parent
    );
  }
  return readDOMFragmentParent(editor) ? false : null;
};
