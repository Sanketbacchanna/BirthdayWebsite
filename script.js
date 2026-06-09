let audioStarted = false;
let ytPlayer;

function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: 'HTFXx1uvE7E',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'loop': 1,
            'playlist': 'HTFXx1uvE7E'
        },
        events: {
            'onReady': (event) => {
                event.target.mute();
                event.target.playVideo(); // Preload muted to avoid delay
            }
        }
    });
}

function playBackgroundMusic() {
    if (typeof ytPlayer !== 'undefined' && ytPlayer.playVideo) {
        try {
            ytPlayer.unMute();
            ytPlayer.setVolume(100);
            ytPlayer.seekTo(0);
            if (ytPlayer.getPlayerState() !== 1) {
                ytPlayer.playVideo();
            }
        } catch(e) {
            ytPlayer.playVideo();
        }
    } else {
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic && bgMusic.paused) {
            bgMusic.volume = 0.5;
            bgMusic.play().catch(e => console.log("Audio autoplay prevented", e));
        }
    }
}

window.onload = () => {
    // Attempt to play dramatic countdown music automatically
    const countdownMusic = document.getElementById('countdown-music');
    countdownMusic.volume = 0.5;
    countdownMusic.play().catch(e => console.log("Countdown audio prevented by browser", e));
    
    startCountdown();
};

function startCountdown() {
    let count = 3;
    const countdownEl = document.getElementById('countdown-text');
    const introMessage = document.getElementById('intro-message');
    const introScreen = document.getElementById('intro-screen');
    const giftScreen = document.getElementById('gift-screen');

    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownEl.innerText = count;
            countdownEl.style.transform = 'scale(1.3)';
            setTimeout(() => countdownEl.style.transform = 'scale(1)', 300);
        } else if (count === 0) {
            countdownEl.style.display = 'none';
            introMessage.classList.remove('hidden');
            introMessage.style.opacity = '1';
        } else {
            clearInterval(interval);
            introScreen.classList.remove('active');
            introScreen.classList.add('hidden');
            
            // Switch music! Fade out countdown, wait for user to click gift to fade in bg
            const countdownMusic = document.getElementById('countdown-music');
            const bgMusic = document.getElementById('bg-music');
            
            countdownMusic.pause();
            
            setTimeout(() => {
                giftScreen.classList.remove('hidden');
                giftScreen.classList.add('active');
            }, 800);
        }
    }, 1000);
}

function openGift() {
    const giftScreen = document.getElementById('gift-screen');
    const celebrationScreen = document.getElementById('celebration-screen');
    const bgMusic = document.getElementById('bg-music');

    // Start audio
    playBackgroundMusic();

    // Gift animation - Shrink and spin away
    const giftBox = document.querySelector('.gift-box');
    giftBox.style.transform = 'scale(0) rotate(180deg)';
    giftBox.style.opacity = '0';
    giftBox.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    setTimeout(() => {
        giftScreen.classList.remove('active');
        giftScreen.classList.add('hidden');

        setTimeout(() => {
            // Trigger Confetti immediately when gift opens
            fireConfetti();

            // Show surprise cards screen instead of celebration screen directly
            const surpriseScreen = document.getElementById('surprise-cards-screen');
            surpriseScreen.classList.remove('hidden');
            surpriseScreen.classList.add('active');
        }, 500); // Wait for gift screen to fade out
    }, 800);
}

function nextCard(currentId) {
    const current = document.getElementById(`sc-${currentId}`);
    const next = document.getElementById(`sc-${currentId + 1}`);

    current.classList.remove('active');
    current.classList.add('hidden');

    setTimeout(() => {
        next.classList.remove('hidden');
        next.classList.add('active');

        // Small confetti burst for the final reveal card
        if (currentId + 1 === 4) {
            fireConfetti();
            setTimeout(initScratchCard, 100); // Give it a slight delay so DOM is fully active
        }
    }, 500); // Wait for current card to hide
}

function showCelebration() {
    const surpriseScreen = document.getElementById('surprise-cards-screen');
    const celebrationScreen = document.getElementById('celebration-screen');

    surpriseScreen.classList.remove('active');
    surpriseScreen.classList.add('hidden');

    // Trigger Starry Night Mode
    document.body.classList.add('star-night');
    generateStars();

    setTimeout(() => {
        celebrationScreen.classList.remove('hidden');
        celebrationScreen.classList.add('active');
        createBalloons(); // Start balloons on main celebration screen
    }, 500);
}

function generateStars() {
    const container = document.getElementById('stars-container');
    if (!container || container.children.length > 5) return; // already generated

    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position, size, and animation delay
        const size = Math.random() * 3 + 1; // 1px to 4px
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        
        container.appendChild(star);
    }
}

