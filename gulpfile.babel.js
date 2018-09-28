import gulp from 'gulp';
import git from 'gulp-git';
import install from 'gulp-install';
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

const schematics = (module) => {
  return new Promise((resolve, reject) => {
    process.chdir('../node_modules/midgard_schematics/');

    const exit = {};
    const child = spawn('ng', ['g', '.:import-module', `--name=${module.name}`]);

    child.on('exit', (code, signal) => {
      exit.code = code;
      exit.signal = signal;
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    child.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    if (!exit.code) {
      process.chdir('../../');
      return resolve();
    } else {
      return reject(new Error(`Schematics child process exited with code ${exit.code}, signal ${exit.signal}`));
    }
  });
};

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
        .catch((err) => { throw new Error(err); })
        .then(() => {
          process.chdir(module.name);
          return new Promise((resolve, reject) => {
            return gulp.src('./package.json')
              .pipe(install())
              .on('error', reject)
              .on('end', resolve);
          }).catch((err) => { throw new Error(err); });
        })
        .then(schematics(module).catch((err) => { throw new Error(err); }))
        .then(subTaskDone);
    });
    tasksToRun.push(taskName);

    return gulp.parallel(tasksToRun)(done);
  }
  process.chdir('../');
});
