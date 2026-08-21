import { act, render } from '@testing-library/react';
import { startTransition, Suspense } from 'react';

import { EditableDOMRuntime } from '../src/editable/editable-dom-runtime';
import { usePublishedAndroidInputManager } from '../src/editable/runtime-android-engine';
import type { AndroidInputManager } from '../src/hooks/android-input-manager/android-input-manager';
import { createReactEditor } from '../src/plugin/with-react';

test('an abandoned render cannot publish its Android input manager', () => {
  const runtime = new EditableDOMRuntime({ editor: createReactEditor() });
  const committedManager = {} as AndroidInputManager;
  const abandonedManager = {} as AndroidInputManager;
  const replacementManager = {} as AndroidInputManager;
  const suspended = new Promise<never>(() => {});

  const RuntimeOwner = ({
    abandon,
    inputManager,
  }: {
    abandon: boolean;
    inputManager: AndroidInputManager;
  }) => {
    usePublishedAndroidInputManager({ inputManager, runtime });

    if (abandon) throw suspended;

    return null;
  };
  const tree = (inputManager: AndroidInputManager, abandon = false) => (
    <Suspense fallback={null}>
      <RuntimeOwner abandon={abandon} inputManager={inputManager} />
    </Suspense>
  );
  const mounted = render(tree(committedManager));

  expect(runtime.androidInputManagerRef.current).toBe(committedManager);

  act(() => {
    startTransition(() => {
      mounted.rerender(tree(abandonedManager, true));
    });
  });

  expect(runtime.androidInputManagerRef.current).toBe(committedManager);

  runtime.androidInputManagerRef.current = replacementManager;
  mounted.unmount();

  expect(runtime.androidInputManagerRef.current).toBe(replacementManager);

  runtime.androidInputManagerRef.current = null;
  runtime.destroy();
});
