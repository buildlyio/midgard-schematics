import { Rule, Tree } from "@angular-devkit/schematics";
import * as cheerio from 'cheerio'

export function deleteExitPointRule (options: any): Rule {
    return (host: Tree) => {
        const navigationPath = options.parentExitPointComponentPath;
        const content: Buffer | null = host.read(navigationPath);
        let strContent: string = '';
        if(content) strContent = content.toString('utf8');
        // parse HTML
        const cheerioDom = cheerio.load(strContent, {
            decodeEntities: false,
            lowerCaseTags: false,
            lowerCaseAttributeNames: false
        });
        const exitPointComponentHTML = cheerioDom(`#exitPointComponent`);
        const deleteFromElement = cheerioDom(`#${options.parentExitPointComponentElementId}`); // element to insert HTML to
        deleteFromElement.empty()
        // string content to append to the file
        const newFileContent = exitPointComponentHTML.toString();
        host.overwrite(navigationPath, newFileContent);
        return host;
    };
}
