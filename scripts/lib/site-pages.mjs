// Paired routes keep language switching on the corresponding page.
export const pagePaths = [
  'index.md',
  'start/index.md',
  'concepts/pipeline.md',
  'concepts/resources-targets.md',
  'tools/analyzer.md',
  'compatibility/current-baseline.md',
  '404.md'
];
export const localePrefixes = ['', 'en/'];
export const expectedPages = localePrefixes.flatMap(prefix => pagePaths.map(page => prefix + page)).sort();
