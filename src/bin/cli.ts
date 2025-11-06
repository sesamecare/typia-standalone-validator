#!/usr/bin/env node
import minimist from 'minimist';

import { generateValidator } from '../index';

const argv = minimist(process.argv.slice(2), {
  alias: {
    out: ['o', 'output'],
    force: ['f'],
  },
  boolean: ['force'],
});

async function run() {
  await generateValidator({
    ...argv,
    source: argv._[0],
    tsType: argv._[1],
    project: argv.project,
    outputFile: argv.out,
  });
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(-1);
});
