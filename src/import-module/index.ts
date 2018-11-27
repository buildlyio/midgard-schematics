import { Rule, Tree, SchematicContext, chain} from '@angular-devkit/schematics';
import { addRouteRule } from "../utils/add-route-utils";
import { addAddReducersAndEpicsRule } from "../utils/add-reducers-and-epics-utils";
import { addLibraryToWorkspaceFileRule, updateAppTsConfigRule, updateTsConfigRule } from "../utils/add-configs-utils";
import { addExitPointRule } from "../utils/add-exit-point-rule";

export function importModule(options: any): Rule {

  return (host: Tree, context: SchematicContext) => {

    options.module = 'projects/midgard-angular/src/lib/midgard.module.ts';

    const rule = chain([
        addAddReducersAndEpicsRule(options),
        addRouteRule(options),
        addExitPointRule(options),
        addLibraryToWorkspaceFileRule(options),
        updateTsConfigRule(options),
        updateAppTsConfigRule(options)
        ]);

    return rule(host, context);
  };
}
