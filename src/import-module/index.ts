import { Rule, Tree, SchematicContext, chain} from '@angular-devkit/schematics';
import { addRouteRule } from "../utils/add-route-utils";
import { addAddReducersAndEpicsRule } from "../utils/add-reducers-and-epics-utils";
import { addNavigationElementRule } from "../utils/add-navigation-element-rule";

export function importModule(options: any): Rule {

  return (host: Tree, context: SchematicContext) => {

    options.module = 'projects/midgard-angular/src/lib/midgard.module.ts';

    const rule = chain([
        addRouteRule(options),
        addAddReducersAndEpicsRule(options),
        addNavigationElementRule(options)
        ]);

    return rule(host, context);
  };
}
