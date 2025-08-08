const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- UI Element Definitions ---
const ui = {
    title: { x: canvas.width / 2, y: 150, text: "PIXEL CAFE" },
    startButton: { x: canvas.width / 2 - 150, y: 280, width: 300, height: 70, text: "Start Game" },
    musicButton: { x: 740, y: 45, width: 40, height: 40 },
    sfxButton: { x: 680, y: 45, width: 40, height: 40 },
};

// --- Drawing Functions ---
function drawFloor() {
    const tileSize = 40;
    for (let y = 0; y < canvas.height; y += tileSize) {
        for (let x = 0; x < canvas.width; x += tileSize) {
            ctx.fillStyle = ((x / tileSize + y / tileSize) % 2 === 0) ? '#8a7e72' : '#9b8c7e';
            ctx.fillRect(x, y, tileSize, tileSize);
        }
    }
}

function drawBarista(p) {
    ctx.fillStyle = '#f2cc8f'; ctx.fillRect(p.x + 5, p.y, p.width - 10, 15);
    ctx.fillStyle = '#222222'; ctx.fillRect(p.x + 5, p.y, p.width - 10, 5);
    ctx.fillStyle = 'white'; ctx.fillRect(p.x + 10, p.y + 5, 5, 5); ctx.fillRect(p.x + 25, p.y + 5, 5, 5);
    ctx.fillStyle = '#4a4e69'; ctx.fillRect(p.x, p.y + 15, p.width, p.height - 15);
    ctx.fillStyle = '#f2e9e4'; ctx.fillRect(p.x, p.y + 15, p.width, 5);
    if (p.holding === 'coffee') {
        ctx.fillStyle = 'white'; ctx.fillRect(p.x + 15, p.y + 25, 10, 12);
        ctx.fillStyle = '#6f4e37'; ctx.fillRect(p.x + 15, p.y + 25, 10, 5);
    } else if (p.holding === 'croissant') {
        ctx.fillStyle = '#e0ac69';
        ctx.beginPath();
        ctx.moveTo(p.x + 10, p.y + 30);
        ctx.bezierCurveTo(p.x + 10, p.y + 20, p.x + 30, p.y + 20, p.x + 30, p.y + 30);
        ctx.fill();
    }
}

function drawCoffeeIcon(x, y) {
    ctx.fillStyle = '#6f4e37';
    ctx.fillRect(x, y, 12, 15);
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, 12, 3);
}

function drawCroissantIcon(x, y) {
    ctx.fillStyle = '#e0ac69';
    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    ctx.bezierCurveTo(x, y, x + 15, y, x + 15, y + 10);
    ctx.fill();
}

function drawCustomer(c) {
    ctx.fillStyle = c.isAngry ? '#d00000' : c.shirtColor;
    ctx.fillRect(c.x, c.y + 15, c.width, c.height - 15);
    ctx.fillStyle = '#f2cc8f'; ctx.fillRect(c.x + 5, c.y, c.width - 10, 15);
    ctx.fillStyle = c.hairColor; ctx.fillRect(c.x + 5, c.y, c.width - 10, 5);
    ctx.fillStyle = 'white'; ctx.fillRect(c.x + 10, c.y + 5, 5, 5); ctx.fillRect(c.x + 25, c.y + 5, 5, 5);
    if (c.state === 'ORDERING') {
        ctx.fillStyle = 'white';
        const bubbleWidth = (c.order.coffee && c.order.croissant) ? 40 : 25;
        ctx.beginPath(); ctx.roundRect(c.x + (c.width - bubbleWidth) / 2, c.y - 30, bubbleWidth, 20, [10]); ctx.fill();
        let iconX = c.x + (c.width - bubbleWidth) / 2 + 5;
        if (c.order.coffee) {
            drawCoffeeIcon(iconX, c.y - 28);
            iconX += 20;
        }
        if (c.order.croissant) {
            drawCroissantIcon(iconX, c.y - 25);
        }
    }
}

function drawCoffeeMachine(m) {
    ctx.fillStyle = '#3d405b'; ctx.fillRect(m.x, m.y, m.width, m.height);
    ctx.fillStyle = '#2a2d3e'; ctx.fillRect(m.x, m.y, m.width, 20);
    ctx.fillStyle = '#c0c0c0'; ctx.fillRect(m.x + 10, m.y + 25, m.width - 20, 30);
    ctx.fillStyle = '#e07a5f'; ctx.fillRect(m.x + 20, m.y + 35, 10, 10);
    ctx.fillStyle = '#81b29a'; ctx.fillRect(m.x + 50, m.y + 35, 10, 10);
    ctx.fillStyle = '#555555'; ctx.fillRect(m.x + 35, m.y + 55, 10, 15);
    ctx.fillStyle = '#111111'; ctx.fillRect(m.x + 10, m.y + 70, m.width - 20, 10);
}

