function createIndex(length, max = 9, min = 0) {
    /*
    Index of coefficient - Specs:
    Direction: Conventional
    (nth power will be denoted by index = n)
    (contsnat term will be denoted by index = 0)
    */

    let index = [];

    console.log(length);

    for(let i = 0; i < length; i++){
        index.push(Math.round(Math.random()*9 + min));
    }

    return index;
}

function createSimple(index) {
    /*
    Index of function - Specs:
    Direction: Conventional
    (nth power will be denoted by index = n)
    (contsnat term will be denoted by index = 0)
    must be .reverse()-ed before .join()
    */

    // Ignore if the argument is not an array
    if (!Array.isArray(index)) {
        return index;
    }

    let Fx = [];

    for (let i = index.length-1; i >= 0; i--) {
        //If coefficient = 0, skip the term, so codes will be omitted

        if (index[i] == 1) {
            Fx.unshift('x<sup>' + i + '</sup>');
        } else if (index[i] > 1) {
            Fx.unshift(index[i] + 'x<sup>' + i + '</sup>')
        }

    }

    if (Fx.length > 1) {
        Fx[1] = Fx[1].slice(0, Fx[1].indexOf('<'));
    }

    if (Fx.length > 0) {
        Fx[0] = Fx[0].slice(0, Fx[0].indexOf('x'));
    }
    

    if (!Fx[0]) {
        Fx[0] = 1;
    }

    return unify(Fx.reverse().join(' + '));
}

function sortArray(input, validation = false) {
    /*
    Sort 2-dimensional array by length (inner arrays)
    Argument:
        validation: if 0 is counted as a valid term
    */

    // Deep-clone input array in case of unexpected modifications
    let sample = structuredClone(input);

    // Sort in ascending order
    if (validation) {
        // Sort by # valid terms
        sample.sort((a,b) => validate(a).length - validate(b).length);
    } else {
        // Sort by length
        sample.sort((a,b) => a.length - b.length)
    }
    
    return sample;
}

function validate(items) {
    /*
    Extract non-zero terms from an array
    Returns a new array
    */
   
    let arr = [];

    arr = items.filter(item => Boolean(item));

    return arr;
}

function createFx(indices) {
    /*
    Create a product function
    Input: 2D array of indices of coefficients

    Input Restriction:
    - For n indices:
        n-1 indices must have a length greater than 1

    Output: A product function in HTML syntax

    Output Convention:
        Factors will be sorted by their length in an ascending order
    */

    let complex = []

    // Sort indices of coefficient by length
    indices = sortArray(indices, validation=true);

    // If the first index has a valid length of 1 (Validate length via function)
    if (validate(indices[0]).length == 1) {
        if (!indices[0][0] || indices[0][0] == 0) { // If the first term is not 1
            complex.push(createSimple(indices[0]));
        }
        indices.splice(indices.indexOf(indices[0]), 1); // Delete the first item
    }

    // Generate expressions for the subsequent terms (wrapped in brackets)
    indices.forEach(index => {
        complex.push('(' + createSimple(index) + ')')
    });

    return complex.join('');
}

function randomize(index, range = [-5, 5]) {
    /*
    Randomize the coefficients (Generate incorrect responses)
    */

    randomized = []

    index.forEach(coefficient => {
        randomized.push(coefficient + Math.round(Math.random()*(range[1]-range[0])+range[0]));
    });

    return randomized;
}

function derivativeSimple(coefficients) {
    /*
    Find the derivative of a function
    Input: Coefficient Index
    Output: Function in HTML syntax
    */

    let derivative = [];

    derivative = coefficients.map(coefficient => {
        derivedTerm = coefficients.indexOf(coefficient)
        return coefficient*(derivedTerm) + 'x<sup>' + (derivedTerm-1) + '</sup>'
    });

    // Delete the coefficient of the first term (constant)
    derivative.splice(0, 1); 

    // Remove redundant exponent notations (Traversal)
    derivative = derivative.map(term => {
        if (term.indexOf('x<sup>0</sup>') != -1) {
            return term.replace('x<sup>0</sup>','');
        }
        return term.replace('x<sup>1</sup>','x');
    });

    // Coefficient of 1 is omitted, add it back if the constant term is empty
    if (!derivative[0]) {
        derivative[0] = 1;
    }

    return unify(derivative.reverse().join(' + '));
}

function wrap(fx) {
    /*
    Formatting Utility
    Wrap a function in brackets if it contains multiple terms
    */

    if (fx.indexOf('+') != -1) {
        return '(' + fx + ')';
    }
    return fx;
}

function derivativeOf(fx, recur = true) {
    /*
    Concatenate the derivative of a product function

    !Recursive function: Can potentially crash the game!

    fx1 & fx2 should be factors of the original function, such that
        - fx1*fx2 = original function

    Input Specifications:
        *IoE: Index of Coefficient
        - fx: List of IoE of functions
            [0]: IOE of function #1
            [1]: IOE of function #2 (Simple / Compound)
        - recur: if one of the fx (conventionally fx2) argument is a product (must be derived again)
        
    fx - After processing:
        [0]: Expression of function #1
        [1]: Expression of function #2
        [2]: Derivative of function #1
        [3]: Derivative of function #2 
    
    Output Specification:
        - derivative of the product function in HTML syntax
    */

    // Dissect the array
    fx = [
        fx[0],
        fx.slice(1) //Subsequent terms will be put together as one
    ];

    if (fx[1].length > 1) {
        // Keep the IoE of the second fx if it's a compound function
        complex = fx[1];

        // Find the derivative of the first function
        fx.push(wrap(derivativeSimple(fx[0])));

        // Convert IoE to fx
        fx[0] = wrap(createSimple(fx[0])); // Simple conversion
        fx[1] = '[' + createFx(fx[1]) + ']' // Compound conversion

        // Swap the first and third item
        temp = fx[0];
        fx[0] = fx[2];
        fx[2] = temp;

        // Add a plus sign in the middle
        fx.splice(2, 0, ' + ');

        // Continue if the last term is compound (product function)
        return fx.slice(0,4).join('') + '[' + derivativeOf(complex) + ']';
    } else {
        // Flatten the array (avoid nested arrays)
        fx[1] = fx[1].flat()

        // Find derivative of each term (copy of the original array is used to avoid infinite loop)

        fx.slice().forEach(f => {
            fx.push(derivativeSimple(f));
        });

        // Convert IoE to Functions (strings will be ignored)
        fx = fx.map(createSimple);

        // Wrap in brackets if applicable
        fx = fx.map(wrap);

        // Swap the first and third item (to make the derivative correct)
        temp = fx[0];
        fx[0] = fx[2];
        fx[2] = temp;

        // Add a plus sign in the middle
        fx.splice(2, 0, ' + ');
        
        return fx.join('');
    }
}

function pack(entry) {
    return derivativeOf(entry);
}

function unify(Fx) {
    return Fx.split('+ -').join('- ');
}