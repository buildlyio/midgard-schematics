import { Rule, Tree } from "@angular-devkit/schematics";
import { ModuleOptions } from "@schematics/angular/utility/find-module";
import { getWorkspace, getWorkspacePath } from "@schematics/angular/utility/config";

interface UpdateJsonFn<T> {
    (obj: T): T | void;
}

type TsConfigPartialType = {
    compilerOptions: {
        baseUrl: string,
        paths: {
            [key: string]: string[];
        },
    },
    include: string[]
};

// this function is a utility to update a json file, it is copied from @angular/dev-kit/packages/libray/index.ts
function updateJsonFile<T>(host: Tree, path: string, callback: UpdateJsonFn<T>): Tree {
    const source = host.read(path);
    if (source) {
        const sourceText = source.toString('utf-8');
        const json = JSON.parse(sourceText);
        callback(json);
        host.overwrite(path, JSON.stringify(json, null, 2));
    }

    return host;
}

/**
 * @description rule to update the application ts config file and add the imported module to the include array
 * @param {ModuleOptions} options
 * @returns {Rule}
 */
export function updateAppTsConfigRule (options: ModuleOptions): Rule {

    return (host: Tree) => {
        if (!host.exists('src/tsconfig.app.json')) { return host; }

        return updateJsonFile(host, 'src/tsconfig.app.json', (tsconfig: TsConfigPartialType) => {
            if (!tsconfig.include) {
                tsconfig.include = [];
            }
            tsconfig.include.push(`../projects/${options.name}/src/lib/${options.name}.module.ts`);
        });
    };
}

export function updateTsConfigRule(options: ModuleOptions): Rule {

    return (host: Tree) => {
        if (!host.exists('tsconfig.json')) { return host; }

        return updateJsonFile(host, 'tsconfig.json', (tsconfig: TsConfigPartialType) => {
            if (!tsconfig.compilerOptions.paths) {
                tsconfig.compilerOptions.paths = {};
            }
            if (!tsconfig.compilerOptions.paths[options.name]) {
                tsconfig.compilerOptions.paths[options.name] = [];
            }
            tsconfig.compilerOptions.paths[options.name].push(`dist/${options.name}`);
        });
    };
}

/**
 * @description rule to update the application angular.json file and add the imported module to the projects array in the angular workspace
 * @param {ModuleOptions} options
 * @returns {Rule}
 */
export function addLibraryToWorkspaceFileRule(options: any): Rule {
    return (host: Tree) => {

        const workspace = getWorkspace(host);
        const projectRoot = `projects/${options.name}`;
        // tslint:disable-next-line:no-any
        const project: any = {
            root: `${projectRoot}`,
            projectType: 'library',
            architect: {
                build: {
                    builder: '@angular-devkit/build-ng-packagr:build',
                    options: {
                        project: `${projectRoot}/ng-package.json`,
                    },
                    configurations: {
                        production: {
                            project: `${projectRoot}/ng-package.prod.json`,
                        },
                    },
                },
                test: {
                    builder: '@angular-devkit/build-angular:karma',
                    options: {
                        main: `${projectRoot}/src/test.ts`,
                        tsConfig: `${projectRoot}/tsconfig.spec.json`,
                        karmaConfig: `${projectRoot}/karma.conf.js`,
                    },
                },
                lint: {
                    builder: '@angular-devkit/build-angular:tslint',
                    options: {
                        tsConfig: [
                            `${projectRoot}/tsconfig.lint.json`,
                            `${projectRoot}/tsconfig.spec.json`,
                        ],
                        exclude: [
                            '**/node_modules/**',
                        ],
                    },
                },
            },
        };

        workspace.projects[options.name] = project;
        host.overwrite(getWorkspacePath(host), JSON.stringify(workspace, null, 2));
    };
}

/**
 * @description rule to update the application angular.json file and add custom scripts and styles
 * @param {ModuleOptions} options
 * @returns {Rule}
 */
export function addStylesAndScriptsToWorkspaceFileRule(options: any): Rule {
    return (host: Tree) => {
        const workspace = getWorkspace(host);
        if(options.styles && options.styles !== 'undefined' && workspace.projects['midgard-angular'].architect.build.options.styles) {
            workspace.projects['midgard-angular'].architect.build.options.styles = [...workspace.projects['midgard-angular'].architect.build.options.styles, options.styles];
        }
        if(options.scripts && options.scripts !== 'undefined' && workspace.projects['midgard-angular'].architect.build.options.scripts) {
            workspace.projects['midgard-angular'].architect.build.options.scripts = [...workspace.projects['midgard-angular'].architect.build.options.scripts, options.scripts];
        }
      if(options.assets && options.assets !== 'undefined' && workspace.projects['midgard-angular'].architect.build.options.assets) {
        workspace.projects['midgard-angular'].architect.build.options.assets = [...workspace.projects['midgard-angular'].architect.build.options.assets, options.assets];
      }
        host.overwrite(getWorkspacePath(host), JSON.stringify(workspace, null, 2));
    };
}
