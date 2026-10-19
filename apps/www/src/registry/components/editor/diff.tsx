'use client';

import type {
  Comparison,
  ComparisonBranch,
  ComparisonEffect,
  ComparisonEvidence,
  ComparisonResolution,
  ComparisonSpan,
} from 'platejs/diff';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type DiffGranularity = 'grapheme' | 'line' | 'section' | 'word';

const effectLabels: Record<ComparisonEffect['kind'], string> = {
  delete: 'Deletion',
  insert: 'Insertion',
  join: 'Join',
  'node-type': 'Type change',
  placement: 'Move',
  property: 'Properties',
  'root-create': 'Root created',
  'root-delete': 'Root deleted',
  split: 'Split',
  structure: 'Structure',
  text: 'Text',
  wrapper: 'Wrapper',
};

const segmentText = (
  text: string,
  granularity: DiffGranularity,
  locale?: string
): readonly string[] => {
  if (granularity === 'section' || text.length === 0) return [text];
  if (granularity === 'line') {
    return text.match(/[^\r\n]*(?:\r\n|\r|\n)|[^\r\n]+$/gu) ?? [text];
  }

  return Array.from(
    new Intl.Segmenter(locale, { granularity }).segment(text),
    ({ segment }) => segment
  );
};

const evidenceLabel = (evidence: ComparisonEvidence) =>
  evidence.kind === 'recorded'
    ? `Recorded · ${evidence.operationIds.length} operation${
        evidence.operationIds.length === 1 ? '' : 's'
      }`
    : `Inferred · ${evidence.basis}`;

const formatSpan = ({ from, root, to }: ComparisonSpan) =>
  `${root ?? 'document'}:${from}–${to}`;

function TextEffect({
  after,
  before,
  granularity,
  locale,
}: {
  after: string;
  before: string;
  granularity: DiffGranularity;
  locale?: string;
}) {
  return (
    <div className="grid gap-2 text-sm sm:grid-cols-2">
      <div className="rounded-md border border-red-200 bg-red-50/70 p-2">
        <div className="mb-1 text-xs font-medium text-red-700">Before</div>
        <div className="whitespace-pre-wrap text-red-950">
          {segmentText(before, granularity, locale).map((segment, index) => (
            <mark
              // oxlint-disable-next-line react-doctor/no-array-index-as-key -- Segments are a derived display mask and are recreated as one immutable text effect.
              key={index}
              className="bg-red-200/70 text-inherit"
              data-diff-segment={granularity}
            >
              {segment}
            </mark>
          ))}
        </div>
      </div>
      <div className="rounded-md border border-emerald-200 bg-emerald-50/70 p-2">
        <div className="mb-1 text-xs font-medium text-emerald-700">After</div>
        <div className="whitespace-pre-wrap text-emerald-950">
          {segmentText(after, granularity, locale).map((segment, index) => (
            <mark
              // oxlint-disable-next-line react-doctor/no-array-index-as-key -- Segments are a derived display mask and are recreated as one immutable text effect.
              key={index}
              className="bg-emerald-200/70 text-inherit"
              data-diff-segment={granularity}
            >
              {segment}
            </mark>
          ))}
        </div>
      </div>
    </div>
  );
}