function initScratchCard() {
    const canvas = document.getElementById('scratch-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Setup canvas
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Fill background
    ctx.fillStyle = '#9ca3af'; // silver color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text overlay
    ctx.font = 'bold 24px Outfit, sans-serif';
    ctx.fillStyle = '#4b5563';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎁 Scratch Here 🎁', canvas.width / 2, canvas.height / 2);
    
    // Scratching logic
    let isDrawing = false;
    let completed = false;
    
    const getPos = (e) => {
        const bbox = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - bbox.left,
            y: clientY - bbox.top
        };
    };

    const scratch = (e) => {
        if (!isDrawing || completed) return;
        e.preventDefault();
        
        const pos = getPos(e);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
        ctx.fill();
        
        throttleCheck();
    };

    let scratchCounter = 0;
    const throttleCheck = () => {
        scratchCounter++;
        if (scratchCounter > 15) {
            scratchCounter = 0;
            checkScratchCompletion();
        }
    };

    const checkScratchCompletion = () => {
        if (completed) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let cleared = 0;
        const data = imageData.data;
        for(let i = 3; i < data.length; i += 4) {
            if(data[i] === 0) cleared++;
        }
        
        const total = canvas.width * canvas.height;
        if ((cleared / total) > 0.45) { // 45% cleared
            completed = true;
            canvas.style.transition = 'opacity 0.5s ease';
            canvas.style.opacity = '0';
            setTimeout(() => {
                canvas.style.display = 'none';
                document.getElementById('enter-party-btn').classList.remove('hidden');
                fireConfetti();
                setTimeout(fireConfetti, 500);
            }, 500);
        }
    };

    canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('mouseup', () => { isDrawing = false; checkScratchCompletion(); });
    canvas.addEventListener('mouseleave', () => { isDrawing = false; });
    
    canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, {passive: false});
    canvas.addEventListener('touchmove', scratch, {passive: false});
    canvas.addEventListener('touchend', () => { isDrawing = false; checkScratchCompletion(); });
}

function fireConfetti() {
    const duration = 6 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 35, spread: 360, ticks: 100, zIndex: 100, colors: ['#c084fc', '#f472b6', '#fbbf24', '#ffffff'] };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}

function createBalloons() {
    const container = document.getElementById('balloons-container');
    const colors = ['#c084fc', '#f472b6', '#fbbf24', '#38bdf8', '#818cf8'];

    for (let i = 0; i < 25; i++) {
        setTimeout(() => {
            const balloon = document.createElement('div');
            balloon.className = 'balloon';

            const color = colors[Math.floor(Math.random() * colors.length)];
            const left = Math.random() * 95;
            const delay = Math.random() * 5;
            const duration = 15 + Math.random() * 10;

            balloon.style.color = color;
            balloon.style.left = `${left}vw`;
            balloon.style.animationDelay = `${delay}s`;
            balloon.style.animationDuration = `${duration}s`;

            balloon.addEventListener('click', function () {
                this.style.transform = 'scale(1.5)';
                this.style.opacity = '0';

                // Small confetti burst on pop
                confetti({
                    particleCount: 20,
                    spread: 60,
                    origin: {
                        x: this.getBoundingClientRect().left / window.innerWidth,
                        y: this.getBoundingClientRect().top / window.innerHeight
                    },
                    colors: [color, '#ffffff']
                });

                setTimeout(() => this.remove(), 200);
            });

            container.appendChild(balloon);
        }, i * 300);
    }
}

function toggleMemories() {
    const modal = document.getElementById('memory-modal');
    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 500);
    } else {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
}

// Reasons Flip Cards Feature
const reasons = [
    "💖 Kind Heart",
    "💖 Beautiful Smile",
    "💖 Always Supports Me",
    "💖 Best Sister Ever",
    "💖 Makes Everyone Happy"
];

let cardsRendered = false;

function toggleReasons() {
    const modal = document.getElementById('reasons-modal');
    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 500);
    } else {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('active'), 10);

        if (!cardsRendered) {
            renderFlipCards();
        }
    }
}

function renderFlipCards() {
    cardsRendered = true;
    const container = document.getElementById('reasons-container');
    container.innerHTML = '';
    
    reasons.forEach((reason, index) => {
        const card = document.createElement('div');
        card.className = 'flip-card';
        card.style.animationDelay = `${index * 0.15}s`;
        
        card.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    <span>#${index + 1}</span>
                </div>
                <div class="flip-card-back">
                    <span>${reason}</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
            // Small confetti on flip
            if(card.classList.contains('flipped')) {
                const rect = card.getBoundingClientRect();
                confetti({
                    particleCount: 15,
                    spread: 40,
                    origin: {
                        x: (rect.left + rect.width / 2) / window.innerWidth,
                        y: (rect.top + rect.height / 2) / window.innerHeight
                    },
                    colors: ['#f472b6', '#fbbf24']
                });
            }
        });
        
        container.appendChild(card);
    });
}

