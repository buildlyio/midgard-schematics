import { Rule, Tree } from '@angular-devkit/schematics';
import { ModuleOptions } from "@schematics/angular/utility/find-module";
import { getWorkspace, getWorkspacePath } from '@schematics/angular/utility/config';

/**
 * rule to remove custom scripts and styles from angular.json
 * @param {ModuleOptions} options
 * @returns {Rule}
 */
export function deleteStylesAndScriptsToWorkspaceFileRule(options: any): Rule {
  return (host: Tree) => {
    const workspace = getWorkspace(host);
    if (options.styles && options.styles !== 'undefined' && workspace.projects['midgard-angular'].architect.build.options.styles) {
      const customStyleIndex = workspace.projects['midgard-angular'].architect.build.options.styles.indexOf(options.styles);
      if (customStyleIndex !== -1) {
        workspace.projects['midgard-angular'].architect.build.options.styles.splice(customStyleIndex, 1)
      }
    }
    if (options.scripts && options.scripts !== 'undefined' && workspace.projects['midgard-angular'].architect.build.options.scripts) {
      const customScriptIndex = workspace.projects['midgard-angular'].architect.build.options.scripts.indexOf(options.scripts);
      if (customScriptIndex !== -1) {
        workspace.projects['midgard-angular'].architect.build.options.scripts.splice(customScriptIndex, 1)
      }
    }
    if (options.assets && options.assets !== 'undefined' && workspace.projects['midgard-angular'].architect.build.options.assets) {
      const customAssetsIndex = workspace.projects['midgard-angular'].architect.build.options.assets.indexOf(options.assets);
      if (customAssetsIndex !== -1) {
        workspace.projects['midgard-angular'].architect.build.options.assets.splice(customAssetsIndex, 1)
      }
    }
    host.overwrite(getWorkspacePath(host), JSON.stringify(workspace, null, 2));
  }
}
