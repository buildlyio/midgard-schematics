import { Rule, Tree, SchematicContext, chain} from '@angular-devkit/schematics';
import { addRouteRule } from "../utils/addition/add-routes-utils";
import { addReducersAndEpicsRule } from "../utils/addition/add-reducers-and-epics-utils";
import { addExitPointRule } from "../utils/addition/add-exit-point-rule";
import { addStylesAndScriptsToWorkspaceFileRule } from '../utils/addition/add-configs-utils';
import { deleteReducersAndEpicsRule } from '../utils/deletion/delete-reducers-and-epics-utils';
import { deleteRouteRule } from '../utils/deletion/delete-routes-utils';
import { deleteExitPointRule } from '../utils/deletion/delete-exit-point-rule';

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
      deleteRouteRule(options),
      deleteExitPointRule(options),
      // addStylesAndScriptsToWorkspaceFileRule(options)
    ]);

    return rule(host, context);
  };
}
