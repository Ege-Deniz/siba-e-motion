const fs = require('fs');
const path = require('path');

const filesToProcess = [
    path.join(__dirname, 'site/index.html'),
    path.join(__dirname, 'site/tr/index.html')
];

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // The structure looks like an image/icon preceding the text
    // Extract both blocks using regex
    
    // Pattern to grab the whole block containing the icon for Real-Time Intelligence
    // and Charging Forward. Given this is probably built with Framer, the structure is complex.
    // Let's use string manipulation to find the icon components.
    
    const realTimeIndex = content.indexOf('Real-Time Intelligence');
    const chargingForwardIndex = content.indexOf('Charging Forward');
    
    if (realTimeIndex !== -1 && chargingForwardIndex !== -1) {
        console.log(`Analyzing ${filePath}...`);
        
        // Let's find the SVG tags just before each text.
        // Look for <svg ... </svg> closest before realTimeIndex
        const rtiSvgEnd = content.lastIndexOf('</svg>', realTimeIndex) + 6;
        const rtiSvgStart = content.lastIndexOf('<svg', rtiSvgEnd);
        const rtiSvg = content.substring(rtiSvgStart, rtiSvgEnd);
        
        // Same for Charging Forward
        const cfSvgEnd = content.lastIndexOf('</svg>', chargingForwardIndex) + 6;
        const cfSvgStart = content.lastIndexOf('<svg', cfSvgEnd);
        const cfSvg = content.substring(cfSvgStart, cfSvgEnd);
        
        
        if (rtiSvgStart !== -1 && cfSvgStart !== -1 && rtiSvg !== cfSvg) {
            console.log("Replacing SVGs...");
            // We can do a string replace, but we need to prevent double replace or accidental replace.
            
            // Reconstruct content up to rtiSvg, put cfSvg, ..., up to cfSvg, put rtiSvg
            // Ensure we handle the order. Which one is first?
            const firstStart = Math.min(rtiSvgStart, cfSvgStart);
            const firstEnd = firstStart === rtiSvgStart ? rtiSvgEnd : cfSvgEnd;
            const secondStart = Math.max(rtiSvgStart, cfSvgStart);
            const secondEnd = secondStart === rtiSvgStart ? rtiSvgEnd : cfSvgEnd;
            
            const firstSvgNew = firstStart === rtiSvgStart ? cfSvg : rtiSvg;
            const secondSvgNew = secondStart === rtiSvgStart ? cfSvg : rtiSvg;
            
            let newContent = content.substring(0, firstStart) + 
                             firstSvgNew + 
                             content.substring(firstEnd, secondStart) + 
                             secondSvgNew + 
                             content.substring(secondEnd);
                             
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated icons in ${filePath}`);
        }
    }
}

filesToProcess.forEach(processFile);
console.log('Icon swap complete!');