function EffectDetails({
  effect,
  granularity,
  locale,
}: {
  effect: ComparisonEffect;
  granularity: DiffGranularity;
  locale?: string;
}) {
  if (effect.kind === 'text') {
    return (
      <TextEffect
        after={effect.afterText}
        before={effect.beforeText}
        granularity={granularity}
        locale={locale}
      />
    );
  }
  if (effect.kind === 'placement') {
    return (
      <p className="text-sm text-muted-foreground">
        {effect.sourceRoot ?? 'document'}:{effect.sourcePath.join('.')} →{' '}
        {effect.targetRoot ?? 'document'}:{effect.targetPath.join('.')}
      </p>
    );
  }
  if (effect.kind === 'property') {
    return (
      <div className="grid gap-2 text-xs sm:grid-cols-2">
        <pre className="overflow-x-auto rounded-md bg-red-50 p-2 text-red-950">
          {JSON.stringify(effect.beforeProperties, null, 2)}
        </pre>
        <pre className="overflow-x-auto rounded-md bg-emerald-50 p-2 text-emerald-950">
          {JSON.stringify(effect.afterProperties, null, 2)}
        </pre>
      </div>
    );
  }
  if (effect.kind === 'split' || effect.kind === 'join') {
    return (
      <p className="text-sm text-muted-foreground">
        {effect.parts} {effect.parts === 1 ? 'part' : 'parts'}
      </p>
    );
  }
  if (effect.kind === 'node-type') {
    return (
      <p className="text-sm text-muted-foreground">
        {effect.beforeType ?? 'none'} → {effect.afterType ?? 'none'}
      </p>
    );
  }
  if (effect.kind === 'wrapper') {
    return (
      <p className="text-sm text-muted-foreground">
        {effect.action === 'add' ? 'Add' : 'Remove'} {effect.type ?? 'wrapper'}
      </p>
    );
  }
  if (effect.kind === 'root-create' || effect.kind === 'root-delete') {
    return <p className="text-sm text-muted-foreground">Root: {effect.root}</p>;
  }

  return null;
}

