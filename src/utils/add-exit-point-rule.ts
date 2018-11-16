import { Rule, Tree } from "@angular-devkit/schematics";
import * as cheerio from 'cheerio'

export function addExitPointRule (options: any): Rule {
    return (host: Tree) => {
        const navigationPath = options.parentExitPointComponent.path; // we can get this from options as well for more flexibility
        const content: Buffer | null = host.read(navigationPath);
        let strContent: string = '';
        if(content) strContent = content.toString('utf8');
        const cheerioDom = cheerio.load(strContent);
        const navBarElem = cheerioDom('.nav-bar');
        const contentToInsert = `<${options.parentExitPointComponent.componentSelector} label="${options.parentExitPointComponent.options.label}"></${options.parentExitPointComponent.componentSelector}>`;
        navBarElem.append(contentToInsert);
        // string content to append to the file
        const newFileContent = navBarElem.toString().replace(new RegExp('routerlink', 'g'), 'routerLink');
        host.overwrite(navigationPath, newFileContent);
        return host;
    };
}
