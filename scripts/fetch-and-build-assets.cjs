const path = require('path');
const { mkdirSync } = require('fs');
const fs = require('fs/promises');
const task = require('tasuku');
const got = require('got');
const svgo = require('svgo');
const svgr = require('@svgr/core');
const svg2vectordrawable = require('svg2vectordrawable');
const _ = require('lodash');

require('dotenv').config();

const iconData = require('../data/icondata.json');

const concurrency = +(process.env.CONCURRENCY || '10');
const figmaFileKey = process.env.FIGMA_FILE_KEY;
const figmaAccessToken = process.env.FIGMA_ACCESS_TOKEN;

if (!figmaFileKey) {
  throw new Error('FIGMA_FILE_KEY is required');
}

if (!figmaAccessToken) {
  throw new Error('FIGMA_ACCESS_TOKEN is required');
}

const figmaEndpoint = 'https://api.figma.com/v1';
const iconNameMap = new Map(iconData);

const svgPath = path.resolve(__dirname, '../svg');
mkdirSync(svgPath, { recursive: true });

const drawablePath = path.resolve(__dirname, '../drawable');
mkdirSync(drawablePath, { recursive: true });

const componentPath = path.resolve(__dirname, '../src/react');
mkdirSync(componentPath, { recursive: true });

task('Fetch image URLs', async ({ task, setTitle }) => {
  const ids = iconData.map(icon => icon[0]);
  const { body } = await got(`${figmaEndpoint}/images/${figmaFileKey}`, {
    responseType: 'json',
    headers: {
      'X-FIGMA-TOKEN': figmaAccessToken,
    },
    searchParams: {
      ids: ids.join(','),
      format: 'svg',
    },
  });

  const imageEntries = Object.entries(body.images);
  const imageEntriesChunks = _.chunk(imageEntries, concurrency);
  for (let i = 0; i < imageEntriesChunks.length; i++) {
    setTitle(`Processing chunks (${i+1}/${imageEntriesChunks.length})`);
    const chunk = imageEntriesChunks[i];
    const chunkTask = await task.group(task =>
      chunk.map(([nodeId, downloadUrl]) => {
        const iconName = iconNameMap.get(nodeId);
        return task(`Downloading ${iconName}`, async ({ task, setTitle }) => {
          const { body } = await got(downloadUrl);
          const exportingTask = await task.group(task => [
            task('Save as SVG', async ({ task }) => {
              const filePath = path.join(svgPath, `${iconName}.svg`);
              let { data: svg } = svgo.optimize(body, {
                js2svg: {
                  indent: 2,
                  pretty: true,
                },
                plugins: [
                  {
                    name: 'addAttributesToSVGElement',
                    params: {
                      attributes: [{ 'data-karrot-ui-icon': true }],
                    },
                  },
                ],
              });
              svg = svg.replace(/#212124/g, 'currentColor');
              await fs.writeFile(filePath, svg, 'utf-8');
            }),
            task('Save as React Component', async ({ task }) => {
              const componentName = iconName
                .replace(/^[a-z]/, ch => ch.toUpperCase())
                .replace(/_[a-z]/g, ch => ch[1].toUpperCase());
              const filePath = path.join(componentPath, `${componentName}.tsx`);
              let component = await svgr.transform(body, {
                plugins: [
                  '@svgr/plugin-svgo',
                  '@svgr/plugin-jsx',
                  '@svgr/plugin-prettier',
                ],
                replaceAttrValues: {
                  '#212124': 'currentColor',
                },
                prettierConfig: {
                  tabWidth: 2,
                  useTabs: false,
                  singleQuote: true,
                  semi: true,
                },
                svgoConfig: {
                  plugins: [
                    {
                      name: 'addAttributesToSVGElement',
                      params: {
                        attributes: [{ 'data-karrot-ui-icon': true }],
                      },
                    },
                  ],
                },
                typescript: true,
                dimensions: false,
              }, { componentName });
              component = component.slice(`import * as React from "react";\n`.length);
              await fs.writeFile(filePath, component, 'utf-8');
            }),
            task('Save as Vector Drawable', async ({ task }) => {
              const filePath = path.join(drawablePath, `${iconName}.xml`);
              const drawable = await svg2vectordrawable(body);
              await fs.writeFile(filePath, drawable, 'utf-8');
            }),
          ]);

          exportingTask.clear();
          setTitle(`Successfully exported ${iconName}`);
        });
      }),
      { concurrency },
    );

    chunkTask.clear();
  }
});
