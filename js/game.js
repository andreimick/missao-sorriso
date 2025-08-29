// Elementos do DOM
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const gameContainer = document.getElementById('game-container');
const loadingScreen = document.getElementById('loading-screen');
const startScreen = document.getElementById('start-screen');
const mainScreen = document.getElementById('main-screen');
const quizScreen = document.getElementById('quiz-screen');
const endScreen = document.getElementById('end-screen');
const startBtn = document.getElementById('start-btn');
const dialogueBox = document.getElementById('dialogue-box');
const dialogueText = document.getElementById('dialogue-text');
const dialogueOptions = document.getElementById('dialogue-options');
const scoreDisplay = document.getElementById('score-display');
const endTitle = document.getElementById('end-title');
const endText = document.getElementById('end-text');
const toolCursor = document.getElementById('tool-cursor');
const helpIcon = document.getElementById('help-icon');
const toolPalette = document.getElementById('tool-palette');
const toolBrushIcon = document.getElementById('tool-toothbrush');
const toolDrillIcon = document.getElementById('tool-drill');
const toolFillingIcon = document.getElementById('tool-filling');
const infoBar = document.getElementById('info-bar');

// Elementos do Quiz
const quizContainer = document.getElementById('quiz-container');
const quizQuestionText = document.getElementById('quiz-question');
const quizOptionsContainer = document.getElementById('quiz-options');

// Configurações do Jogo - Dimensões LÓGICAS do canvas (NOVA PROPORÇÃO 16:9)
const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Estados do Jogo
const GAME_STATE = {
    LOADING: 'loading',
    START: 'start',
    DIALOGUE: 'dialogue',
    HIGIENIZATION: 'higienization',
    TREATMENT: 'treatment',
    FILLING: 'filling',
    QUIZ: 'quiz',
    END: 'end'
};

let currentState = GAME_STATE.LOADING;
let score = 0;
let quizCorrectAnswers = 0;
let isInteracting = false;
let isMouseDown = false;
let dirt = [];
let cavity = {
    x: 0,
    y: 0,
    radius: 30,
    damage: 100,
    filled: 0,
    image: null
};
let currentTool = '';
let assetsLoaded = false;

// Dimensões e posicionamento dos personagens para DESKTOP
const dentistImageWidthDesktop = 200;
const dentistImageHeightDesktop = 300;
const childImageWidthDesktop = 200;
const childImageHeightDesktop = 300;

const dentistPosDesktop = {
    x: 50,
    y: 250,
    width: dentistImageWidthDesktop,
    height: dentistImageHeightDesktop
};
const childPosDesktop = {
    x: 550,
    y: 250,
    width: childImageWidthDesktop,
    height: childImageHeightDesktop
};

// Dimensões e posicionamento dos personagens para MOBILE (NOVAS POSIÇÕES)
const dentistImageWidthMobile = 150;
const dentistImageHeightMobile = 225;
const childImageWidthMobile = 150;
const childImageHeightMobile = 225;

const dentistPosMobile = {
    x: 20,
    y: 20,
    width: dentistImageWidthMobile,
    height: dentistImageHeightMobile
};
const childPosMobile = {
    x: GAME_WIDTH - childImageWidthMobile - 20,
    y: 20,
    width: childImageWidthMobile,
    height: childImageHeightMobile
};

// Posição do dente (centralizado)
const toothImageWidth = 120 * 2;
const toothImageHeight = 80 * 2;
let toothBoundingBox = {
    x: (GAME_WIDTH / 2) - (toothImageWidth / 2),
    y: (GAME_HEIGHT / 2) - (toothImageHeight / 2),
    width: toothImageWidth,
    height: toothImageHeight
};

