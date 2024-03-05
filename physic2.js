let area = document.querySelector('.area');
let hero = document.querySelector('.hero');
let aim = document.querySelector('.aim');
let circle = document.querySelector('.circle');
let stick = document.querySelector('.stick');
let shot = document.querySelector('.shot');
let score = document.querySelector('.score');
let audio = document.querySelector('.audio');
let time = document.querySelector('.time');
hero.style.left = area.offsetWidth/2 - hero.offsetWidth/2 + 'px';
hero.style.top = area.offsetHeight/2 - hero.offsetHeight/2 + 'px';
let areaCoords = area.getBoundingClientRect();
let areaXcenterWindow = areaCoords.x + areaCoords.width/2;
let areaYcenterWindow = areaCoords.y + areaCoords.height/2;
let circleCoords = circle.getBoundingClientRect();
let circleXcenterWindow = circleCoords.x + circleCoords.width/2;
let circleYcenterWindow = circleCoords.y + circleCoords.height/2;
let diagonalLength = 0;
let speedHero = 1.5;
let speedAutoMove = speedHero / 4;
let dx;
let dy;
let allEnemy;
let speedEnemy = 1;
// таймер по истечению которого увеличивается скорость врагов
let timer = 50;
// i служит индексом для работы с каждым врагом в процессе
  let i = 0;

let heroObj = {
  x: area.offsetWidth/2 - hero.offsetWidth/2,
  y: area.offsetHeight/2 - hero.offsetHeight/2,
  rotate: 0,
  move(x, y) {
    if (this.x + hero.offsetWidth > areaCoords.right) {
      this.x = areaCoords.right - hero.offsetWidth;
    } 
    if (this.x < areaCoords.left) {
      this.x = 1;
    }
    if (this.y < areaCoords.top) {
      this.y = 1;
    }
    if (this.y + hero.offsetHeight > areaCoords.bottom) {
      this.y = areaCoords.bottom - hero.offsetHeight;
    } 
    
    this.x += x * speedHero;
    this.y += y * speedHero;
    
    hero.style.left = this.x + 'px';
    hero.style.top = this.y + 'px';
  },
  rotateAngle(angle) {
    this.rotate += angle - this.rotate;
    hero.style.transform = `rotate(${this.rotate}deg)`;
  },
}

let enemyObj = {
  create (x, y, turbo) {
  enemy = document.createElement('span');
  enemy.classList.add('enemy');
  enemy.style.left = x + 'px';
  enemy.style.top = y + 'px';
  if (turbo > 1) {
    enemy.style.background = 'red';
  }
  // нестандартный атрибут data передает скорость врага
  enemy.setAttribute('data-speed', speedEnemy*turbo);
  area.insertAdjacentElement('beforeend', enemy);
  }
}

// функция возвращающая координаты возрождения врага, с проверкой на область вокруг героя(рекурсия)
function random () {
  let turbo = 1;
  let x = Math.random() * areaCoords.width - 20; // 20 - half enemy
  let y = Math.random() * areaCoords.bottom - 20; // 20 - half enemy
  if (x > (heroObj.x - 50) && x < (heroObj.x + 50) && y > (heroObj.y - 50) && y < (heroObj.y + 50)) {
    return random();
  }
  if (Math.abs(x - heroObj.x) > 100) {
    turbo = 4;
  }
  return [x, y, turbo];
}

// создаем врагов
let enemyMovings = []; // координаты врагов
for (let i = 0; i < 3; i += 1) {
  let xy = random();
  enemyObj.create(xy[0], xy[1], xy[2]);
  enemyMovings.push([xy[0], xy[1]])
}

function enemyMove (x, y, el) {
    enemyMovings[i][0] += x*el.dataset.speed;
    enemyMovings[i][1] += y*el.dataset.speed;
    
    el.style.left = enemyMovings[i][0] + 'px';
    el.style.top = enemyMovings[i][1] + 'px';
}

// получаем длинну диагонали от A до B
function calculateDiagonal (xA, yA, xB, yB) {
  let a = Math.abs(xA - xB);
  let b = Math.abs(yA - yB);
  //diagonalLength = Math.sqrt(a*a + b*b);
  return Math.sqrt(a*a + b*b);
}

// используется для вычисления направления объекта относительно какого-либо центра 
function fromCenterMove (x, y, centerX, centerY) {
  dx = x - centerX;
  dy = y - centerY;
  
  let catangens = Math.atan2(dy, dx);
  let heroDx = Math.cos(catangens) * speedAutoMove;
  let heroDy = Math.sin(catangens) * speedAutoMove;
  
  return [heroDx, heroDy, catangens];
}

// высчитываем градус поворота стика и передаем его герою
function calculateAngleHero (catangens) {
  let angle = (catangens * 180) / Math.PI;
  if (angle < 0) angle += 360;
  
  heroObj.rotateAngle(angle);
}

// заданм расположение стика
function calculateStickMove (x, y, catangens) {
  let dr = circle.offsetWidth/2 - stick.offsetWidth/2;
  if (diagonalLength < 35) {
    // calculate new coords stick
    dx = x - circleCoords.x - stick.offsetWidth / 2;
    dy = y - circleCoords.y - stick.offsetHeight / 2;
  } else {
    dx = Math.cos(catangens)*dr + dr;
    dy = Math.sin(catangens)*dr + dr;
  } 
  
  stick.style.left = dx + 'px';
  stick.style.top = dy + 'px';
}

