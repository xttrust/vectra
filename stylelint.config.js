export default {
  extends: ['stylelint-config-standard'],
  overrides: [
    {
      // Colours live in tokens and directions only. Everything else must use var(--v-*).
      files: ['src/css/*.css', 'src/css/components/**/*.css', 'src/css/sections/**/*.css'],
      rules: {
        'color-no-hex': true,
        'color-named': 'never',
        'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch'],
      },
    },
  ],
};
