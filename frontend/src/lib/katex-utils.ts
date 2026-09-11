import katex from 'katex';

export function renderLatex(text: string): string {
    if (!text) return '';
    
    // If text contains $ delimiters for LaTeX math mode, render math sections
    if (text.includes('$')) {
        const parts = text.split('$');
        let result = '';
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 1) {
                // Math mode
                try {
                    result += katex.renderToString(parts[i], { throwOnError: false });
                } catch (e) {
                    result += parts[i];
                }
            } else {
                result += parts[i];
            }
        }
        return result;
    }
    
    // In case raw LaTeX macros like \Delta or \pm exist without delimiters, convert them to unicode
    let processed = text
        .replace(/\\Delta/g, 'Δ')
        .replace(/\\pm/g, '±');
    
    return processed;
}
