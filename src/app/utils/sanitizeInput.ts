const acceptedTokens = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '(', ')']);
const alternativeTokens = new Map([['÷', '/'], ['×', '*'], ['x', '*']]);

export const sanitizeInput = (inputString: string) =>
    inputString.split('')
        .map(token => alternativeTokens.get(token) ?? token)
        .filter(token => acceptedTokens.has(token)).join('');