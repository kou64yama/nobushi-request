import * as path from 'path';
import * as ts from 'typescript';
import { readDir } from './lib/fs';

const tsconfig = require('../tsconfig.json');
const compilerOptions = tsconfig.compilerOptions as ts.CompilerOptions;

interface Options {
  withTests?: boolean;
}

async function transpile({ withTests = false }: Options = {}): Promise<void> {
  const fileNames = await readDir(path.resolve(__dirname, '../src/**/*.ts'), {
    ...withTests ? { ignore: path.resolve(__dirname, '../src/**/*.test.ts') } : {},
  });

  const program = ts.createProgram(fileNames, compilerOptions);
  const emitResult = program.emit();

  emitResult.diagnostics.forEach((diagnostic) => {
    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
  });

  if (emitResult.emitSkipped) {
    throw new Error(`Process exiting with code '1'.`);
  }
}

export default transpile;
