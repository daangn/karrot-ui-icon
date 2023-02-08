#!/usr/bin/env node

import path from 'path';
import yaml from 'js-yaml';
import fs from 'fs';
import pkg from '../package.json' assert { type: 'json' };
import { Command } from 'commander';
import appRoot from 'app-root-path';
import chalk from 'chalk';

import generateSeedIconComponent from './generate-seed-icon-component.mjs';
import generateSpriteSvg from './generate-sprite-svg.mjs';
import generateConfig from './generate-config';

const program = new Command();
const configPath = path.resolve(appRoot.path, 'icon.config.yml');

const initCommand = new Command('init')
  .alias('-i')
  .description('Initialize icon.config.yml')
  .action(() => {
    try {
      const config = generateConfig();
      fs.writeFileSync(configPath, config);
      console.log(chalk.green('icon.config.yml generated!'));
    } catch (e) {
      console.error(e);
    }
  });

const generateCommand = new Command('generate')
  .alias('gen')
  .description('Generate SVG sprite and SeedIcon component')
  .action(() => {
    try {
      const fileContents = yaml.load(fs.readFileSync(configPath, 'utf8'));
      const version = pkg.version;
    
      const { spriteOutputPath, iconComponentOutputPath, icons } = fileContents;
      const spriteFileName = fileContents.spriteFileName || 'sprite';
      const iconComponentFileName = fileContents.iconComponentFileName || 'SeedIcon';
    
      const seedIconComponent = generateSeedIconComponent({ iconComponentFileName, iconComponentOutputPath, spriteOutputPath, spriteFileName, version, icons });
      const spriteSvg = generateSpriteSvg({ icons });
      
      const spriteOutputDir = path.resolve(spriteOutputPath);
      const iconComponentOutputDir = path.resolve(iconComponentOutputPath);

      if (!fs.existsSync(spriteOutputDir)) {
        fs.mkdirSync(spriteOutputDir, { recursive: true });
      }

      if (!fs.existsSync(iconComponentOutputDir)) {
        fs.mkdirSync(iconComponentOutputDir, { recursive: true });
      }
  
      fs.writeFileSync(path.resolve(spriteOutputPath, `${spriteFileName}.svg`), spriteSvg);
      fs.writeFileSync(path.resolve(iconComponentOutputPath, `${iconComponentFileName}.tsx`), seedIconComponent);
      console.log(chalk.green(`SVG sprite generate complete at ${spriteOutputPath}/${spriteFileName}.svg!`));
      console.log(chalk.green(`SeedIcon component generate complete at ${iconComponentOutputPath}/${iconComponentFileName}.tsx!`));
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.log(chalk.red('icon.config.yml not found!'));
      }
      console.error(e);
    }
  });

program
  .version(pkg.version, '-v, --version')
  .description('Generate SVG sprite and SeedIcon component')
  .addCommand(initCommand)
  .addCommand(generateCommand)
  .parse(process.argv);
