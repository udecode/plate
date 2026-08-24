#!/usr/bin/env node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const DEFAULT_EXTENSIONS = new Set(['md', 'mdx', 'markdown', 'txt', 'rst', 'adoc']);
const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.next',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'target',
  'vendor',
]);

const PROSE_PATTERNS = [
  {
    id: 'chatbot-artifact',
    category: 'artifact',
    pattern: String.raw`\b(?:great question|excellent point|i hope this helps|would you like me to|let me know if|feel free to|happy to help|you(?:'|\u2019)re absolutely right)\b`,
    note: 'Delete assistant chatter from the artifact.',
  },
  {
    id: 'throat-clearing',
    category: 'framing',
    pattern: String.raw`\b(?:here(?:'|\u2019)s the thing|let me be clear|the uncomfortable truth is|it is (?:important|worth) noting that|make no mistake|let that sink in)\b`,
    note: 'State the point directly.',
  },
  {
    id: 'announcement',
    category: 'framing',
    pattern: String.raw`\b(?:let(?:'|\u2019)s (?:dive in|delve into|explore|break (?:this|it) down)|in this (?:article|section),? we (?:will|shall)|here(?:'|\u2019)s what you need to know|without further ado)\b`,
    note: 'Start with the content instead of announcing it.',
  },
  {
    id: 'faux-insight',
    category: 'framing',
    pattern: String.raw`\b(?:what (?:most people|everyone) (?:miss|get wrong)|the real question is|what really matters|the deeper issue|the heart of the matter|at its core)\b`,
    note: 'Make the claim carry its own weight.',
  },
  {
    id: 'significance-inflation',
    category: 'claim',
    pattern: String.raw`\b(?:marks? a pivotal|(?:is|stands as|serves as) a testament to|serves as a reminder|underscor(?:es|ing) the (?:importance|significance)|reflects broader|setting the stage for|key turning point|evolving landscape|indelible mark)\b`,
    note: 'Replace importance language with the concrete consequence.',
  },
  {
    id: 'vague-attribution',
    category: 'claim',
    pattern: String.raw`\b(?:experts (?:believe|argue|say)|studies show|research suggests|industry reports suggest|observers have (?:cited|noted)|some critics argue|it is widely (?:believed|regarded))\b`,
    note: 'Name the source or remove the unsupported attribution.',
  },
  {
    id: 'superficial-ing-tail',
    category: 'claim',
    pattern: String.raw`,\s+(?:highlighting|underscoring|emphasizing|showcasing|reflecting|symbolizing|ensuring|fostering|demonstrating|illustrating|solidifying)\b`,
    note: 'Delete the tail or turn its real content into a sourced sentence.',
  },
  {
    id: 'binary-reframe',
    category: 'structure',
    pattern: String.raw`\b(?:not (?:just|only|merely)\b[^.!?\n]{0,100}?\bbut\b|(?:it|this|that)(?:'|\u2019)s not [^.!?\n]{2,70}[.,;:]\s+(?:it|this|that)(?:'|\u2019)s\b)`,
    note: 'State the positive claim directly unless the contrast carries meaning.',
  },
  {
    id: 'negative-countdown',
    category: 'structure',
    pattern: String.raw`\bnot (?:an? )?[^.!?\n]{2,45}\.\s+not (?:an? )?[^.!?\n]{2,45}\.`,
    note: 'State what the thing is.',
  },
  {
    id: 'self-answered-question',
    category: 'structure',
    pattern: String.raw`\b(?:the (?:result|reason|catch|kicker|problem|answer|worst part)|why|what happened next)\?\s+[^?\n]{1,90}[.!]`,
    note: 'Fold the answer into a direct sentence.',
  },
  {
    id: 'hedging-stack',
    category: 'wording',
    pattern: String.raw`\b(?:(?:could|may|might) (?:potentially|possibly|perhaps)|(?:potentially|arguably) (?:possibly|perhaps)|it (?:could|might) perhaps be argued)\b`,
    note: 'Keep the one qualifier that carries real uncertainty.',
  },
  {
    id: 'copula-avoidance',
    category: 'wording',
    pattern: String.raw`\b(?:serves as|stands as|boasts)\b`,
    note: 'Check whether is or has says it more clearly.',
  },
  {
    id: 'generic-conclusion',
    category: 'ending',
    pattern: String.raw`\b(?:the future looks bright|exciting times lie ahead|only time will tell|the possibilities are endless|poised for growth|watch this space|journey toward excellence|step in the right direction)\b`,
    note: 'End on the last concrete fact, decision, question, or action.',
  },
  {
    id: 'signposted-conclusion',
    category: 'ending',
    pattern: String.raw`^(?:in conclusion|to sum up|in summary|overall),?\b`,
    flags: 'gim',
    note: 'Check whether the paragraph only repeats the piece.',
  },
  {
    id: 'diff-narration',
    category: 'artifact',
    pattern: String.raw`\b(?:was (?:added|updated|refactored) to|now (?:uses|supports|allows|includes)|replaces? the (?:old|previous)|previously (?:used|was|had))\b`,
    note: 'Describe current behavior unless this document is about the change.',
  },
  {
    id: 'inline-header-list',
    category: 'formatting',
    pattern: String.raw`^\s*[-*]\s+\*\*[^*\n]{2,60}\*\*:\s+`,
    flags: 'gim',
    note: 'Use prose or a plain list when the bold label only repeats the item.',
  },
  {
    id: 'em-dash',
    category: 'formatting',
    pattern: '\u2014',
    note: 'Default to a period, comma, colon, or rewrite; an author style may override.',
  },
];

