//Utilities

function reduce(dual) {

    while (dual[0] != dual[1]) {
        dual[dual.indexOf(Math.max(...dual))] = dual[dual.indexOf(Math.max(...dual))] - dual[dual.indexOf(Math.min(...dual))];
    }

    return dual[0];
}

function fraction(num, den) {

    let sign = 1

    if (num < 0 || den < 0) {
        sign = -1
    }

    num = Math.abs(num);
    den = Math.abs(den);

    factor = reduce([num, den]);

    if (den/factor != 1) {
        if (sign == -1) {
            return '-<sup>' + num/factor + '</sup>&frasl;<sub>' + den/factor + '</sub>';
        }
        return '-<sup>' + num/factor + '</sup>&frasl;<sub>' + den/factor + '</sub>'
    }
    if (den != num) {
        return (num/factor)*sign
    }
    return '';
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


//Core mechanics

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
            Fx.unshift(index[i] + 'x<sup>' + i + '</sup>');
        }
    }

    // Avoid redundant exponent notation
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

function integralOf(index) {
    /*
    Find the integral of a polynomial
    Input spec: Index of Coefficient
    Direction of Traversal: Arbitrary
    Output spec: Integral of Function in HTML syntax
    */

    integral = []

    for (let i = index.length - 1; i >= 0; i--) {
        if (index[i] != 0) {
            integral.unshift(fraction(index[i], i+1) + 'x<sup>' + (i + 1) + '</sup>');
        }
    }

    integral[0] = integral[0].slice(0, integral[0].indexOf('x')+1);
    integral.unshift('C');

    return unify(integral.reverse().join(' + '));
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

function pack(entry) {
    return integralOf(entry);
}
