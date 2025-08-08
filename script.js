const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- UI Element Definitions ---
const ui = {
    title: { x: canvas.width / 2, y: 150, text: "PIXEL CAFE" },
    startButton: { x: canvas.width / 2 - 150, y: 280, width: 300, height: 70, text: "Start Game" },
    musicButton: { x: 750, y: 10, width: 40, height: 40 },
    sfxButton: { x: 700, y: 10, width: 40, height: 40 },
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
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(p.x + 10, p.y + 5, 5, 5); ctx.fillRect(p.x + 25, p.y + 5, 5, 5);
    ctx.fillStyle = '#4a4e69'; ctx.fillRect(p.x, p.y + 15, p.width, p.height - 15);
    ctx.fillStyle = '#f2e9e4'; ctx.fillRect(p.x, p.y + 15, p.width, 5);
    if (p.holding === 'coffee') {
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(p.x + 15, p.y + 25, 10, 12);
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
    ctx.fillStyle = '#FFFFFF';
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
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(c.x + 10, c.y + 5, 5, 5); ctx.fillRect(c.x + 25, c.y + 5, 5, 5);
    if (c.state === 'ORDERING') {
        ctx.fillStyle = '#FFFFFF';
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

function drawMachine(m) {
    ctx.fillStyle = m.baseColor; ctx.fillRect(m.x, m.y, m.width, m.height);
    ctx.fillStyle = m.topColor; ctx.fillRect(m.x, m.y, m.width, 20);

    if (m.details) {
        m.details.forEach(d => {
            ctx.fillStyle = d.color;
            ctx.fillRect(m.x + d.x, m.y + d.y, d.w, d.h);
        });
    }

    // Item-specific visual logic
    if (m.item === 'croissant') {
        ctx.fillStyle = '#FFFACD'; // Light yellow glow
        ctx.fillRect(m.x + 15, m.y + 15, 50, 50);
        if (m.cooldowns[0] <= 0) drawCroissantIcon(m.x + 20, m.y + 35);
        if (m.cooldowns[1] <= 0) drawCroissantIcon(m.x + 45, m.y + 35);
    } else if (m.item === 'coffee') {
        if (m.cooldowns[0] <= 0) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(m.x + 35, m.y + 45, 10, 12);
        }
    }

    // Cooldown progress bars
    const barHeight = 10;
    const barY = m.y - 15;
    const totalBarWidth = m.width - 10;
    const slotWidth = totalBarWidth / m.cooldowns.length;
    const barPadding = m.cooldowns.length > 1 ? 5 : 0;
    const barWidth = slotWidth - barPadding;

    for (let i = 0; i < m.cooldowns.length; i++) {
        const barX = m.x + 5 + (i * slotWidth);
        if (m.cooldowns[i] > 0) {
            const progressWidth = (m.cooldowns[i] / m.timeToComplete) * barWidth;
            ctx.fillStyle = '#222';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            ctx.fillStyle = '#e07a5f';
            ctx.fillRect(barX, barY, barWidth - progressWidth, barHeight);
        }
    }
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

function drawCounterDecorations() {
    // Cash Register
    ctx.fillStyle = '#888888';
    ctx.fillRect(100, 220, 40, 30);
    ctx.fillStyle = '#444444';
    ctx.fillRect(105, 225, 30, 15);

    // Order Here Sign
    drawPixelText('Order Here', 100, 260, 10, '#FFFFFF');
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

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPixelText('Shift Over!', canvas.width / 2, 150, 40, '#FFFFFF', 'center');
    drawPixelText(`You earned: ${money.toFixed(2)}€`, canvas.width / 2, 250, 20, '#FFFFFF', 'center');
    drawPixelText('Click to Continue', canvas.width / 2, 350, 16, '#FFFFFF', 'center');
}


function drawMusicIcon(x, y) {
    ctx.fillStyle = '#FFFFFF';
    const p = 5;
    ctx.fillRect(x + p * 4, y + p, p, p * 5);
    ctx.fillRect(x + p, y + p * 5, p * 4, p * 2);
    ctx.fillRect(x + p * 5, y + p, p * 2, p);
}

function drawSfxIcon(x, y) {
    ctx.fillStyle = '#FFFFFF';
    const p = 5;
    ctx.fillRect(x, y + p * 2, p * 3, p * 4);
    ctx.fillRect(x + p * 3, y + p, p * 2, p * 6);
    ctx.fillRect(x + p * 6, y + p * 3, p, p * 2);
    ctx.fillRect(x + p * 7, y + p * 2, p, p * 4);
}

function drawGameUI() {
    drawPixelText(`Money: ${money.toFixed(2)}€`, 10, 20, 16, '#FFFFFF');
    drawPixelText(`Time: ${Math.ceil(timer)}`, 690, 20, 16, '#FFFFFF', 'right');

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
const player = { x: 400, y: 150, width: 40, height: 40, speed: 250, holding: 'none' };
const coffeeMachine = {
    x: 700, y: 80, width: 80, height: 80, cooldowns: [0], timeToComplete: 2, item: 'coffee',
    baseColor: '#3d405b', topColor: '#2a2d3e',
    details: [
        { x: 10, y: 25, w: 60, h: 30, color: '#c0c0c0' }, { x: 15, y: 30, w: 10, h: 10, color: '#e07a5f' },
        { x: 35, y: 30, w: 10, h: 10, color: '#81b29a' }, { x: 55, y: 30, w: 10, h: 10, color: '#e07a5f' },
        { x: 25, y: 55, w: 10, h: 15, color: '#555555' }, { x: 45, y: 55, w: 10, h: 15, color: '#555555' },
        { x: 5, y: 55, w: 5, h: 20, color: '#777777' }, { x: 10, y: 70, w: 60, h: 10, color: '#111111' },
    ]
};
const croissantOven = {
    x: 20, y: 80, width: 80, height: 80, cooldowns: [0, 0], timeToComplete: 3, item: 'croissant',
    baseColor: '#444444', topColor: '#222222',
    details: [
        { x: 5, y: 5, w: 70, h: 70, color: '#222222' },
        { x: 10, y: 75, w: 60, h: 5, color: '#666666' },
    ]
};
const machines = [coffeeMachine, croissantOven];

const trashCan = { x: 380, y: 80, width: 40, height: 60 };
const counter = { x: 0, y: 250, width: canvas.width, height: 80 };
const waitingSpots = [ { x: 150, y: 350 }, { x: 250, y: 350 }, { x: 350, y: 350 }, { x: 450, y: 350 }];
const customerColors = { hair: ['#c9a227', '#6a3e29', '#000000'], shirt: ['#9d8189', '#5f9ea0', '#a0a0a0'] };

let money = 0, timer = 60;
let gameState = 'start';
let spawnInterval;

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
    if (gameState === 'playing' && musicEnabled) {
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
    gameState = 'playing';
    if (musicEnabled) sounds.music.play();
    money = 0;
    timer = 60;
    activeCustomers = [];
    player.x = 400;
    player.y = 150;
    player.holding = 'none';
    machines.forEach(m => { m.cooldowns = m.cooldowns.map(() => 0); });

    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnCustomer, 3000);
}


// --- Game Logic ---
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function movePlayer(dt) {
    const moveSpeed = player.speed * dt;
    if (keys['ArrowUp']) player.y -= moveSpeed;
    if (keys['ArrowDown']) player.y += moveSpeed;
    if (keys['ArrowLeft']) player.x -= moveSpeed;
    if (keys['ArrowRight']) player.x += moveSpeed;
    if (joystick.active && (joystick.dx !== 0 || joystick.dy !== 0)) {
        const magnitude = Math.sqrt(joystick.dx * joystick.dx + joystick.dy * joystick.dy);
        player.x += (joystick.dx / magnitude) * moveSpeed;
        player.y += (joystick.dy / magnitude) * moveSpeed;
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

function updateCustomers(dt) {
    const queue = activeCustomers.filter(c => c.state === 'ENTERING' || c.state === 'ORDERING');
    activeCustomers.forEach(c => {
        if (c.state === 'ENTERING' || c.state === 'ORDERING') {
            const queueIndex = queue.indexOf(c);
            if (queueIndex !== -1) c.targetX = waitingSpots[queueIndex].x;
        }
        const speed = 120 * dt;
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

function updateMachines(dt) {
    machines.forEach(m => {
        for (let i = 0; i < m.cooldowns.length; i++) {
            if (m.cooldowns[i] > 0) {
                m.cooldowns[i] -= dt;
            }
        }
    });
}

// --- Main Update and Draw Functions ---
function update(dt) {
    movePlayer(dt);
    updateCustomers(dt);
    handleServing();
    updateMachines(dt);

    if (player.holding !== 'none' && checkCollision(player, trashCan)) {
        player.holding = 'none';
        money -= 0.5;
        playSound(sounds.trash);
    } else if (player.holding === 'none') {
        machines.forEach(m => {
            if (checkCollision(player, m)) {
                for (let i = 0; i < m.cooldowns.length; i++) {
                    if (m.cooldowns[i] <= 0) {
                        player.holding = m.item;
                        m.cooldowns[i] = m.timeToComplete;
                        playSound(sounds.pickup);
                        return;
                    }
                }
            }
        });
    }

    timer -= dt;
    if (timer <= 0) {
        gameState = 'over';
        sounds.music.pause();
        sounds.music.currentTime = 0;
        clearInterval(spawnInterval);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'playing' || gameState === 'over') {
        drawFloor();
        drawCounter(counter);
        machines.forEach(drawMachine);
        drawTrashCan(trashCan);
        drawBarista(player);
        drawCounterDecorations();
        activeCustomers.forEach(drawCustomer);
        drawGameUI();
        if (gameState === 'over') {
            drawGameOverScreen();
        }
    }
}

// --- Joystick Visual Update ---
const joystickStick = document.getElementById('joystick-stick');
function drawJoystick() {
    if (joystick.active) {
        const angle = Math.atan2(joystick.dy, joystick.dx);
        const distance = Math.min(30, Math.sqrt(joystick.dx * joystick.dx + joystick.dy * joystick.dy));
        const stickX = distance * Math.cos(angle);
        const stickY = distance * Math.sin(angle);
        joystickStick.style.transform = `translate(${stickX}px, ${stickY}px)`;
    } else {
        joystickStick.style.transform = 'translate(0, 0)';
    }
}

// --- Game Loop ---
let lastTime = 0;
function gameLoop(timestamp) {
    if (!lastTime) {
        lastTime = timestamp;
    }
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (gameState === 'playing') {
        update(deltaTime);
    }
    
    draw();
    drawJoystick();

    requestAnimationFrame(gameLoop);
}


// --- Event Listeners ---
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    if (gameState === 'start') {
        if (mouseX >= ui.startButton.x && mouseX <= ui.startButton.x + ui.startButton.width &&
            mouseY >= ui.startButton.y && mouseY <= ui.startButton.y + ui.startButton.height) {
            startGame();
        }
    } else if (gameState === 'over') {
        gameState = 'start';
    }

    // Sound buttons are always active
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
}

function handleJoystickEnd(e) {
    if (!joystick.active) return;
    joystick.active = false;
    joystick.dx = 0;
    joystick.dy = 0;
}

joystickContainer.addEventListener('touchstart', handleJoystickStart, { passive: false });
joystickContainer.addEventListener('touchmove', handleJoystickMove, { passive: false });
joystickContainer.addEventListener('touchend', handleJoystickEnd);
joystickContainer.addEventListener('touchcancel', handleJoystickEnd);
document.addEventListener('mousedown', (e) => { if(e.target === joystickContainer || e.target.parentElement === joystickContainer) handleJoystickStart(e); });
document.addEventListener('mousemove', handleJoystickMove);
document.addEventListener('mouseup', handleJoystickEnd);

// --- Initial Draw ---
document.fonts.load('10px "Press Start 2P"').then(() => {
    requestAnimationFrame(gameLoop);
});