const quizQuestions = [{
    question: "Qual a idade ideal para ensinar hábitos de higiene bucal?",
    options: ["A partir dos 10 anos", "Entre 4 e 6 anos", "Na adolescência", "Apenas quando a criança pede"],
    answer: "Entre 4 e 6 anos"
}, {
    question: "Qual o principal objetivo de projetos sociais na odontologia?",
    options: ["Apenas tratar doenças", "Vender produtos odontológicos", "Levar prevenção e educação em saúde", "Pesquisar novas tecnologias"],
    answer: "Levar prevenção e educação em saúde"
}, {
    question: "Qual o maior obstáculo para a saúde bucal em comunidades carentes?",
    options: ["Falta de dentistas", "Falta de hospitais", "Acesso limitado a materiais e medo do dentista", "Desinteresse das famílias"],
    answer: "Acesso limitado a materiais e medo do dentista"
}, {
    question: "O que a odontologia social oferece, além de tratamento?",
    options: ["Dinheiro", "Dignidade, acolhimento e esperança", "Carros", "Comida"],
    answer: "Dignidade, acolhimento e esperança"
}, {
    question: "Escovar os dentes previne apenas cáries?",
    options: ["Sim, apenas cáries.", "Não, previne apenas gengivite.", "Sim, e fortalece os ossos.", "Não, ajuda no desenvolvimento da fala e autoestima."],
    answer: "Não, ajuda no desenvolvimento da fala e autoestima."
}, {
    question: "Qual o papel do acadêmico de odontologia em uma comunidade?",
    options: ["Apenas observar", "Ser um educador em saúde", "Fazer diagnósticos complexos", "Ajudar a construir clínicas"],
    answer: "Ser um educador em saúde"
}, {
    question: "O que significa 'Transformando Sorrisos, Transformando Vidas'?",
    options: ["Mudar a cor dos dentes", "Apenas realizar tratamentos estéticos", "Ajudar pessoas a sorrirem novamente, impactando suas vidas", "Abrir mais consultórios"],
    answer: "Ajudar pessoas a sorrirem novamente, impactando suas vidas"
}, {
    question: "Qual o tempo ideal de escovação dos dentes?",
    options: ["30 segundos", "1 minuto", "2 minutos", "5 minutos"],
    answer: "2 minutos"
}, {
    question: "Quando uma criança deve ter sua primeira visita ao dentista?",
    options: ["Após os 5 anos", "Depois dos 10 anos", "Assim que o primeiro dente de leite nascer", "Apenas na adolescência"],
    answer: "Assim que o primeiro dente de leite nascer"
}, {
    question: "A mastigação está ligada à saúde bucal?",
    options: ["Sim, diretamente.", "Não, é um processo separado.", "Somente na idade adulta.", "Apenas na infância."],
    answer: "Sim, diretamente."
}, ];

let selectedQuizQuestions = [];
let currentQuizQuestionIndex = 0;

const assets = {};
const assetList = [
    'background.jpg', 'character_dentist.png', 'character_child.png', 'toothbrush.png', 'dental_tools/drill.png', 'dental_tools/filling.png', 'tooth_model.png',
    'caries/carie1.png', 'caries/carie2.png', 'caries/carie3.png', 'caries/carie4.png', 'caries/carie5.png'
];

const carieImages = [
    'caries/carie1.png', 'caries/carie2.png', 'caries/carie3.png', 'caries/carie4.png', 'caries/carie5.png'
];

function loadAssets() {
    let loadedCount = 0;
    let errorCount = 0;
    const totalAssets = assetList.length;

    assetList.forEach(assetName => {
        const img = new Image();
        img.src = `assets/${assetName}`;
        img.onload = () => {
            assets[assetName] = img;
            loadedCount++;
            checkLoadStatus();
        };
        img.onerror = () => {
            console.error(`Erro ao carregar o asset: ${assetName}. Verifique o nome e o caminho.`);
            loadedCount++;
            errorCount++;
            checkLoadStatus();
        };
    });

    function checkLoadStatus() {
        if (loadedCount === totalAssets) {
            if (errorCount === 0) {
                assetsLoaded = true;
                loadingScreen.classList.add('hidden');
                switchScreen(GAME_STATE.START);
                requestAnimationFrame(draw);
            } else {
                loadingScreen.innerHTML = `<h1>Erro ao Carregar Recursos</h1><p>Não foi possível carregar ${errorCount} de ${totalAssets} assets. Verifique se os arquivos estão na pasta 'assets' e se os nomes estão corretos. Veja o console do navegador (F12) para mais detalhes.</p>`;
            }
        }
    }
}

