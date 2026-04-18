// 1. SELEÇÃO DE ELEMENTOS
const inputPlayer = document.getElementById('playerName');
const btnAdd = document.getElementById('btnAdd');
const playerListElement = document.getElementById('playerList');
const modeToggle = document.getElementById('modeToggle');
const modeLabel = document.getElementById('modeLabel');
const playerLevelSelect = document.getElementById('playerLevel');
const confirmToggle = document.getElementById('confirmToggle');
const confirmLabel = document.getElementById('confirmLabel');
const btnSortear = document.querySelector('.btn-sortear');
const btnClear = document.getElementById('btnClear');

// 2. ESTADO DA APLICAÇÃO
let players = JSON.parse(localStorage.getItem('fairplay_players')) || [];
let isConfirmed = false;

// 3. LÓGICA DE INTERFACE
// Alternar entre modo Aleatório e Equilibrado
modeToggle.addEventListener('change', () => {
    if (modeToggle.checked) {
        modeLabel.innerText = "Modo: Equilibrado (Níveis)";
        playerLevelSelect.classList.remove('hidden');
    } else {
        modeLabel.innerText = "Modo: Aleatório";
        playerLevelSelect.classList.add('hidden');
    }
});

// Lógica do Switch de Confirmação (Substitui o antigo Slider de arrastar)
confirmToggle.addEventListener('change', () => {
    isConfirmed = confirmToggle.checked;
    if (isConfirmed) {
        confirmLabel.innerText = "Times Confirmados!";
        confirmLabel.style.color = "var(--mustard-yellow)";
        confirmLabel.style.fontWeight = "bold";
    } else {
        confirmLabel.innerText = "Confirmar Escalação";
        confirmLabel.style.color = "var(--text-white)";
        confirmLabel.style.fontWeight = "normal";
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

    players.push({ name, level });
    inputPlayer.value = '';
    inputPlayer.focus();
    renderPlayers();
}

function renderPlayers() {
    playerListElement.innerHTML = '';
    players.forEach((player, index) => {
        const li = document.createElement('li');
        li.className = 'player-item';
        li.innerHTML = `
            <span>${player.name} <span class="player-stars">${"⭐".repeat(player.level)}</span></span>
            <button class="btn-remove" onclick="removePlayer(${index})">×</button>
        `;
        playerListElement.appendChild(li);
    });
    localStorage.setItem('fairplay_players', JSON.stringify(players));
}

function removePlayer(index) {
    players.splice(index, 1);
    renderPlayers();
}

// 5. LÓGICA DE SORTEIO
function sortearTimes() {
    // Verificação de bloqueio (O que faltava!)
    if (isConfirmed) {
        alert("O racha está confirmado! Desmarque a confirmação para sortear novamente.");
        return;
    }

    if (players.length < 2) {
        alert("Adicione pelo menos 2 jogadores!");
        return;
    }

    let timeA = [], timeB = [];
    let listaParaSortear = [...players].sort(() => Math.random() - 0.5);

    if (modeToggle.checked) {
        // Modo Equilibrado: Ordena por nível e distribui (serpente)
        listaParaSortear.sort((a, b) => b.level - a.level);
        listaParaSortear.forEach((p, i) => {
            (i % 2 === 0) ? timeA.push(p) : timeB.push(p);
        });
    } else {
        // Modo Aleatório
        const metade = Math.ceil(listaParaSortear.length / 2);
        timeA = listaParaSortear.slice(0, metade);
        timeB = listaParaSortear.slice(metade);
    }

    exibirResultado(timeA, timeB);
}

function exibirResultado(timeA, timeB) {
    const resultSection = document.getElementById('resultSection');
    const teamAList = document.getElementById('teamAList');
    const teamBList = document.getElementById('teamBList');
    const unlockContainer = document.getElementById('unlockContainer');

    teamAList.innerHTML = timeA.map(p => `<li>${p.name}</li>`).join('');
    teamBList.innerHTML = timeB.map(p => `<li>${p.name}</li>`).join('');

    resultSection.classList.remove('hidden');
    unlockContainer.classList.remove('hidden');
    
    // Reset do switch ao gerar novo sorteio para permitir conferência
    confirmToggle.checked = false;
    isConfirmed = false;
    confirmLabel.innerText = "Confirmar Escalação";
}

// FUNÇÃO PARA LIMPAR/REINICIAR
function limparSorteio() {
    // Mesma trava do botão de sortear
    if (isConfirmed) {
        alert("Atenção: O racha já está confirmado! Desmarque a confirmação se realmente deseja limpar tudo.");
        return;
    }

    // Se não estiver confirmado, ele recarrega a página ou limpa os dados
    if (confirm("Deseja realmente apagar todos os jogadores e o sorteio atual?")) {
        localStorage.removeItem('fairplay_players'); // Opcional: limpa o histórico salvo
        window.location.reload();
    }
}

// 6. INICIALIZAÇÃO E EVENTOS
btnSortear.addEventListener('click', sortearTimes);
btnClear.addEventListener('click', limparSorteio);

// Evento para o Enter no input
inputPlayer.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addPlayer();
});

renderPlayers();