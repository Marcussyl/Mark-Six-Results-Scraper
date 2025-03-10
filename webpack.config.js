import path from 'path';

export default {
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(process.cwd(), 'dist'),
  },
  target: 'node',
  mode: 'production',
  externals: {
    yargs: 'commonjs yargs',
    cosmiconfig: 'commonjs cosmiconfig',
    express: 'commonjs express',
    'import-fresh': 'commonjs import-fresh',
    picocolors: 'commonjs picocolors',
  },
};
