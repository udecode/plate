import type {
  EditorInstalledReadGroups,
  EditorInstalledUpdateGroups,
  EditorStateView,
  EditorUpdateTransaction,
  Value,
} from '../../core';
import type { YjsRemoteCursorData, YjsState, YjsTx } from './types';

type InstalledYjsState<
  V extends Value,
  TExtensions extends readonly unknown[],
> =
  EditorInstalledReadGroups<V, TExtensions> extends {
    yjs: infer TYjsState extends YjsState;
  }
    ? TYjsState
    : YjsState;

export type EditorYjsCursorDataFor<
  V extends Value,
  TExtensions extends readonly unknown[],
> =
  InstalledYjsState<V, TExtensions> extends YjsState<infer TCursorData>
    ? TCursorData
    : YjsRemoteCursorData;

export type EditorYjsStateFor<
  V extends Value,
  TExtensions extends readonly unknown[],
> = YjsState<EditorYjsCursorDataFor<V, TExtensions>>;

type InstalledYjsTx<V extends Value, TExtensions extends readonly unknown[]> =
  EditorInstalledUpdateGroups<V, TExtensions> extends {
    yjs: infer TYjsTx extends YjsTx<any>;
  }
    ? TYjsTx
    : YjsTx;

type EditorYjsTxFor<V extends Value, TExtensions extends readonly unknown[]> =
  InstalledYjsTx<V, TExtensions> extends YjsTx<infer TCursorData>
    ? YjsTx<TCursorData>
    : YjsTx;

export const getEditorYjsState = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  state: EditorStateView<V, TExtensions>
): EditorYjsStateFor<V, TExtensions> =>
  (
    state as unknown as {
      yjs: EditorYjsStateFor<V, TExtensions>;
    }
  ).yjs;

export const getEditorYjsTx = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  tx: EditorUpdateTransaction<V, TExtensions>
): EditorYjsTxFor<V, TExtensions> =>
  (
    tx as unknown as {
      yjs: EditorYjsTxFor<V, TExtensions>;
    }
  ).yjs;
