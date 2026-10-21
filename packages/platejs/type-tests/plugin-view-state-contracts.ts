import { createEditor, definePlugin } from 'platejs';
import {
  definePlugin as definePlatePlugin,
  toReactPlugin,
  useViewStore,
} from 'platejs/react';

type Equal<TLeft, TRight> =
  (<T>() => T extends TLeft ? 1 : 2) extends <T>() => T extends TRight ? 1 : 2
    ? true
    : false;

const OpenStatePlugin = definePlugin('openState', {
  initialViewState: () => ({ openKeys: [] as string[], pinned: false }),
})
  .extend(({ editor, viewStoreOf }) => {
    // @ts-expect-error An editor carries no presentation, so it cannot name a view store.
    viewStoreOf(editor);

    return {
      read: ({ state }) => ({
        openKeys: () => {
          const store = viewStoreOf(state);
          const openKeys: readonly string[] = store.get('openKeys');

          // @ts-expect-error A read state's view store has no setter.
          store.set({ pinned: true });
          // @ts-expect-error The store keeps the keys initialViewState declares.
          store.get('missing');

          return openKeys;
        },
      }),
      update: ({ tx }) => ({
        openNext: () => {
          const store = viewStoreOf(tx);

          store.set({ openKeys: [...store.get('openKeys'), 'next'] });
          store.set((draft) => {
            draft.pinned = true;
          });
        },
      }),
    };
  })
  .extend((context) => {
    // @ts-expect-error The .extend context names a view only through viewStoreOf.
    void context.viewStore;

    return {
      api: ({ viewStore }) => ({
        isPinned: (): boolean => viewStore.get('pinned'),
      }),
    };
  });

definePlugin('constructorOpenState', {
  initialViewState: () => ({ open: false }),
  read: ({ state, viewStoreOf }) => ({
    isOpen: (): boolean => viewStoreOf(state).get('open'),
  }),
});

definePlugin('constructorChangeOpenState', {
  initialViewState: () => ({ open: false }),
  on: {
    transactionChange: ({ tx, viewStoreOf }) => {
      const open: boolean = viewStoreOf(tx).get('open');

      // @ts-expect-error A constructor callback keeps the declared view state.
      viewStoreOf(tx).get('missing');

      void open;
    },
  },
});

definePlugin('constructorInjectOpenState', {
  initialViewState: () => ({ open: false }),
  inject: {
    nodeProps: {
      transformProps: ({ editor, props, viewStoreOf }) => {
        const open: boolean = editor.read((state) =>
          viewStoreOf(state).get('open')
        );

        // @ts-expect-error An inject callback keeps the declared view state.
        editor.read((state) => viewStoreOf(state).get('missing'));

        void open;

        return props;
      },
    },
  },
});

const openStateEditor = createEditor({ plugins: [OpenStatePlugin] });
const portalStore = openStateEditor.plugin(OpenStatePlugin).viewStore;
const viewState = portalStore.get();

const viewStateMatches: Equal<
  typeof viewState,
  Readonly<{ openKeys: readonly string[]; pinned: boolean }>
> = true;

portalStore.set({ pinned: true });
// @ts-expect-error Portal writes keep the declared field types.
portalStore.set({ pinned: 'yes' });

toReactPlugin(OpenStatePlugin).extend((context) => {
  // @ts-expect-error A React .extend context has no bare viewStore either.
  void context.viewStore;
  void context.viewStoreOf;

  return {};
});

const ReactOpenStatePlugin = definePlatePlugin('reactOpenState', {
  initialViewState: () => ({ count: 0 }),
}).extend(({ viewStoreOf }) => ({
  api: ({ viewStore }) => ({
    count: (): number => viewStore.get('count'),
  }),
  update: ({ tx }) => ({
    increment: () => {
      viewStoreOf(tx).set((draft) => {
        draft.count += 1;
      });
    },
  }),
}));

definePlatePlugin('reactConstructorDecorateOpenState', {
  initialViewState: () => ({ open: false }),
  decorate: {
    read: ({ editor, viewStoreOf }) => {
      const open: boolean = editor.read((state) =>
        viewStoreOf(state).get('open')
      );

      // @ts-expect-error A decorate callback keeps the declared view state.
      editor.read((state) => viewStoreOf(state).get('missing'));

      void open;

      return [];
    },
  },
});

definePlatePlugin('reactConstructorChangeOpenState', {
  initialViewState: () => ({ open: false }),
  on: {
    transactionChange: ({ tx, viewStoreOf }) => {
      const open: boolean = viewStoreOf(tx).get('open');

      // @ts-expect-error A React constructor callback keeps the declared view state.
      viewStoreOf(tx).get('missing');

      void open;
    },
  },
});

const useViewStoreContracts = () => {
  const count: number = useViewStore(
    ReactOpenStatePlugin,
    (state) => state.count
  );
  // @ts-expect-error The selector sees only the declared view state.
  useViewStore(ReactOpenStatePlugin, (state) => state.missing);
  // @ts-expect-error A name-only object carries no view state contract.
  useViewStore({ name: 'reactOpenState' }, () => 0);

  return count;
};

void viewStateMatches;
void useViewStoreContracts;
