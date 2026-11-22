import { readFileSync, writeFileSync } from 'node:fs'
import { RULES } from './clip.ts'

export type Rule = { rule: string; check: string }
export type Source = { file: string; text: string }

export const CLIP_SOURCE: Source = { file: 'scripts/clip.ts', text: readFileSync(`${import.meta.dir}/clip.ts`, 'utf8') }
export const SKILL = `${import.meta.dir}/../SKILL.md`
const END = '<!-- /rules -->'

/** The file that defines each named check, so a renamed or deleted check fails here instead of leaving a skill pointing nowhere. */
export function locate(check: string, sources: Source[] = [CLIP_SOURCE]): string {
  const groups = new Map<string, string[]>()
  for (const name of check.split(/,\s*/)) {
    const src = sources.find(s => new RegExp(`(function|const|class) ${name}\\b`).test(s.text))
    if (!src) throw new Error(`no check named ${name} in ${sources.map(s => s.file).join(' or ')}`)
    groups.set(src.file, [...(groups.get(src.file) ?? []), `\`${name}\``])
  }
  return [...groups].map(([file, names]) => `${names.join(', ')} in \`${file}\``).join('; ')
}

/** Rewrites the rule list between a skill's rules markers, naming the command that writes it. */
export function withRules(text: string, rules: Rule[], { sources = [CLIP_SOURCE], cmd = 'bun scripts/rules.ts' } = {}): string {
  const start = `<!-- rules: written by \`${cmd}\` -->`
  const from = text.indexOf(start)
  const to = text.indexOf(END)
  if (from === -1 || to < from) throw new Error(`the skill has no ${start} ... ${END} block`)
  const list = rules.map(r => `- ${r.rule} (${locate(r.check, sources)})`).join('\n')
  return `${text.slice(0, from + start.length)}\n${list}\n${text.slice(to)}`
}

if (import.meta.main) {
  const text = readFileSync(SKILL, 'utf8')
  const next = withRules(text, RULES)
  if (next !== text) writeFileSync(SKILL, next)
}