// создаем пулю
function createBullet () {
  bullet = document.createElement('span');
  bullet.classList.add('bullet');
  bullet.style.transform = `rotate(${heroObj.rotate}deg)`;
  bullet.style.left = heroObj.x + 10 + 'px';
  bullet.style.top = heroObj.y + 10 + 'px';
  area.insertAdjacentElement('beforeend', bullet);
  bulletX = heroObj.x + 10;
  bulletY = heroObj.y + 10;
}

// переменные пули(сама пуля, её x и y, проверка на пулю в настоящий момент на арене)
let bullet;
let bulletX = 0;
let bulletY = 0;
let bulletCheck = false;

// полет пули, столкновение с ареной и скорость
function skyBullet (x, y) {
 if (bulletX > areaCoords.right) {
      bulletCheck = false;
      bullet.remove();
    } 
    if (bulletX < areaCoords.left) {
      bulletCheck = false;
      bullet.remove();
    }
    if (bulletY < areaCoords.top) {
      bulletCheck = false;
      bullet.remove();
    }
    if (bulletY > areaCoords.bottom) {
      bulletCheck = false;
      bullet.remove();
    } 
    
    bulletX += x*7;
    bulletY += y*7;
    
    bullet.style.left = bulletX + 'px';
    bullet.style.top = bulletY + 'px';
}


// координаты на момент выстрела, чтобы пули не меняла траекторию ввиду даижения героя
let bulletDirectoryX = 0;
let bulletDirectoryY = 0;

// процесс
let process;
process = setInterval(() => {
  // если стик упирается в окружность, то включаем автоход герою
  if (diagonalLength >= 35) {
    let stickCoords = stick.getBoundingClientRect();
    
    [heroDx, heroDy] = fromCenterMove (stickCoords.x + stickCoords.width/2, stickCoords.y + stickCoords.height/2, circleXcenterWindow, circleYcenterWindow);
    
    heroObj.move(heroDx, heroDy);
  }
  
  // работа с врагами
  allEnemy = area.querySelectorAll('.enemy');
  for (let el of allEnemy) {
    let metr = el.getBoundingClientRect();
    [enemyDX, enemyDY] = fromCenterMove (heroObj.x, heroObj.y, metr.x, metr.y);
    enemyMove(enemyDX/10, enemyDY/10, el);
    
    if (bulletX < metr.right && bulletX > metr.x && bulletY > metr.y && bulletY < metr.bottom) {
      el.remove();
      bulletCheck = false;
      bullet.remove();
      bulletX = 0;
      bulletY = 0;
      enemyMovings.splice(i, 1);
      
      let coords = random();
      
      enemyMovings.push([coords[0], coords[1]])
      enemyObj.create(coords[0], coords[1], coords[2]);
      
       score.innerHTML = +score.innerHTML + 1;
    }
    i += 1;
    // проверка на столкновение с героем
    if (calculateDiagonal(metr.x, metr.y, heroObj.x, heroObj.y) < 33) {
        clearInterval(process);
      alert(`Fail. Result: ${score.innerHTML}`);
      location.reload();
    }
  }
  i = 0;
  
  // полет пули
  if (bulletCheck) {
     skyBullet (bulletDirectoryX, bulletDirectoryY);
  }
  
  timer -= 0.01
  time.innerHTML = timer.toFixed(0);
  if (timer <= 0) {
    speedEnemy += 0.2;
    timer = 50;
  }
}, 0)

// events listener
  stick.addEventListener('touchmove', (event) => {
    event.preventDefault();
    let touch = event.targetTouches[0];
   
    [heroDx, heroDy, catangens] = fromCenterMove (touch.clientX, touch.clientY, circleXcenterWindow, circleYcenterWindow);
  
    diagonalLength = calculateDiagonal (touch.clientX, touch.clientY, circleXcenterWindow, circleYcenterWindow)
    calculateAngleHero (catangens);
    calculateStickMove (touch.clientX, touch.clientY, catangens);
  })

stick.addEventListener('touchend', (event) => {
    event.preventDefault();
    stick.style.left = circle.offsetWidth/2 - stick.offsetWidth/2 + 'px';
    stick.style.top = circle.offsetHeight/2 - stick.offsetHeight/2 + 'px';
    
    diagonalLength = 0;
})

shot.addEventListener('touchstart', (event) => {
  event.preventDefault();
  
  if (!bulletCheck) {
    audio.play();
    audio.currentTime = 0;
  // получаем метрики прицела, вычисляем координаты траектории для пули
    let aimCoords = aim.getBoundingClientRect();
     [bulletDx, bulletDy] = fromCenterMove (aimCoords.x, aimCoords.y, heroObj.x+10, heroObj.y+10);
  
  // сохраняем полученные координаты траектории пули в отдельных переменных для того, чтобы траектория не менялась при перемещении героя
    bulletDirectoryX = bulletDx;
    bulletDirectoryY = bulletDy;
  
    bulletCheck = true;
    createBullet();
  }
})
