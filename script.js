// DOM elements
const questionText = document.getElementById('question-text');
const nextButton = document.getElementById('next-button');
const optionsContainer = document.getElementById('options-container');
const scoreElement = document.getElementById('score');
const timerContainer = document.getElementById('timer');
const questionContainer = document.getElementById('question-container');

// State variables
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 30;
let timerInterval;

// Fetch questions from the API
async function fetchQuestions() {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=5');
        
        if (!response.ok) {
            console.error('HTTP error! status: ', response.status);
        }
        
        const data = await response.json();
        
        if (data.response_code !== 0) {
            console.error('API error! Response code:', data.response_code);
        }
        
        console.log(data);
        questions = data.results;
        
        if (questions.length === 0) {
            console.error('No questions received from the API');
        }
        
        displayQuestion();
        startTimer();
      } catch (error) {
        console.error('Error fetching questions:', error);
        handleFetchError(error);
      }
}

// Handle fetch errors
function handleFetchError(error) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = `An error occurred: ${error.message}. Please try again later.`;
    optionsContainer.appendChild(errorMessage);

    const reloadButton = document.createElement('button');
    reloadButton.textContent = 'Reload';
    reloadButton.addEventListener('click', () => {
      location.reload();
    });
    optionsContainer.appendChild(reloadButton);

}

// Display questions
function displayQuestion() {
    // Clear previous options
    optionsContainer.innerHTML = '';

    const currentQuestion = questions[currentQuestionIndex];
    questionText.textContent = decodeHtml(currentQuestion.question);

    const options = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
    shuffleArray(options);

    optionsContainer.innerHTML = '';
    options.forEach(option => {
        const optionElement = document.createElement('button');
        optionElement.textContent = decodeHtml(option);
        optionElement.classList.add('option');
        optionElement.setAttribute('aria-label', `Answer option: ${decodeHtml(option)}`)
        optionElement.addEventListener('click', () => checkAnswer(option, currentQuestion.correct_answer));
        optionsContainer.appendChild(optionElement);
    });

    nextButton.style.display = 'none';
}

function checkAnswer(selectedOption, correctOption) {
    // Stop timer
    clearInterval(timerInterval);

    // Get all option buttons
    const optionButtons = optionsContainer.querySelectorAll('button');

    optionButtons.forEach(button => {
        if (button.textContent === selectedOption) {
            button.classList.add(selectedOption === correctOption ? 'correct' : 'incorrect');
        }
        button.disabled = true;
    });

    if (selectedOption === correctOption) {
        score++;
        scoreElement.textContent = score;
    }

    nextButton.style.display = 'block';
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
        startTimer();
        nextButton.style.display = 'none';
    } else {
        alert("Quiz completed! Your score is " + score);
        currentQuestionIndex = 0;
        score = 0;
        scoreElement.textContent = score;
        fetchQuestions();
    }
}

// Timer functions
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerContainer.textContent = `Time left: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Time's up!");
            nextQuestion();
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = 30;
    startTimer();
}

// Utility function 
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Event listener for next button
nextButton.addEventListener('click', nextQuestion);

fetchQuestions();
