import { type TxOnlyMethod } from '../core/tx-only';
import type { Plugin } from '../interfaces/editor';
import { type Range } from '../interfaces/range';
import { type AuthoredRefusal } from './refusal';
import { authoredMarksSchema } from './tree/marks';
import type { AuthoredChange, AuthoredChangeDetails, AuthoredChangeGroup, AuthoredDecision, AuthoredOptions, AuthoredPage, AuthoredQuery, AuthoredResult, AuthoredView } from './types';
type AuthoredRead = {
    view: () => AuthoredView;
    change: (id: string) => AuthoredChange | null;
    changes: (query?: AuthoredQuery) => AuthoredPage;
    changesAt: (range: Range) => readonly AuthoredChange[];
    details: (id: string) => AuthoredChangeDetails | null;
    /** Pending changes as cards show them, each with its palette rank. */
    groups: () => readonly AuthoredChangeGroup[];
    preview: (decisions: AuthoredDecision | readonly AuthoredDecision[]) => AuthoredResult;
};
type AuthoredUpdate = {
    /**
     * Accept or reject changes in this update, which records nothing. Several
     * decisions decide together, so changes that wait on each other can be
     * accepted and rejected in one call. A blocked result names the changes to
     * decide with them.
     */
    decide: (decisions: AuthoredDecision | readonly AuthoredDecision[]) => AuthoredResult;
    /** Record this update's writes under one change, whatever the intent. */
    propose: TxOnlyMethod<(options?: {
        changeId?: string;
    }) => string>;
};
export type AuthoredPlugin = Plugin<{
    activate: true;
    api: {
        setView: (view: AuthoredView) => void;
        /** Calls the listener with the ids of changes a commit added, changed or removed. */
        subscribeChanges: (listener: (changeIds: readonly string[]) => void) => () => void;
        /**
         * Calls the listener with each Suggesting change the editor refused
         * whole, after it rolled back, and with each view switch it refused.
         */
        subscribeRefusals: (listener: (refusal: AuthoredRefusal) => void) => () => void;
    };
    contributions: true;
    name: 'authored';
    read: AuthoredRead;
    schema: typeof authoredMarksSchema;
    update: AuthoredUpdate;
}>;
/** Deterministic ids, clock and starting intent for tests. */
export type AuthoredTestOptions = AuthoredOptions & Readonly<{
    createChangeId?: () => string;
    createTagId?: () => string;
    intent?: 'edit' | 'propose';
    now?: () => number;
    /**
     * Record what Suggesting refuses, such as a change in a table, as content
     * loaded from elsewhere can hold it.
     */
    vetoes?: false;
}>;
/**
 * The `authored` plugin with deterministic ids, clock and starting intent,
 * for tests.
 */
export declare const createAuthoredPlugin: (options: AuthoredTestOptions) => AuthoredPlugin;
/** Suggestions recorded as review marks in the document. */
export declare const authored: (options: AuthoredOptions) => AuthoredPlugin;
export {};
