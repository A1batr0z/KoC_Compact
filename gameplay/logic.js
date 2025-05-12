/*
Main game logic goes here

What I do:
- Generate functions using createIndex()/createFx()
- Update frontend question/option display
- Update game stats (score, life, player progress, etc.)
*/

// Initialize
let score = document.getElementById('score-display');
let progress = document.getElementById('progress-display');
let life = document.getElementById('life-display');
let instructText = document.getElementById('instruction');
let problemText = document.getElementById('problem-display');

let question_count = 0;
let life_count = 3;
let dis_score = 10000;
let correctIndex = 0;

let session = localStorage.getItem('level')

life.innerHTML = 'Lives left: 3';
if (session[1] == 'diff') {
    instructText.innerHTML = 'Find the derivative of:';
} else {
    instructText.innerHTML = 'Find the integral of:';
}


let options_set = [
    document.getElementById('option-1'),
    document.getElementById('option-2'),
    document.getElementById('option-3'),
    document.getElementById('option-4')
];

function updateScore() {
    /*
    Update score every 5ms (total of 50s)
    */

    if (dis_score > 0){

        if (dis_score < 2000) {
            // Alert the user of the remaining time (less than 10s)
            score.style.color = '#DC143C';
        }

        // Draining score / Update score display
        dis_score -= 1;
        score.innerHTML = 'Score: '+dis_score;

    } else {
        // If score hits 0, then fails
        clearInterval(scoreInterval);
        localStorage.setItem('win', false);
        localStorage.setItem('stats', [0, question_count, life_count]);
        resultScreen();
        return;
    }
}

const scoreInterval = setInterval(updateScore, 5);

document.getElementById('fall-back').addEventListener('click', function() {
    window.history.back();
});

function penalize(wrongOption) {
    /*
    Penalize player for choosing an incorrect answer
    */

    // Penalty
    dis_score -= 500;
    life_count --;

    // Update life count / wrong option
    life.innerHTML = 'Lives left: '+life_count;
    wrongOption.style.backgroundColor = 'grey';

    // If life goes to 0
    if (life_count == 0) {
        clearInterval(scoreInterval);
        localStorage.setItem('win', false);
        localStorage.setItem('stats', [dis_score, question_count, 0]);
        resultScreen();
        return;
    }
}

function restore_color(target) {
    /*
    Restore color of incorrect answers (if clicked)
    Removing inline css
    */

    target.style.backgroundColor = '';
    return;
}

function refresh() {
    /*
    Generate/Update options for each question
    Gameplay mechanics
    */

    // Update question count and display
    question_count ++;
    progress.innerHTML = format('Question {question_count}/10');

    // Maximum & Minimum # of terms in the polynomials
    let current_terms = Math.round(Math.random()*4+1);

    //Generate index & functions / Update display
    let current_coefficients = createIndex(current_terms);
    problemText.innerHTML = createFx(current_coefficients);

    // Reinitialize listeners and fresh copy replacement
    options_set = options_set.map(option => {

        // Deep clone the original option, then replace the whole node (on HTML and array)

        const newOption = option.cloneNode(true);
        option.replaceWith(newOption);
        return newOption;
    });

    // Randomly generate the correct option index (0-3)
    correctIndex = Math.round(Math.random()*3);

    // Solve the question, and assign it to the correct option index, if clicked go to the next question
    options_set[correctIndex].innerHTML = integralOf(current_coefficients).replace('f(x)','F(x)') + ' [V]';
    options_set[correctIndex].addEventListener('click', refresh);

    // Restore colors for all options
    options_set.forEach(option => restore_color(option))

    // Traverse through the incorrect options
    for(let i = 0; i <= 3; i++) {
        if(i != correctIndex){
            // Assign incorrect answers / add penalty event listener to the rest
            options_set[i].innerHTML = integralOf(randomize(current_coefficients)).replace('f(x)','F(x)');
            options_set[i].addEventListener('click', () => penalty(option));

            // Loop until the randomized(incorrect) response is not the same as the correct answer
            while(options_set[i].innerHTML + ' [V]' == options_set[correctIndex].innerHTML){
                options_set[i].innerHTML = integralOf(randomize(current_coefficients)).replace('f(x)','F(x)');
            }
        }
    }

    // If reached the tenth question, win
    if (question_count == 10) {
        clearInterval(scoreinterval);
        localStorage.setItem('win', true);
        localStorage.setItem('stats', [dis_score, 10, life_count]);
        resultScreen();
        return;
    }
}

function resultScreen() {
    /*
    Direct the player to the result screen
    */

    window.location.href='../result.html';
}

// Start recursion
refresh();