function drawCroissantOven(m) {
    ctx.fillStyle = '#444444'; ctx.fillRect(m.x, m.y, m.width, m.height);
    ctx.fillStyle = '#222222'; ctx.fillRect(m.x + 5, m.y + 5, m.width - 10, m.height - 10);
    ctx.fillStyle = '#f4a460'; ctx.fillRect(m.x + 15, m.y + 15, m.width - 30, m.height - 40);
    ctx.fillStyle = '#666666'; ctx.fillRect(m.x + 10, m.y + m.height - 20, m.width - 20, 5);
}

function drawPixelText(text, x, y, size, color, align = 'left', baseline = 'top') {
    ctx.font = `${size}px "Press Start 2P"`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
}

function drawCounter(c) {
    ctx.fillStyle = '#a0522d'; ctx.fillRect(c.x, c.y, c.width, c.height);
    ctx.fillStyle = '#80421d'; ctx.fillRect(c.x, c.y, c.width, 20);
    ctx.fillStyle = '#5c2f10'; ctx.fillRect(c.x + 20, c.y + c.height, 30, canvas.height - c.y - c.height);
    ctx.fillRect(c.x + c.width - 50, c.y + c.height, 30, canvas.height - c.y - c.height);
}

function drawTrashCan(t) {
    ctx.fillStyle = '#6c757d'; ctx.fillRect(t.x, t.y, t.width, t.height);
    ctx.fillStyle = '#495057'; ctx.fillRect(t.x - 5, t.y, t.width + 10, 5);
}

function drawStartScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPixelText(ui.title.text, ui.title.x, ui.title.y, 40, '#FFFFFF', 'center');
    ctx.fillStyle = '#e07a5f';
    ctx.fillRect(ui.startButton.x, ui.startButton.y, ui.startButton.width, ui.startButton.height);
    drawPixelText(ui.startButton.text, ui.startButton.x + ui.startButton.width / 2, ui.startButton.y + ui.startButton.height / 2, 20, '#FFFFFF', 'center', 'middle');
}

function drawMusicIcon(x, y) {
    ctx.fillStyle = '#FFFFFF';
    const p = 5; // Pixel size, assuming a 40x40 button
    ctx.fillRect(x + p * 4, y + p, p, p * 5);
    ctx.fillRect(x + p, y + p * 5, p * 4, p * 2);
    ctx.fillRect(x + p * 5, y + p, p * 2, p);
}

function drawSfxIcon(x, y) {
    ctx.fillStyle = '#FFFFFF';
    const p = 5; // Pixel size
    ctx.fillRect(x, y + p * 2, p * 3, p * 4);
    ctx.fillRect(x + p * 3, y + p, p * 2, p * 6);
    ctx.fillRect(x + p * 6, y + p * 3, p, p * 2);
    ctx.fillRect(x + p * 7, y + p * 2, p, p * 4);
}

function drawGameUI() {
    // Score, Time, etc.
    drawPixelText(`Level: ${level}`, 10, 20, 16, '#FFFFFF');
    drawPixelText(`Money: ${money.toFixed(2)}€`, 10, 45, 16, '#FFFFFF');
    drawPixelText(`Time: ${Math.ceil(timer)}`, canvas.width - 10, 20, 16, '#FFFFFF', 'right');

    // Sound Buttons
    drawMusicIcon(ui.musicButton.x, ui.musicButton.y);
    drawSfxIcon(ui.sfxButton.x, ui.sfxButton.y);

    if (!musicEnabled) {
        ctx.strokeStyle = 'red'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(ui.musicButton.x, ui.musicButton.y);
        ctx.lineTo(ui.musicButton.x + ui.musicButton.width, ui.musicButton.y + ui.musicButton.height);
        ctx.stroke();
    }
     if (!sfxEnabled) {
        ctx.strokeStyle = 'red'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(ui.sfxButton.x, ui.sfxButton.y);
        ctx.lineTo(ui.sfxButton.x + ui.sfxButton.width, ui.sfxButton.y + ui.sfxButton.height);
        ctx.stroke();
    }
}


// --- Game Objects & State ---
const player = { x: 400, y: 150, width: 40, height: 40, speed: 4, holding: 'none' };
const coffeeMachine = { x: 700, y: 80, width: 80, height: 80 };
const croissantOven = { x: 20, y: 80, width: 80, height: 80 };
const trashCan = { x: 380, y: 80, width: 40, height: 60 };
const counter = { x: 0, y: 250, width: canvas.width, height: 80 };
const waitingSpots = [ { x: 150, y: 350 }, { x: 250, y: 350 }, { x: 350, y: 350 }, { x: 450, y: 350 }];
const customerColors = { hair: ['#c9a227', '#6a3e29', '#000000'], shirt: ['#9d8189', '#5f9ea0', '#a0a0a0'] };