// Virtual Cake Feature
let candlesBlown = false;
let cakeCut = false;

function toggleCake() {
    const modal = document.getElementById('cake-modal');
    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.classList.add('hidden');
            
            // Resume YouTube background music and pause Happy Birthday song
            const bgMusic = document.getElementById('bg-music');
            if (bgMusic && !bgMusic.paused) {
                bgMusic.pause();
            }
            if (typeof ytPlayer !== 'undefined' && ytPlayer.playVideo) {
                try {
                    if (ytPlayer.getPlayerState() !== 1) ytPlayer.playVideo();
                } catch(e) {}
            }
        }, 500);
    } else {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

function interactCake() {
    if (!candlesBlown) {
        blowCandles();
    } else if (!cakeCut) {
        cutCake();
    }
}

function blowCandles() {
    if (candlesBlown) return;

    // Pause background YouTube music and play Happy Birthday song
    if (typeof ytPlayer !== 'undefined' && ytPlayer.pauseVideo) {
        try {
            ytPlayer.pauseVideo();
        } catch(e) {}
    }
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        bgMusic.volume = 0.8;
        bgMusic.currentTime = 0; // Start from beginning
        bgMusic.play().catch(e => console.log("Audio play prevented", e));
    }

    const flames = document.querySelectorAll('.flame');
    flames.forEach(flame => {
        flame.classList.add('extinguished');
    });

    const instructions = document.getElementById('cake-instructions');
    instructions.innerHTML = "Yay! Now tap again to cut the cake! 🔪";
    instructions.style.color = "#f472b6";
    instructions.style.fontWeight = "bold";
    instructions.style.transform = "scale(1.1)";
    instructions.style.transition = "all 0.5s ease";

    // Confetti burst
    fireConfetti();

    candlesBlown = true;
}

function cutCake() {
    if (cakeCut) return;
    cakeCut = true;
    
    const cakeContainer = document.querySelector('.cake-container');
    const originalCake = document.querySelector('.cake');
    
    // Create Knife
    const knife = document.createElement('div');
    knife.innerHTML = '🔪';
    knife.style.position = 'absolute';
    knife.style.fontSize = '50px';
    knife.style.top = '-50px';
    knife.style.left = '50%';
    knife.style.transform = 'translateX(-50%)';
    knife.style.zIndex = '20';
    knife.style.transition = 'top 0.5s ease-in';
    cakeContainer.appendChild(knife);
    
    // Animate knife cutting down
    setTimeout(() => {
        knife.style.top = '150px';
        
        // After cut, split the cake
        setTimeout(() => {
            knife.remove();
            
            // Clone the cake to make base and slice
            const cakeBase = originalCake.cloneNode(true);
            const cakeSlice = originalCake.cloneNode(true);
            
            // Cut a slice from the front center
            cakeBase.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 75% 100%, 50% 50%, 25% 100%, 0 100%)';
            cakeSlice.style.clipPath = 'polygon(50% 50%, 75% 100%, 25% 100%)';
            
            cakeBase.style.transition = 'transform 1s ease';
            cakeSlice.style.transition = 'transform 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            
            originalCake.style.display = 'none'; // hide original
            
            cakeContainer.appendChild(cakeBase);
            cakeContainer.appendChild(cakeSlice);
            
            // Trigger reflow
            void cakeSlice.offsetWidth;
            
            // Slide the slice out!
            cakeSlice.style.transform = 'translate(-50%, 50px) scale(1.15)';
            cakeSlice.style.zIndex = '5';
            
            // Update instructions
            const instructions = document.getElementById('cake-instructions');
            instructions.innerHTML = "Perfect! Here's your slice! <span class='emoji'>🥳🍰</span>";
            
            // Big confetti
            fireConfetti();
            setTimeout(fireConfetti, 500);
            setTimeout(fireConfetti, 1000);
            
        }, 500);
    }, 100);
}

// Letter Feature
function openLetter() {
    const modal = document.getElementById('letter-modal');
    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 500);
    } else {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

// Final Surprise Feature
function finalSurprise() {
    const modal = document.getElementById('final-modal');
    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 500);
    } else {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('active');
            fireConfetti();
            setTimeout(fireConfetti, 800);
            setTimeout(fireConfetti, 1600);
        }, 10);
    }
}