function switchScreen(state) {
    const screens = [loadingScreen, startScreen, mainScreen, quizScreen, endScreen];
    screens.forEach(s => s.classList.remove('screen-fade-in', 'screen-fade-out'));

    dialogueBox.classList.add('hidden');
    toolCursor.classList.add('hidden');
    quizContainer.classList.add('hidden');
    helpIcon.classList.add('hidden');
    toolPalette.classList.add('hidden');
    infoBar.classList.add('hidden');

    screens.forEach(s => s.classList.add('hidden'));

    canvas.style.cursor = 'auto';

    if (state === GAME_STATE.START) {
        startScreen.classList.remove('hidden');
        startScreen.classList.add('screen-fade-in');
    } else if (state === GAME_STATE.DIALOGUE) {
        mainScreen.classList.remove('hidden');
        mainScreen.classList.add('screen-fade-in');
        mainScreen.style.backgroundImage = `url(assets/background.jpg)`;
        showDialogue(story.start);
    } else if (state === GAME_STATE.HIGIENIZATION) {
        mainScreen.classList.remove('hidden');
        mainScreen.classList.add('screen-fade-in');
        mainScreen.style.backgroundImage = `url(assets/background.jpg)`;
        helpIcon.classList.remove('hidden');
        toolPalette.classList.remove('hidden');
        infoBar.classList.remove('hidden');
        startHigienizationPhase();
        showDialogue(story.higienization);
    } else if (state === GAME_STATE.TREATMENT) {
        mainScreen.classList.remove('hidden');
        mainScreen.classList.add('screen-fade-in');
        mainScreen.style.backgroundImage = `url(assets/background.jpg)`;
        helpIcon.classList.remove('hidden');
        toolPalette.classList.remove('hidden');
        infoBar.classList.remove('hidden');
        startTreatmentPhase();
        showDialogue(story.treatment);
    } else if (state === GAME_STATE.FILLING) {
        mainScreen.classList.remove('hidden');
        mainScreen.classList.add('screen-fade-in');
        mainScreen.style.backgroundImage = `url(assets/background.jpg)`;
        helpIcon.classList.remove('hidden');
        toolPalette.classList.remove('hidden');
        infoBar.classList.remove('hidden');
        startFillingPhase();
        showDialogue(story.filling);
    } else if (state === GAME_STATE.QUIZ) {
        mainScreen.classList.add('hidden');
        mainScreen.classList.remove('screen-fade-out');
        quizScreen.classList.remove('hidden');
        quizScreen.classList.add('screen-fade-in');
        startQuizPhase();
    } else if (state === GAME_STATE.END) {
        endScreen.classList.remove('hidden');
        endScreen.classList.add('screen-fade-in');
    }
    currentState = state;
}

function showDialogue(dialogue) {
    dialogueBox.classList.remove('hidden');
    dialogueText.textContent = dialogue.intro;
    dialogueOptions.innerHTML = '';
    dialogue.options.forEach(option => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = option.text;
        btn.addEventListener('click', () => {
            dialogueBox.classList.add('hidden');
            if (option.nextState.startsWith('dialogue')) {
                showDialogue(story[option.nextState]);
            } else {
                switchScreen(option.nextState);
            }
        });
        dialogueOptions.appendChild(btn);
    });
}

const story = {
    start: {
        intro: "Olá! Eu sou a Dra. Sofia. Vim te mostrar como é divertido cuidar do sorriso. Tudo bem?",
        options: [{
            text: "Sim! Vamos lá!",
            nextState: 'higienization'
        }, {
            text: "Estou com um pouco de medo...",
            nextState: 'dialogue_fear'
        }]
    },
    dialogue_fear: {
        intro: "Não se preocupe, aqui é tudo seguro e sem dor! Vamos começar devagar e aprender a escovar os dentes?",
        options: [{
            text: "Ok, vamos!",
            nextState: 'higienization'
        }]
    },
    higienization: {
        intro: "Agora, pegue a escova na paleta de ferramentas e arraste para limpar a sujeira dos dentes!",
        options: []
    },
    treatment: {
        intro: "Achamos uma pequena cárie. Pegue a broca na paleta de ferramentas e use-a para remover a cárie!",
        options: []
    },
    filling: {
        intro: "Quase lá! Pegue a ferramenta de preenchimento na paleta e segure sobre a área para restaurar o dente!",
        options: []
    }
};

