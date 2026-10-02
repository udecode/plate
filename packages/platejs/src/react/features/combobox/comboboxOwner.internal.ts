import type React from 'react';

import { type PluginTransaction, PointApi } from '../../../core';
import {
  type Anchor,
  type EditorCommit,
  type Range,
  RangeApi,
  subscribeEditorViewState,
} from '../../../facade';
import type { ComboboxState } from '../../../features/combobox/lib/combobox';
import {
  findTypedTrigger,
  isComboboxQuery,
  readComboboxQuery,
  readTypedInsertion,
} from '../../../features/combobox/lib/combobox.internal';
import { getPluginStore } from '../../../internal/plugin/pluginStore';
import type { PluginReference } from '../../../lib';
import type { Editor } from '../../editor';
import { claimEditableKeyDown } from '../../utils/editableKeyDown.internal';

/** The open query an autocomplete popup offers options for. */
export type ComboboxMatch = Readonly<{
  /** True while an IME composes; `query` then previews the visible preedit. */
  composing: boolean;
  /** Text typed after the trigger. */
  query: string;
  /** Trigger and query; completion replaces this range. */
  range: Range;
  /** The trigger text that opened this popup. */
  trigger: string;
}>;

export type ComboboxCompletion = (tx: PluginTransaction) => false | void;

export type ComboboxPopup = Readonly<{
  activeOptionId: string | null;
  listboxId: string;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => boolean;
  open: boolean;
  plugin: PluginReference;
}>;

type Occurrence = Readonly<{
  typedExtent: Anchor<Range>;
  popup: ComboboxPopup;
  trigger: Anchor<Range>;
  triggerText: string;
}>;

const POPUP_KEYS = new Set(['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab']);
// `input` follows each preedit DOM update; composition events alone can precede it.
const PREVIEW_EVENTS = [
  'compositionend',
  'compositionstart',
  'compositionupdate',
  'input',
] as const;
const refused = Symbol('combobox completion refused');
const owners = new WeakMap<Element, ComboboxOwner>();

const isThenable = (value: unknown) =>
  typeof (value as PromiseLike<unknown> | null)?.then === 'function';

const sameOffer = (a: ComboboxMatch, b: ComboboxMatch) =>
  a.query === b.query && a.trigger === b.trigger;

const sameMatch = (a: ComboboxMatch | null, b: ComboboxMatch) =>
  a !== null &&
  sameOffer(a, b) &&
  a.composing === b.composing &&
  RangeApi.equals(a.range, b.range);

class ComboboxOwner {
  private aria: Readonly<Record<string, string>> = {};
  private readonly listeners = new Set<() => void>();
  private match: ComboboxMatch | null = null;
  private occurrence: Occurrence | null = null;
  private readonly popups: ComboboxPopup[] = [];
  private stop: (() => void) | null = null;
  readonly element: HTMLElement;
  readonly view: Editor;

  constructor(view: Editor, element: HTMLElement) {
    this.element = element;
    this.view = view;
  }

  complete(
    popup: ComboboxPopup,
    expected: ComboboxMatch,
    callback: ComboboxCompletion
  ) {
    const { match, occurrence } = this;

    if (occurrence?.popup !== popup || !match || !sameOffer(match, expected)) {
      return false;
    }
    if (
      !this.view.api.react.settleInput() ||
      this.view.api.react.isComposing()
    ) {
      return false;
    }

    const state = this.stateOf(popup);

    if (!state) return false;

    try {
      this.view.update({ history: 'new-batch' }, (tx) => {
        const trigger = occurrence.trigger.resolve(this.view);
        const typedExtent = occurrence.typedExtent.resolve(this.view);
        const selection = tx.selection();

        if (
          !trigger ||
          !typedExtent ||
          !selection ||
          !RangeApi.isCollapsed(selection) ||
          !this.isEditable() ||
          tx.nodes.elementReadOnly({ at: RangeApi.start(trigger) }) ||
          readComboboxQuery(
            tx,
            {
              caret: selection.focus,
              typedExtentEnd: RangeApi.end(typedExtent),
              trigger,
              triggerText: occurrence.triggerText,
            },
            state
          ) !== expected.query
        ) {
          throw refused;
        }

        const start = RangeApi.start(trigger);

        tx.text.delete({ at: { anchor: start, focus: selection.focus } });
        tx.selection.set(start);

        const result: unknown = callback(tx);

        if (result === false) throw refused;
        if (isThenable(result)) {
          throw new TypeError('A combobox completion must be synchronous.');
        }
      });
    } catch (error) {
      if (error === refused) return false;

      throw error;
    }

    this.close();

    return true;
  }