let activeCustomers = [];
let level = 1, money = 0, timer = 60;
let gameStarted = false;
let spawnInterval, timerInterval;

// --- Audio ---
const sounds = {
    pickup: new Audio('audio/pickup.wav'),
    success: new Audio('audio/success.wav'),
    error: new Audio('audio/error.wav'),
    trash: new Audio('audio/trash.wav'),
    music: new Audio('audio/music.mp3'),
};
sounds.music.loop = true;
sounds.music.volume = 0.3;

let musicEnabled = true;
let sfxEnabled = true;

let joystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };

function toggleMusic() {
    musicEnabled = !musicEnabled;
    if (gameStarted && musicEnabled) {
        sounds.music.play();
    } else {
        sounds.music.pause();
    }
}

function toggleSfx() {
    sfxEnabled = !sfxEnabled;
}

function playSound(sound) {
    if (sfxEnabled) { sound.currentTime = 0; sound.play(); }
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    if (musicEnabled) sounds.music.play();
    level = 1;
    money = 0;
    timer = 60;
    activeCustomers = [];
    player.x = 400;
    player.y = 150;
    player.holding = 'none';

    clearInterval(spawnInterval);
    clearInterval(timerInterval);

    spawnInterval = setInterval(spawnCustomer, 3000 / level);
    timerInterval = setInterval(() => {
        timer -= 1;
        if (timer <= 0) {
            alert(`Shift Over! You earned: ${money.toFixed(2)}€`);
            gameStarted = false;
            sounds.music.pause();
            sounds.music.currentTime = 0;
            clearInterval(spawnInterval);
            clearInterval(timerInterval);
        }
    }, 1000);
}


// --- Game Logic ---
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function movePlayer() {
    if (keys['ArrowUp']) player.y -= player.speed;
    if (keys['ArrowDown']) player.y += player.speed;
    if (keys['ArrowLeft']) player.x -= player.speed;
    if (keys['ArrowRight']) player.x += player.speed;
    if (joystick.active && (joystick.dx !== 0 || joystick.dy !== 0)) {
        const magnitude = Math.sqrt(joystick.dx * joystick.dx + joystick.dy * joystick.dy);
        player.x += (joystick.dx / magnitude) * player.speed;
        player.y += (joystick.dy / magnitude) * player.speed;
    }
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
    player.y = Math.max(0, Math.min(player.y, counter.y - player.height));
}

function spawnCustomer() {
    const orderingOrEnteringCount = activeCustomers.filter(c => c.state === 'ORDERING' || c.state === 'ENTERING').length;
    if (orderingOrEnteringCount >= waitingSpots.length) return;
    const rand = Math.random();
    let order, price;
    if (rand < 0.4) { order = { coffee: true, croissant: false }; price = 2; }
    else if (rand < 0.8) { order = { coffee: false, croissant: true }; price = 1; }
    else { order = { coffee: true, croissant: true }; price = 3; }
    const newCustomer = {
        x: -50, y: 350, width: 40, height: 40, targetX: -50, targetY: 350,
        state: 'ENTERING', isAngry: false, order: order, price: price,
        hairColor: customerColors.hair[Math.floor(Math.random() * customerColors.hair.length)],
        shirtColor: customerColors.shirt[Math.floor(Math.random() * customerColors.shirt.length)],
    };
    activeCustomers.push(newCustomer);
}

function updateCustomers() {
    const queue = activeCustomers.filter(c => c.state === 'ENTERING' || c.state === 'ORDERING');
    activeCustomers.forEach(c => {
        if (c.state === 'ENTERING' || c.state === 'ORDERING') {
            const queueIndex = queue.indexOf(c);
            if (queueIndex !== -1) c.targetX = waitingSpots[queueIndex].x;
        }
        const speed = 2;
        if (c.x < c.targetX) c.x = Math.min(c.x + speed, c.targetX);
        else if (c.x > c.targetX) c.x = Math.max(c.x - speed, c.targetX);
        if (c.state === 'ENTERING' && c.x === c.targetX) c.state = 'ORDERING';
    });
    activeCustomers = activeCustomers.filter(c => {
        if (c.state === 'LEAVING') return c.x > -50 && c.x < canvas.width + 50;
        return true;
    });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
}

