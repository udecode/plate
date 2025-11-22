/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createPlateTestEditor } from '../__tests__/createPlateTestEditor';
import { createPlatePlugin } from '../plugin';

jsxt;

describe('SlateReactExtensionPlugin keyboard shortcuts', () => {
  describe('moveLine', () => {
    it('should call moveLine with reverse: true on ArrowUp', async () => {
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

    it('should call moveLine with reverse: false on ArrowDown', async () => {
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

    it('should allow custom moveLine implementation to handle the event', async () => {
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
      expect(moveLineMock).toHaveReturnedWith(true);
    });

    it('should use default behavior when moveLine returns false', async () => {
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
      expect(moveLineMock).toHaveReturnedWith(false);
    });
  });

  describe('tab', () => {
    it('should call tab with reverse: false on Tab', async () => {
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

    it('should call tab with reverse: true on Shift+Tab', async () => {
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

    it('should allow custom tab implementation to handle the event', async () => {
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
      expect(tabMock).toHaveReturnedWith(true);
    });

    it('should use default behavior when tab returns false', async () => {
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
      expect(tabMock).toHaveReturnedWith(false);
    });
  });

  describe('selectAll', () => {
    it('should call selectAll on Mod+A', async () => {
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

    it('should allow custom selectAll implementation to handle the event', async () => {
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
      expect(selectAllMock).toHaveReturnedWith(true);
    });

    it('should use default behavior when selectAll returns false', async () => {
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
      expect(selectAllMock).toHaveReturnedWith(false);
    });
  });

  describe('escape', () => {
    it('should call escape on Escape key', async () => {
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

    it('should allow custom escape implementation to handle the event', async () => {
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
      expect(escapeMock).toHaveReturnedWith(true);
    });

    it('should use default behavior when escape returns false', async () => {
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
      expect(escapeMock).toHaveReturnedWith(false);
    });
  });

  describe('default behavior', () => {
    it('should use default moveLine implementation when not overridden', async () => {
      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [],
      });

      // Should not throw any errors
      await triggerKeyboardEvent('ArrowUp');
      await triggerKeyboardEvent('ArrowDown');
    });

    it('should use default tab implementation when not overridden', async () => {
      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [],
      });

      // Should not throw any errors
      await triggerKeyboardEvent('Tab');
      await triggerKeyboardEvent('Shift+Tab');
    });

    it('should use default selectAll implementation when not overridden', async () => {
      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [],
      });

      // Should not throw any errors
      await triggerKeyboardEvent('mod+a');
    });

    it('should use default escape implementation when not overridden', async () => {
      const [, { triggerKeyboardEvent }] = await createPlateTestEditor({
        plugins: [],
      });

      // Should not throw any errors
      await triggerKeyboardEvent('Escape');
    });
  });

  describe('integration', () => {
    it('should work with multiple custom implementations', async () => {
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
