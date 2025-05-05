function createIndex_coefficients(terms, multiplier) {
    if(terms < 1) {
        /*If the number of terms (generated randomly during gameplay) is less than 1,
        add linear functions to confuse the player*/
        terms = Math.round(Math.random()+1);
    }

    let coefficients = [];

    for(let i = 1; i <= terms; i++) {
        //Generate a random coefficient for each term, and append it to the coefficient index list
        coefficients.push(Math.round(Math.random()*(i*multiplier))); 
        //Multipliers are used to augment the value of coefficients (although randomly generated)
    }
    //Outputs a list containing all coefficients, order of terms in ascending order (although doesnt matter it's how i've programmed it)
    //Example: coefficients[0] will yield the coefficient for the constant term, since the order of constant term is 0 (more intelligible...)
    return coefficients;
}

function fxGen_polynomial(coefficients) {
    let randFx = '';

    for(let i = coefficients.length - 1; i >= 0; i--) {
        if(!(coefficients[i]) && i == coefficients.length-1) {
            coefficients.splice(i, 1); //Delete the last coefficient (of the highest term) 
            //if it's 0 (so if the quartic term is 0, it's basically a cubic function)
        }
    }

    let terms = coefficients.length - 1;

    for(let i = terms ; i >= 0; i--) { //List traversal with descending index
        if(!(terms)) { //If the function only contains constants, that is when term == 0, the function will be a random number
            randFx = coefficients[i];
        }else if(coefficients[i] == 1 && i) {
            if(i==1){
                if(i==terms) {
                    randFx += 'x'; //If it's the first term & coefficient = 1
                    //(when order = 1, since in math we don't write the 1 exponent, we also don't write the 1 as coefficient)
                }else {
                    randFx += ' + x'; //Add "+" sign if not the first term (same as above)
                }
            }else if(i==terms && terms){
                randFx += 'x<sup>' + i + '</sup>'; //Leading term & coefficient = 1 (exponents are taking into account)
            }else if (!(i==0)) {
                randFx += ' + x<sup>' + i + '</sup>'; //Subsequent terms & coefficient = 1
            }          
        } else if(coefficients[i]) {
            if (i==1){
                if(i==terms) {
                    randFx += coefficients[i] + 'x'; //For linear terms as the leading term, but when coefficient is not 1
                }else {
                    randFx += ' + ' + coefficients[i] + 'x'; //For linear terms as the subsequent terms
                }
            }else if(i==terms && terms) {
                randFx += coefficients[i] + 'x<sup>' + i + '</sup>';//Leading term, no restrictions
            }else if (!(i==0)) {
                randFx += ' + ' + coefficients[i] + 'x<sup>' + i + '</sup>';//Subsequent terms, no restrictions
            }else {
                randFx += ' + ' + coefficients[i];//Constant term, no restriction
            }
        }
    }
    if(!(randFx)){ //If there is not a function after going through all these above, we set the function to 0
        randFx = '0';
    }

    return 'f(x) = ' + randFx; //Return the function
}

//This function is dependent on the coefficient index generator, please refer to the previous PDF for its functionality
function derivativeOf_polynomial(coefficients) {
    let temp = [...coefficients]; //Create deep copy of the function so the original variable (containing the func) won't be altereds

    temp.splice(0, 1); //Constant term is deleted (as said above, index 0 is the constant term)
    for(let i = 0; i <= temp.length - 1; i++) {
        temp.splice(i, 1, temp[i] * (i+1)); //Traverse the list, using the power rule (f'(x) = n*x^(n-1)) to find the derivative
        //Values of list are replaced using splice
    }

    return temp; //Return the derivative
}

//create an index of coefficients: current_coefficients = createIndex_coefficients(4,5);
//create a random polynomial function: fxGen_polynomial(current_coefficients);
//find the derivative of a polynomial function: derivativeOf_polynomial(current_coefficients);

