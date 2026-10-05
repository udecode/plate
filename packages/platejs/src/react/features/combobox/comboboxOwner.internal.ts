import type React from 'react';

import { type PluginTransaction, PointApi } from '../../../core';
import {
  type Anchor,
  type Range,
  RangeApi,
  subscribeEditorViewState,
} from '../../../facade';
import type { ComboboxState } from '../../../features/combobox/lib/combobox';
import {
  findTypedTrigger,
  isComboboxQuery,
  readComboboxQuery,
  type TypedInsertion,
} from '../../../features/combobox/lib/combobox.internal';
import { getPluginStore } from '../../../internal/plugin/pluginStore';
import type { PluginReference } from '../../../lib';
import type { Editor } from '../../editor';
import { isImeConfirmKeyEvent } from '../../utils/dispatchPlateShortcut.internal';
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
const refused = new Error('combobox completion refused');
const owners = new WeakMap<Element, ComboboxOwner>();
// Equal text in a later occurrence must not complete a match offered by an earlier one.
const occurrenceOf = new WeakMap<ComboboxMatch, Occurrence>();

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
  private readonly replaced = new Map<string, string | null>();
  private readonly written = new Map<string, string | null>();
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

    if (
      occurrence?.popup !== popup ||
      occurrenceOf.get(expected) !== occurrence ||
      !match ||
      !sameOffer(match, expected)
    ) {
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
    const next: Record<string, string | null> = popup
      ? {
          'aria-autocomplete': 'list',
          'aria-expanded': String(popup.open),
          'aria-haspopup': 'listbox',
          'aria-multiline': null,
          role: 'combobox',
          ...(popup.open
            ? {
                'aria-controls': popup.listboxId,
                ...(popup.activeOptionId
                  ? { 'aria-activedescendant': popup.activeOptionId }
                  : {}),
              }
            : {}),
        }
      : {};

    for (const [name, original] of this.replaced) {
      if (name in next) continue;
      if (this.element.getAttribute(name) === this.written.get(name)) {
        this.write(name, original);
      }

      this.replaced.delete(name);
      this.written.delete(name);
    }
    for (const [name, value] of Object.entries(next)) {
      const current = this.element.getAttribute(name);

      // A value the app wrote after the owner's last write replaces the one to restore.
      if (!this.replaced.has(name) || current !== this.written.get(name)) {
        this.replaced.set(name, current);
      }

      this.write(name, value);
      this.written.set(name, value);
    }
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

  private write(name: string, value: string | null) {
    if (value === null) this.element.removeAttribute(name);
    else if (this.element.getAttribute(name) !== value) {
      this.element.setAttribute(name, value);
    }
  }

  private onTyped(range: Range, text: string) {
    const insertion: TypedInsertion = {
      caret: RangeApi.end(range),
      length: text.length,
    };

    if (this.view.api.react.isFocused() && this.isEditable()) {
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
      isImeConfirmKeyEvent(event.nativeEvent)
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

      return composing && match !== null
        ? this.offer(occurrence, { ...match, composing })
        : null;
    }

    const preview = composing
      ? this.view.api.dom.textToCaret(RangeApi.end(trigger))
      : null;

    return this.offer(occurrence, {
      composing,
      query:
        preview !== null && isComboboxQuery(preview, state) ? preview : query,
      range: { anchor: RangeApi.start(trigger), focus: selection.focus },
      trigger: occurrence.triggerText,
    });
  }

  private offer(occurrence: Occurrence, match: ComboboxMatch) {
    occurrenceOf.set(match, occurrence);

    return match;
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
    // Subscribed before the commit refresh, so a typed trigger replaces the
    // open occurrence before the popup state publishes once.
    const unsubscribeTyped = this.view.api.react.subscribeTypedText(
      ({ editable, range, text }) => {
        if (editable === this.element) this.onTyped(range, text);
      }
    );
    const unsubscribeCommit = this.view.subscribeCommit(refresh);
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
      unsubscribeTyped();
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