const RAW_PATTERNS = [
  {
    id: 'citation-token',
    category: 'artifact',
    pattern: String.raw`\b(?:(?:cite)?turn\d+(?:search|view|fetch|open)\d+|oai_citation|oaicite|contentReference|attributableIndex)\b`,
    note: 'Replace internal citation markup with a real citation or remove it.',
  },
  {
    id: 'placeholder',
    category: 'artifact',
    pattern: String.raw`\[(?:insert|your|todo|tbd|placeholder|source|recipient|name|date)[^\]\n]{0,60}\](?!\()|\b(?:YYYY|20\d{2})-(?:XX|\?\?)-(?:XX|\?\?)\b`,
    note: 'Fill the placeholder or leave it visibly assigned to the author.',
  },
  {
    id: 'tracking-parameter',
    category: 'artifact',
    pattern: String.raw`[?&](?:utm_source|utm_medium|utm_campaign|referrer)=(?:chatgpt(?:\.com)?|openai|copilot(?:\.com)?|grok(?:\.com)?)[^\s)\]]*`,
    note: 'Remove the tracking parameter without changing the destination.',
  },
  {
    id: 'unicode-obfuscation',
    category: 'artifact',
    pattern: '[\u00ad\u200b\u200c\u200d\u2060\ufeff]',
    note: 'Remove invisible characters. Do not evade detectors.',
  },
];

const WATCHED_WORDS = [
  'comprehensive',
  'crucial',
  'delve',
  'empower',
  'facilitate',
  'foster',
  'groundbreaking',
  'highlight',
  'interplay',
  'intricate',
  'leverage',
  'multifaceted',
  'nuanced',
  'pivotal',
  'realm',
  'robust',
  'seamless',
  'showcase',
  'tapestry',
  'transformative',
  'underscore',
  'utilize',
  'vibrant',
];

const INVARIANTS = {
  urls: /https?:\/\/[^\s)>\]]+/gi,
  emails: /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g,
  numbers: /\b\d+(?:[.,]\d+)*(?:\s?(?:%|ms|s|sec|seconds?|minutes?|hours?|days?|weeks?|months?|years?|kb|mb|gb|tb|px|rem|em|kg|g|km|m|cm|usd|eur|gbp))?\b/gi,
  dates: /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/gi,
  inlineCode: /`[^`\n]+`/g,
  linkTargets: /\]\(([^)\n]+)\)/g,
  doubleQuotedText: /["\u201c][^"\u201d\n]{2,160}["\u201d]/g,
};

const MODALS = ['can', 'cannot', "can't", 'could', 'may', 'might', 'must', 'shall', 'should', 'will', "won't"];

function blank(match) {
  return match.replace(/[^\n\r]/g, ' ');
}

function prepareText(raw, { includeQuotes = false, keepUrls = false } = {}) {
  let text = raw;
  text = text.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, blank);
  text = text.replace(/^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1\s*$/gm, blank);
  text = text.replace(/^(?: {4}|\t)[^\n]*$/gm, blank);
  text = text.replace(/`+[^`\n]+`+/g, blank);
  if (!includeQuotes) text = text.replace(/^[ \t]*>[^\n]*$/gm, blank);
  if (!keepUrls) {
    text = text.replace(/\]\([^)\n]+\)/g, blank);
    text = text.replace(/https?:\/\/\S+/g, blank);
  }
  return text;
}

