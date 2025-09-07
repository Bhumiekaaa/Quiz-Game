const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName("choice-text"));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');

const loader = document.getElementById('loader')
const game = document.getElementById('game');


let currentQuestion = {};
let acceptingAnswes = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

let questions = [];

// Fetch questions from local JSON file
fetch('questions.json')
    .then(res => res.json())
    .then(loadedQuestions => {
        questions = loadedQuestions;
        startGame();
    })
    .catch(err => {
        console.error('Error loading questions:', err);
        // Show error message to user
        question.innerText = 'Error loading questions. Please try again.';
        loader.classList.add('hidden');
    });

    /*{
        question: "Inside which HTML element do we put the JavaScript",
        choice1: "<script>",
        choice2: "<javascript>",
        choice3: "<js>",
        choice4: "<scripting>",
        answer: 1
    },
    {
        question: "What is the correct syntax for referring to an external script called 'xxx.js'?",
        choice1: "<script href='xxx.js'>",
        choice2: "<script name ='xxx.js'>",
        choice3: "<script src='xxx.js'>",
        choice4: "<script file='xxx.js'>",
        answer: 3
    },
    {
        question: "How do you write 'Hello World' in an alert box?",
        choice1: "msgBox('Hello Word');",
        choice2: "alertBox('Hello World');",
        choice3: "msg('Hello World');",
        choice4: "alert('Hello World');",
        answer: 4
    }*/


//CONSTANTS
const CORRECT_MARK = 1; // One mark per correct answer
const MAX_QUESTIONS = 10; // Number of questions per game from the pool of 50

let timer;
let timeLeft = 30; // Time per question in seconds

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions];
    
    // Show game and hide loader
    game.classList.remove("hidden");
    loader.classList.add("hidden");
    
    // Start with first question
    getNewQuestions();
};

getNewQuestions = () => {
    if(availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        localStorage.setItem("mostRecentScore", score);
        return window.location.assign('end.html');
    }

    // Clear previous timer if exists
    if (timer) {
        clearInterval(timer);
    }

    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

    // Reset timer
    timeLeft = 30;
    updateTimer();
    timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(timer);
            getNewQuestions(); // Move to next question if time runs out
        }
    }, 1000);

    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    question.innerText = currentQuestion.question;

    choices.forEach(choice => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number];
        // Reset any previous styling
        choice.parentElement.classList.remove('correct', 'incorrect');
    });

    availableQuestions.splice(questionIndex, 1);
    acceptingAnswes = true;
};

// Update timer display
const updateTimer = () => {
    const timerDisplay = document.createElement('div');
    timerDisplay.id = 'timer';
    timerDisplay.style.textAlign = 'center';
    timerDisplay.style.fontSize = '2rem';
    timerDisplay.style.marginBottom = '1rem';
    timerDisplay.style.color = timeLeft <= 10 ? '#dc3545' : '#ffffff';
    
    if (!document.getElementById('timer')) {
        question.parentElement.insertBefore(timerDisplay, question);
    }
    
    document.getElementById('timer').textContent = `Time Left: ${timeLeft}s`;
};

choices.forEach(choice => {
    choice.addEventListener('click', e => {
        if(!acceptingAnswes) return;

        // Clear timer when answer is selected
        clearInterval(timer);
        acceptingAnswes = false;
        
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset['number'];

        const classToApply = 
            selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';
           
        // Update score - one mark per correct answer
        if(classToApply === 'correct') {
            incrementScore(CORRECT_MARK);
        }
        // No points for wrong answers

        // Add visual feedback
        selectedChoice.parentElement.classList.add(classToApply);
        
        // Show correct answer if wrong
        if(classToApply === 'incorrect') {
            const correctChoice = document.querySelector(`[data-number="${currentQuestion.answer}"]`);
            correctChoice.parentElement.classList.add('correct');
        }

        setTimeout(() => {
            // Remove visual feedback
            choices.forEach(c => c.parentElement.classList.remove('correct', 'incorrect'));
            getNewQuestions();
        }, 2000);
    });
});

incrementScore = num => {
    score = Math.max(0, score + num); // Prevent negative scores
    scoreText.innerText = score;
};

//startGame();
