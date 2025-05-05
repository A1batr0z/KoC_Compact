function createIndex_coefficients(terms = 2, multiplier = 3) {
    let coefficients = [];

    for (let i = 0; i < terms; i++) {
        let coeff = Math.floor(Math.random() * multiplier + 1);
        if (i === terms - 1 && coeff === 0) coeff = 1; // Avoid 0 for leading term
        coefficients.push(coeff);
    }

    return coefficients;
}

function fxGen_polynomial(coefficients) {
    let result = '';
    let terms = coefficients.length;

    for (let i = terms - 1; i >= 0; i--) {
        let coeff = coefficients[i];
        if (coeff === 0) continue;

        let term = '';
        if (i === 0) {
            term = `${coeff}`;
        } else if (i === 1) {
            term = coeff === 1 ? 'x' : `${coeff}x`;
        } else {
            term = coeff === 1 ? `x<sup>${i}</sup>` : `${coeff}x<sup>${i}</sup>`;
        }

        result += result ? ' + ' + term : term;
    }

    return result || '0';
}

function derivativeOf_polynomial(coefficients) {
    let derivative = [];

    for (let i = 1; i < coefficients.length; i++) {
        derivative.push(coefficients[i] * i);
    }

    return derivative;
}

function product(times) {
    let expression = '';
    let co_index = [];

    for (let i = 0; i < times; i++) {
        let termCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 terms
        let coeffs = createIndex_coefficients(termCount, 4);
        co_index.push(coeffs);

        let termStr = fxGen_polynomial(coeffs);

        if (termStr.includes('+') || termStr.includes('<sup>')) {
            expression += (i === 0 ? '' : '') + `(${termStr})`;
        } else {
            expression += (i === 0 ? '' : '') + `${termStr}`;
        }

        if (i < times - 1) {
            expression += ''; // no `*` to match request format: x(x+1)
        }
    }

    return [co_index, expression];
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
    dis_score -= 500;
    life_count --;
    life.innerHTML = 'Lives left: '+life_count;
    wrongOp.style.backgroundColor = 'grey';
    if(life_count == 0) {
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
    question_count++;
    progression.innerHTML = 'Question: ' + question_count + '/10';

    // Generate a product (two factors)
    let [current_coefficients, current_question] = product(2);  // Generate product expression

    // Generate the correct derivative using the product rule
    let first_derivative = fxGen_polynomial(derivativeOf_polynomial(current_coefficients[0])) + '(' + fxGen_polynomial(current_coefficients[1]) + ')';
    let second_derivative = fxGen_polynomial(current_coefficients[0]) + '(' + fxGen_polynomial(derivativeOf_polynomial(current_coefficients[1])) + ')';
    let correct_answer = first_derivative + ' + ' + second_derivative;

    // Display the generated question
    problemText.innerHTML = current_question + " --> Find the derivative of this function.";

    // Reinitialize listeners
    options_set = options_set.map(option => {
        const newOption = option.cloneNode(true);
        option.replaceWith(newOption);
        return newOption;
    });

    // Choose a random option for the correct answer
    correctIndex = Math.floor(Math.random() * 4);
    options_set[correctIndex].innerHTML = correct_answer.replace('f(x)', "f'(x)");

    // Create 3 incorrect answers
    for (let i = 0; i < 4; i++) {
        if (i !== correctIndex) {
            let incorrectAnswer = generateIncorrectAnswer(current_coefficients);
            while (incorrectAnswer === correct_answer) {
                incorrectAnswer = generateIncorrectAnswer(current_coefficients);
            }
            options_set[i].innerHTML = incorrectAnswer;
        }
    }

    // Add event listeners to options
    options_set.forEach(option => {
        option.addEventListener('click', function () {
            if (option.innerHTML === correct_answer.replace('f(x)', "f'(x)")) {
                correctAnswerSelected();
            } else {
                penalty(option);
            }
        });
    });

    // Check if the game is over (10 questions completed)
    if (question_count === 10) {
        clearInterval(scoreinterval);
        localStorage.setItem('win', true);
        localStorage.setItem('stats', [dis_score, 10, life_count]);
        resultScreen();
        return;
    }
}

refresh();