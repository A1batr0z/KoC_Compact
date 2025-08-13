function createIndex(length, max = 9, min = 0) {
    /*
    Index of coefficient - Specs:
    Direction: Conventional
    (nth power will be denoted by index = n)
    (contsnat term will be denoted by index = 0)
    */

    let index = [];

    for(let i = 0; i < length; i++){
        index.push(Math.round(Math.random()*9 + min));
    }

    return index;
}

function format(entry) {
    /*
    String formatting makeshift:

    Syntax:
    format('Your string {variable#1} ...')

    Customizable variable integration in your string!
    */

    entry = entry.replace(/\{(.*?)\}/g, (_, cap) => {
        return globalThis[cap];
    });

    return entry;
}

function unify(Fx) {
    return Fx.split('+ -').join('- ');
}

function createFx(index) {
    /*
    Index of function - Specs:
    Direction: Conventional
    (nth power will be denoted by index = n)
    (contsnat term will be denoted by index = 0)
    must be .reverse()-ed before .join()
    */

    let Fx = [];

    for (let i = index.length-1; i >= 0; i--) {
        //If coefficient = 0, skip the term, so codes will be omitted
        

        if (index[i] == 1) {
            Fx.unshift('x<sup>' + i + '</sup>');
        } else if (index[i] == 0) {
            break;
        } else {
            Fx.unshift(index[i] + 'x<sup>' + i + '</sup>')
        }

    }

    // Replace redundant exponent notation
    Fx = Fx.map(term => {
        if (term.indexOf('x<sup>0</sup>') != -1) {
            return term.replace('x<sup>0</sup>','');
        }
        return term.replace('x<sup>1</sup>','x');
    });

    if (!Fx[0]) {
        Fx[0] = 1;
    }

    return unify(Fx.reverse().join(' + '));
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

function derivativeOf(coefficients) {
    /*
    Find the derivative of a function
    Input: Coefficient Index
    Output: Function in HTML syntax
    */

    if (!coefficients.length) {
        return '0';
    }

    let derivative = [];

    derivative = coefficients.map((coefficient, index) => {
        //console.log('DeriveTerm: '+index) 
        //console.log('Coeff: '+coefficient)
        //console.log('Yield: '+(coefficient *(index) + 'x<sup>' + (index-1) + '</sup>'));
        if (index != 0 && coefficient != 0) {
            return coefficient*index + 'x<sup>' + (index-1) + '</sup>';
        } else {
            console.log("This term is constant!")
            return '';
        }
    });

    // Filter none terms
    derivative = derivative.filter(n => n)

    console.log("This dv: "+derivative)
    
    // Replace redundant exponent notation
    derivative = derivative.map(term => {
        if (term.indexOf('x<sup>0</sup>') != -1) {
            return term.replace('x<sup>0</sup>','');
        }
        return term.replace('x<sup>1</sup>','x');
    });

    // Remove terms with 0 coefficient
    derivative.forEach(term => {
        if (term.startsWith('0')) {
            derivative.splice(derivative.indexOf(term), 1);
        }
    });

    // Coefficient of 1 is omitted, add it back if the constant term is empty
    if (!derivative[0]) {
        derivative[0] = 1;
    }

    return unify(derivative.reverse().join(' + '));
}

function pack(entry) {
    return derivativeOf(entry);
}