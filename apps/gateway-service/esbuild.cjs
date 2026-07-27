const esbuild = require('esbuild');
const esbuildPluginTsc = require('esbuild-plugin-tsc');

esbuild.build({
  entryPoints: ['src/main.ts'], // Your NestJS Lambda entry point
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/index.js',
  sourcemap: true,
  external: [
    '@nestjs/microservices',
    '@nestjs/websockets',
    'cache-manager',
    'class-validator',
    'class-transformer',
  ],
  plugins: [
    esbuildPluginTsc({
      tsconfigPath: './tsconfig.json',
    }),
  ],
}).catch(() => process.exit(1));