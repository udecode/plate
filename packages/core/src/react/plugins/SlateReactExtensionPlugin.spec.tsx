/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createPlateTestEditor } from '../__tests__/createPlateTestEditor';
import { createPlatePlugin } from '../plugin';

jsxt;

describe('SlateReactExtensionPlugin keyboard shortcuts', () => {
  describe('moveLine', () => {
    it('call moveLine with reverse: true on ArrowUp', async () => {
      const moveLineMock = mock().mockReturnValue(false);

      const testPlugin = createPlatePlugin({
        key: 'testPlugin',
      }).overrideEditor(() => ({
        transforms: {
          moveLine: moveLineMock,
        },
      }));

      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [testPlugin],
      });

      await triggerKeyboardEvent('ArrowUp');

      expect(moveLineMock).toHaveBeenCalledWith({ reverse: true });
    });

    it('call moveLine with reverse: false on ArrowDown', async () => {
      const moveLineMock = mock().mockReturnValue(false);

      const testPlugin = createPlatePlugin({
        key: 'testPlugin',
      }).overrideEditor(() => ({
        transforms: {
          moveLine: moveLineMock,
        },
      }));

      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [testPlugin],
      });

      await triggerKeyboardEvent('ArrowDown');

      expect(moveLineMock).toHaveBeenCalledWith({ reverse: false });
    });

    it('allow custom moveLine implementation to handle the event', async () => {
      const moveLineMock = mock().mockReturnValue(true);

      const testPlugin = createPlatePlugin({
        key: 'testPlugin',
      }).overrideEditor(() => ({
        transforms: {
          moveLine: moveLineMock,
        },
      }));

      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [testPlugin],
      });

      await triggerKeyboardEvent('ArrowUp');

      expect(moveLineMock).toHaveBeenCalledWith({ reverse: true });
      expect(moveLineMock.mock.results.at(-1)?.value).toBe(true);
    });

    it('use default behavior when moveLine returns false', async () => {
      const moveLineMock = mock().mockReturnValue(false);

      const testPlugin = createPlatePlugin({
        key: 'testPlugin',
      }).overrideEditor(() => ({
        transforms: {
          moveLine: moveLineMock,
        },
      }));

      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [testPlugin],
      });

      await triggerKeyboardEvent('ArrowDown');

      expect(moveLineMock).toHaveBeenCalledWith({ reverse: false });
      expect(moveLineMock.mock.results.at(-1)?.value).toBe(false);
    });
  });

  describe('tab', () => {
    it('call tab with reverse: false on Tab', async () => {
      const tabMock = mock().mockReturnValue(false);

      const testPlugin = createPlatePlugin({
        key: 'testPlugin',
      }).overrideEditor(() => ({
        transforms: {
          tab: tabMock,
        },
      }));

      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [testPlugin],
      });

      await triggerKeyboardEvent('Tab');

      expect(tabMock).toHaveBeenCalledWith({ reverse: false });
    });

    it('call tab with reverse: true on Shift+Tab', async () => {
      const tabMock = mock().mockReturnValue(false);

      const testPlugin = createPlatePlugin({
        key: 'testPlugin',
      }).overrideEditor(() => ({
        transforms: {
          tab: tabMock,
        },
      }));

      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [testPlugin],
      });

      await triggerKeyboardEvent('Shift+Tab');

      expect(tabMock).toHaveBeenCalledWith({ reverse: true });
    });

    it('allow custom tab implementation to handle the event', async () => {
      const tabMock = mock().mockReturnValue(true);

      const testPlugin = createPlatePlugin({
        key: 'testPlugin',
      }).overrideEditor(() => ({
        transforms: {
          tab: tabMock,
        },
      }));

      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [testPlugin],
      });

      await triggerKeyboardEvent('Tab');

      expect(tabMock).toHaveBeenCalledWith({ reverse: false });
      expect(tabMock.mock.results.at(-1)?.value).toBe(true);
    });

    it('use default behavior when tab returns false', async () => {
      const tabMock = mock().mockReturnValue(false);

      const testPlugin = createPlatePlugin({
        key: 'testPlugin',
      }).overrideEditor(() => ({
        transforms: {
          tab: tabMock,
        },
      }));

      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [testPlugin],
      });

      await triggerKeyboardEvent('Shift+Tab');

      expect(tabMock).toHaveBeenCalledWith({ reverse: true });
      expect(tabMock.mock.results.at(-1)?.value).toBe(false);
    });
  });

  describe('selectAll', () => {
    it('call selectAll on Mod+A', async () => {
      const selectAllMock = mock().mockReturnValue(false);

      const testPlugin = createPlatePlugin({
        key: 'testPlugin',
      }).overrideEditor(() => ({
        transforms: {
          selectAll: selectAllMock,
        },
      }));

      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [testPlugin],
      });

      await triggerKeyboardEvent('mod+a');

      expect(selectAllMock).toHaveBeenCalledWith();
    });

    it('allow custom selectAll implementation to handle the event', async () => {
      const selectAllMock = mock().mockReturnValue(true);

      const testPlugin = createPlatePlugin({
        key: 'testPlugin',
      }).overrideEditor(() => ({
        transforms: {
          selectAll: selectAllMock,
        },
      }));

      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [testPlugin],
      });

      await triggerKeyboardEvent('mod+a');

      expect(selectAllMock).toHaveBeenCalledWith();
      expect(selectAllMock.mock.results.at(-1)?.value).toBe(true);
    });

    it('use default behavior when selectAll returns false', async () => {
      const selectAllMock = mock().mockReturnValue(false);

      const testPlugin = createPlatePlugin({
        key: 'testPlugin',
      }).overrideEditor(() => ({
        transforms: {
          selectAll: selectAllMock,
        },
      }));

      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [testPlugin],
      });

      await triggerKeyboardEvent('mod+a');

      expect(selectAllMock).toHaveBeenCalledWith();
      expect(selectAllMock.mock.results.at(-1)?.value).toBe(false);
    });
  });

  describe('escape', () => {
    it('call escape on Escape key', async () => {
      const escapeMock = mock().mockReturnValue(false);

      const testPlugin = createPlatePlugin({
        key: 'testPlugin',
      }).overrideEditor(() => ({
        transforms: {
          escape: escapeMock,
        },
      }));

      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [testPlugin],
      });

      await triggerKeyboardEvent('Escape');

      expect(escapeMock).toHaveBeenCalledWith();
    });

    it('allow custom escape implementation to handle the event', async () => {
      const escapeMock = mock().mockReturnValue(true);

      const testPlugin = createPlatePlugin({
        key: 'testPlugin',
      }).overrideEditor(() => ({
        transforms: {
          escape: escapeMock,
        },
      }));

      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [testPlugin],
      });

      await triggerKeyboardEvent('Escape');

      expect(escapeMock).toHaveBeenCalledWith();
      expect(escapeMock.mock.results.at(-1)?.value).toBe(true);
    });

    it('use default behavior when escape returns false', async () => {
      const escapeMock = mock().mockReturnValue(false);

      const testPlugin = createPlatePlugin({
        key: 'testPlugin',
      }).overrideEditor(() => ({
        transforms: {
          escape: escapeMock,
        },
      }));

      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [testPlugin],
      });

      await triggerKeyboardEvent('Escape');

      expect(escapeMock).toHaveBeenCalledWith();
      expect(escapeMock.mock.results.at(-1)?.value).toBe(false);
    });
  });

  describe('default behavior', () => {
    it('use default moveLine implementation when not overridden', async () => {
      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [],
      });

      // Should not throw any errors
      await triggerKeyboardEvent('ArrowUp');
      await triggerKeyboardEvent('ArrowDown');
    });

    it('use default tab implementation when not overridden', async () => {
      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [],
      });

      // Should not throw any errors
      await triggerKeyboardEvent('Tab');
      await triggerKeyboardEvent('Shift+Tab');
    });

    it('use default selectAll implementation when not overridden', async () => {
      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [],
      });

      // Should not throw any errors
      await triggerKeyboardEvent('mod+a');
    });

    it('use default escape implementation when not overridden', async () => {
      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [],
      });

      // Should not throw any errors
      await triggerKeyboardEvent('Escape');
    });
  });

  describe('integration', () => {
    it('work with multiple custom implementations', async () => {
      const moveLineMock = mock().mockReturnValue(true);
      const tabMock = mock().mockReturnValue(false);
      const selectAllMock = mock().mockReturnValue(true);
      const escapeMock = mock().mockReturnValue(false);

      const testPlugin = createPlatePlugin({
        key: 'testPlugin',
      }).overrideEditor(() => ({
        transforms: {
          escape: escapeMock,
          moveLine: moveLineMock,
          selectAll: selectAllMock,
          tab: tabMock,
        },
      }));

      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [testPlugin],
      });

      await triggerKeyboardEvent('ArrowUp');
      await triggerKeyboardEvent('Tab');
      await triggerKeyboardEvent('mod+a');
      await triggerKeyboardEvent('Escape');

      expect(moveLineMock).toHaveBeenCalledWith({ reverse: true });
      expect(tabMock).toHaveBeenCalledWith({ reverse: false });
      expect(selectAllMock).toHaveBeenCalledWith();
      expect(escapeMock).toHaveBeenCalledWith();
    });
  });
});
