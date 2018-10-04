import gulp from 'gulp';
import git from 'gulp-git';
import { spawn } from 'child_process';
import { readFileSync } from 'fs';

const applicationPath = process.cwd();

const readConfig = () => {
  const configPath = applicationPath + '/config.json';

  let config;

  try {
    config = readFileSync(configPath);
  } catch (e) {
    throw new Error('Error loading application configuration: ' + e.message);
  }

  try {
    config = JSON.parse(config);
  } catch (e) {
    throw new Error('Error parsing application configuration: ' + e.message);
  }

  return config;
};

const config = readConfig();

const clone = (url, folderName) => {
  const options = {
    args: folderName
  };

  return new Promise((resolve, reject) => {
    git.clone(url, options, (err) => {
      if (err) {
        console.warn(err.message);
        return reject(err);
      }
      return resolve();
    });
  });
};


const runCommand = (command, args = [], wd) => {
  const cwd = process.cwd();
  if (wd) {
    process.chdir(wd);
  }
  return new Promise((resolve, reject) => {
    const fullCommand = `${command} ${args.join(' ')}`;
    console.log(`Running command: ${fullCommand}`);
    const child = spawn(command, args);

    child.on('exit', (code, signal) => {
      const exit = { code, signal };
      if (wd) {
        process.chdir(cwd);
      }
      if (!exit.code) {
        return resolve();
      } else {
        return reject(new Error(`Command '${fullCommand}' exited with code ${exit.code}, signal ${exit.signal}`));
      }
    });

    child.on('error', (err) => {
      if (wd) {
        process.chdir(cwd);
      }
      reject(err);
    });

    child.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    child.stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
};

const npmInstall = (module) => {
  return runCommand('npm', ['install'], module.name);
};

const schematics = (module) => {
  return runCommand('ng', ['g', '.:import-module', `--name=${module.name}`], '../node_modules/midgard-schematics/');
};

const genericErrorHandler = (err) => { console.warn(err.message); };

gulp.task('init', (done) => {
  if (!config) {
    throw new Error('Application configuration not found');
  }

  if (!config.modules || !config.modules.length) {
    throw new Error('No application modules found');
  }

  const tasksToRun = [];
  for (let i = 0; i < config.modules.length; i++) {
    const module = config.modules[i];
    const taskName = `init:${module.name}`;
    gulp.task(taskName, (subTaskDone) => {
      process.chdir('projects');
      return clone(module.url, module.name)
        .catch(genericErrorHandler)
        .then(() => { return npmInstall(module); })
        .catch(genericErrorHandler)
        .then(() => { return schematics(module); })
        .catch(genericErrorHandler)
        .then(subTaskDone);
    });
    tasksToRun.push(taskName);

    return gulp.parallel(tasksToRun)(done);
  }
  process.chdir('../');
});
