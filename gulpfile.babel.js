import gulp from 'gulp';
import git from 'gulp-git';
import { spawn } from 'child_process';
import { readFileSync } from 'fs';

const originalPath = process.cwd();

const readConfig = () => {
  const configPath = originalPath + 'config.js';

  let config;

  try {
    config = readFileSync(configPath);
  } catch (e) {
    throw new Error("Error loading application configuration: " + e.message);
  }

  try {
    config = JSON.parse(config);
  } catch (e) {
    throw new Error("Error parsing application configuration: " + e.message);
  }

  return config;
};

const clone = (url, folderName) => {

  const options = {
    args: folderName
  };

  git.clone(url, options, (err) => {
    if (err) {
      throw err;
    }
  });
};

gulp.task('modules:init', () => {
  const config = readConfig();

  if (!config) {
    throw new Error("Application configuration not found");
  }

  if (!config.modules || !config.modules.length) {
    throw new Error("No application modules found");
  }
 
  process.chdir('projects');
  for (let i = 0; i < config.modules.length; i++) {
    const module = config.modules[i];
    if (module.url) {
      clone(module.url, module.name);
    }
  }
  process.chdir('../');
});

gulp.task('schematics', (cb) => {
  process.chdir('../');

  const exit = {};
  const child = spawn('ng', ['g', '.:import-module', '--name=contacts']);

  child.on('exit', (code, signal) => {
    exit.code = code;
    exit.signal = signal;
  });

  child.on('error', (err) => {
    throw err;
  });

  child.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  child.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  if (!exit.code) {
    return cb();
  } else {
    throw new Error(`Schematics child process exited with code ${exit.code}, signal ${exit.signal}`);
  }
});
