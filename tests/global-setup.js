/* Builds the kit and the docs site before any test runs, so every job (test, visual, nightly, baselines)
   checks the site as it is now. Both builds take well under a second. */
import { execFileSync } from 'node:child_process';

export default function globalSetup() {
  for (const script of ['build/build.mjs', 'build/icons.mjs', 'build/site.mjs']) {
    execFileSync(process.execPath, [script], { stdio: ['ignore', 'ignore', 'inherit'] });
  }
}
