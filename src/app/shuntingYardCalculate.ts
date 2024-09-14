type OperatorFn = (a: number, b?: number) => number;

const operators: { [key: string]: OperatorFn } = {
    '+': (a, b) => a + b!,
    '-': (a, b) => a - b!,
    '*': (a, b) => a * b!,
    '/': (a, b) => a / b!,
    'NEG': (a) => -a  // 
};

const precedence: { [key: string]: number } = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    'NEG': 3 
};

// Tokenize the input expression using regex to handle multi-digit numbers and operators
function tokenize(expression: string): string[] {
    const regex = /\d+|\+|\-|\*|\/|\(|\)/g;
    return expression.match(regex) || [];
}

// Shunting Yard Algorithm for parsing to RPN (postfix notation)
function shuntingYard(tokens: string[]): string[] {
    const output: string[] = [];
    const opsStack: string[] = [];

    tokens.forEach((token, index) => {
        if (!isNaN(Number(token))) {
            // If token is a number, push it to the output
            output.push(token);
        } else if (token === '-' && (index === 0 || tokens[index - 1] === '(')) {
            // Handle unary minus
            opsStack.push('NEG');
        } else if (token in operators) {
            // If token is an operator (binary)
            while (opsStack.length > 0 && opsStack[opsStack.length - 1] in operators &&
                precedence[opsStack[opsStack.length - 1]] >= precedence[token]) {
                output.push(opsStack.pop()!);
            }
            opsStack.push(token);
        } else if (token === '(') {
            // Left parenthesis
            opsStack.push(token);
        } else if (token === ')') {
            // Right parenthesis, pop operators until left parenthesis
            while (opsStack.length > 0 && opsStack[opsStack.length - 1] !== '(') {
                output.push(opsStack.pop()!);
            }
            opsStack.pop(); // Remove the '(' from the stack
        }
    });

    // Pop all remaining operators in the stack
    while (opsStack.length > 0) {
        output.push(opsStack.pop()!);
    }

    return output;
}

// Evaluate RPN expression
function evaluateRPN(rpnTokens: string[]): number {
    const stack: number[] = [];

    rpnTokens.forEach(token => {
        if (!isNaN(Number(token))) {
            // If token is a number, push it to the stack
            stack.push(Number(token));
        } else if (token in operators) {
            // If token is an operator
            if (token === 'NEG') {
                // Handle unary minus
                const a = stack.pop()!;
                stack.push(operators[token](a));
            } else {
                // Handle binary operators
                const b = stack.pop()!;
                const a = stack.pop()!;
                stack.push(operators[token](a, b));
            }
        }
    });

    return stack[0];
}


function calculate(expression: string): number {
    const tokens = tokenize(expression);
    const rpn = shuntingYard(tokens);
    return evaluateRPN(rpn);
}


// const expression1 = "-5 + 3 * (2 - 8)";    
// const result1 = calculate(expression1);
// console.log(result1);  // -23


export const shuntingYardCalculate = calculate;