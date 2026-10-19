#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import { verifyMergedSummaries } from './plite-browser-runner.mjs';

const directory = path.resolve(process.argv[2] ?? 'test-results/summaries');
const requiredProjects = process.argv.slice(3);
const files = fs
  .readdirSync(directory, { recursive: true })
  .filter((file) => file.endsWith('.json'))
  .map((file) => path.join(directory, file));

if (files.length === 0) {
  throw new Error(`No Plite browser summaries found under ${directory}`);
}

const summaries = files.map((file) =>
  JSON.parse(fs.readFileSync(file, 'utf-8'))
);
const reports = verifyMergedSummaries(summaries, requiredProjects);

for (const report of reports) {
  console.log(
    `${report.project}: ${report.passed} passed, ${report.skipped} skipped, ` +
      `${report.planned} applicable tests across ${report.jobs} jobs`
  );
}
