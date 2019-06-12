import gulp from 'gulp';
import git from 'gulp-git';
import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';


const applicationPath = process.cwd();

/**
 * Reads files from the application directory
 * @param fileName - The name of the file that we want to read
 * @returns {object} the object resulting from parsing the application configuration
 */
const readFile = (fileName) => {
  const filePath = applicationPath + `/${fileName}`;

  let file;

  try {
    file = readFileSync(filePath);
  } catch (e) {
    throw new Error('Error loading application configuration: ' + e.message);
  }

  try {
    file = JSON.parse(file);
  } catch (e) {
    throw new Error('Error parsing application configuration: ' + e.message);
  }

  return file;
};

const config = readFile('config.json');
const appState = readFile('app-state.json');

/**
 * Updates the state of the module object loaded from the configuration with the newState
 *
 * @param {object} module - The configuration of a module that needs to be processed
 * @param {object} newState - A set of properties on the module status object that need to have their values updated, along with the new values
 */
const updateModuleStatus = (module, newState) => {
  if (typeof module === 'object' && typeof newState === 'object') {
    module.status = Object.assign(module.status || {}, newState);
  }
};


/**
 * Asynchronously clones a module as defined in the module configuration
 *
 * @param {object} module
 * @returns {Promise} A Promise that will resolve if the clone operation has succeeded and will reject otherwise
 */
const clone = (module) => {
  const options = {
    args: module.name
  };

  return new Promise((resolve, reject) => {
    git.clone(module.url, options, (err) => {
      if (err) {
        console.warn(err.message);
        return reject(err);
      }
      updateModuleStatus(module, { cloneSucceeded: true });
      return resolve();
    });
  });
};

/**
 * Asynchronously executes a command by spawning a child process
 *
 * @param {string} command - the command to be executed, without arguments or parameters
 * @param {Array<string>} [args=[]] - the list of parameters and arguments to be passed to the command
 * @param {object} wd - the working directory that the command should be executed in
 * @returns {Promise} - A promise that resolves if the child process exits with exit code 0, and rejects otherwise
 */
const runCommand = (command, args = [], wd, dataCallback) => {
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
      if (dataCallback) {
        dataCallback(data);
      } else {
        console.log(data.toString());
      }
    });

    child.stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
};


/**
 * Creates a Promise to execute the npm install command in a module's folder
 *
 * @param {object} module - the module configuration for the module that needs npm install
 * @returns {Promise} A Promise that resolves if npm install succeeds, and rejects otherwise
 */
const npmInstall = (module) => {
  if (!module.status || !module.status.cloneSucceeded) {
    return;
  }
  return runCommand('npm', ['install'], module.name);
};

/**
 * Creates a Promise to execute the schematics insert-module command for a module
 *
 * @param {object} module - the module configuration for the module that needs npm install
 * @returns {Promise} A Promise that resolves if npm install succeeds, and rejects otherwise
 */
const schematicsInsert = (module) => {
  if (!module.status || !module.status.cloneSucceeded) {
    return;
  }
  return runCommand('ng', ['g', '.:insert-module', `--name=${module.name}`,
      `--parentExitPointComponentPath=${module.config.parentExitPointComponent.path}`,
      `--parentExitPointComponentElementId=${module.config.parentExitPointComponent.elementId}`,
      `--parentExitPointComponentSelector=${module.config.parentExitPointComponent.componentSelector}`,
      module.config.parentExitPointComponent.options.label ? `--parentExitPointComponentLabel=${module.config.parentExitPointComponent.options.label}` : '',
      module.config.parentExitPointComponent.options.icon ? `--parentExitPointComponentIcon=${module.config.parentExitPointComponent.options.icon}` : '',
      module.config.parentExitPointComponent.options.route ? `--parentExitPointComponentRoute=${module.config.parentExitPointComponent.options.route}` : '',
      module.config.parentExitPointComponent.options.routerOutlet ? `--parentExitPointComponentRouterOutlet=${module.config.parentExitPointComponent.options.routerOutlet}` : '',
      `--routingModuleOptionsPath=${module.config.routingModuleOptions.path}`,
      `--routingModuleOptionsChildrenArrayIndex=${module.config.routingModuleOptions.childrenArrayIndex}`,
      `--routingModuleOptionsParentComponent=${module.config.routingModuleOptions.parentComponent}`,
      `--styles=${module.config.styles}`,
      `--scripts=${module.config.scripts}`,
      ],
      '../../node_modules/midgard-schematics/');
};

/**
 * Creates a Promise to execute the schematics remove-module command for a module
 *
 * @param {object} module - the module configuration for the module that needs npm install
 * @returns {Promise} A Promise that resolves if npm install succeeds, and rejects otherwise
 */
