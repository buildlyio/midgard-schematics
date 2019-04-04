import { Rule, Tree, SchematicContext, chain} from '@angular-devkit/schematics';
import { addRouteRule } from "../utils/add-route-utils";
import { addAddReducersAndEpicsRule } from "../utils/add-reducers-and-epics-utils";
import { addExitPointRule } from "../utils/add-exit-point-rule";
import { addCustomStylesAndScriptsToWorkspaceFileRule } from '../utils/add-configs-utils';

export function importModule(options: any): Rule {

  return (host: Tree, context: SchematicContext) => {
    const rule = chain([
        addAddReducersAndEpicsRule(options),
        addRouteRule(options),
        addExitPointRule(options),
        addCustomStylesAndScriptsToWorkspaceFileRule(options)
        // addLibraryToWorkspaceFileRule(options),
        // updateTsConfigRule(options),
        // updateAppTsConfigRule(options)
        ]);

    return rule(host, context);
  };
}
