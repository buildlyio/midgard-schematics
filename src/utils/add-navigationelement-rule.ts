import { Rule, Tree } from "@angular-devkit/schematics";
import { ModuleOptions } from "@schematics/angular/utility/find-module";
import { capitalize } from "@angular-devkit/core/src/utils/strings";
const jsdom = require('jsdom').jsdom

const { JSDOM } = jsdom;

export function addNavigationElementRule (options: ModuleOptions): Rule {
    return (host: Tree) => {
        const navigationPath = 'projects/midgard-angular/src/lib/components/nav-bar/nav-bar.component.html'; // we can get this from options as well for more flexibility
        const content: Buffer | null = host.read(navigationPath);
        let strContent: string = '';
        if(content) strContent = content.toString();
        const dom = new JSDOM(strContent);
        const navBarElem = dom.window.document.querySelector("nav-bar");
        const contentToInsert = `<div class="nav-bar__elem"><a [routerLink]="['/${options.name}']"><i class="fas fa-store"></i>${capitalize(options.name)}</a></div>`;
        navBarElem.parentNode.insertBefore(contentToInsert, navBarElem.nextSibling);
        host.overwrite(navigationPath, dom.window.document.documentElement.outerHTML);
        return host;
    };
}