const schematicsRemove = (module) => {
  if (!module.status || !module.status.cloneSucceeded) {
    return;
  }
  return runCommand('ng', ['g', '.:remove-module', `--name=${module.name}`,
      `--parentExitPointComponentPath=${module.config.parentExitPointComponent.path}`,
      `--parentExitPointComponentElementId=${module.config.parentExitPointComponent.elementId}`,
      `--parentExitPointComponentSelector=${module.config.parentExitPointComponent.componentSelector}`,
      module.config.parentExitPointComponent.options.label ? `--parentExitPointComponentLabel=${module.config.parentExitPointComponent.options.label}` : '',
      module.config.parentExitPointComponent.options.icon ? `--parentExitPointComponentIcon=${module.config.parentExitPointComponent.options.icon}` : '',
      module.config.parentExitPointComponent.options.route ? `--parentExitPointComponentRoute=${module.config.parentExitPointComponent.options.route}` : '',
      module.config.parentExitPointComponent.options.routerOutlet ? `--parentExitPointComponentRouterOutlet=${module.config.parentExitPointComponent.options.routerOutlet}` : '',
      `--routingModuleOptionsPath=${module.config.routingModuleOptions.path}`,
      `--routingModuleOptionsChildrenArrayIndex=${module.config.routingModuleOptions.childrenArrayIndex}`,
      `--routingModuleOptionsParentComponent=${module.config.routingModuleOptions.parentComponent}`,
      `--styles=${module.config.styles}`,
      `--scripts=${module.config.scripts}`,
    ],
    '../../node_modules/midgard-schematics/');
};


/**
 * An error handler function that handles exceptions but writes their messages to the console as warnings
 *
 * @param {Error} err - the error generated by the exception
 */
const genericErrorHandler = (err) => { console.warn(err.message); };


/**
 * Gulp task which initializes an entire walhall application based on the configuration found in its config.json
 *
 * Clone, npm install, run schematics#import-module on every module defined in the application's config.json
 *
 * Tasks will be executed in sequence. If a clone operation fails, no further operations will be performed on that module.
 *
 */
gulp.task('init', (done) => {
  if (!config) {
    throw new Error('Application configuration not found');
  }

  if (!config.modules) {
    throw new Error('No application modules found');
  }

  const tasksToRun = [];

    process.chdir('src/clients');
    for (let i = 0; i < config.modules.length; i++) {
    const module = config.modules[i];
    const taskName = `init:${module.name}`;
    gulp.task(taskName, (subTaskDone) => {
      return clone(module)
        .catch(genericErrorHandler)
        .then(() => { return npmInstall(module); })
        .catch(genericErrorHandler)
        .then(() => {
          if (module.config) {
              return schematicsInsert(module);
          }
        })
        .catch(genericErrorHandler)
        .then(subTaskDone);
    });
    tasksToRun.push(taskName);
  }

  gulp.task('add:app', () => {
      process.chdir('../');
      return gulp.src('.').pipe(git.add());
  });
  gulp.task('commit:app', () => {
    return gulp.src('.').pipe(git.commit('modules has been added to the application by midgard-schematics'));
  });
  gulp.task('getCommitId:app', () => {
    return runCommand('../node_modules/midgard-schematics/lib/git-log.sh', [], undefined, (data) => {
      appState.app.initCommitId = data.toString().split(' ')[1].trim();
      console.warn(data.toString());
    });
  });

  tasksToRun.push('add:app', 'commit:app', 'getCommitId:app');

  return gulp.series(tasksToRun)(() => {
    process.chdir('../');
    writeFileSync(`${applicationPath}/app-state.json`, JSON.stringify(appState))
    done();
  });
});


/**
 * Gulp task that cleans up the code generated by schematics
 *
 * run schematics#remove-module on every module defined in the application's config.json
 **
 */
gulp.task('cleanup', (done) => {
  if (!config) {
    throw new Error('Application configuration not found');
  }

  if (!config.modules) {
    throw new Error('No application modules found');
  }

  const tasksToRun = [];

  process.chdir('src/clients');
  for (let i = config.modules.length - 1; i >= 0; i--) {
    const module = config.modules[i];
    const taskName = `cleanup:${module.name}`;
    gulp.task(taskName, (subTaskDone) => {
      return schematicsRemove(module)
        .catch(genericErrorHandler)
        .then(subTaskDone);
    });
    tasksToRun.push(taskName);
  }

  gulp.task('add:app', () => {
    process.chdir('../');
    return gulp.src('.').pipe(git.add());
  });
  gulp.task('commit:app', () => {
    return gulp.src('.').pipe(git.commit('modules has been added to the application by midgard-schematics'));
  });
  gulp.task('getCommitId:app', () => {
    return runCommand('../node_modules/midgard-schematics/lib/git-log.sh', [], undefined, (data) => {
      appState.app.initCommitId = data.toString().split(' ')[1].trim();
      console.warn(data.toString());
    });
  });

  tasksToRun.push('add:app', 'commit:app', 'getCommitId:app');

  return gulp.series(tasksToRun)(() => {
    process.chdir('../');
    writeFileSync(`${applicationPath}/app-state.json`, JSON.stringify(appState))
    done();
  });
});
