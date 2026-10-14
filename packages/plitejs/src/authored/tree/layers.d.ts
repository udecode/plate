import type { EditorJsonValue } from '../../interfaces/json';
/** A property value, with `undefined` for an absent property; `null` counts as absent. */
export type LayerValue = EditorJsonValue | undefined;
/**
 * One property write a pending suggestion made. Nothing edits a tag after it
 * is written: recording, decisions and Editing takeover only add or remove
 * whole tags.
 */
export type FormatTag = Readonly<{
    at: number;
    author: string;
    /** The value this write replaced; absent when the property was absent. */
    before?: EditorJsonValue;
    change: string;
    id: string;
    key: string;
    kind: 'format';
    /** The key's tips when this was written; absent over the accepted value. */
    over?: readonly string[];
}>;
export type LayerOutcome = (change: string) => 'accept' | 'keep' | 'reject';
export type KeyDecision = Readonly<{
    /** The tags left on the key, each the same object as an input tag. */
    kept: readonly FormatTag[];
    value: Readonly<{
        kind: 'set';
        value: LayerValue;
    }> | Readonly<{
        kind: 'unchanged';
    }>;
    /** Pending changes the decision waits on; non-empty means nothing changed. */
    waits: readonly string[];
}>;
/** One tag, or a fork: tags written concurrently from one point, decided as one. */
type Step = Readonly<{
    below: LayerValue;
    tags: readonly FormatTag[];
}>;
/**
 * The key's tags as a chain of steps, bottom first. `over` is read against the
 * tags present, so an id a decision removed means the accepted value. A tag
 * every other tag descends from or leads to is a step of its own; the tags
 * between two such tags, which some concurrent write left incomparable, form
 * one fork step.
 */
export declare const keySteps: (tags: readonly FormatTag[]) => readonly Step[];
/** The ids of the key's tips: the tags no other present tag was written over. */
export declare const keyTips: (tags: readonly FormatTag[]) => readonly string[];
/**
 * Decide one key. A suggestion built on another depends on it: accepting a
 * step waits on every pending step below it, rejecting one waits on every
 * pending step above it, and a decision on one tag of a fork waits on the
 * fork's other tags. The value comes from the highest step not rejected: the
 * live value when it is the top step, otherwise the value the step above it
 * replaced; with every step rejected, the value the bottom step replaced. It
 * never compares the live value with a tag, so a correction that rewrote the
 * live value changes no decision.
 */
export declare const decideKey: (live: LayerValue, tags: readonly FormatTag[], outcome: LayerOutcome) => KeyDecision;
/**
 * Record one property write. Editing commands take the key over, Editing
 * corrections keep every tag, and Suggesting adds a tag over the key's tips,
 * except on the writer's own pending insertion when no other change holds the
 * key, or over the writer's own run of tags at the top: a value that returns
 * to what the run replaced withdraws the run, and any other value replaces it
 * with one tag from that value, so a reviewer sees each writer's change to a
 * key once.
 */
export declare const writeLayer: (input: Readonly<{
    intent: 'edit' | 'propose';
    isOwn: (tag: FormatTag) => boolean;
    next: LayerValue;
    ownInsertion: boolean;
    previous: LayerValue;
    source: 'command' | 'correction';
    tag: (fields: Pick<FormatTag, 'before' | 'over'>) => FormatTag;
    tags: readonly FormatTag[];
}>) => readonly FormatTag[];
export {};
