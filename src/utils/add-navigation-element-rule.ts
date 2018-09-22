import { Rule, Tree } from "@angular-devkit/schematics";
import { ModuleOptions } from "@schematics/angular/utility/find-module";
import { capitalize } from "@angular-devkit/core/src/utils/strings";
import * as cheerio from 'cheerio'

export function addNavigationElementRule (options: ModuleOptions): Rule {
    return (host: Tree) => {
        const navigationPath = 'projects/midgard-angular/src/lib/components/nav-bar/nav-bar.component.html'; // we can get this from options as well for more flexibility
        const content: Buffer | null = host.read(navigationPath);
        let strContent: string = '';
        if(content) strContent = content.toString('utf8');
        const cheerioDom = cheerio.load(strContent, {decodeEntities: false});
        const navBarElem = cheerioDom('.nav-bar');
        const contentToInsert = `<div class="nav-bar__elem"><a routerLink="/${options.name}"><i class="fas fa-store"></i>${capitalize(options.name)}</a></div>`;
        navBarElem.append(contentToInsert);
        host.overwrite(navigationPath, navBarElem.toString());
        return host;
    };
}
