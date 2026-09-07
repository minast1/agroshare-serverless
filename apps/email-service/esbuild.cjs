const esbuild = require('esbuild');
const esbuildPluginTsc = require('esbuild-plugin-tsc');


const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');

const entryPoint = path.join(srcDir, 'main.ts');
const outputFile = path.join(distDir, 'index.js');


async function main() {
  const isProduction = process.env.NODE_ENV === 'production';
  console.log('🧹 Cleaning dist...');

  fs.rmSync(distDir, {
    recursive: true,
    force: true,
  });

  fs.mkdirSync(distDir, {
    recursive: true,
  });


  console.log(`📦 Building Lambda for environment: ${isProduction ? 'PRODUCTION' : 'LOCAL/DEVELOPMENT'}`);
  const pluginsPipeline = [esbuildPluginTsc({
        force: true,
      }),]

  const externalLibs = [
     '@nestjs/microservices',
    '@nestjs/websockets',
    '@aws-sdk/*',
    'class-validator',
    'class-transformer',
];
    if(isProduction) {
    externalLibs.push('@sentry/aws-serverless');

      pluginsPipeline.push(
        sentryEsbuildPlugin({
      org: "custex",
      project: "node-awslambda",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: {
          name: `payment-service@${Date.now()}`,
          inject: true, // ⚡️ Injects the unique lookup signature tokens into your bundle
        },
      sourcemaps: {
        assets: [path.join(distDir, '**/*.map'), path.join(distDir, 'index.js')],
        filesToDeleteAfterUpload: [
         path.join(distDir, '**/*.map'),
        ],
      },
    }),)
  }
  await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    minify: isProduction,
    sourcemap: 'external',
    keepNames: true,
    treeShaking: true, 
    platform: 'node',
    target: 'node20',
    outfile: outputFile,
    tsconfig: path.join(rootDir, 'tsconfig.json'),
    sourcesContent: isProduction,
    external: externalLibs,
    plugins: pluginsPipeline,
    legalComments: 'none',
    logLevel: 'info',
  });

  const stats = fs.statSync(outputFile);

  console.log('');
  console.log('✅ Lambda build completed');
  console.log(
    `📦 Bundle size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`,
  );
  console.log(`📁 Output: ${outputFile}`);
}

main().catch((error) => {
  console.error('');
  console.error('❌ Lambda build failed');
  console.error(error);
  process.exit(1);
});