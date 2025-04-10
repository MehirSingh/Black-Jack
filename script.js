class BlackjackGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.suits = ['♠', '♣', '♥', '♦'];
        this.values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        this.initializeElements();
        this.initializeEventListeners();
        this.splashScreen = document.getElementById('splash-screen');
        this.gameContainer = document.getElementById('game-container');
        this.setupSplashScreen();
    }

    initializeElements() {
        this.playerCardsEl = document.getElementById('player-cards');
        this.dealerCardsEl = document.getElementById('dealer-cards');
        this.messageEl = document.getElementById('message');
        this.playerScoreEl = document.getElementById('player-score');
        this.dealerScoreEl = document.getElementById('dealer-score');
        this.newGameBtn = document.getElementById('new-game');
        this.hitBtn = document.getElementById('hit');
        this.standBtn = document.getElementById('stand');
    }

    initializeEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.hitBtn.addEventListener('click', () => this.hit());
        this.standBtn.addEventListener('click', () => this.stand());
    }

    setupSplashScreen() {
        document.getElementById('start-game').addEventListener('click', () => {
            this.splashScreen.style.display = 'none';
            this.gameContainer.style.display = 'block';
            this.startNewGame();
        });
    }

    createDeck() {
        this.deck = [];
        for (let suit of this.suits) {
            for (let value of this.values) {
                this.deck.push({ suit, value });
            }
        }
        // Shuffle deck
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    async startNewGame() {
        this.createDeck();
        this.playerHand = [];
        this.dealerHand = [];
        this.playerCardsEl.innerHTML = '';
        this.dealerCardsEl.innerHTML = '';
        this.messageEl.textContent = '';
        
        // Deal initial cards
        await this.dealCard(this.playerHand, this.playerCardsEl, false);
        await this.dealCard(this.dealerHand, this.dealerCardsEl, false);
        await this.dealCard(this.playerHand, this.playerCardsEl, false);
        await this.dealCard(this.dealerHand, this.dealerCardsEl, true);

        this.updateScores();
        this.hitBtn.disabled = false;
        this.standBtn.disabled = false;
        this.newGameBtn.disabled = true;
    }

    async dealCard(hand, container, hidden) {
        const card = this.deck.pop();
        hand.push(card);
        
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        
        // Calculate random initial position for dealing animation
        const randomX = (Math.random() - 0.5) * 100;
        const randomRotate = (Math.random() - 0.5) * 30;
        cardEl.style.transform = `translate(${randomX}px, -1000px) rotate(${randomRotate}deg)`;
        
        if (hidden) cardEl.classList.add('hidden');

        const isRed = card.suit === '♥' || card.suit === '♦';
        const color = isRed ? 'red' : 'black';

        cardEl.innerHTML = `
            <div class="card-front">
                <span class="card-value top ${color}">${card.value}${card.suit}</span>
                <span class="card-suit ${color}">${card.suit}</span>
                <span class="card-value bottom ${color}">${card.value}${card.suit}</span>
            </div>
            <div class="card-back"></div>
        `;

        container.appendChild(cardEl);
        
        // Trigger dealing animation
        await new Promise(resolve => {
            setTimeout(() => {
                cardEl.classList.add('dealing');
                resolve();
            }, 50);
        });
        
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    calculateScore(hand) {
        let score = 0;
        let aces = 0;

        for (let card of hand) {
            if (card.value === 'A') {
                aces += 1;
                score += 11;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                score += 10;
            } else {
                score += parseInt(card.value);
            }
        }

        while (score > 21 && aces > 0) {
            score -= 10;
            aces -= 1;
        }

        return score;
    }

    updateScores() {
        const playerScore = this.calculateScore(this.playerHand);
        this.playerScoreEl.textContent = `(${playerScore})`;
        
        // Only show dealer's score if their second card is revealed
        if (this.dealerHand.length > 0) {
            if (!this.dealerCardsEl.querySelector('.card.hidden')) {
                const dealerScore = this.calculateScore(this.dealerHand);
                this.dealerScoreEl.textContent = `(${dealerScore})`;
            } else {
                this.dealerScoreEl.textContent = '';
            }
        }
    }

    async hit() {
        await this.dealCard(this.playerHand, this.playerCardsEl, false);
        this.updateScores();

        if (this.calculateScore(this.playerHand) > 21) {
            this.endGame('Bust! Dealer wins!');
        }
    }

    async stand() {
        this.hitBtn.disabled = true;
        this.standBtn.disabled = true;

        // Reveal dealer's hidden card
        const hiddenCard = this.dealerCardsEl.querySelector('.card.hidden');
        if (hiddenCard) hiddenCard.classList.remove('hidden');

        // Dealer hits on 16, stands on 17
        while (this.calculateScore(this.dealerHand) < 17) {
            await this.dealCard(this.dealerHand, this.dealerCardsEl, false);
        }

        this.updateScores();
        this.determineWinner();
    }

    determineWinner() {
        const playerScore = this.calculateScore(this.playerHand);
        const dealerScore = this.calculateScore(this.dealerHand);

        if (dealerScore > 21) {
            this.endGame('Dealer busts! You win! 🎉');
        } else if (playerScore > dealerScore) {
            this.endGame('You win! 🎉');
        } else if (dealerScore > playerScore) {
            this.endGame('Dealer wins! 😢');
        } else {
            this.endGame("It's a tie! 🤝");
        }
    }

    endGame(message) {
        this.messageEl.textContent = message;
        this.hitBtn.disabled = true;
        this.standBtn.disabled = true;
        this.newGameBtn.disabled = false;
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BlackjackGame();
});

// Assuming you have a reference to the dealer's cards
const dealerCards = document.querySelectorAll('.dealer-card');

// Function to reveal dealer's cards
function revealDealerCards() {
    dealerCards.forEach(card => card.classList.remove('hidden'));
}

// Initially hide dealer's cards
dealerCards.forEach(card => card.classList.add('hidden'));

// Call revealDealerCards() at the correct moment in the game logic