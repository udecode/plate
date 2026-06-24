import {
  Component,
  type ComponentType,
  type ContextType,
  type ReactNode,
  type RefObject,
} from 'react';
import { IS_ANDROID } from '@platejs/plite-dom';
import { EditorContext } from '../../hooks/use-editor';
import type { ReactRuntimeEditor } from '../../plugin/react-editor';
import {
  createRestoreDomManager,
  type RestoreDOMManager,
} from './restore-dom-manager';

const MUTATION_OBSERVER_CONFIG: MutationObserverInit = {
  subtree: true,
  childList: true,
  characterData: true,
  characterDataOldValue: true,
};

type RestoreDOMProps = {
  children?: ReactNode;
  receivedUserInput: RefObject<boolean>;
  node: RefObject<HTMLDivElement | null>;
};

// We have to use a class component here since we rely on `getSnapshotBeforeUpdate` which has no FC equivalent
// to run code synchronously immediately before react commits the component update to the DOM.
class RestoreDOMComponent extends Component<RestoreDOMProps> {
  static contextType = EditorContext;
  context: ContextType<typeof EditorContext> = null;

  private manager: RestoreDOMManager | null = null;
  private mutationObserver: MutationObserver | null = null;

  observe() {
    const { node } = this.props;
    const current = node.current;

    if (!current) {
      return;
    }

    this.mutationObserver?.observe(current, MUTATION_OBSERVER_CONFIG);
  }

  componentDidMount() {
    const { receivedUserInput } = this.props;
    const editor = this.context! as unknown as ReactRuntimeEditor;

    this.manager = createRestoreDomManager(editor, receivedUserInput);
    this.mutationObserver = new MutationObserver(
      this.manager.registerMutations
    );

    this.observe();
  }

  getSnapshotBeforeUpdate() {
    const pendingMutations = this.mutationObserver?.takeRecords();
    if (pendingMutations?.length) {
      this.manager?.registerMutations(pendingMutations);
    }

    this.mutationObserver?.disconnect();
    this.manager?.restoreDOM();

    return null;
  }

  componentDidUpdate() {
    this.manager?.clear();
    this.observe();
  }

  componentWillUnmount() {
    this.mutationObserver?.disconnect();
  }

  render() {
    return this.props.children;
  }
}

export const RestoreDOM: ComponentType<RestoreDOMProps> = IS_ANDROID
  ? RestoreDOMComponent
  : ({ children }) => <>{children}</>;
