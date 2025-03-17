import { glob } from 'glob';
import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';

// Load environment variables

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: 'xxxx',
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
          `,
          role: 'system',
        },
        {
          content: content,
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

  for (const contentItem of contentConfig) {
    const sourcePattern = contentItem.source;
    
    // Get source files (can be an array of file paths)
    const sourceFiles = await glob(sourcePattern);

    for (const sourceFile of sourceFiles) {
      const sourceContent = fs.readFileSync(sourceFile, 'utf8');

      for (const targetLanguage of language.targets) {
        // Simply replace 'en' with 'cn' in the path
        const targetFile = sourceFile.replace('/en/', `/${targetLanguage}/`);

        console.log(
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
          console.log(`Successfully translated to ${targetFile}`);
        } catch (error) {
          console.error(`Failed to translate ${sourceFile} to ${targetLanguage}:`, error);
        }
      }
    }
  }
}

// Run the translation process
try {
  await processTranslation();
  console.log('Translation completed successfully');
} catch (error) {
  console.error('Translation process failed:', error);
  process.exit(1);
}
