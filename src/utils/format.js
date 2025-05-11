export const nFormat = (number) => {

    if(number === undefined || number === null || isNaN(number) || number === Infinity || number === "NaN" || number === "Infinity" || number === "undefined" || number === "null" || number === '❗️') return "❗️"

    // Convert to fixed 2 decimal places first
    const fixed = Number(number).toFixed(2);
    
    // Remove .00 if present
    const withoutZeros = fixed.replace(/\.00$/, '');
    
    // Add thousands separator
    return withoutZeros.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}