function words(text) {
  return text.match(/[A-Za-z][A-Za-z'\u2019-]*/g) ?? [];
}

function sentences(text) {
  return text
    .split(/(?<=[.!?])\s+|\n{2,}/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => words(sentence).length > 0);
}

function lineAt(text, index) {
  let line = 1;
  for (let position = 0; position < index; position += 1) {
    if (text[position] === '\n') line += 1;
  }
  return line;
}

function excerptAt(text, index, length) {
  const lineStart = text.lastIndexOf('\n', index - 1) + 1;
  const nextBreak = text.indexOf('\n', index + length);
  const lineEnd = nextBreak === -1 ? text.length : nextBreak;
  return text.slice(lineStart, lineEnd).trim().replace(/\s+/g, ' ').slice(0, 220);
}

function addPatternFindings(findings, source, patterns) {
  for (const definition of patterns) {
    const regex = new RegExp(definition.pattern, definition.flags ?? 'gi');
    let match;
    while ((match = regex.exec(source)) !== null) {
      findings.push({
        id: definition.id,
        category: definition.category,
        line: lineAt(source, match.index),
        match: match[0].trim(),
        excerpt: excerptAt(source, match.index, match[0].length),
        note: definition.note,
        index: match.index,
      });
      if (match.index === regex.lastIndex) regex.lastIndex += 1;
    }
  }
}

function addVocabularyClusters(findings, source) {
  const paragraphPattern = /\S[\s\S]*?(?=\n\s*\n|$)/g;
  let paragraph;
  while ((paragraph = paragraphPattern.exec(source)) !== null) {
    const hits = [];
    for (const term of WATCHED_WORDS) {
      const matches = paragraph[0].match(new RegExp(`\\b${term}(?:s|ed|ing)?\\b`, 'gi')) ?? [];
      if (matches.length > 0) hits.push({ term, count: matches.length });
    }
    const total = hits.reduce((sum, hit) => sum + hit.count, 0);
    if (hits.length < 2 && total < 3) continue;
    findings.push({
      id: 'watched-vocabulary-cluster',
      category: 'wording',
      line: lineAt(source, paragraph.index),
      match: hits.map((hit) => `${hit.term} x${hit.count}`).join(', '),
      excerpt: paragraph[0].trim().replace(/\s+/g, ' ').slice(0, 220),
      note: 'Inspect the cluster. Keep precise terms; replace generic or promotional uses.',
      index: paragraph.index,
    });
  }
}

function addTitleCaseHeadings(findings, source) {
  const headingPattern = /^(#{1,6})\s+(.+)$/gm;
  const smallWords = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);
  let match;
  while ((match = headingPattern.exec(source)) !== null) {
    const headingWords = match[2].match(/[A-Za-z][A-Za-z'-]*/g) ?? [];
    const candidates = headingWords.filter((word) => !smallWords.has(word.toLowerCase()));
    if (candidates.length < 3) continue;
    const titleCased = candidates.filter((word) => /^[A-Z]/.test(word)).length;
    if (titleCased / candidates.length < 0.8) continue;
    findings.push({
      id: 'title-case-heading',
      category: 'formatting',
      line: lineAt(source, match.index),
      match: match[2],
      excerpt: match[0],
      note: 'Use sentence case unless the destination style guide requires title case.',
      index: match.index,
    });
  }
}

function computeSignals(text) {
  const sentenceList = sentences(text);
  const lengths = sentenceList.map((sentence) => words(sentence).length);
  const mean = lengths.length === 0 ? 0 : lengths.reduce((sum, length) => sum + length, 0) / lengths.length;
  const variance = lengths.length === 0
    ? 0
    : lengths.reduce((sum, length) => sum + (length - mean) ** 2, 0) / lengths.length;
  const starts = new Map();
  for (const sentence of sentenceList) {
    const start = words(sentence).slice(0, 2).join(' ').toLowerCase();
    if (start) starts.set(start, (starts.get(start) ?? 0) + 1);
  }
  const repeatedStarts = Object.fromEntries([...starts].filter(([, count]) => count > 1));
  let similarLengthRuns = 0;
  let run = 1;
  for (let index = 1; index < lengths.length; index += 1) {
    if (Math.abs(lengths[index] - lengths[index - 1]) <= 2) run += 1;
    else {
      if (run >= 3) similarLengthRuns += 1;
      run = 1;
    }
  }
  if (run >= 3) similarLengthRuns += 1;
  return {
    wordCount: words(text).length,
    sentenceCount: sentenceList.length,
    meanSentenceWords: round(mean),
    sentenceLengthCv: mean === 0 ? 0 : round(Math.sqrt(variance) / mean),
    similarLengthRuns,
    repeatedStarts,
  };
}

function auditText(raw, options = {}) {
  const prose = prepareText(raw, options);
  const artifacts = prepareText(raw, { ...options, keepUrls: true });
  const findings = [];
  addPatternFindings(findings, prose, PROSE_PATTERNS);
  addPatternFindings(findings, artifacts, RAW_PATTERNS);
  addVocabularyClusters(findings, prose);
  addTitleCaseHeadings(findings, prose);
  const unique = new Map();
  for (const finding of findings) unique.set(`${finding.id}:${finding.index}:${finding.match}`, finding);
  const sorted = [...unique.values()].sort((left, right) => left.index - right.index);
  return {
    sha256: hash(raw),
    findings: sorted.map(({ index, ...finding }) => finding),
    signals: computeSignals(prose),
  };
}

function hash(text) {
  return createHash('sha256').update(text).digest('hex');
}

function extractMatches(text, pattern) {
  const matches = [];
  const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push((match[1] ?? match[0]).trim().replace(/[.,;:]$/, ''));
    if (match.index === regex.lastIndex) regex.lastIndex += 1;
  }
  return matches;
}

function countValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function subtractCounts(left, right) {
  const result = [];
  for (const [value, count] of left) {
    const delta = count - (right.get(value) ?? 0);
    for (let index = 0; index < delta; index += 1) result.push(value);
  }
  return result;
}

function modalCounts(text) {
  const lower = text.toLowerCase();
  return Object.fromEntries(
    MODALS.map((modal) => {
      const escaped = modal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return [modal, (lower.match(new RegExp(`\\b${escaped}\\b`, 'g')) ?? []).length];
    }).filter(([, count]) => count > 0),
  );
}

function compareText(original, rewrite) {
  const changes = {};
  for (const [name, pattern] of Object.entries(INVARIANTS)) {
    const before = countValues(extractMatches(original, pattern));
    const after = countValues(extractMatches(rewrite, pattern));
    const missing = subtractCounts(before, after);
    const added = subtractCounts(after, before);
    if (missing.length > 0 || added.length > 0) changes[name] = { missing, added };
  }
  const originalModals = modalCounts(original);
  const rewriteModals = modalCounts(rewrite);
  return {
    originalSha256: hash(original),
    rewriteSha256: hash(rewrite),
    invariantChange: Object.keys(changes).length > 0,
    changes,
    modalReview: {
      original: originalModals,
      rewrite: rewriteModals,
      changed: JSON.stringify(originalModals) !== JSON.stringify(rewriteModals),
    },
  };
}

function walk(directory, extensions, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry.name)) walk(path.join(directory, entry.name), extensions, output);
      continue;
    }
    if (!entry.isFile()) continue;
    const extension = path.extname(entry.name).slice(1).toLowerCase();
    if (extensions.has(extension)) output.push(path.join(directory, entry.name));
  }
  return output;
}

