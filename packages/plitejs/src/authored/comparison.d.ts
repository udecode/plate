import type { TwoWayComparison } from '../diff/lib/comparison-types';
import type { AnyEditor, Value } from '../interfaces/editor';
export type AuthoredComparisonImportResult = Readonly<{
    ids: readonly string[];
    mappings: ReadonlyArray<Readonly<{
        changeId: string;
        groupId: string;
    }>>;
    status: 'applied' | 'unchanged';
}> | Readonly<{
    reason: 'authored-frontier' | 'document' | 'schema';
    status: 'stale';
}> | Readonly<{
    reason: 'ambiguous-selection' | 'dependency';
    status: 'blocked';
}> | Readonly<{
    reason: 'comparison' | 'selection';
    status: 'invalid';
}> | Readonly<{
    reason: 'actor' | 'plugin';
    status: 'unavailable';
}>;
/** Publish a validated fixed-revision comparison as one native proposal. */
export declare const proposeAuthoredComparison: <V extends Value>(editor: AnyEditor<V>, input: Readonly<{
    comparison: TwoWayComparison<V>;
    groupIds?: readonly string[];
}>) => AuthoredComparisonImportResult;
