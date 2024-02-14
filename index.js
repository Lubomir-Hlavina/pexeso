// Constants
const gridContainer = document.querySelector('.grid-container');
const giveUpBtn = document.getElementById('give-up-btn');
const newGameBtn = document.getElementById('new-game-btn');
const movesDisplay = document.querySelector('.moves');
const modalEl = document.querySelector('.modal');
const appendTime = document.getElementById('time');
const pauseGameBtn = document.getElementById('stop-watch-btn');
const continueGameBtn = document.getElementById('continue-watch-btn');
const twoPlayersBtn = document.getElementById('two-players-btn');
const twoPlayersForm = document.querySelector('.two-players-form');
const onePlayerBtn = document.getElementById('one-player-btn');
const onePlayerForm = document.querySelector('.one-player-form');
const playerName = document.getElementById('player-name');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const closeLeaderBoardBtn = document.getElementById('close-leaderboard');
const leaderboardModal = document.getElementById('modal-leaderboard');

// Variables
let cards = [];
let firstCard;
let secondCard;
let lockBoard = true;
let isGameStarted = false;
let isGamePaused = false;
let isSinglePlayer = false;
let isMultiplayer = false;
let moves = 0;
let firstPlayerScore = 0;
let secondPlayerScore = 0;

// Initialization
initializeGame();


function initializeGame() {
  fetch('./data/cards.json')
    .then((res) => res.json())
    .then((data) => {
      cards = [...data, ...data];
      shuffleCards();
      generateCards();
    });

// Event listeners

  newGameBtn.addEventListener('click', startGame);
  giveUpBtn.addEventListener('click', giveUpGame);
  pauseGameBtn.addEventListener('click', stopGame);
  continueGameBtn.addEventListener('click', continueGame);
  twoPlayersBtn.addEventListener('click', twoPlayersOption);
  onePlayerBtn.addEventListener('click', onePlayerOption);
  leaderboardBtn.addEventListener('click', openLeaderboardModal);
  closeLeaderBoardBtn.addEventListener('click', closeLeaderboardModal);
}

// Card-related functions
function shuffleCards() {
  let currentIndex = cards.length;
  let randomIndex;
  let temporaryValue;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

function generateCards() {
  for (let card of cards) {
    const cardElement = createCardElement(card);
    gridContainer.appendChild(cardElement);
    cardElement.addEventListener('click', flipCard);
  }
}

function createCardElement(card) {
  const cardElement = document.createElement('div');
  cardElement.classList.add('card');
  cardElement.setAttribute('data-name', card.name);
  cardElement.innerHTML = `
    <div class="front">
      <img class="front-image" src=${card.image} />
    </div>
    <div class="back"></div>
  `;
  return cardElement;
}

// Stopwatch-related functions
let minutes = 0;
let seconds = 0;
let milliseconds = 0;
let interval;

function stopGame() {
  if (firstCard) return;

  clearInterval(interval);
  isGamePaused = true;
  pauseGameBtn.style.display = 'none';
  continueGameBtn.style.display = 'block';
  lockBoard = true;
}

function startTimer() {
  clearInterval(interval);
  interval = setInterval(updateTimer, 10);
}

function continueGame() {
  interval = setInterval(updateTimer, 10);
  isGamePaused = false;
  pauseGameBtn.style.display = 'block';
  continueGameBtn.style.display = 'none';
  lockBoard = false;
}

function resetTimer() {
  clearInterval(interval);
  minutes = 0;
  seconds = 0;
  milliseconds = 0;
  updateDisplay();
}

function updateTimer() {
  milliseconds++;

  if (milliseconds > 99) {
    seconds++;
    milliseconds = 0;
  }

  if (seconds > 59) {
    minutes++;
    seconds = 0;
  }

  updateDisplay();
}

function updateDisplay() {
  const formattedTime = `${pad(minutes)}:${pad(seconds)}:${pad(milliseconds)}`;
  appendTime.innerHTML = formattedTime;
}

function pad(value) {
  return value < 10 ? '0' + value : value;
}

// Card flipping and game logic
function flipCard() {
  if (lockBoard || this === firstCard) return;

  this.classList.add('flipped');

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  moves++;
  movesDisplay.textContent = moves;
  lockBoard = true;

  checkForMatch();

  if (allCardsMatched()) {
    endGame();
  }
}

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;

  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  resetBoard();
}

