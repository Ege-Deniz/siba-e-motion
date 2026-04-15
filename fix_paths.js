const fs = require('fs');
const path = require('path');

const siteDir = path.join(__dirname, 'site');

function getRelativePrefix(filePath) {
    const relativeToSite = path.relative(siteDir, filePath);
    const depth = relativeToSite.split(path.sep).length - 1;
    return depth === 0 ? './' : '../'.repeat(depth);
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    const relPrefix = getRelativePrefix(filePath);
    
    // Replace various media and assets absolute/relative paths
    // e.g. /media/... -> ./media/... or ../media/...
    // ../../../media/... -> ../../media/... etc.
    // /site/assets/... -> ./assets/... or ../assets/...
    // /assets/... -> ./assets/... or ../assets/...

    content = content.replace(/(["'\(])(?:(?:\.\.\/)+|\/?(?:site\/)?)media\//g, `$1${relPrefix}media/`);
    content = content.replace(/(["'\(])(?:(?:\.\.\/)+|\/?(?:site\/)?)assets\//g, `$1${relPrefix}assets/`);
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${path.relative(siteDir, filePath)}`);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (/\.(html|css|js)$/.test(file)) {
            processFile(fullPath);
        }
    });
}

walkDir(siteDir);
console.log('Done!');
