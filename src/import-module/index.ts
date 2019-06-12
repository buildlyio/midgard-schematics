import { Rule, Tree, SchematicContext, chain} from '@angular-devkit/schematics';
import { addRouteRule } from "../utils/addition/add-routes-utils";
import { addReducersAndEpicsRule } from "../utils/addition/add-reducers-and-epics-utils";
import { addExitPointRule } from "../utils/addition/add-exit-point-rule";
import { addStylesAndScriptsToWorkspaceFileRule } from '../utils/addition/add-configs-utils';

export function insertModule(options: any): Rule {

  return (host: Tree, context: SchematicContext) => {
    const rule = chain([
        addReducersAndEpicsRule(options),
        addRouteRule(options),
        addExitPointRule(options),
        addStylesAndScriptsToWorkspaceFileRule(options)
        // addLibraryToWorkspaceFileRule(options),
        // updateTsConfigRule(options),
        // updateAppTsConfigRule(options)
        ]);

    return rule(host, context);
  };
}

export function removeModule(options: any): Rule {

  return (host: Tree, context: SchematicContext) => {
    const rule = chain([
      deleteReducersAndEpicsRule(options),
      // addRouteRule(options),
      // addExitPointRule(options),
      // addStylesAndScriptsToWorkspaceFileRule(options)
    ]);

    return rule(host, context);
  };
}