helpIcon.addEventListener('click', () => {
    dialogueBox.classList.add('hidden');
    const instructionsBox = document.createElement('div');
    instructionsBox.classList.add('dialogue-box', 'instructions-overlay');
    instructionsBox.innerHTML = `
        <p id="instructions-text"></p>
        <div id="instructions-options">
            <button class="option-btn">Entendi!</button>
        </div>
    `;
    document.body.appendChild(instructionsBox);

    const instructionsTextElement = instructionsBox.querySelector('#instructions-text');
    const closeInstructionsBtn = instructionsBox.querySelector('.option-btn');

    let instructionsText = '';
    if (currentState === GAME_STATE.START || currentState === GAME_STATE.DIALOGUE) {
        instructionsText = `
            Bem-vindo ao Missão Sorriso!
            <br><br>
            Seu objetivo é transformar o sorriso de uma criança. Siga as instruções para cada etapa do tratamento.
            <br><br>
            **Toque no botão 'Iniciar' para começar a aventura!**
        `;
    } else if (currentState === GAME_STATE.HIGIENIZATION || currentState === GAME_STATE.TREATMENT || currentState === GAME_STATE.FILLING) {
        instructionsText = `
            Este é um jogo sobre saúde bucal!
            <br><br>
            - **Objetivo:** Limpe os dentes, remova a cárie e restaure o sorriso do nosso paciente.
            <br>
            - **Como Jogar:** Use a paleta de ferramentas para selecionar a ferramenta correta para cada etapa.
            <br>
            - **Selecione a ferramenta** e arraste o mouse ou o dedo sobre a área de tratamento para começar a trabalhar.
            <br>
            - **Conclua as 3 etapas** (higienização, tratamento e restauração) e responda um quiz para vencer o jogo!
        `;
    } else if (currentState === GAME_STATE.QUIZ) {
        instructionsText = "Responda as perguntas corretamente! Pense bem antes de escolher a sua resposta.";
    } else {
        instructionsText = "Você já concluiu o jogo! Veja sua pontuação e recomece se quiser."
    }

    instructionsTextElement.innerHTML = instructionsText;

    closeInstructionsBtn.addEventListener('click', () => {
        document.body.removeChild(instructionsBox);
    });
});

function activateTool(toolName) {
    let requiredTool = '';
    if (currentState === GAME_STATE.HIGIENIZATION) requiredTool = 'toothbrush';
    else if (currentState === GAME_STATE.TREATMENT) requiredTool = 'drill';
    else if (currentState === GAME_STATE.FILLING) requiredTool = 'filling';

    if (toolName !== requiredTool) {
        dialogueBox.classList.remove('hidden');
        dialogueText.textContent = "Ferramenta errada! Você precisa da ferramenta correta para esta etapa. Tente novamente.";
        dialogueOptions.innerHTML = `<button class="option-btn" onclick="dialogueBox.classList.add('hidden')">OK</button>`;
        return;
    }

    if (currentTool) {
        document.getElementById(`tool-${currentTool}`).classList.remove('selected');
    }
    currentTool = toolName;
    document.getElementById(`tool-${currentTool}`).classList.add('selected');

    isInteracting = true;
    toolCursor.classList.add('hidden');
    const cursorPath = `url('assets/${toolName === 'toothbrush' ? 'toothbrush.png' : 'dental_tools/' + toolName + '.png'}')`;
    canvas.style.cursor = cursorPath;
    infoBar.classList.add('hidden'); // Oculta a barra de info ao ativar ferramenta
    helpIcon.classList.add('hidden'); // Oculta o ícone de ajuda ao ativar ferramenta
}

function deactivateTool() {
    isInteracting = false;
    isMouseDown = false;
    if (currentTool) {
        document.getElementById(`tool-${currentTool}`).classList.remove('selected');
    }
    currentTool = '';
    canvas.style.cursor = 'auto';
    infoBar.classList.remove('hidden'); // Mostra a barra de info ao desativar ferramenta
    helpIcon.classList.remove('hidden'); // Mostra o ícone de ajuda ao desativar ferramenta
}