function auditTarget(target, options = {}) {
  const extensions = options.extensions ?? DEFAULT_EXTENSIONS;
  if (!target || target === '-') {
    const raw = fs.readFileSync(0, 'utf8');
    return [{ file: '<stdin>', ...auditText(raw, options) }];
  }
  const resolved = path.resolve(target);
  const files = fs.statSync(resolved).isDirectory() ? walk(resolved, extensions) : [resolved];
  const results = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const result = auditText(raw, options);
    if (result.signals.wordCount < (options.minWords ?? 0)) continue;
    results.push({ file, ...result });
  }
  return results.sort((left, right) => {
    const leftDensity = left.findings.length / Math.max(1, left.signals.wordCount);
    const rightDensity = right.findings.length / Math.max(1, right.signals.wordCount);
    return rightDensity - leftDensity || right.findings.length - left.findings.length;
  });
}

function parseArgs(args) {
  const options = {
    positionals: [],
    json: false,
    includeQuotes: false,
    failOnInvariantChange: false,
    minWords: 0,
    extensions: new Set(DEFAULT_EXTENSIONS),
  };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--json') options.json = true;
    else if (argument === '--include-quotes') options.includeQuotes = true;
    else if (argument === '--fail-on-invariant-change') options.failOnInvariantChange = true;
    else if (argument === '--min-words') options.minWords = Number(args[++index]);
    else if (argument === '--ext') {
      options.extensions = new Set(args[++index].split(',').map((value) => value.trim().replace(/^\./, '').toLowerCase()));
    } else options.positionals.push(argument);
  }
  return options;
}

