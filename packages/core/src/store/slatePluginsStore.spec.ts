import { slatePluginsStore } from './slatePluginsStore';

it('should be', () => {
  expect(slatePluginsStore.getState().byId.main).toBeDefined();
});
