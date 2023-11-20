import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

async function runCommand(command: string, args: string[] = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

async function prepend(file: string, content: string) {
  const currentContent = await fs.promises.readFile(file, 'utf8');
  const newContent = `${content}${currentContent}`;
  await fs.promises.writeFile(file, newContent, 'utf8');
}

export async function generateValidator({
  source,
  tsType,
  project,
  outputFile,
}: {
  project: string;
  outputFile: string;
  source: string;
  tsType: string;
}) {
  const template = `import typia from 'typia';
import { ${tsType} } from '../${path.relative(process.cwd(), source)}';

export const validate${tsType} = typia.createValidate<${tsType}>();
`;

  try {
    // Typia only runs on dirs, so make one.
    if (!fs.existsSync('__typia__')) {
      await fs.promises.mkdir('__typia__');
    }
    await fs.promises.writeFile('__typia__/validator.ts', template);

    await fs.promises.writeFile(
      '__typia__/tsconfig.json',
      `{
    "extends": "${path.relative(path.join(process.cwd(), '__typia__'), project)}",
    "strict": true,
    "strictNullChecks":true,
    "compilerOptions": {
      "plugins": [{
        "transform": "typia/lib/transform"
      }]
    }
  }`,
    );

    await runCommand('npx', [
      'typia',
      'generate',
      '--input',
      '__typia__',
      '--output',
      '__typia_out__',
      '--project',
      '__typia__/tsconfig.json',
    ]);

    await runCommand('npx', [
      'tsup',
      '__typia_out__/validator.ts',
      '--target',
      'node18',
      '-d',
      path.dirname(outputFile),
      '--format',
      'esm',
    ]);

    const tmpOutput = path.join(path.dirname(outputFile), 'validator.mjs');
    await prepend(tmpOutput, '// @ts-nocheck\n');
    await fs.promises.rename(tmpOutput, outputFile);
  } finally {
    try {
      fs.rmSync('__typia__', { recursive: true });
      fs.rmSync('__typia_out__', { recursive: true });
    } catch (e) {
      // Ignore
    }
  }
}
