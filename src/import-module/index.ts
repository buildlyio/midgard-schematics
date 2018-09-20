import { Rule, Tree, SchematicContext, chain} from '@angular-devkit/schematics';
import { addImportToNgModule } from '../utils/ng-module-utils';
import { addRouteRule } from "../utils/add-route-utils";

export function importModule(options: any): Rule {

  return (host: Tree, context: SchematicContext) => {

    options.module = 'projects/midgard-angular/src/lib/midgard.module.ts';

    const rule = chain([
        addImportToNgModule(options),
        addRouteRule(options)
        ]);

    return rule(host, context);
  };
}
