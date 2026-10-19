import { getSelection } from '../../dom';
import { findDOMRootRuntime } from '../../dom/internal';
import type { EditableInputController } from './input-controller';

type SelectionChangeRegistration = {
  notify: () => void;
  root: HTMLElement;
};

const DOCUMENT_TO_SELECTION_TRANSPORT = new WeakMap<
  Document,
  ReturnType<typeof createSelectionTransport>
>();

const createSelectionTransport = (document: Document) => {
  const registrations = new Map<HTMLElement, SelectionChangeRegistration>();
  const shadows = new Map<Element, { count: number; root: ShadowRoot }>();
  const HTMLElementConstructor = document.defaultView?.HTMLElement;
  let previousOwners = new Set<HTMLElement>();
  let singleRegistration: SelectionChangeRegistration | undefined;

  const handleNativeSelectionChange = ({ target }: Event) => {
    // Chrome can emit selectionchange for newly appended form fields.
    if (
      HTMLElementConstructor &&
      target instanceof HTMLElementConstructor &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
    ) {
      return;
    }

    if (singleRegistration) {
      previousOwners.add(singleRegistration.root);
      singleRegistration.notify();
      return;
    }

    const nextOwners = new Set<HTMLElement>();
    const visitedTrees = new Set<Document | ShadowRoot>();
    const resolveNode = (node: Node | null) => {
      if (!node) return;

      const shadow = shadows.get(node as Element)?.root;

      if (shadow) {
        resolveTree(shadow);
        return;
      }

      const root = findDOMRootRuntime(node)?.rootRef.current;

      if (root && registrations.has(root)) nextOwners.add(root);
    };
    const resolveTree = (tree: Document | ShadowRoot) => {
      if (visitedTrees.has(tree)) return;

      visitedTrees.add(tree);
      const selection = getSelection(tree);

      resolveNode(selection?.anchorNode ?? null);
      if (selection?.focusNode !== selection?.anchorNode) {
        resolveNode(selection?.focusNode ?? null);
      }
      resolveNode(tree.activeElement);
    };

    resolveTree(document);
    const owners = previousOwners;

    previousOwners = nextOwners;
    nextOwners.forEach((root) => owners.add(root));
    owners.forEach((root) => registrations.get(root)?.notify());
  };

  // React onSelect omits native selection changes without keyboard or clicks.
  document.addEventListener('selectionchange', handleNativeSelectionChange);

  return {
    register(registration: SelectionChangeRegistration) {
      registrations.set(registration.root, registration);
      singleRegistration = registrations.size === 1 ? registration : undefined;
      const containingShadows: ShadowRoot[] = [];
      let tree = registration.root.getRootNode();

      // Retargeted events expose the host even for closed, nested shadow trees.
      while ('host' in tree) {
        const shadow = tree as ShadowRoot;
        const entry = shadows.get(shadow.host) ?? { count: 0, root: shadow };

        entry.count += 1;
        shadows.set(shadow.host, entry);
        containingShadows.push(shadow);
        tree = shadow.host.getRootNode();
      }

      let attached = true;

      return () => {
        if (!attached) return;

        attached = false;
        registrations.delete(registration.root);
        previousOwners.delete(registration.root);
        singleRegistration =
          registrations.size === 1
            ? registrations.values().next().value
            : undefined;
        containingShadows.forEach((shadow) => {
          const entry = shadows.get(shadow.host);

          if (entry) {
            entry.count -= 1;
            if (entry.count === 0) shadows.delete(shadow.host);
          }
        });

        if (registrations.size === 0) {
          document.removeEventListener(
            'selectionchange',
            handleNativeSelectionChange
          );
          DOCUMENT_TO_SELECTION_TRANSPORT.delete(document);
        }
      };
    },
  };
};

export const attachEditableSelectionChangeListener = ({
  root,
  scheduleOnDOMSelectionChange,
  state,
}: {
  root: HTMLElement;
  scheduleOnDOMSelectionChange: () => void;
  state: Pick<EditableInputController['state'], 'pendingDOMSelectionImport'> &
    Partial<
      Pick<
        EditableInputController['state'],
        | 'activeIntent'
        | 'modelSelectionPreference'
        | 'selectionChangeOrigin'
        | 'selectionSource'
      >
    >;
}) => {
  const document = root.ownerDocument;
  let transport = DOCUMENT_TO_SELECTION_TRANSPORT.get(document);

  if (!transport) {
    transport = createSelectionTransport(document);
    DOCUMENT_TO_SELECTION_TRANSPORT.set(document, transport);
  }

  return transport.register({
    root,
    notify: () => {
      if (
        !root.isConnected ||
        (state.activeIntent === 'history' &&
          state.selectionChangeOrigin === 'repair-induced' &&
          state.selectionSource === 'model-owned' &&
          state.modelSelectionPreference?.preferModelSelection === true)
      ) {
        return;
      }

      state.pendingDOMSelectionImport = true;
      scheduleOnDOMSelectionChange();
    },
  });
};