// Adiciona os event listeners para as ferramentas
toolBrushIcon.addEventListener('click', () => activateTool('toothbrush'));
toolDrillIcon.addEventListener('click', () => activateTool('drill'));
toolFillingIcon.addEventListener('click', () => activateTool('filling'));

function startHigienizationPhase() {
    generateDirt();
}

function generateDirt() {
    dirt = [];
    const DIRT_COUNT = 20;
    for (let i = 0; i < DIRT_COUNT; i++) {
        const randomIndex = Math.floor(Math.random() * carieImages.length);
        const image = assets[carieImages[randomIndex]];
        dirt.push({
            x: toothBoundingBox.x + Math.random() * toothBoundingBox.width,
            y: toothBoundingBox.y + Math.random() * toothBoundingBox.height,
            radius: 5 + Math.random() * 5,
            image: image,
            width: 30,
            height: 30
        });
    }
}

function startTreatmentPhase() {
    generateCavity();
}

function startFillingPhase() {
    // A cárie já foi removida, a lógica de preenchimento vai usar a mesma posição
}

function generateCavity() {
    cavity.x = toothBoundingBox.x + toothBoundingBox.width / 2;
    cavity.y = toothBoundingBox.y + toothBoundingBox.height / 2;
    cavity.radius = 25 + Math.random() * 10;
    cavity.damage = 100;
    cavity.filled = 0;
    const randomIndex = Math.floor(Math.random() * carieImages.length);
    cavity.image = assets[carieImages[randomIndex]];
}

function shuffleAndSelect(array, num) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.slice(0, num);
}

function startQuizPhase() {
    helpIcon.classList.remove('hidden');
    deactivateTool();
    toolPalette.classList.add('hidden');
    infoBar.classList.add('hidden');

    selectedQuizQuestions = shuffleAndSelect(quizQuestions, 10);
    currentQuizQuestionIndex = 0;
    quizCorrectAnswers = 0;
    showQuizQuestion();
}

function showQuizQuestion() {
    if (currentQuizQuestionIndex >= selectedQuizQuestions.length) {
        endQuiz();
        return;
    }

    quizContainer.classList.remove('hidden');

    const currentQuestion = selectedQuizQuestions[currentQuizQuestionIndex];

    quizQuestionText.textContent = `Pergunta ${currentQuizQuestionIndex + 1} de ${selectedQuizQuestions.length}: ${currentQuestion.question}`;
    quizOptionsContainer.innerHTML = '';

    const shuffledOptions = shuffleAndSelect(currentQuestion.options, currentQuestion.options.length);

    shuffledOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.classList.add('quiz-btn');
        btn.addEventListener('click', () => {
            checkAnswer(btn, option === currentQuestion.answer);
        });
        quizOptionsContainer.appendChild(btn);
    });
}

function checkAnswer(selectedBtn, isCorrect) {
    const allBtns = document.querySelectorAll('.quiz-btn');
    allBtns.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        selectedBtn.style.backgroundColor = '#4CAF50';
        score += 50;
        quizCorrectAnswers++;
    } else {
        selectedBtn.style.backgroundColor = '#F44336';
        const correctBtn = Array.from(allBtns).find(btn => btn.textContent === selectedQuizQuestions[currentQuizQuestionIndex].answer);
        if (correctBtn) correctBtn.style.backgroundColor = '#4CAF50';
    }

    scoreDisplay.textContent = `Pontos: ${score}`;

    setTimeout(() => {
        currentQuizQuestionIndex++;
        showQuizQuestion();
    }, 1500);
}

function endQuiz() {
    quizContainer.classList.add('hidden');
    switchScreen(GAME_STATE.END);

    endScreen.innerHTML = `
        <div class="end-card">
            <h1 id="end-title" class="end-title">Parabéns! Missão Concluída!</h1>
            <p class="end-text">Você transformou o sorriso de uma criança e aprendeu muito sobre saúde bucal.</p>
            <div class="score-container">
                <p>Pontuação Total: <b>${score}</b></p>
                <p>Acertos no Quiz: <b>${quizCorrectAnswers}/${selectedQuizQuestions.length}</b></p>
            </div>
            <div class="end-buttons">
                <a href="index.html" class="main-btn">Voltar para a Página Inicial</a>
                <button id="quiz-again-btn" class="main-btn">Jogar o Quiz Novamente</button>
            </div>
        </div>
    `;

    document.getElementById('quiz-again-btn').addEventListener('click', () => {
        score = 0;
        quizCorrectAnswers = 0;
        scoreDisplay.textContent = 'Pontos: 0';
        deactivateTool();
        switchScreen(GAME_STATE.START);
    });

    deactivateTool();
}

