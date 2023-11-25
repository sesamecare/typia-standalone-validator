#!/usr/bin/env node
import minimist from 'minimist';

import { generateValidator } from '..';

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
  console.error(error);
  process.exit(-1);
});
