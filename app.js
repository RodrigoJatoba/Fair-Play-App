// 1. SELEÇÃO DE ELEMENTOS
const inputPlayer = document.getElementById('playerName');
const btnAdd = document.getElementById('btnAdd');
const playerListElement = document.getElementById('playerList');
const modeToggle = document.getElementById('modeToggle');
const modeLabel = document.getElementById('modeLabel');
const playerLevelSelect = document.getElementById('playerLevel');

// 2. ESTADO DA APLICAÇÃO
let players = JSON.parse(localStorage.getItem('fairplay_players')) || [];

// 3. LÓGICA DE INTERFACE (MODOS)
modeToggle.addEventListener('change', () => {
    if (modeToggle.checked) {
        modeLabel.innerText = "Modo: Equilibrado (Níveis)";
        playerLevelSelect.classList.remove('hidden');
    } else {
        modeLabel.innerText = "Modo: Aleatório";
        playerLevelSelect.classList.add('hidden');
    }
});

// 4. FUNÇÕES PRINCIPAIS
function addPlayer() {
    const name = inputPlayer.value.trim();
    const level = parseInt(playerLevelSelect.value);
    
    if (name === "") {
        alert("Digite o nome do craque!");
        return;
    }

    // Adiciona como objeto para suportar os dois modos
    players.push({ name: name, level: level });
    
    inputPlayer.value = '';
    inputPlayer.focus();
    renderPlayers();
}

function removePlayer(index) {
    players.splice(index, 1);
    renderPlayers();
}

function renderPlayers() {
    playerListElement.innerHTML = '';

    players.forEach((player, index) => {
        const li = document.createElement('li');
        li.className = 'player-item';
        
        // Gera as estrelas baseadas no nível do objeto player
        const stars = "⭐".repeat(player.level);

        li.innerHTML = `
            <div>
                <span class="player-name">${player.name}</span>
                <span class="player-stars">${modeToggle.checked ? stars : ''}</span>
            </div>
            <button onclick="removePlayer(${index})" class="btn-remove">✕</button>
        `;
        playerListElement.appendChild(li);
    });

    localStorage.setItem('fairplay_players', JSON.stringify(players));
}

function sortearTimes() {
    if (players.length < 2) {
        alert("Adicione pelo menos 2 jogadores!");
        return;
    }

    let timeA = [];
    let timeB = [];
    let listaParaSortear = [...players].sort(() => Math.random() - 0.5);

    if (modeToggle.checked) {
        listaParaSortear.sort((a, b) => b.level - a.level);
        listaParaSortear.forEach((p, i) => { (i % 2 === 0) ? timeA.push(p) : timeB.push(p); });
    } else {
        const metade = Math.ceil(listaParaSortear.length / 2);
        timeA = listaParaSortear.slice(0, metade);
        timeB = listaParaSortear.slice(metade);
    }

    exibirResultado(timeA, timeB);
    mostrarSliderDestravamento();
}

function exibirResultado(timeA, timeB) {
    const resultSection = document.getElementById('resultSection');
    const teamAList = document.getElementById('teamAList');
    const teamBList = document.getElementById('teamBList');

    teamAList.innerHTML = timeA.map(p => `<li>${p.name}</li>`).join('');
    teamBList.innerHTML = timeB.map(p => `<li>${p.name}</li>`).join('');

    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// Vincula o botão de sorteio que está no seu HTML
document.querySelector('.btn-sortear').addEventListener('click', sortearTimes);

// 6. EVENTOS
btnAdd.addEventListener('click', addPlayer);
inputPlayer.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addPlayer();
});

const slider = document.getElementById('unlockSlider');
const track = document.querySelector('.unlock-track');
const unlockContainer = document.getElementById('unlockContainer');
let isDragging = false;
let startX, maxDist;

// Ativa o slider quando sortear os times
// Chame essa função dentro da sua função sortearTimes()
function mostrarSliderDestravamento() {
    unlockContainer.classList.remove('hidden');
    resetSlider();
}

slider.addEventListener('mousedown', startDrag);
slider.addEventListener('touchstart', startDrag);

function startDrag(e) {
    isDragging = true;
    startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
    maxDist = track.offsetWidth - slider.offsetWidth - 10;
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
}

function drag(e) {
    if (!isDragging) return;
    const x = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
    let moveX = x - startX;

    if (moveX < 0) moveX = 0;
    if (moveX > maxDist) moveX = maxDist;

    slider.style.left = moveX + 5 + 'px';

    // Se chegou ao final
    if (moveX >= maxDist) {
        onUnlocked();
    }
}

function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    // Se não chegou ao fim, volta para o início
    if (parseInt(slider.style.left) < maxDist) {
        slider.style.transition = "left 0.3s ease";
        slider.style.left = "5px";
        setTimeout(() => slider.style.transition = "", 300);
    }
}

function onUnlocked() {
    slider.classList.add('unlocked');
    document.querySelector('.unlock-text').innerText = "Times Confirmados!";
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    
    // Aqui você pode adicionar o que acontece após destravar
    // Ex: liberar botão de compartilhar ou salvar racha
    alert("Times confirmados com sucesso!");
}

function resetSlider() {
    slider.style.left = "5px";
    slider.classList.remove('unlocked');
    document.querySelector('.unlock-text').innerText = "Arraste para confirmar times";
}

// Inicializar a lista ao carregar a página
renderPlayers();