  dismiss(popup: ComboboxPopup) {
    if (this.occurrence?.popup === popup) this.close();
  }

  getMatch = (popup: ComboboxPopup) =>
    this.occurrence?.popup === popup ? this.match : null;

  mount(popup: ComboboxPopup) {
    this.popups.push(popup);
    if (this.popups.length === 1) this.start();

    return () => {
      this.popups.splice(this.popups.indexOf(popup), 1);
      if (this.occurrence?.popup === popup) this.close();
      if (this.popups.length > 0) return;

      this.stop?.();
      this.stop = null;
      if (owners.get(this.element) === this) owners.delete(this.element);
    };
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  syncAria() {
    const popup = this.match ? this.occurrence?.popup : undefined;
    const next: Record<string, string> = popup?.open
      ? {
          'aria-autocomplete': 'list',
          'aria-controls': popup.listboxId,
          ...(popup.activeOptionId
            ? { 'aria-activedescendant': popup.activeOptionId }
            : {}),
        }
      : {};

    for (const name of Object.keys(this.aria)) {
      if (!(name in next)) this.element.removeAttribute(name);
    }
    for (const [name, value] of Object.entries(next)) {
      if (this.aria[name] !== value) this.element.setAttribute(name, value);
    }

    this.aria = next;
  }

  private close() {
    if (!this.occurrence) return;

    this.occurrence.trigger.release();
    this.occurrence.typedExtent.release();
    this.occurrence = null;
    this.match = null;
    this.publish();
  }

  private isAnotherEditorFocused() {
    const active = this.element.ownerDocument.activeElement;

    return (
      !!active?.closest('[data-editor="true"]') &&
      !this.element.contains(active)
    );
  }

  private isEditable() {
    return (
      this.element.isConnected &&
      !this.view.read.view.isReadOnly() &&
      this.view.api.dom.root() === this.element
    );
  }

  private onCommit(commit: EditorCommit) {
    const insertion = readTypedInsertion(commit);

    if (
      insertion &&
      commit.selectionAfterRoot === this.view.read.view.root() &&
      this.view.api.react.isFocused() &&
      this.isEditable()
    ) {
      let latest: { popup: ComboboxPopup; trigger: Range } | null = null;

      for (const popup of this.popups) {
        const state = this.stateOf(popup);
        const trigger = state
          ? findTypedTrigger(this.view.read, insertion, state)
          : null;

        if (
          state &&
          trigger &&
          (!latest ||
            PointApi.isAfter(
              RangeApi.start(trigger),
              RangeApi.start(latest.trigger)
            )) &&
          (!state.triggerQuery || state.triggerQuery(this.view))
        ) {
          latest = { popup, trigger };
        }
      }

      if (latest) {
        const { popup, trigger } = latest;

        this.occurrence?.trigger.release();
        this.occurrence?.typedExtent.release();
        this.occurrence = {
          typedExtent: this.view.anchor(
            { anchor: RangeApi.start(trigger), focus: insertion.caret },
            { association: 'outward', deletion: 'nearest' }
          ),
          popup,
          trigger: this.view.anchor(trigger, { deletion: 'drop' }),
          triggerText: this.view.read.text.string(trigger),
        };
        this.match = null;
      }
    }

    this.refresh();
  }

  private onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const popup = this.match ? this.occurrence?.popup : undefined;

    if (
      !popup?.open ||
      !POPUP_KEYS.has(event.key) ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.nativeEvent.isComposing ||
      // oxlint-disable-next-line typescript/no-deprecated -- WebKit sends the IME confirmation Enter after compositionend with only this code.
      event.keyCode === 229
    ) {
      return false;
    }
    if (popup.onKeyDown(event)) return true;
    if (event.key !== 'Escape') return false;

    this.close();

    return true;
  }

