import { createAtomStore } from './createAtomStore';

describe('createAtomStore', () => {
  describe('when store name is empty', () => {
    it('should be defined', () => {
      const { store, useStore } = createAtomStore({});

      expect(store).toBeDefined();
      expect(store.atom).toBeDefined();
      expect(useStore).toBeDefined();
      expect(useStore().get).toBeDefined();
      expect(useStore().use).toBeDefined();
      expect(useStore().set).toBeDefined();
    });
  });

  describe('when store name is defined', () => {
    it('should be defined', () => {
      const { namedStore, useNamedStore, name } = createAtomStore(
        {
          a: 1,
          b: 'a',
        },
        {
          name: 'named',
          scope: 'named',
        }
      );

      expect(name).toBe('named');
      expect(namedStore.scope).toBe('named');
      expect(namedStore.atom.b).toBeDefined();
      expect(useNamedStore().get.b).toBeDefined();
      expect(useNamedStore().use.b).toBeDefined();
      expect(useNamedStore().set.b).toBeDefined();
    });
  });

  describe('when store is extended', () => {
    it('should be defined', () => {
      const { namedStore } = createAtomStore(
        {
          a: 1,
          b: 'a',
        },
        {
          name: 'named',
        }
      );
      const { renamedStore, useRenamedStore, name } = namedStore.extend(
        {
          c: 2,
        },
        {
          name: 'renamed',
          scope: 'renamed',
        }
      );

      expect(name).toBe('renamed');
      expect(renamedStore.scope).toBe('renamed');
      expect(useRenamedStore().get.b).toBeDefined();
      expect(useRenamedStore().use.b).toBeDefined();
      expect(useRenamedStore().set.b).toBeDefined();
      expect(useRenamedStore().get.c).toBeDefined();
    });
  });
});
