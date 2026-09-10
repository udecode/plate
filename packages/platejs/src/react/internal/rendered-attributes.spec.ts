import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import type { NodeKey } from '../../facade';
import { mergePlateRenderedAttributes } from '../../internal/mergePlateRenderedAttributes';
import {
  createPlateRenderedAttributeStore,
  PlateRenderedAttributeProvider,
  usePlateRenderedAttributes,
  usePublishPlateRenderedAttributes,
} from './rendered-attributes';

const nodeKey = (value: string) => value as NodeKey;

describe('Plate rendered attributes', () => {
  it('keeps transient client paint out of server output', () => {
    const key = nodeKey('server-node');
    const Probe = () => {
      usePublishPlateRenderedAttributes('server-source', 0, [
        { attributes: { 'data-client-paint': 'true' }, key },
      ]);
      const attributes = usePlateRenderedAttributes(key);

      return React.createElement('div', attributes);
    };
    const html = renderToString(
      React.createElement(
        PlateRenderedAttributeProvider,
        null,
        React.createElement(Probe)
      )
    );

    expect(html).not.toContain('data-client-paint');
  });

  it('hydrates server output before publishing transient client paint', async () => {
    const key = nodeKey('hydrated-node');
    const Probe = () => {
      usePublishPlateRenderedAttributes('hydrated-source', 0, [
        { attributes: { 'data-client-paint': 'true' }, key },
      ]);
      const attributes = usePlateRenderedAttributes(key);

      return React.createElement('div', attributes);
    };
    const tree = React.createElement(
      PlateRenderedAttributeProvider,
      null,
      React.createElement(Probe)
    );
    const container = document.createElement('div');

    container.innerHTML = renderToString(tree);

    let root: ReturnType<typeof hydrateRoot> | undefined;

    await act(async () => {
      root = hydrateRoot(container, tree);
      await Promise.resolve();
    });

    expect(container.firstElementChild).toHaveAttribute(
      'data-client-paint',
      'true'
    );

    await act(async () => {
      root?.unmount();
    });
  });

  it('keeps publishing after Strict Mode replays provider effects', async () => {
    const key = nodeKey('strict-node');
    let setActive: React.Dispatch<React.SetStateAction<boolean>> = () => {};
    const Probe = () => {
      const [active, setActiveState] = React.useState(false);

      setActive = setActiveState;
      usePublishPlateRenderedAttributes(
        'strict-source',
        0,
        active ? [{ attributes: { 'data-active': 'true' }, key }] : []
      );
      const attributes = usePlateRenderedAttributes(key);

      return React.createElement('div', attributes);
    };
    const mounted = render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(
          PlateRenderedAttributeProvider,
          null,
          React.createElement(Probe)
        )
      )
    );

    act(() => {
      setActive(true);
    });

    await waitFor(() => {
      expect(mounted.container.firstElementChild).toHaveAttribute(
        'data-active',
        'true'
      );
    });
  });

  it('publishes only changed NodeKey buckets and preserves source order', () => {
    const first = nodeKey('first');
    const second = nodeKey('second');
    const store = createPlateRenderedAttributeStore();
    const firstListener = mock(() => {});
    const secondListener = mock(() => {});
    const releaseFirst = store.subscribeNodeKey(first, firstListener);
    const releaseSecond = store.subscribeNodeKey(second, secondListener);

    store.replaceSource('navigation', 0, [
      {
        attributes: {
          'data-nav-target': 'true',
          className: 'navigation',
          style: { color: 'red' },
        },
        key: first,
      },
    ]);

    expect(firstListener).toHaveBeenCalledTimes(1);
    expect(secondListener).not.toHaveBeenCalled();

    store.replaceSource('placeholder', 1, [
      {
        attributes: {
          className: 'placeholder',
          placeholder: 'Write something',
          style: { opacity: 0.5 },
        },
        key: first,
      },
    ]);

    expect(store.getNodeSnapshot(first)).toEqual({
      'data-nav-target': 'true',
      className: 'navigation placeholder',
      placeholder: 'Write something',
      style: { color: 'red', opacity: 0.5 },
    });

    firstListener.mockClear();
    secondListener.mockClear();
    store.replaceSource('navigation', 0, [
      {
        attributes: {
          'data-nav-target': 'true',
          className: 'navigation',
        },
        key: second,
      },
    ]);

    expect(firstListener).toHaveBeenCalledTimes(1);
    expect(secondListener).toHaveBeenCalledTimes(1);
    expect(store.getNodeSnapshot(first)).toEqual({
      className: 'placeholder',
      placeholder: 'Write something',
      style: { opacity: 0.5 },
    });
    expect(store.getNodeSnapshot(second)).toEqual({
      'data-nav-target': 'true',
      className: 'navigation',
    });

    releaseFirst();
    releaseSecond();
    expect(store.getMetrics()).toMatchObject({
      changedNodeCount: 4,
      nodeSubscriptionCount: 0,
      publicationCount: 3,
      wakeCount: 4,
    });
  });

  it('merges by compiled source order instead of publication timing', () => {
    const key = nodeKey('node');
    const store = createPlateRenderedAttributeStore();

    store.replaceSource('later-plugin', 1, [
      { attributes: { className: 'later', placeholder: 'later' }, key },
    ]);
    store.replaceSource('earlier-plugin', 0, [
      { attributes: { className: 'earlier', placeholder: 'earlier' }, key },
    ]);

    expect(store.getNodeSnapshot(key)).toEqual({
      className: 'earlier later',
      placeholder: 'later',
    });
  });

  it('reuses equal snapshots and clears only the removed source', () => {
    const key = nodeKey('node');
    const store = createPlateRenderedAttributeStore();
    const listener = mock(() => {});

    store.subscribeNodeKey(key, listener);
    store.replaceSource('one', 0, [{ attributes: { className: 'one' }, key }]);
    const snapshot = store.getNodeSnapshot(key);

    listener.mockClear();
    store.replaceSource('one', 0, [{ attributes: { className: 'one' }, key }]);

    expect(listener).not.toHaveBeenCalled();
    expect(store.getNodeSnapshot(key)).toBe(snapshot);

    store.replaceSource('two', 1, [{ attributes: { className: 'two' }, key }]);
    store.clearSource('one');

    expect(store.getNodeSnapshot(key)).toEqual({ className: 'two' });
  });

  it('rejects event handlers and refs from the private paint channel', () => {
    const key = nodeKey('node');
    const store = createPlateRenderedAttributeStore();

    expect(() =>
      store.replaceSource('event', 0, [
        { attributes: { onClick: () => {} } as never, key },
      ])
    ).toThrow('Unsupported rendered attribute "onClick".');
    expect(() =>
      store.replaceSource('ref', 0, [
        { attributes: { ref: () => {} } as never, key },
      ])
    ).toThrow('Unsupported rendered attribute "ref".');
    expect(() =>
      store.replaceSource('data', 0, [
        { attributes: { 'data-state': {} } as never, key },
      ])
    ).toThrow('Rendered attribute "data-state" must be a primitive value.');
    expect(() =>
      store.replaceSource('style', 0, [
        { attributes: { style: { color: {} } } as never, key },
      ])
    ).toThrow('Rendered style "color" must be a string or number.');
  });

  it('merges paint without replacing host refs or handlers', () => {
    const ref = () => {};
    const onClick = () => {};
    const attributes = mergePlateRenderedAttributes(
      { className: 'host', onClick, ref, style: { color: 'black' } },
      {
        className: 'paint',
        placeholder: 'Write',
        style: { opacity: 0.5 },
      }
    );

    expect(attributes).toMatchObject({
      className: 'host paint',
      onClick,
      placeholder: 'Write',
      ref,
      style: { color: 'black', opacity: 0.5 },
    });
  });
});