let score = document.getElementById('score-display');
let instructText = document.getElementById('instruction');
let problemText = document.getElementById('problem-display');
let question_count = 0;
let win = false;
let progression = document.getElementById('progress-display');
let life = document.getElementById('life-display');
let life_count = 3;

let options_set = [
    document.getElementById('option-1'),
    document.getElementById('option-2'),
    document.getElementById('option-3'),
    document.getElementById('option-4')
];

//Initialize
life.innerHTML = 'Lives left: 3';
instructText.innerHTML = 'Find the derivative of:';
let correctIndex = 0;

let dis_score = 10000;

function updateScore() {
    if(dis_score > 0){
        if(dis_score < 1000 ) {
            score.style.color = '#DC143C';
        }
        dis_score -= 1;
        score.innerHTML = 'Score: '+dis_score;
    }else {
        clearInterval(scoreinterval); //fail
        localStorage.setItem('win', false);
        localStorage.setItem('stats', [0, question_count, life_count]);
        resultScreen();
        return;
    } 
}

const scoreinterval = setInterval(updateScore, 5);

document.getElementById('fall-back').addEventListener('click', function() {
    window.history.back();
});

function penalty(wrongOp) {
    console.log('!!!!!!!!!!wrong option triggered, chosen:'+wrongOp.innerHTML+' while correct index gives:'+options_set[correctIndex].innerHTML);
    dis_score -= 500;
    life_count --;
    life.innerHTML = 'Lives left: '+life_count;
    wrongOp.style.backgroundColor = 'grey';
    if(life_count == 0){
        clearInterval(scoreinterval);
        localStorage.setItem('win', false);
        localStorage.setItem('stats', [dis_score, question_count, 0]);
        resultScreen();
        return;
    }
}

function restore_color(target) {
    target.style.backgroundColor = '';
    return;
}

function refresh() {
    question_count ++;
    progression.innerHTML = 'Question: '+question_count+'/10';

    let current_terms = Math.round(Math.random()*4+1); //Maximum and minimum terms in polynomials
    let current_coefficients = createIndex_coefficients(current_terms,5);
    problemText.innerHTML = fxGen_polynomial(current_coefficients);

    //Reinitialize listeners
    
    //options_set.forEach(option => option.removeEventListener('click', () => penalty()));
    //options_set.forEach(option => option.removeEventListener('click', refresh)); 
    //fresh copy replacement
    options_set = options_set.map(option => {
        const newOption = option.cloneNode(true);
        option.replaceWith(newOption);
        return newOption;
    });

    correctIndex = Math.round(Math.random()*3);
    options_set[correctIndex].innerHTML = fxGen_polynomial(derivativeOf_polynomial(current_coefficients)).replace('f(x)','f\'(x)') + ' [C]'; //Display
    options_set[correctIndex].addEventListener('click', refresh);
    options_set.forEach(option => {
        if(option.innerHTML != options_set[correctIndex].innerHTML) {
            option.addEventListener('click', () => penalty(option));
        }
    });

    options_set.forEach(option => restore_color(option))

    for(let i = 0; i <= 3; i++) {
        if(i!=correctIndex){
            options_set[i].innerHTML = fxGen_polynomial(createIndex_coefficients(current_terms-1,Math.round(Math.random()*2+4))).replace('f(x)','f\'(x)');
            console.log('Result generated')
            console.log(options_set[i].innerHTML+' compare with '+options_set[correctIndex].innerHTML);
            while(options_set[i].innerHTML + ' [C]' == options_set[correctIndex].innerHTML){ //Check
                options_set[i].innerHTML = fxGen_polynomial(createIndex_coefficients(current_terms-1,Math.round(Math.random()*2+4))).replace('f(x)','f\'(x)');
                console.log('while looping')
            }
        }
    }

    if(question_count == 10) {
        clearInterval(scoreinterval);
        localStorage.setItem('win', true);
        localStorage.setItem('stats', [dis_score, 10, life_count]);
        resultScreen();
        return;
    }
}

function resultScreen() {
    window.location.href='../result.html';
}

refresh();