export function Diff({
  className,
  comparison,
  locale,
  onResolutionsChange,
  onSelectionChange,
}: {
  className?: string;
  comparison: Comparison;
  locale?: string;
  onResolutionsChange?: (resolutions: readonly ComparisonResolution[]) => void;
  onSelectionChange?: (changeIds: readonly string[]) => void;
}) {
  const [filter, setFilter] = React.useState<'all' | ComparisonEffect['kind']>(
    'all'
  );
  const [branch, setBranch] = React.useState<'all' | ComparisonBranch>('all');
  const [granularity, setGranularity] = React.useState<DiffGranularity>('word');
  const [resolutionDraft, setResolutionDraft] = React.useState<{
    comparisonId: string;
    values: ReadonlyMap<string, ComparisonBranch>;
  }>(() => ({ comparisonId: comparison.id, values: new Map() }));
  const [selectionDraft, setSelectionDraft] = React.useState<{
    comparisonId: string;
    values: ReadonlySet<string>;
  }>(() => ({ comparisonId: comparison.id, values: new Set() }));
  const resolutions =
    resolutionDraft.comparisonId === comparison.id
      ? resolutionDraft.values
      : new Map<string, ComparisonBranch>();
  const selectedChangeIds =
    selectionDraft.comparisonId === comparison.id
      ? selectionDraft.values
      : new Set<string>();
  const effectKinds = React.useMemo(
    () =>
      Array.from(
        new Set(
          comparison.changes.flatMap(({ effects }) =>
            effects.map(({ kind }) => kind)
          )
        )
      ).sort(),
    [comparison]
  );
  const visibleChanges = React.useMemo(
    () =>
      comparison.changes.filter(
        ({ branches, effects }) =>
          (filter === 'all' || effects.some(({ kind }) => kind === filter)) &&
          (branch === 'all' || branches?.includes(branch))
      ),
    [branch, comparison, filter]
  );
  const [selectedChangeId, setSelectedChangeId] = React.useState<string | null>(
    null
  );
  const activeChangeId = visibleChanges.some(
    ({ id }) => id === selectedChangeId
  )
    ? selectedChangeId
    : (visibleChanges[0]?.id ?? null);
  const activeIndex = Math.max(
    0,
    visibleChanges.findIndex(({ id }) => id === activeChangeId)
  );
  const totalEffects = comparison.changes.reduce(
    (total, { effects }) => total + effects.length,
    0
  );
  const visibleEffects = visibleChanges.reduce(
    (total, { effects }) =>
      total +
      (filter === 'all'
        ? effects.length
        : effects.filter(({ kind }) => kind === filter).length),
    0
  );
  const changesById = React.useMemo(
    () => new Map(comparison.changes.map((change) => [change.id, change])),
    [comparison]
  );

  const publishSelection = (requested: ReadonlySet<string>) => {
    const selected = new Set(requested);
    const pending = [...requested];

    for (const id of pending) {
      const change = changesById.get(id);

      for (const required of change?.requiredChangeIds ?? []) {
        if (selected.has(required)) continue;
        selected.add(required);
        pending.push(required);
      }
    }
    setSelectionDraft({ comparisonId: comparison.id, values: selected });
    onSelectionChange?.(
      comparison.changes
        .filter(({ id }) => selected.has(id))
        .map(({ id }) => id)
    );
  };

  const chooseConflict = (conflictId: string, choice: ComparisonBranch) => {
    if (comparison.kind !== 'three-way') return;
    const next = new Map(resolutions);

    next.set(conflictId, choice);
    setResolutionDraft({ comparisonId: comparison.id, values: next });
    onResolutionsChange?.(
      comparison.conflicts.flatMap(({ id }) => {
        const selected = next.get(id);

        return selected
          ? [
              Object.freeze({
                choice: selected,
                comparisonId: comparison.id,
                conflictId: id,
              }),
            ]
          : [];
      })
    );
  };

  const navigate = (direction: -1 | 1) => {
    if (visibleChanges.length === 0) return;
    const nextIndex =
      (activeIndex + direction + visibleChanges.length) % visibleChanges.length;
    const next = visibleChanges[nextIndex];

    setSelectedChangeId(next.id);
    requestAnimationFrame(() => {
      document.getElementById(`diff-${next.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    });
  };

  return (
    <section
      aria-label="Document comparison"
      className={cn('space-y-3 rounded-md border p-3', className)}
      data-comparison-id={comparison.id}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div aria-live="polite" className="text-sm font-medium">
          {visibleChanges.length} of {comparison.changes.length} groups ·{' '}
          {visibleEffects} of {totalEffects} effects
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-muted-foreground">
            Effect{' '}
            <select
              aria-label="Filter comparison effects"
              className="rounded-md border bg-background px-2 py-1 text-foreground"
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value as 'all' | ComparisonEffect['kind']
                )
              }
            >
              <option value="all">All</option>
              {effectKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {effectLabels[kind]}
                </option>
              ))}
            </select>
          </label>
          {comparison.kind === 'three-way' && (
            <label className="text-xs text-muted-foreground">
              Branch{' '}
              <select
                aria-label="Filter comparison branches"
                className="rounded-md border bg-background px-2 py-1 text-foreground"
                value={branch}
                onChange={(event) =>
                  setBranch(event.target.value as 'all' | ComparisonBranch)
                }
              >
                <option value="all">All</option>
                <option value="local">Local</option>
                <option value="remote">Remote</option>
              </select>
            </label>
          )}
          <label className="text-xs text-muted-foreground">
            Detail{' '}
            <select
              aria-label="Comparison text granularity"
              className="rounded-md border bg-background px-2 py-1 text-foreground"
              value={granularity}
              onChange={(event) =>
                setGranularity(event.target.value as DiffGranularity)
              }
            >
              <option value="section">Section</option>
              <option value="line">Line</option>
              <option value="word">Word</option>
              <option value="grapheme">Character</option>
            </select>
          </label>
          <Button
            aria-label="Previous comparison group"
            disabled={visibleChanges.length === 0}
            onClick={() => navigate(-1)}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          <Button
            aria-label="Next comparison group"
            disabled={visibleChanges.length === 0}
            onClick={() => navigate(1)}
            size="sm"
            variant="outline"
          >
            Next
          </Button>
          <Button
            aria-label="Select filtered comparison groups"
            disabled={visibleChanges.length === 0}
            onClick={() =>
              publishSelection(
                new Set([
                  ...selectedChangeIds,
                  ...visibleChanges.map(({ id }) => id),
                ])
              )
            }
            size="sm"
            variant="outline"
          >
            Select filtered
          </Button>
          <Button
            aria-label="Clear comparison group selection"
            disabled={selectedChangeIds.size === 0}
            onClick={() => publishSelection(new Set())}
            size="sm"
            variant="outline"
          >
            Clear
          </Button>
        </div>
      </div>

      {comparison.diagnostics.length > 0 && (
        <div aria-label="Comparison diagnostics" className="space-y-1">
          {comparison.diagnostics.map((diagnostic, index) => (
            <p
              // oxlint-disable-next-line react-doctor/no-array-index-as-key -- Diagnostics are immutable and ordered within one comparison result.
              key={index}
              className={cn(
                'rounded-md border px-2 py-1 text-xs',
                diagnostic.severity === 'warning'
                  ? 'border-amber-300 bg-amber-50 text-amber-950'
                  : 'bg-muted text-muted-foreground'
              )}
              data-diagnostic={diagnostic.code}
            >
              {diagnostic.message}
            </p>
          ))}
        </div>
      )}

      {comparison.kind === 'three-way' && comparison.conflicts.length > 0 && (
        <div aria-label="Comparison conflicts" className="space-y-2">
          {comparison.conflicts.map((conflict, index) => {
            const selected = resolutions.get(conflict.id);

            return (
              <article
                key={conflict.id}
                className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-950"
                data-comparison-conflict={conflict.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-medium">
                      Conflict {index + 1} · {conflict.kind}
                    </h3>
                    <p className="text-xs">
                      {conflict.base.map(formatSpan).join(', ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      aria-pressed={selected === 'local'}
                      onClick={() => chooseConflict(conflict.id, 'local')}
                      size="sm"
                      variant={selected === 'local' ? 'default' : 'outline'}
                    >
                      Use local
                    </Button>
                    <Button
                      aria-pressed={selected === 'remote'}
                      onClick={() => chooseConflict(conflict.id, 'remote')}
                      size="sm"
                      variant={selected === 'remote' ? 'default' : 'outline'}
                    >
                      Use remote
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {visibleChanges.length === 0 ? (
        <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          {comparison.changes.length === 0
            ? 'No visible changes.'
            : 'No changes match this filter.'}
        </p>
      ) : (
        <ol className="space-y-3">
          {visibleChanges.map((change, index) => {
            const visibleChangeEffects =
              filter === 'all'
                ? change.effects
                : change.effects.filter(({ kind }) => kind === filter);

            return (
              <li
                id={`diff-${change.id}`}
                key={change.id}
                className={cn(
                  'scroll-m-3 rounded-md border p-3',
                  change.id === activeChangeId &&
                    'border-primary ring-1 ring-primary'
                )}
                data-comparison-change={change.id}
              >
                <div className="mb-2 flex w-full flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-medium">
                    <input
                      aria-label={`Select change ${index + 1}`}
                      checked={selectedChangeIds.has(change.id)}
                      onChange={(event) => {
                        const next = new Set(selectedChangeIds);

                        if (event.target.checked) next.add(change.id);
                        else next.delete(change.id);
                        publishSelection(next);
                      }}
                      type="checkbox"
                    />
                    <button
                      onClick={() => setSelectedChangeId(change.id)}
                      type="button"
                    >
                      Change {index + 1}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {change.branches?.map((value) => (
                      <span
                        key={value}
                        className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground capitalize"
                        data-comparison-branch={value}
                      >
                        {value}
                      </span>
                    ))}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {evidenceLabel(change.evidence)}
                    </span>
                  </div>
                </div>
                <div className="mb-3 flex flex-wrap gap-1 text-xs text-muted-foreground">
                  <span>
                    Before: {change.before.map(formatSpan).join(', ')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>After: {change.after.map(formatSpan).join(', ')}</span>
                </div>
                <div className="space-y-3">
                  {visibleChangeEffects.map((effect) => (
                    <article
                      key={effect.id}
                      aria-label={effectLabels[effect.kind]}
                      className="space-y-2 rounded-md bg-muted/40 p-2"
                      data-comparison-effect={effect.id}
                      data-effect-kind={effect.kind}
                    >
                      <h3 className="text-sm font-medium">
                        {effectLabels[effect.kind]}
                      </h3>
                      <EffectDetails
                        effect={effect}
                        granularity={granularity}
                        locale={locale}
                      />
                    </article>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