  private publish() {
    this.syncAria();
    for (const listener of this.listeners) listener();
  }

  private read(): ComboboxMatch | null {
    const { occurrence } = this;
    const trigger = occurrence?.trigger.resolve(this.view);
    const typedExtent = occurrence?.typedExtent.resolve(this.view);
    const selection = this.view.read.selection();
    const state = occurrence && this.stateOf(occurrence.popup);

    if (
      !occurrence ||
      !trigger ||
      !typedExtent ||
      !state ||
      !selection ||
      !RangeApi.isCollapsed(selection) ||
      !this.isEditable() ||
      this.isAnotherEditorFocused()
    ) {
      return null;
    }

    const composing = this.view.api.react.isComposing();
    const query = readComboboxQuery(
      this.view.read,
      {
        caret: selection.focus,
        typedExtentEnd: RangeApi.end(typedExtent),
        trigger,
        triggerText: occurrence.triggerText,
      },
      state
    );

    if (query === null) {
      const { match } = this;
      const modelLagsPreedit = composing && match !== null;

      return modelLagsPreedit ? { ...match, composing } : null;
    }

    const preview = composing ? this.readPreview(trigger) : null;

    return {
      composing,
      query:
        preview !== null && isComboboxQuery(preview, state) ? preview : query,
      range: { anchor: RangeApi.start(trigger), focus: selection.focus },
      trigger: occurrence.triggerText,
    };
  }

  private readPreview(trigger: Range) {
    const start = this.view.api.dom.resolveDOMPoint(RangeApi.end(trigger));
    const root = this.element.getRootNode() as Document | ShadowRoot;
    const selection =
      'getSelection' in root && typeof root.getSelection === 'function'
        ? root.getSelection()
        : this.element.ownerDocument.getSelection();
    const focus = selection?.focusNode;

    if (!start || !focus || !this.element.contains(focus)) return null;

    const range = this.element.ownerDocument.createRange();

    range.setStart(start[0], start[1]);
    if (range.comparePoint(focus, selection.focusOffset) < 0) return null;
    range.setEnd(focus, selection.focusOffset);

    return range.toString().replaceAll('\uFEFF', '');
  }

  private refresh() {
    const next = this.read();

    if (!next) {
      this.close();

      return;
    }
    if (sameMatch(this.match, next)) return;

    this.match = next;
    this.publish();
  }

  private start() {
    const refresh = () => this.refresh();
    const unsubscribeCommit = this.view.subscribeCommit((commit) =>
      this.onCommit(commit)
    );
    const unsubscribeView = subscribeEditorViewState(this.view, refresh);
    const releaseKeys = claimEditableKeyDown(this.element, (event) =>
      this.onKeyDown(event)
    );

    const { ownerDocument } = this.element;

    for (const type of PREVIEW_EVENTS) {
      this.element.addEventListener(type, refresh);
    }
    ownerDocument.addEventListener('focusin', refresh);

    this.stop = () => {
      unsubscribeCommit();
      unsubscribeView();
      releaseKeys();
      for (const type of PREVIEW_EVENTS) {
        this.element.removeEventListener(type, refresh);
      }
      ownerDocument.removeEventListener('focusin', refresh);
      this.close();
    };
  }

  private stateOf(popup: ComboboxPopup) {
    return getPluginStore(this.view, popup.plugin)?.public.get() as
      | ComboboxState
      | undefined;
  }
}

export const getComboboxOwner = (view: Editor, element: HTMLElement) => {
  let owner = owners.get(element);

  if (!owner) {
    owner = new ComboboxOwner(view, element);
    owners.set(element, owner);
  }

  return owner;
};

export type { ComboboxOwner };
