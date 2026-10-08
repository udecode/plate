import React, { type CSSProperties, useRef } from 'react';

import type { Editor, Value } from '../..';
import {
  createEditorCommitPublicationQueue,
  publishEditorCommitInVersionOrder,
} from '../../core/commit-publication';
import { getEditorRuntimeOwner } from '../../core/editor-runtime';
import { getScreenReaderAnnouncements } from '../../core/screen-reader-announcement';
import {
  getActiveElement,
  getFlatTreeParentElement,
} from '../../dom/utils/dom';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';

const visuallyHiddenStyle: CSSProperties = {
  border: 0,
  clipPath: 'inset(50%)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: 1,
};

type RegisterRegion = (region: HTMLElement) => () => void;

const ANNOUNCERS = new WeakMap<Editor, RegisterRegion>();

const isAudible = (region: HTMLElement) => {
  if (
    typeof region.checkVisibility === 'function' &&
    !region.checkVisibility({ visibilityProperty: true })
  ) {
    return false;
  }

  for (
    let element: Element | null = region;
    element;
    element = getFlatTreeParentElement(element)
  ) {
    if (
      element.hasAttribute('hidden') ||
      element.hasAttribute('inert') ||
      element.getAttribute('aria-hidden')?.trim().toLowerCase() === 'true'
    ) {
      return false;
    }
  }

  return true;
};

/**
 * Ranks regions: audible before hidden, then by the depth of the deepest
 * flat-tree ancestor shared with the focused element, then by registration
 * order.
 */
const chooseSpeaker = (regions: ReadonlySet<HTMLElement>) => {
  const depths = new Map<Element, number>();
  const focusPath: Element[] = [];

  for (
    let element = getActiveElement();
    element;
    element = getFlatTreeParentElement(element)
  ) {
    focusPath.push(element);
  }
  focusPath.reverse().forEach((element, depth) => depths.set(element, depth));

  let speaker: HTMLElement | null = null;
  let speakerAudible = false;
  let speakerDepth = -1;

  for (const region of regions) {
    if (!region.isConnected) continue;

    const audible = isAudible(region);
    let depth = -1;

    for (
      let element: Element | null = region;
      element && depth === -1;
      element = getFlatTreeParentElement(element)
    ) {
      depth = depths.get(element) ?? -1;
    }

    const better = audible === speakerAudible ? depth > speakerDepth : audible;

    if (speaker === null || better) {
      speaker = region;
      speakerAudible = audible;
      speakerDepth = depth;
    }
  }

  return speaker;
};

const createAnnouncer = (
  owner: Editor,
  release: () => void
): RegisterRegion => {
  const regions = new Set<HTMLElement>();
  const queue = createEditorCommitPublicationQueue<Value>(
    owner.read.lastCommit()?.version ?? 0
  );
  let speaker: HTMLElement | null = null;

  const unsubscribe = owner.subscribeCommit((commit, snapshot) => {
    publishEditorCommitInVersionOrder(queue, commit, snapshot, (published) => {
      const messages = getScreenReaderAnnouncements(published.effects);

      if (messages.length === 0) return;

      const next = chooseSpeaker(regions);

      if (!next) return;
      if (speaker !== next) speaker?.replaceChildren();

      const message = next.ownerDocument.createElement('span');

      message.textContent = messages.join(' ');
      next.replaceChildren(message);
      speaker = next;
    });
  });

  return (region) => {
    regions.add(region);

    return () => {
      regions.delete(region);
      if (speaker === region) {
        speaker = null;
        region.replaceChildren();
      }
      if (regions.size === 0) {
        unsubscribe();
        release();
      }
    };
  };
};

const registerAnnouncementRegion = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  editor: Editor<V, TPlugins>,
  region: HTMLElement
) => {
  const owner = getEditorRuntimeOwner(editor);
  let register = ANNOUNCERS.get(owner);

  if (!register) {
    register = createAnnouncer(owner, () => ANNOUNCERS.delete(owner));
    ANNOUNCERS.set(owner, register);
  }

  return register(region);
};

/**
 * One polite live region per Plite React provider. Every region of one editor
 * registers with that editor's announcer, which writes each announcement into
 * one of them.
 */
export const EditorAnnouncementLiveRegion = <
  V extends Value,
  TPlugins extends readonly unknown[],
>({
  editor,
}: {
  editor: Editor<V, TPlugins>;
}) => {
  const regionRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const region = regionRef.current;

    return region ? registerAnnouncementRegion(editor, region) : undefined;
  }, [editor]);

  // React must render no children here: the announcer replaces them across React roots.
  return (
    <span
      aria-atomic="true"
      aria-live="polite"
      ref={regionRef}
      role="status"
      style={visuallyHiddenStyle}
    />
  );
};
