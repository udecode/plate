#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/writing-check.mjs [file...]
// Prints each line of the files, or of standard input without one, once for
// each writing rule a script can see that it breaks, with the text that broke
// it, then exits 1 when any line does, or 2 when a file cannot be read. Code
// spans and closed fenced blocks hold literal text, so they are skipped.
import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const RULES = [
  ['long dash', /[‒-―⸺⸻﹘]/u],
  ['hyphen as dash', /(?<=\S) --? (?=\S)/u],
  ['curly quote', /[‘’“”]/u],
  ['the word "seam"', /\bseams?\b/iu],
  ['chatbot phrase', /\b(?:great question|i'd be happy to help|i hope this helps|let me know if|you're absolutely right)\b|^[\s>*_+-]*(?:\d+[.)]\s+)?[*_]*(absolutely|certainly|of course)\b/iu],
  ['filler phrase', /\b(?:in order to|due to the fact that|it is important to note)\b/iu],
  ['AI vocabulary', /\b(?:additionally|crucial(?:ly)?|delv(?:e|es|ed|ing)|enduring|foster(?:s|ed|ing)?|garner(?:s|ed|ing)?|interplays?|intricate|pivotal|showcas(?:e|es|ed|ing)|tapestr(?:y|ies)|testaments?|vibrant)\b/iu],
  ['"is" in costume', /\b(?:serv(?:e|es|ing) as|st(?:ands|ood) as|boast(?:s|ed|ing)?)\b/iu],
];

// CommonMark bars a backtick from a backtick fence's info string, so such a line
// opens no fence: https://spec.commonmark.org/0.31.2/#fenced-code-blocks
const FENCE = /^[\s>]*(?:(?:[-*+]|\d+[.)])\s+)?(`{3,}|~{3,})(.*)$/u;
// CommonMark: a code span runs from a backtick run to the next run of the same
// length, and an escaped backtick outside a span opens none:
// https://spec.commonmark.org/0.31.2/#code-spans, #backslash-escapes
const SPAN = /\\.|(?<!`)(`+)(?!`).*?(?<!`)\1(?!`)/gu;

function closedFences(lines) {
  const hidden = new Set();
  for (let index = 0; index < lines.length; index += 1) {
    const open = FENCE.exec(lines[index]);
    if (!open || (open[1][0] === '`' && open[2].includes('`'))) continue;
    const close = new RegExp(`^[\\s>]*${open[1][0]}{${open[1].length},}\\s*$`, 'u');
    const end = lines.findIndex((line, at) => at > index && close.test(line));
    if (end === -1) continue;
    for (let at = index; at <= end; at += 1) hidden.add(at);
    index = end;
  }
  return hidden;
}

export const verbatim = (lines) => ['```text', ...lines, '```'];

export function findings(text) {
  const lines = text.split('\n');
  const hidden = closedFences(lines);
  const found = [];
  for (const [index, line] of lines.entries()) {
    if (hidden.has(index)) continue;
    const prose = line.replace(SPAN, (match, run) => (run ? '' : match));
    for (const [rule, pattern] of RULES) {
      const match = pattern.exec(prose);
      if (match) found.push({ line: index + 1, rule, match: (match[1] ?? match[0]).trim(), text: line.trim() });
    }
  }
  return found;
}

const entry = () => {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
};

if (entry()) {
  const files = process.argv.slice(2);
  let inputs;
  try {
    inputs = files.length > 0 ? files.map((file) => [file, readFileSync(file, 'utf8')]) : [['-', readFileSync(0, 'utf8')]];
  } catch (error) {
    console.error(`writing-check.mjs: ${error.message}`);
    process.exit(2);
  }
  let failed = false;
  for (const [file, text] of inputs) {
    for (const { line, rule, match, text: shown } of findings(text)) {
      failed = true;
      console.log(`${file}:${line}: ${rule} "${match}": ${shown}`);
    }
  }
  process.exit(failed ? 1 : 0);
}