/**
 * Obtém as coordenadas X e Y do evento, seja de mouse ou toque.
 * O scaling é feito aqui para que as coordenadas de interação correspondam às coordenadas lógicas do canvas.
 * @param {Event} event O evento do mouse ou toque.
 * @returns {{x: number, y: number}} As coordenadas ajustadas para o espaço lógico do canvas.
 */
function getCoords(event) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const scaledX = (x / rect.width) * GAME_WIDTH;
    const scaledY = (y / rect.height) * GAME_HEIGHT;

    return {
        x: scaledX,
        y: scaledY
    };
}


function handleInteraction(e) {
    if (!isInteracting || !isMouseDown) return;

    const coords = getCoords(e);
    const mouseX = coords.x;
    const mouseY = coords.y;

    if (currentState === GAME_STATE.HIGIENIZATION && currentTool === 'toothbrush') {
        for (let i = dirt.length - 1; i >= 0; i--) {
            const d = dirt[i];
            const distance = Math.sqrt(Math.pow(mouseX - d.x, 2) + Math.pow(mouseY - d.y, 2));
            if (distance < d.radius + 15) {
                dirt.splice(i, 1);
                score += 10;
                scoreDisplay.textContent = `Pontos: ${score}`;
            }
        }
        if (dirt.length === 0) {
            deactivateTool();
            dialogueBox.classList.remove('hidden');
            dialogueText.textContent = "Uau, dentes limpos! Agora vamos ver se tem algo mais...";
            dialogueOptions.innerHTML = `<button class="option-btn" onclick="dialogueBox.classList.add('hidden'); switchScreen(GAME_STATE.TREATMENT);">Continuar</button>`;
        }
    } else if (currentState === GAME_STATE.TREATMENT && currentTool === 'drill') {
        const distance = Math.sqrt(Math.pow(mouseX - cavity.x, 2) + Math.pow(mouseY - cavity.y, 2));
        if (distance < cavity.radius + 15 && cavity.damage > 0) {
            cavity.damage -= 2;
            score += 2;
            scoreDisplay.textContent = `Pontos: ${score}`;
        }
        if (cavity.damage <= 0) {
            deactivateTool();
            dialogueBox.classList.remove('hidden');
            dialogueText.textContent = "Cárie removida! O dente está pronto para ser preenchido.";
            dialogueOptions.innerHTML = `<button class="option-btn" onclick="dialogueBox.classList.add('hidden'); switchScreen(GAME_STATE.FILLING);">Continuar</button>`;
        }
    } else if (currentState === GAME_STATE.FILLING && currentTool === 'filling') {
        const distance = Math.sqrt(Math.pow(mouseX - cavity.x, 2) + Math.pow(mouseY - cavity.y, 2));
        if (distance < cavity.radius + 15 && cavity.filled < 100) {
            cavity.filled += 3;
            score += 3;
            scoreDisplay.textContent = `Pontos: ${score}`;
        }
        if (cavity.filled >= 100) {
            deactivateTool();
            dialogueBox.classList.remove('hidden');
            dialogueText.textContent = "Perfeito! Dente restaurado e brilhando!";
            dialogueOptions.innerHTML = `<button class="option-btn" onclick="dialogueBox.classList.add('hidden'); switchScreen(GAME_STATE.QUIZ);">Continuar</button>`;
        }
    }
}

function handleMouseUp() {
    isMouseDown = false;
}

