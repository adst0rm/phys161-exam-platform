import katex from 'katex';

export function renderLatex(text: string): string {
    if (!text) return '';
    // Basic substitution for common issues in the dataset
    let processed = text.replace(/\+/g, '\\pm').replace(/\?/g, '\\Delta').replace(/\?/g, '^2');
    
    // We try to find things that look like math and wrap them in  if they aren't already.
    // For simplicity, we just use KaTeX to render the whole text if it contains typical math,
    // or just return the text. Actually, it's safer to just render the whole text using 
    // a regex to find $...$ and replace. But the dataset might just have raw text with unicode.
    // Let's just return the processed text, and let React render it. Wait, the user wants KaTeX.
    
    // Simple parser: replace $...$ with katex
    const parts = processed.split('$');
    if (parts.length === 1) {
        // No $ delimiters, just return text
        return processed;
    }
    
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
