import { Rule, Tree, SchematicContext, chain, SchematicsException } from '@angular-devkit/schematics';
import { addRouteRule } from "../utils/add-route-utils";
import { addAddReducersAndEpicsRule } from "../utils/add-reducers-and-epics-utils";
import { addLibraryToWorkspaceFileRule, updateAppTsConfigRule, updateTsConfigRule } from "../utils/add-configs-utils";
import { addExitPointRule } from "../utils/add-exit-point-rule";
import * as ts from "typescript";
import { getSourceNodes } from "@schematics/angular/utility/ast-utils";

export function importModule(options: any): Rule {

  return (host: Tree, context: SchematicContext) => {

    options.module = 'projects/midgard-angular/src/lib/midgard.module.ts';

      let text = host.read(options.routingModuleOptionsPath);
      if (!text) throw new SchematicsException(`Routing module does not exist.`);
      let sourceText = text.toString('utf-8');

      // create the typescript source file
      let sourceFile = ts.createSourceFile(options.routingModuleOptionsPath, sourceText, ts.ScriptTarget.Latest, true);

      // get the nodes of the source file
      let nodes: ts.Node[] = getSourceNodes(sourceFile);

      // validate if the route of the module exists if yes don't run the rules
      if (nodes.find(n => ts.SyntaxKind.StringLiteral && n.getText() === options.name)){
          throw new SchematicsException(`module already exists`);
      } else {
          const rule = chain([
              addRouteRule(options),
              addAddReducersAndEpicsRule(options),
              addExitPointRule(options),
              addLibraryToWorkspaceFileRule(options),
              updateTsConfigRule(options),
              updateAppTsConfigRule(options)
          ]);
          return rule(host, context);
      }
  };
}
