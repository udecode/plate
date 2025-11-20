#!/usr/bin/env node
/**
 * List files under docs/** whose last Git commit is within N days (default 60).
 * Usage:
 *
 *     node listDocsLastModified.js [days]
 *
 * Example: node listDocsLastModified.js 45 # 45 天内修改过的文件
 */

import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
// Load environment variables
import OpenAI from 'openai';

const TARGET_DIR = 'docs';
const DAYS = Number(process.argv[2]) || 60; // 默认 60 天
const CUTOFF = Date.now() - DAYS * 24 * 60 * 60 * 1000;

// 1) 列出目标目录所有受 Git 跟踪的文件
const files = execSync(`git ls-files ${TARGET_DIR}`, { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

if (files.length === 0) {
  console.error(`No tracked files found in ${TARGET_DIR}`);
  process.exit(1);
}

console.error(`Scanning ${files.length} files… (cutoff = ${DAYS} days)`);

// 2) 查询最后提交时间并过滤
const results = files
  .filter((f) => !f.endsWith('.cn.mdx')) // 过滤掉以.cn.mdx结尾的文件
  .flatMap((f) => {
    const out = spawnSync('git', ['log', '-1', '--format=%ci', '--', f], {
      encoding: 'utf8',
    });
    if (out.status !== 0) return [];
    const dateStr = out.stdout.trim();
    const ts = Date.parse(dateStr);
    if (Number.isNaN(ts) || ts < CUTOFF) return []; // 超过时间窗口，丢弃
    return { file: f, lastModified: dateStr };
  });

// 3) 排序并输出
results.sort((a, b) => a.file.localeCompare(b.file));
console.table(results);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: 'sk-xxxx',
  baseURL: 'https://api.deepseek.com',
});

// Read languine configuration
const readConfig = () => {
  try {
    const configPath = path.resolve(process.cwd(), 'languine.json');
    const configContent = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error('Error reading languine.json:', error);
    process.exit(1);
  }
};

// Translate content using OpenAI
async function translateContent(content, targetLanguage) {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          content: `You are a professional translator. Translate the following MDX content from English to ${targetLanguage}. 
          Preserve all Markdown formatting, code blocks, and component tags. Do not translate code inside code blocks or component names.
          The content is in .mdx format, which combines Markdown with JSX components.
          - Do not translate the provider as 提供者, just keep it as provider.
          - Do not translate the entry as 条目, just keep it as entry.
          - Do not translate the leaf as 叶子, just keep it as leaf.
          - Do not translate the element as 元素, just keep it as element.
          `,
          role: 'system',
        },
        {
          content,
          role: 'user',
        },
      ],
      model: 'deepseek-chat',
    });

    return response.choices[0].message.content || content;
  } catch (error) {
    console.error('Error translating content:', error);
    return content;
  }
}

// Process files for translation
async function processTranslation() {
  const config = readConfig();
  const { content: contentConfig, language } = config;

  if (!language?.source || !language.targets || !contentConfig) {
    console.error('Invalid configuration in languine.json');
    process.exit(1);
  }

  // Only translate files from the results array (files modified within the cutoff period)
  for (const { file: sourceFile } of results) {
    const sourceContent = fs.readFileSync(sourceFile, 'utf8');

    for (const targetLanguage of language.targets) {
      // Add .cn.mdx suffix to the source file path
      const targetFile = sourceFile.replace('.mdx', '.cn.mdx');

      console.info(
        `Translating ${sourceFile} to ${targetLanguage} (${targetFile})`
      );

      // Create target directory if it doesn't exist
      const targetDir = path.dirname(targetFile);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Process translations sequentially instead of in parallel
      try {
        const translatedContent = await translateContent(
          sourceContent,
          targetLanguage
        );
        fs.writeFileSync(targetFile, translatedContent);
        console.info(`Successfully translated to ${targetFile}`);
      } catch (error) {
        console.error(
          `Failed to translate ${sourceFile} to ${targetLanguage}:`,
          error
        );
      }
    }
  }
}

// Run the translation process
try {
  await processTranslation();
  console.info('Translation completed successfully');
} catch (error) {
  console.error('Translation process failed:', error);
  process.exit(1);
}
