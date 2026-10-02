import {
  type RuntimePluginTypeProviderOf,
  type RuntimeTransferPlugin,
  transfer,
  type TransferApi,
  type TransferRead,
} from '../../facade';
import { definePlugin, type BasePlugin, type DefinitionOf } from '../plugin';

type TransferPluginDefinition = Readonly<{
  api: TransferApi;
  enabled: boolean;
  name: 'transfer';
  read: TransferRead;
}>;

type TransferPluginDescriptor = BasePlugin<TransferPluginDefinition> &
  RuntimePluginTypeProviderOf<RuntimeTransferPlugin>;

/** Moves and copies blocks and text through one admission law. */
export const TransferPlugin = definePlugin('transfer', {}).extend(() =>
  transfer()
) as unknown as TransferPluginDescriptor;

export type TransferDefinition = DefinitionOf<typeof TransferPlugin>;