function printAudit(results, json) {
  if (json) {
    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
    return;
  }
  for (const result of results) {
    process.stdout.write(`${result.file}: ${result.findings.length} finding(s), ${result.signals.wordCount} words\n`);
    for (const finding of result.findings) {
      process.stdout.write(`  L${finding.line} [${finding.category}/${finding.id}] ${finding.match}\n`);
    }
  }
}

function printComparison(result, json) {
  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }
  process.stdout.write(`invariant_change: ${result.invariantChange}\n`);
  for (const [name, change] of Object.entries(result.changes)) {
    if (change.missing.length > 0) process.stdout.write(`missing_${name}: ${change.missing.join(' | ')}\n`);
    if (change.added.length > 0) process.stdout.write(`added_${name}: ${change.added.join(' | ')}\n`);
  }
  process.stdout.write(`modal_review_changed: ${result.modalReview.changed}\n`);
}

const HELP = `audit-prose: find prose review candidates and literal preservation changes

Usage:
  node scripts/audit-prose.mjs audit [file-or-directory] [--json]
  node scripts/audit-prose.mjs compare <original> <rewrite> [--json]

Options:
  --include-quotes             Scan Markdown blockquotes
  --ext md,mdx,txt             Directory-scan extensions
  --min-words N                Skip shorter files in directory scans
  --fail-on-invariant-change   Compare exits 2 when literal invariants change

Audit output is a review queue, not an AI-authorship score.`;

function main(argv = process.argv.slice(2)) {
  const [command, ...rest] = argv;
  if (!command || command === '-h' || command === '--help') {
    process.stdout.write(`${HELP}\n`);
    return 0;
  }
  const options = parseArgs(rest);
  if (command === 'audit') {
    printAudit(auditTarget(options.positionals[0], options), options.json);
    return 0;
  }
  if (command === 'compare') {
    const [originalPath, rewritePath] = options.positionals;
    if (!originalPath || !rewritePath) throw new Error('compare requires original and rewrite paths');
    const result = compareText(fs.readFileSync(originalPath, 'utf8'), fs.readFileSync(rewritePath, 'utf8'));
    printComparison(result, options.json);
    return options.failOnInvariantChange && result.invariantChange ? 2 : 0;
  }
  throw new Error(`unknown command: ${command}`);
}

function round(value) {
  return Math.round(value * 100) / 100;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) {
  try {
    process.exitCode = main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

export { auditTarget, auditText, compareText, computeSignals, prepareText };
