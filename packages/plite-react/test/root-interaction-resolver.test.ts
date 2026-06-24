import { describe, expect, test } from 'vitest';

import { shouldReplayMouseUpDOMSelection } from '../src/editable/root-interaction-controller';
import {
  resolveRootInteractionMouseDown,
  resolveRootInteractionMouseUp,
  resolveRootInteractionTarget,
} from '../src/editable/root-interaction-resolver';

const createRootChrome = () => {
  const root = document.createElement('section');

  root.dataset.pliteRootChrome = 'body';

  return root;
};

describe('root interaction resolver', () => {
  test('keeps interactive descendants native', () => {
    const root = createRootChrome();
    const button = document.createElement('button');

    root.append(button);

    const target = resolveRootInteractionTarget({
      currentTarget: root,
      target: button,
    });

    expect(target.kind).toBe('interactive-descendant');
    expect(resolveRootInteractionMouseDown({ target }).type).toBe('ignore');
  });

  test('restores selection for root chrome activation without coordinates', () => {
    const root = createRootChrome();
    const label = document.createElement('span');

    root.append(label);

    const target = resolveRootInteractionTarget({
      currentTarget: root,
      target: label,
    });
    const mouseDown = resolveRootInteractionMouseDown({ target });

    expect(target.kind).toBe('root-chrome');
    expect(mouseDown).toEqual({
      preventDefault: true,
      type: 'activate-root',
    });
    expect(
      resolveRootInteractionMouseUp({
        eventRange: null,
        pendingAction: mouseDown,
        selection: 'restore',
      })
    ).toEqual({
      fallbackSelection: 'end',
      selection: 'restore',
      type: 'focus-root',
    });
  });

  test('keeps root chrome activation on restore when browser coordinates resolve stale text', () => {
    expect(
      resolveRootInteractionMouseUp({
        eventRange: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
        pendingAction: {
          preventDefault: true,
          type: 'activate-root',
        },
        selection: 'restore',
      })
    ).toEqual({
      fallbackSelection: 'end',
      selection: 'restore',
      type: 'focus-root',
    });
  });

  test('carries root chrome fallback selection into mouseup focus action', () => {
    expect(
      resolveRootInteractionMouseUp({
        eventRange: null,
        pendingAction: {
          fallbackSelection: 'end',
          preventDefault: true,
          type: 'activate-root',
        },
        selection: 'restore',
      })
    ).toEqual({
      fallbackSelection: 'end',
      selection: 'restore',
      type: 'focus-root',
    });
  });

  test('restores selection for editable root surface clicks without coordinates', () => {
    const editable = document.createElement('div');

    editable.dataset.pliteEditor = 'true';

    const target = resolveRootInteractionTarget({
      currentTarget: editable,
      target: editable,
    });
    const mouseDown = resolveRootInteractionMouseDown({
      editableRootFocused: false,
      target,
    });

    expect(target.kind).toBe('editable-root');
    expect(mouseDown).toEqual({
      preventDefault: true,
      type: 'place-editable-root',
    });
    expect(
      resolveRootInteractionMouseUp({
        eventRange: null,
        pendingAction: mouseDown,
        selection: 'restore',
      })
    ).toEqual({
      fallbackSelection: 'end',
      selection: 'restore',
      type: 'focus-root',
    });
  });

  test('keeps editable root padding clicks on restore even when browser coordinates resolve stale text', () => {
    expect(
      resolveRootInteractionMouseUp({
        eventRange: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
        pendingAction: {
          preventDefault: true,
          type: 'place-editable-root',
        },
        selection: 'restore',
      })
    ).toEqual({
      fallbackSelection: 'end',
      selection: 'restore',
      type: 'focus-root',
    });
  });

  test('places blurred native text targets from mouseup coordinates', () => {
    const editable = document.createElement('div');
    const text = document.createElement('span');

    editable.dataset.pliteEditor = 'true';
    text.dataset.pliteString = 'true';
    editable.append(text);

    const target = resolveRootInteractionTarget({
      currentTarget: editable,
      target: text,
    });
    const mouseDown = resolveRootInteractionMouseDown({
      editableRootFocused: false,
      target,
    });

    expect(target.kind).toBe('native-editable');
    expect(mouseDown).toEqual({ type: 'place-native-editable' });
    expect(
      resolveRootInteractionMouseUp({
        eventRange: {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
        pendingAction: mouseDown,
        selection: 'restore',
      })
    ).toEqual({
      range: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
      type: 'set-selection',
    });
  });

  test('places focused native text targets from mouseup coordinates', () => {
    const editable = document.createElement('div');
    const text = document.createElement('span');

    editable.dataset.pliteEditor = 'true';
    text.dataset.pliteString = 'true';
    editable.append(text);

    const target = resolveRootInteractionTarget({
      currentTarget: editable,
      target: text,
    });

    expect(target.kind).toBe('native-editable');
    expect(
      resolveRootInteractionMouseDown({
        editableRootFocused: true,
        target,
      })
    ).toEqual({ type: 'place-native-editable' });
  });

  test('lets root chrome ignore editable descendants', () => {
    const root = createRootChrome();
    const editable = document.createElement('div');
    const text = document.createElement('span');

    editable.dataset.pliteEditor = 'true';
    text.dataset.pliteString = 'true';
    editable.append(text);
    root.append(editable);

    const target = resolveRootInteractionTarget({
      currentTarget: root,
      target: text,
    });

    expect(target.kind).toBe('interactive-descendant');
    expect(resolveRootInteractionMouseDown({ target }).type).toBe('ignore');
  });

  test('lets root chrome place same-root editable surface clicks', () => {
    const root = createRootChrome();
    const editable = document.createElement('div');

    root.dataset.pliteRootChrome = 'header';
    editable.dataset.pliteEditor = 'true';
    editable.dataset.pliteRoot = 'header';
    root.append(editable);

    const target = resolveRootInteractionTarget({
      currentTarget: root,
      target: editable,
    });
    const mouseDown = resolveRootInteractionMouseDown({
      editableRootFocused: false,
      target,
    });

    expect(target.kind).toBe('editable-root');
    expect(mouseDown).toEqual({
      preventDefault: true,
      type: 'place-editable-root',
    });
  });

  test('lets editable roots ignore nested editor clicks', () => {
    const root = document.createElement('div');
    const nested = document.createElement('div');
    const text = document.createElement('span');

    root.dataset.pliteEditor = 'true';
    nested.dataset.pliteEditor = 'true';
    text.dataset.pliteString = 'true';
    nested.append(text);
    root.append(nested);

    const target = resolveRootInteractionTarget({
      currentTarget: root,
      target: text,
    });

    expect(target.kind).toBe('interactive-descendant');
    expect(resolveRootInteractionMouseDown({ target }).type).toBe('ignore');
  });

  test('replays Firefox mouseup DOM selection only for moved native selections', () => {
    expect(
      shouldReplayMouseUpDOMSelection({
        hasExpandedDOMRange: true,
        isFirefox: true,
        nativeSelectedTextClick: false,
        pointerMoved: true,
      })
    ).toBe(true);

    expect(
      shouldReplayMouseUpDOMSelection({
        hasExpandedDOMRange: true,
        isFirefox: true,
        nativeSelectedTextClick: false,
        pointerMoved: false,
      })
    ).toBe(false);

    expect(
      shouldReplayMouseUpDOMSelection({
        hasExpandedDOMRange: true,
        isFirefox: true,
        nativeSelectedTextClick: true,
        pointerMoved: true,
      })
    ).toBe(false);

    expect(
      shouldReplayMouseUpDOMSelection({
        hasExpandedDOMRange: true,
        isFirefox: false,
        nativeSelectedTextClick: false,
        pointerMoved: true,
      })
    ).toBe(false);
  });
});
