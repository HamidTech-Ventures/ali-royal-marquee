const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            if (content.includes('showToast(')) {
                content = content.replace(/const\s*{\s*showToast\s*}\s*=\s*useToast\(\);?/g, 'const { success, error } = useToast();');
                
                content = content.replace(/showToast\(([^,]+),\s*['"]error['"]\)/g, 'error($1)');
                content = content.replace(/showToast\(([^,]+),\s*['"]success['"]\)/g, 'success($1)');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed', fullPath);
            }
        }
    }
}

processDir('c:/My working/HamidTech_Ventures/Clients/marquee-management-system/frontend/src');
