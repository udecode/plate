import { createBaseEditor, defineBasePlugin } from '@platejs/core';

import type { CorePluginDefinition } from '../src/lib/plugins/getCorePlugins';
import type {
  CoreEditorApi,
  CoreEditorCapabilityDefinition,
  CoreEditorRead,
  CoreEditorTransaction,
  CoreEditorUpdate,
} from '../src/lib/editor/coreEditorCapabilityDefinition.internal';

type UnionToIntersection<T> = (
  T extends unknown
    ? (value: T) => void
    : never
) extends (value: infer TIntersection) => void
  ? TIntersection
  : never;

type Materialize<T> = { [TKey in keyof T]: T[TKey] };

type CapabilityGroup<TDefinition, TField extends 'api' | 'read' | 'update'> =
  TDefinition extends Readonly<{
    name: infer TName extends string;
  }>
    ? TField extends keyof TDefinition
      ? {
          readonly [TKey in TName]: Extract<TDefinition[TField], object>;
        }
      : {}
    : never;

type CapabilityProjection<TDefinition> = Readonly<{
  api: Materialize<UnionToIntersection<CapabilityGroup<TDefinition, 'api'>>>;
  names: TDefinition extends Readonly<{ name: infer TName extends string }>
    ? TName
    : never;
  read: Materialize<UnionToIntersection<CapabilityGroup<TDefinition, 'read'>>>;
  update: Materialize<
    UnionToIntersection<CapabilityGroup<TDefinition, 'update'>>
  >;
}>;

type TransactionCapabilityGroup<TDefinition> =
  TDefinition extends Readonly<{
    name: infer TName extends string;
    update: infer TUpdate extends object;
  }>
    ? {
        readonly [TKey in TName]: TUpdate &
          (TDefinition extends Readonly<{ read: infer TRead extends object }>
            ? TRead
            : {});
      }
    : {};

type TransactionCapabilityProjection<TDefinition> = Materialize<
  UnionToIntersection<TransactionCapabilityGroup<TDefinition>>
>;

type Equal<TLeft, TRight> = [TLeft] extends [TRight]
  ? [TRight] extends [TLeft]
    ? true
    : false
  : false;

type Assert<T extends true> = T;

type HistoryRead<TDefinition> =
  TDefinition extends Readonly<{
    name: 'history';
    read: infer TRead;
  }>
    ? TRead
    : never;

type PublicHistoryDefinition = Extract<
  CorePluginDefinition,
  Readonly<{ name: 'history' }>
>;

type PublicHistoryExists = Assert<
  [PublicHistoryDefinition] extends [never] ? false : true
>;

type PublicHistoryHasRead = Assert<
  'read' extends keyof PublicHistoryDefinition ? true : false
>;

type CoreEditorNameDrift = Assert<
  Equal<
    CapabilityProjection<CoreEditorCapabilityDefinition>['names'],
    CapabilityProjection<CorePluginDefinition>['names']
  >
>;

type CoreEditorApiDrift = Assert<
  Equal<
    CapabilityProjection<CoreEditorCapabilityDefinition>['api'],
    CapabilityProjection<CorePluginDefinition>['api']
  >
>;

type CoreEditorReadLeafToPublic = Assert<
  HistoryRead<CoreEditorCapabilityDefinition> extends HistoryRead<CorePluginDefinition>
    ? true
    : false
>;

type CoreEditorReadPublicToLeaf = Assert<
  HistoryRead<CorePluginDefinition> extends HistoryRead<CoreEditorCapabilityDefinition>
    ? true
    : false
>;

type CoreEditorUpdateDrift = Assert<
  Equal<
    CapabilityProjection<CoreEditorCapabilityDefinition>['update'],
    CapabilityProjection<CorePluginDefinition>['update']
  >
>;

type CoreEditorApiAliasDrift = Assert<
  Equal<
    Materialize<CoreEditorApi>,
    CapabilityProjection<CoreEditorCapabilityDefinition>['api']
  >
>;

type CoreEditorReadAliasDrift = Assert<
  Equal<
    Materialize<CoreEditorRead>,
    CapabilityProjection<CoreEditorCapabilityDefinition>['read']
  >
>;

type CoreEditorTransactionAliasDrift = Assert<
  Equal<
    Materialize<CoreEditorTransaction>,
    TransactionCapabilityProjection<CoreEditorCapabilityDefinition>
  >
>;

type CoreEditorUpdateAliasDrift = Assert<
  Equal<
    Materialize<CoreEditorUpdate>,
    CapabilityProjection<CoreEditorCapabilityDefinition>['update']
  >
>;

const CustomHtmlPlugin = defineBasePlugin('html', {
  api: () => ({
    customDeserialize: () => 'custom-html' as const,
  }),
});
const customCoreEditor = createBaseEditor({ plugins: [CustomHtmlPlugin] });
const customHtmlResult: 'custom-html' =
  customCoreEditor.api.html.customDeserialize();

// @ts-expect-error An explicit same-name plugin replaces the built-in Core capability.
customCoreEditor.api.html.deserialize({ element: '<p>core</p>' });

void customHtmlResult;

export type {
  CoreEditorApiAliasDrift,
  CoreEditorApiDrift,
  CoreEditorNameDrift,
  CoreEditorReadAliasDrift,
  CoreEditorReadLeafToPublic,
  CoreEditorReadPublicToLeaf,
  CoreEditorTransactionAliasDrift,
  CoreEditorUpdateAliasDrift,
  CoreEditorUpdateDrift,
  PublicHistoryExists,
  PublicHistoryHasRead,
};