function draw() {
    if (!assetsLoaded) {
        requestAnimationFrame(draw);
        return;
    }

    // Lógica de redimensionamento do canvas
    const isMobile = window.innerWidth <= 768;
    const finalWidth = isMobile ? 540 : 960;
    const finalHeight = isMobile ? 960 : 540;

    canvas.width = finalWidth;
    canvas.height = finalHeight;

    ctx.clearRect(0, 0, finalWidth, finalHeight);

    // Posições dos personagens para desktop e mobile
    const dentistPos = isMobile ? {
        x: 20,
        y: 20,
        width: 150,
        height: 225
    } : {
        x: 50,
        y: 250,
        width: 200,
        height: 300
    };
    const childPos = isMobile ? {
        x: finalWidth - 150 - 20,
        y: 20,
        width: 150,
        height: 225
    } : {
        x: 550,
        y: 250,
        width: 200,
        height: 300
    };
    
    // Reposiciona o dente para o centro da nova tela
    const toothImageWidth = 120 * 2;
    const toothImageHeight = 80 * 2;
    const toothBoundingBox = {
        x: (finalWidth / 2) - (toothImageWidth / 2),
        y: (finalHeight / 2) - (toothImageHeight / 2),
        width: toothImageWidth,
        height: toothImageHeight
    };

    if (assets['character_dentist.png']) {
        ctx.drawImage(assets['character_dentist.png'], dentistPos.x, dentistPos.y, dentistPos.width, dentistPos.height);
    }
    if (assets['character_child.png']) {
        ctx.drawImage(assets['character_child.png'], childPos.x, childPos.y, childPos.width, childPos.height);
    }

    if (currentState === GAME_STATE.HIGIENIZATION) {
        if (assets['tooth_model.png']) {
            ctx.drawImage(assets['tooth_model.png'], toothBoundingBox.x, toothBoundingBox.y, toothBoundingBox.width, toothBoundingBox.height);
        }

        dirt.forEach(d => {
            if (d.image) {
                ctx.drawImage(d.image, d.x - d.width / 2, d.y - d.height / 2, d.width, d.height);
            }
        });
    }

    if (currentState === GAME_STATE.TREATMENT || currentState === GAME_STATE.FILLING) {
        if (assets['tooth_model.png']) {
            ctx.drawImage(assets['tooth_model.png'], toothBoundingBox.x, toothBoundingBox.y, toothBoundingBox.width, toothBoundingBox.height);
        }

        if (cavity.damage > 0 && cavity.image) {
            const opacity = cavity.damage / 100;
            ctx.save();
            ctx.globalAlpha = opacity;
            const imgWidth = cavity.radius * 2 * 1.5;
            const imgHeight = cavity.radius * 2 * 1.5;
            ctx.drawImage(cavity.image, cavity.x - imgWidth / 2, cavity.y - imgHeight / 2, imgWidth, imgHeight);
            ctx.restore();
        }

        if (cavity.damage > 0 || (currentState === GAME_STATE.FILLING && cavity.filled < 100)) {
            const guideColor = currentState === GAME_STATE.TREATMENT ? 'rgba(255, 255, 255, 0.3)' : 'rgba(180, 255, 180, 0.5)';
            ctx.fillStyle = guideColor;
            ctx.beginPath();
            ctx.arc(cavity.x, cavity.y, cavity.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        if (currentState === GAME_STATE.FILLING && cavity.filled > 0) {
            const fillRadius = cavity.radius * (cavity.filled / 100);
            ctx.fillStyle = `rgba(180, 255, 180, 1)`;
            ctx.beginPath();
            ctx.arc(cavity.x, cavity.y, fillRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    requestAnimationFrame(draw);
}

// Inicialização e Event Listeners
startBtn.addEventListener('click', () => {
    switchScreen(GAME_STATE.DIALOGUE);
});

// Eventos do Mouse
canvas.addEventListener('mousemove', (e) => {
    if (isInteracting) {
        handleInteraction(e);
    }
});

canvas.addEventListener('mousedown', () => {
    if (isInteracting) {
        isMouseDown = true;
    }
});

canvas.addEventListener('mouseup', () => {
    handleMouseUp();
});

// Eventos de Toque
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isInteracting) {
        handleInteraction(e);
    }
}, { passive: false });

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (isInteracting) {
        isMouseDown = true;
        handleInteraction(e);
    }
}, { passive: false });

canvas.addEventListener('touchend', () => {
    handleMouseUp();
});

initGame();

function initGame() {
    const screens = [loadingScreen, startScreen, mainScreen, quizScreen, endScreen];
    screens.forEach(s => s.classList.add('hidden'));
    loadingScreen.classList.remove('hidden');

    loadAssets();
}