function handleServing() {
    if (player.holding === 'none' || player.y + player.height < counter.y) return;
    const customerToServe = activeCustomers.find(c =>
        c.state === 'ORDERING' && (Math.abs((player.x + player.width / 2) - (c.x + c.width / 2)) < (c.width / 2))
    );
    if (customerToServe) {
        const item = player.holding;
        let served = false;
        if (item === 'coffee' && customerToServe.order.coffee) {
            customerToServe.order.coffee = false; served = true;
        } else if (item === 'croissant' && customerToServe.order.croissant) {
            customerToServe.order.croissant = false; served = true;
        }
        if (served) {
            player.holding = 'none';
            playSound(sounds.pickup);
            const isOrderComplete = !customerToServe.order.coffee && !customerToServe.order.croissant;
            if (isOrderComplete) {
                const queue = activeCustomers.filter(c => c.state === 'ORDERING' || c.state === 'ENTERING');
                const servedIndex = queue.indexOf(customerToServe);
                if (servedIndex === 0) {
                    money += customerToServe.price;
                    playSound(sounds.success);
                } else if (servedIndex > 0) {
                    const skippedCustomers = queue.slice(0, servedIndex);
                    skippedCustomers.forEach(skipped => {
                        skipped.isAngry = true; skipped.state = 'LEAVING'; skipped.targetX = -50;
                        money -= 1; playSound(sounds.error);
                    });
                    money += customerToServe.price;
                }
                customerToServe.state = 'LEAVING';
                customerToServe.targetX = canvas.width + 50;
            }
        }
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        drawStartScreen();
    } else {
        drawFloor();
        drawCounter(counter);
        movePlayer();
        drawBarista(player);
        drawCoffeeMachine(coffeeMachine);
        drawCroissantOven(croissantOven);
        drawTrashCan(trashCan);
        updateCustomers();
        handleServing();
        activeCustomers.forEach(drawCustomer);
        if (player.holding !== 'none' && checkCollision(player, trashCan)) {
            player.holding = 'none';
            money -= 0.5;
            playSound(sounds.trash);
        } else if (player.holding === 'none') {
            if (checkCollision(player, coffeeMachine)) { player.holding = 'coffee'; playSound(sounds.pickup); }
            else if (checkCollision(player, croissantOven)) { player.holding = 'croissant'; playSound(sounds.pickup); }
        }
    }

    // Draw UI on top of everything, it's always visible
    drawGameUI();

    requestAnimationFrame(gameLoop);
}

// --- Event Listeners ---
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    if (!gameStarted) {
        // Check Start Button
        if (mouseX >= ui.startButton.x && mouseX <= ui.startButton.x + ui.startButton.width &&
            mouseY >= ui.startButton.y && mouseY <= ui.startButton.y + ui.startButton.height) {
            startGame();
        }
    }

    // Sound buttons are active both in menu and in game
    if (mouseX >= ui.musicButton.x && mouseX <= ui.musicButton.x + ui.musicButton.width &&
        mouseY >= ui.musicButton.y && mouseY <= ui.musicButton.y + ui.musicButton.height) {
        toggleMusic();
    }
    if (mouseX >= ui.sfxButton.x && mouseX <= ui.sfxButton.x + ui.sfxButton.width &&
        mouseY >= ui.sfxButton.y && mouseY <= ui.sfxButton.y + ui.sfxButton.height) {
        toggleSfx();
    }
}

canvas.addEventListener('click', handleCanvasClick);


// --- Joystick Logic ---
const joystickContainer = document.getElementById('joystick-container');
const joystickStick = document.getElementById('joystick-stick');

function handleJoystickStart(e) {
    joystick.active = true;
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    joystick.startX = touch.clientX;
    joystick.startY = touch.clientY;
}

function handleJoystickMove(e) {
    if (!joystick.active) return;
    e.preventDefault();
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    joystick.dx = touch.clientX - joystick.startX;
    joystick.dy = touch.clientY - joystick.startY;
    const angle = Math.atan2(joystick.dy, joystick.dx);
    const distance = Math.min(30, Math.sqrt(joystick.dx * joystick.dx + joystick.dy * joystick.dy));
    const stickX = distance * Math.cos(angle);
    const stickY = distance * Math.sin(angle);
    joystickStick.style.transform = `translate(${stickX}px, ${stickY}px)`;
}

function handleJoystickEnd(e) {
    if (!joystick.active) return;
    joystick.active = false;
    joystick.dx = 0;
    joystick.dy = 0;
    joystickStick.style.transform = 'translate(0, 0)';
}

joystickContainer.addEventListener('touchstart', handleJoystickStart, { passive: false });
joystickContainer.addEventListener('touchmove', handleJoystickMove, { passive: false });
joystickContainer.addEventListener('touchend', handleJoystickEnd);
joystickContainer.addEventListener('touchcancel', handleJoystickEnd);
document.addEventListener('mousedown', (e) => { if(e.target === joystickContainer || e.target === joystickStick) handleJoystickStart(e); });
document.addEventListener('mousemove', handleJoystickMove);
document.addEventListener('mouseup', handleJoystickEnd);

// --- Initial Draw ---
document.fonts.load('10px "Press Start 2P"').then(() => {
    gameLoop();
});
