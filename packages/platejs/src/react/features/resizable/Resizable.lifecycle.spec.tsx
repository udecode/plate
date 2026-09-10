import { act, render } from '@testing-library/react';
import * as React from 'react';

import { Plate } from '../../core';
import { createEditor } from '../../editor';
import { Resizable, ResizeHandle } from './Resizable';

const pointer = (
  target: EventTarget,
  type: string,
  x: number,
  pointerId = 1,
  button = 0
) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button,
    clientX: x,
  });
  Object.defineProperties(event, {
    isPrimary: { value: true },
    pointerId: { value: pointerId },
  });
  act(() => {
    target.dispatchEvent(event);
    const mouseType = ['pointerdown', 'pointermove', 'pointerup'].includes(type)
      ? type.replace('pointer', 'mouse')
      : undefined;
    if (mouseType) {
      target.dispatchEvent(
        new MouseEvent(mouseType, {
          bubbles: true,
          cancelable: true,
          button,
          clientX: x,
        })
      );
    }
  });
};

const fixture = (container?: HTMLElement) => {
  const editor = createEditor();
  const commit = vi.fn();
  const tree = (width = 300, readOnly = false) => (
    <Plate editor={editor} readOnly={readOnly} suppressInstanceWarning>
      <Resizable align="left" onResizeEnd={commit} width={width}>
        <ResizeHandle direction="right" />
      </Resizable>
    </Plate>
  );
  const view = render(tree(), container ? { container } : undefined);
  const handle = Array.from(view.container.getElementsByTagName('div')).find(
    (element) => element.getAttribute('role') === 'slider'
  )!;
  const media = handle.parentElement!;
  Object.defineProperty(media, 'offsetWidth', { value: 300 });
  Object.defineProperty(media.parentElement, 'offsetWidth', { value: 600 });
  return { commit, handle, media, tree, view };
};

describe('media resize pointer lifetime', () => {
  it('expresses mixed percentage constraints and values in the same ARIA unit', () => {
    const f = fixture();
    pointer(f.handle, 'pointerdown', 100);
    pointer(window, 'pointermove', 130);
    expect(
      ['aria-valuemin', 'aria-valuemax', 'aria-valuenow'].map((name) =>
        f.handle.getAttribute(name)
      )
    ).toEqual(['0', '600', '330']);
    f.view.rerender(f.tree(900));
    expect(f.handle.getAttribute('aria-valuenow')).toBe('600');
    expect(f.handle.getAttribute('aria-valuetext')).toBe('600px');
    f.view.unmount();
  });

  it('previews primary pointer movement and commits once on release', () => {
    const f = fixture();
    pointer(f.handle, 'pointerdown', 100);
    pointer(window, 'pointermove', 130);
    expect(f.media.style.width).toBe('330px');
    expect(f.commit).not.toHaveBeenCalled();
    pointer(window, 'pointerup', 150);
    expect(f.commit.mock.calls).toEqual([[350]]);
    pointer(window, 'pointerup', 180);
    expect(f.commit).toHaveBeenCalledTimes(1);
    f.view.unmount();
  });

  it('ignores secondary buttons and other pointer identities', () => {
    const f = fixture();
    pointer(f.handle, 'pointerdown', 100, 1, 2);
    pointer(window, 'pointerup', 150);
    expect(f.commit).not.toHaveBeenCalled();
    pointer(f.handle, 'pointerdown', 100);
    pointer(window, 'pointermove', 180, 2);
    pointer(window, 'pointerup', 180, 2);
    expect(f.media.style.width).toBe('300px');
    expect(f.commit).not.toHaveBeenCalled();
    pointer(window, 'pointerup', 150);
    expect(f.commit.mock.calls).toEqual([[350]]);
    f.view.unmount();
  });

  it('discards the preview on pointer cancellation and window blur', () => {
    for (const reason of ['pointercancel', 'blur']) {
      const f = fixture();
      pointer(f.handle, 'pointerdown', 100);
      pointer(window, 'pointermove', 130);
      expect(f.media.style.width).toBe('330px');
      pointer(window, reason, 130);
      expect(f.media.style.width).toBe('300px');
      pointer(window, 'pointerup', 150);
      expect(f.commit).not.toHaveBeenCalled();
      f.view.unmount();
    }
  });

  it('cancels on unmount, readonly, and an external width change', () => {
    for (const reason of ['unmount', 'readonly', 'external']) {
      const f = fixture();
      pointer(f.handle, 'pointerdown', 100);
      pointer(window, 'pointermove', 130);
      expect(f.media.style.width).toBe('330px');
      if (reason === 'unmount') f.view.unmount();
      else {
        f.view.rerender(
          f.tree(reason === 'external' ? 420 : 300, reason === 'readonly')
        );
      }
      pointer(window, 'pointerup', 150);
      expect(f.commit).not.toHaveBeenCalled();
      if (reason === 'external') expect(f.media.style.width).toBe('420px');
      f.view.unmount();
    }
  });

  it('uses the handle owner window inside an iframe', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const f = fixture(frame.contentDocument!.body);
    try {
      pointer(f.handle, 'pointerdown', 100);
      pointer(window, 'pointermove', 180);
      pointer(window, 'pointerup', 180);
      expect(f.media.style.width).toBe('300px');
      expect(f.commit).not.toHaveBeenCalled();
      pointer(frame.contentWindow!, 'pointermove', 130);
      expect(f.media.style.width).toBe('330px');
      pointer(frame.contentWindow!, 'pointerup', 150);
      expect(f.commit.mock.calls).toEqual([[350]]);
    } finally {
      f.view.unmount();
      frame.remove();
    }
  });
});
