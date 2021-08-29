const { build } = require('esbuild');

// automatically exclude node_modules from bundle
const { nodeExternalsPlugin } = require('esbuild-node-externals');

const DEV_MODE_ENABLED = process.env.BUILD_MODE === 'dev';
DEV_MODE_ENABLED && console.log('dev mode enabled');

build({
  bundle: true,
  entryPoints: ['./src/orcatail.ts'],
  outfile: 'dist/discorcabot.js',
  minify: !DEV_MODE_ENABLED,
  platform: 'node',
  plugins: [nodeExternalsPlugin()],
  sourcemap: DEV_MODE_ENABLED,
}).catch(() => process.exit(1));
