import create from 'zustand';
import createVanillaStore from 'zustand/vanilla';
import { PlateStates } from '../../types/PlateStore';

/**
 * Plate vanilla store.
 * @see zustand vanilla store
 */
export const plateStore = createVanillaStore<PlateStates>(() => ({}));

// export const plateAtom = atomWithStore(plateStore);

// const factory = () => atom<PlateState>({});

/**
 * Plate store.
 * @see zustand store
 */
export const usePlateStore = create(plateStore);
