/* The supported browser floor (v2/PLAN.md, section 3). Build targets and the baseline check both read this. */
export const FLOOR = {
  chrome: '123',
  edge: '123',
  safari: '17.5',
  safari_ios: '17.5',
  firefox: '125',
};

// Lightning CSS encodes versions as major << 16 | minor << 8.
export const lightningTargets = Object.fromEntries(
  Object.entries({ chrome: FLOOR.chrome, edge: FLOOR.edge, safari: FLOOR.safari, ios_saf: FLOOR.safari_ios, firefox: FLOOR.firefox })
    .map(([name, version]) => {
      const [major, minor = 0] = version.split('.').map(Number);
      return [name, (major << 16) | (minor << 8)];
    }),
);

export const esbuildTargets = ['chrome123', 'edge123', 'safari17.5', 'ios17.5', 'firefox125'];
