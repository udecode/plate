import { expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { RULES } from './clip.ts'
import { locate, SKILL, withRules } from './rules.ts'

test('the skill lists the rules its code enforces', () => {
  const text = readFileSync(SKILL, 'utf8')
  expect(withRules(text, RULES), 'SKILL.md is stale; run bun scripts/rules.ts').toBe(text)
})

test('names the file that holds each check, and refuses a check that does not exist', () => {
  expect(locate('renderTake, checkPair')).toBe('`renderTake`, `checkPair` in `scripts/clip.ts`')
  expect(() => locate('checkVibes')).toThrow('no check named checkVibes')
})