function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetBoard();
  }, 1000);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  isSinglePlayer ? singlePlayerName() : multiPlayerName();
}

// Name logic

function singlePlayerName() {
  const playerNameValue = document.getElementById('player_name').value;
  document.getElementById(
    'playerTurn'
  ).textContent = `Name: ${playerNameValue}`;
}

function multiPlayerName() {
  const playerOneName = document.getElementById('player_one_name').value;
  const playerTwoName = document.getElementById('player_two_name').value;

  if (moves === 0 || moves % 2 === 0) {
    document.getElementById(
      'playerTurn'
    ).textContent = `Name: ${playerOneName}`;
  } else {
    document.getElementById(
      'playerTurn'
    ).textContent = `Name: ${playerTwoName}`;
  }
}

// Game control functions
function startGame(e) {
  e.preventDefault();

  if (twoPlayersBtn.classList.contains('active')) {
    // Two players game
    const playerOneName = document.getElementById('player_one_name').value;
    const playerTwoName = document.getElementById('player_two_name').value;
    isMultiplayer = true;
    isSinglePlayer = false;

    if (!playerOneName || !playerTwoName) {
      alert('Both player names are required.');
      return;
    }

    multiPlayerName();
  } else if (onePlayerBtn.classList.contains('active')) {
    // One player game
    const playerNameValue = document.getElementById('player_name').value;
    isMultiplayer = false;
    isSinglePlayer = true;

    if (!playerNameValue) {
      alert('Player name is required.');
      return;
    }

    singlePlayerName();
  }

  isGameStarted = true;
  lockBoard = false;
  modalEl.style.display = 'none';
  startTimer();
}

function giveUpGame() {
  resetBoard();
  shuffleCards();
  moves = 0;
  movesDisplay.textContent = moves;
  gridContainer.innerHTML = '';
  generateCards();
  lockBoard = true;
  modalEl.style.display = 'block';
  resetTimer();
}

// UPDATE LEADERBOARD ITEMS
function updateLeaderboard(score) {
  const leaderboardList = document.getElementById('names');
  const leaderboardEntries = Array.from(leaderboardList.children);
  const currentPlayerName = document.getElementById('player_name').value;

  const newEntry = document.createElement('li');
  newEntry.textContent = `${currentPlayerName} (${score})`;

  let added = false; // Flag to track if the new entry has been added

  for (let i = 0; i < leaderboardEntries.length; i++) {
    const entryScore = parseInt(
      leaderboardEntries[i].textContent.match(/\d+/)[0]
    );

    if (score < entryScore) {
      leaderboardList.insertBefore(newEntry, leaderboardEntries[i]);
      added = true;
      break;
    }
  }

  // ONLY 5 ITEMS
  if (added) {
    leaderboardList.removeChild(
      leaderboardEntries[leaderboardEntries.length - 1]
    );
  }
}

function endGame() {
  resetBoard();
  shuffleCards();

  updateLeaderboard(moves);

  moves = 0;
  movesDisplay.textContent = moves;
  gridContainer.innerHTML = '';
  generateCards();
  lockBoard = true;
  modalEl.style.display = 'block';
  resetTimer();
}

function allCardsMatched() {
  const flippedCards = document.querySelectorAll('.flipped');
  return flippedCards.length === cards.length;
}

// Modal functions

function onePlayerOption() {
  newGameBtn.disabled = false;
  onePlayerForm.style.display = 'flex';
  twoPlayersForm.style.display = 'none';
  onePlayerBtn.classList.add('active');
  twoPlayersBtn.classList.remove('active');
}

function twoPlayersOption() {
  newGameBtn.disabled = false;
  onePlayerForm.style.display = 'none';
  twoPlayersForm.style.display = 'flex';
  onePlayerBtn.classList.remove('active');
  twoPlayersBtn.classList.add('active');
}

function openLeaderboardModal() {
  leaderboardModal.style.display = 'block';
}

function closeLeaderboardModal() {
  leaderboardModal.style.display = 'none';
}
