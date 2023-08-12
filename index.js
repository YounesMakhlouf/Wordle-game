import Swal from 'sweetalert2';
const letterContainers = document.querySelectorAll('.letter');
const title = document.querySelector('h1');
const loader = document.querySelector(".lds-roller");

const ANSWER_LENGTH = 5;
const ROUNDS = 6;
let isLoading = false;
let currentLetters = [];
let currentLine = 0;
let expectedAnswer = [];
let done = false;

async function getWord() {
    toggleLoader(true);
    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const resObj = await res.json();
    toggleLoader(false);
    expectedAnswer = resObj.word.split('');
}

async function isValid() {
    toggleLoader(true);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST", "body": JSON.stringify({
            "word": currentLetters.join("")
        })
    });
    const resObj = await res.json();
    toggleLoader(false);
    return resObj.validWord;
}

function getUserInput(e) {
    if (!(done || isLoading)) {
        if (e.key === "Backspace") {
            currentLetters.pop();
            letterContainers[currentLetters.length + currentLine * ANSWER_LENGTH].innerText = "";
        }
        if (currentLetters.length === 0 || currentLetters.length !== ANSWER_LENGTH) {
            if (isLetter(e.key)) {
                currentLetters.push(e.key.toLowerCase());
                letterContainers[currentLetters.length - 1 + currentLine * ANSWER_LENGTH].innerText = e.key;
            }
        } else if (e.key === "Enter") {
            validateInput();
        }
    }
}

async function validateInput() {
    const valid = await isValid();
    if (valid) {
        showAnswer();
        currentLine++;
        if (expectedAnswer.join('') === currentLetters.join('')) {
            title.classList.add("winner");
            await Swal.fire("Congratulations", "Word by word, you conquered the board – a true Wordle maestro!", "success");
            done = true;
        } else if (currentLine === ROUNDS) {
            await Swal.fire("Oh no!", ` You lost. The word was "${expectedAnswer.join('')}" `, "error");
            done = true;
        }
        currentLetters = [];
    } else {
        makInvalidWord();
    }
}

function makInvalidWord() {
    for (let i = currentLine * ANSWER_LENGTH; i < (currentLine + 1) * ANSWER_LENGTH; i++) {
        letterContainers[i].classList.remove("wrong-word");
        setTimeout(() => {
            letterContainers[i].classList.add("wrong-word");
        }, 10)
    }
}

function showAnswer() {
    const map = countLetters(expectedAnswer);
    for (let i = 0; i < ANSWER_LENGTH; i++) {
        if (expectedAnswer[i] === currentLetters[i]) {
            letterContainers[i + currentLine * ANSWER_LENGTH].classList.add("right-place");
            map[expectedAnswer[i]]--;
        }
    }
    for (let i = 0; i < ANSWER_LENGTH; i++) {
        if (expectedAnswer[i] === currentLetters[i]) {
            // pass
        } else if (expectedAnswer.includes(currentLetters[i]) && map[currentLetters[i]] > 0) {
            letterContainers[i + currentLine * ANSWER_LENGTH].classList.add("wrong-place");
            map[expectedAnswer[i]]--;
        } else {
            letterContainers[i + currentLine * ANSWER_LENGTH].classList.add("wrong");
        }
    }
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function toggleLoader(loading) {
    isLoading = loading;
    loader.classList.toggle("show", loading);
}

async function init() {
    window.addEventListener("keydown", getUserInput);
    await getWord();
}

function countLetters(array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        const letter = array[i];
        if (obj[letter]) {
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }
    return obj;
}

init();