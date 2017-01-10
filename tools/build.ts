import run from './run';
import clean from './clean';
import transpile from './transpile';

async function build(): Promise<void> {
  await run(clean);
  await run(transpile);
}

export default build;
