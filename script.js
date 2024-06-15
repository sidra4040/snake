const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

//declarando variáveis do HTML que serão mudadas (placar, botão, etc)
const score = document.querySelector(".score--value");
const finalScore = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const buttonPlay = document.querySelector(".btn-play");
const speed = document.querySelector(".speed--value");

//definir o áudio
const audio = new Audio("../assets/audio.mp3");

//definir velocidade
let velocidade = 200;

//definir tamanho padrão
const size = 30;

//definir posição inicial
const initialPosition = { x: 300, y: 300 };

//criar a cobrinha
let snake = [initialPosition];

//aumentar pontuação
const incrementScore = () => {
  score.innerText = +score.innerText + snake.length;
};

const incrementSpeed = () => {
  speed.innerText = velocidade.toFixed(0);
};

//gerar número aleatório
const randomNumber = (min, max) => {
  return Math.round(Math.random() * (max - min) + min);
};

//gerar posição aleatória da comida
const randomPosition = () => {
  const number = randomNumber(0, canvas.width - size);
  return Math.round(number / 30) * 30;
};

//gerar cor aleatória
const randomColor = () => {
  const red = randomNumber(128, 255);
  const green = randomNumber(128, 255);
  const blue = randomNumber(100, 255);

  return `rgb(${red}, ${green}, ${blue})`;
};

//criar a comida
const food = {
  x: randomPosition(),
  y: randomPosition(),
  color: randomColor(),
};

//definir direção
let direction;
let loopId;

//desenhar a comida
const drawFood = () => {
  const { x, y, color } = food;

  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
  ctx.shadowBlur = 0;
};

//desenhar a cobrinha
const drawSnake = () => {
  ctx.fillStyle = "#ddd";

  snake.forEach((position, index) => {
    if (index == snake.length - 1) {
      ctx.fillStyle = "white";
    }

    ctx.fillRect(position.x, position.y, size, size);
  });

  //ctx.fillRect(snake[0].x, snake[0].y, size, size);
};

//mover a cobrinha
const moveSnake = () => {
  if (!direction) return;

  const head = snake[snake.length - 1];

  if (direction == "right") {
    snake.push({ x: head.x + size, y: head.y }); //push() adiciona um objeto ao array
  }

  if (direction == "left") {
    snake.push({ x: head.x - size, y: head.y }); //push() adiciona um objeto ao array
  }

  if (direction == "up") {
    snake.push({ x: head.x, y: head.y - size }); //push() adiciona um objeto ao array
  }

  if (direction == "down") {
    snake.push({ x: head.x, y: head.y + size }); //push() adiciona um objeto ao array
  }
  snake.shift(); //shift() remove o primeiro elemento do array
};

//desenhar o grid
const drawGrid = () => {
  ctx.lineWidth = 1; //espessura da linha
  ctx.strokeStyle = "#282828"; //cor da linha
  //for para desenhar as linhas do grid
  for (let i = 30; i < canvas.width; i += 30) {
    ctx.beginPath();
    ctx.lineTo(i, 0);
    ctx.lineTo(i, 600);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineTo(0, i);
    ctx.lineTo(600, i);
    ctx.stroke();
  }
};

//verificar se a cobrinha comeu a comida
const checkEat = () => {
  const head = snake[snake.length - 1];

  if (head.x == food.x && head.y == food.y) {
    snake.push(head);
    audio.play();
    incrementScore();
    incrementSpeed();

    //declarar variáveis de posição para verificar se não estão no meio da cobrinha
    let x = randomPosition();
    let y = randomPosition();

    //loop que fica verificando se a posição de X e Y não estão conflitando com a cobrinha
    while (snake.find((position) => position.x == x && position.y == y)) {
      x = randomPosition();
      y = randomPosition();
    }

    food.x = x;
    food.y = y;
    food.color = randomColor();

    velocidade = velocidade > 95 ? velocidade * (1 - 0.01 * snake.length) : 80;
  }
};

//verificar colisões
const checkCollision = () => {
  const head = snake[snake.length - 1];
  const canvasLimit = canvas.width - size;
  const neckIndex = snake.length - 2;

  const wallCollision =
    head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit;

  const selfCollision = snake.find((position, index) => {
    return index < neckIndex && position.x == head.x && position.y == head.y;
  });

  if (wallCollision || selfCollision) {
    gameOver();
  }
};

//função de game over
const gameOver = () => {
  direction = undefined;

  menu.style.display = "flex";
  finalScore.innerText = score.innerText;
  canvas.style.filter = "blur(4px)";

  //cria uma nova instância do jogo para tirar bug
  //de continuar jogando quando dá game over
  new gameLoop();
};

//criar a animação
const gameLoop = () => {
  clearInterval(loopId); //limpa a sequencia de loops para não sobrecarregar a memória

  ctx.clearRect(0, 0, 600, 600); //limpa a tela
  drawGrid(); //desenha o grid
  drawFood(); //desenha a comida
  drawSnake(); //desenha a cobrinha
  moveSnake(); //move a cobrinha
  checkEat(); //verifica se a cobrinha comeu a comida
  checkCollision(); //verifica a colisão

  loopId = setTimeout(() => {
    gameLoop();
  }, velocidade); // colocada dentro de uma variável loopId para poder ser chamada na hora de limpar
};

//captura do pressionamento das teclas
document.addEventListener("keydown", ({ key }) => {
  if (key == "ArrowRight" && direction != "left") {
    direction = "right";
  }

  if (key == "ArrowLeft" && direction != "right") {
    direction = "left";
  }

  if (key == "ArrowUp" && direction != "down") {
    direction = "up";
  }

  if (key == "ArrowDown" && direction != "up") {
    direction = "down";
  }
});

//botão jogar novamente
buttonPlay.addEventListener("click", () => {
  //zera as propriedades e placar
  score.innerText = "00";
  speed.innerText = "220";
  menu.style.display = "none";
  canvas.style.filter = "none";

  //volta cobrinha e comida para posição inicial
  snake = [initialPosition];
  food.x = randomPosition();
  food.y = randomPosition();
  food.color = randomColor();

  //zera a direção e reinicia a função do jogo
  direction = undefined;
  gameLoop();
});

//chama a função principal do jogo
gameLoop();
