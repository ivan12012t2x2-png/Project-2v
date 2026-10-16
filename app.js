/* =========================================================
   app.js — вся логика приложения «КодоПуть»
   ========================================================= */

/* ---------- 1. ДАННЫЕ УРОКОВ ---------- */
const LESSONS = [
  {
    id: 1,
    title: "Что такое алгоритм",
    subtitle: "Порядок имеет значение",
    emoji: "📜",
    theory: "Алгоритм — это чёткая последовательность шагов для решения задачи. Представь, что ты робот: чтобы сделать бутерброд, нужны конкретные команды в правильном порядке.",
    example: "1. Взять хлеб\n2. Намазать масло\n3. Положить сыр\n4. Накрыть вторым хлебом",
    task: {
      type: "order",
      question: "Расставь шаги алгоритма «Утренняя зарядка» по порядку:",
      hint: "Сначала мы просыпаемся, в конце — умываемся. Подумай о логике.",
      items: ["Открыть глаза", "Встать с кровати", "Сделать зарядку", "Умыться"],
      correct: ["Открыть глаза", "Встать с кровати", "Сделать зарядку", "Умыться"]
    }
  },
  {
    id: 2,
    title: "Команды робота",
    subtitle: "Читаем код сверху вниз",
    emoji: "🤖",
    theory: "Компьютер выполняет команды строго по порядку — сверху вниз. Если поменять строки местами, робот сделает не то, что ты задумал.",
    example: "двигаться_вперёд()\nповернуть_налево()\nдвигаться_вперёд()",
    task: {
      type: "choice",
      question: "Робот стоит лицом на север. Что он сделает после этого кода?",
      code: "повернуть_направо()\nдвигаться_вперёд()",
      hint: "Поворот направо от севера — это восток. Затем робот идёт вперёд.",
      choices: ["Повернётся на восток и сделает шаг", "Повернётся на запад и сделает шаг", "Сделает шаг на север", "Ничего не произойдёт"],
      correctIndex: 0
    }
  },
  {
    id: 3,
    title: "Найди ошибку",
    subtitle: "Отладка как у профи",
    emoji: "🔍",
    theory: "Ошибка в алгоритме — это неправильный шаг или неправильный порядок. Программисты называют поиск ошибок «отладкой». Давай потренируемся!",
    example: "Алгоритм «Помыть руки»:\n1. Открыть кран\n2. Намылить руки\n3. Закрыть кран\n4. Вытереть руки\n❌ Ошибка: кран закрыт слишком рано",
    task: {
      type: "choice",
      question: "Что не так в алгоритме «Почистить зубы»?",
      code: "1. Взять щётку\n2. Нанести пасту\n3. Почистить зубы\n4. Открыть кран и намочить щётку",
      hint: "Щётку надо намочить ДО того, как чистить зубы.",
      choices: ["Шаг 2 лишний", "Шаг 4 стоит не на своём месте", "Нужно чистить зубы 10 минут", "Всё верно"],
      correctIndex: 1
    }
  }
];

/* ---------- 2. СОСТОЯНИЕ ---------- */
let state = {
  currentLesson: 0,
  completed: [],
  score: 0,
  attempts: {},
  onboardStep: 0
};

try {
  const saved = localStorage.getItem('kodoput_state');
  if (saved) state = Object.assign({}, state, JSON.parse(saved));
} catch (e) { console.warn('Не удалось загрузить прогресс', e); }

function save() {
  try { localStorage.setItem('kodoput_state', JSON.stringify(state)); } catch (e) {}
}

/* ---------- 3. НАВИГАЦИЯ ---------- */
function show(id) {
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

/* ---------- 4. ОНБОРДИНГ ---------- */
const ONBOARD = [
  { em: "👋", title: "Привет!", text: "Я — робот Коди. Помогу тебе освоить алгоритмы за 3 коротких урока." },
  { em: "📚", title: "Как проходить уроки", text: "В каждом уроке: короткая теория, пример и практическое задание. Читай внимательно!" },
  { em: "⭐", title: "Зарабатывай очки", text: "За правильные ответы даю очки. Ошибся — не страшно: есть подсказка и вторая попытка." },
  { em: "🏆", title: "Собирай значки", text: "Пройди все 3 урока и получи награду «Алгоритмист-новичок». Готов? Погнали!" }
];

function startOnboarding() {
  state.onboardStep = 0;
  renderOnboard();
  show('screen-onboard');
}

function renderOnboard() {
  const step = ONBOARD[state.onboardStep];
  document.getElementById('onboard-content').innerHTML =
    '<div class="em">' + step.em + '</div>' +
    '<h2>' + step.title + '</h2>' +
    '<p>' + step.text + '</p>' +
    '<div style="margin-top:24px; color:#555; font-size:13px;">Шаг ' + (state.onboardStep + 1) + ' из ' + ONBOARD.length + '</div>';
  document.getElementById('onboard-next').textContent =
    state.onboardStep === ONBOARD.length - 1 ? "Начать! 🚀" : "Далее";
}

function nextOnboard() {
  state.onboardStep++;
  if (state.onboardStep >= ONBOARD.length) goMap();
  else renderOnboard();
}

/* ---------- 5. КАРТА УРОКОВ ---------- */
function goMap() {
  renderMap();
  show('screen-map');
}

function renderMap() {
  document.getElementById('map-score').textContent = state.score;
  document.getElementById('map-badges').textContent = state.completed.length;

  const pct = (state.completed.length / LESSONS.length) * 100;
  document.getElementById('map-progress').style.width = pct + '%';
  document.getElementById('map-progress-label').textContent =
    state.completed.length + ' / ' + LESSONS.length + ' уроков';

  const list = document.getElementById('lessons-list');
  list.innerHTML = '';

  LESSONS.forEach(function(lesson, idx) {
    const isDone = state.completed.indexOf(lesson.id) !== -1;
    const isUnlocked = idx === 0 || state.completed.indexOf(LESSONS[idx - 1].id) !== -1;
    const isCurrent = isUnlocked && !isDone;

    let cls = 'lesson-card';
    if (isDone) cls += ' done';
    else if (isCurrent) cls += ' current';
    else if (!isUnlocked) cls += ' locked';

    const card = document.createElement('div');
    card.className = cls;
    card.innerHTML =
      '<div class="lesson-num">' + (isDone ? '✓' : lesson.id) + '</div>' +
      '<div class="lesson-info">' +
        '<div class="title">' + lesson.emoji + ' ' + lesson.title + '</div>' +
        '<div class="sub">' + (isDone ? 'Пройден · нажми, чтобы повторить' : (isUnlocked ? lesson.subtitle : '🔒 Заблокирован')) + '</div>' +
      '</div>';

    if (isUnlocked) {
      card.onclick = (function(i) { return function() { openLesson(i); }; })(idx);
    }
    list.appendChild(card);
  });

  if (state.completed.length === LESSONS.length) {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = '🎉 Завершить модуль';
    btn.onclick = showFinal;
    list.appendChild(btn);
  }
}

/* ---------- 6. УРОК ---------- */
function openLesson(idx) {
  state.currentLesson = idx;
  renderLesson();
  show('screen-lesson');
}

function renderLesson() {
  const lesson = LESSONS[state.currentLesson];
  document.getElementById('lesson-title-bar').textContent = 'Урок ' + lesson.id + ': ' + lesson.title;
  document.getElementById('lesson-score').textContent = state.score;

  const content = document.getElementById('lesson-content');
  const actions = document.getElementById('lesson-actions');
  actions.innerHTML = '';

  let html =
    '<div class="theory-box"><b>' + lesson.emoji + ' ' + lesson.title + '</b><br><br>' + lesson.theory + '</div>' +
    '<div class="code-box">' + lesson.example + '</div>' +
    '<div class="question">' + lesson.task.question + '</div>';

  if (lesson.task.type === 'order') {
    html += '<div class="order-list" id="order-list"></div>';
  } else if (lesson.task.type === 'choice') {
    if (lesson.task.code) html += '<div class="code-box">' + lesson.task.code + '</div>';
    html += '<div class="choices" id="choices"></div>';
  }

  html += '<div class="feedback" id="feedback"></div>';
  content.innerHTML = html;

  if (lesson.task.type === 'order') renderOrderTask(lesson.task);
  if (lesson.task.type === 'choice') renderChoiceTask(lesson.task);

  const btnCheck = document.createElement('button');
  btnCheck.className = 'btn';
  btnCheck.textContent = '✓ Проверить';
  btnCheck.id = 'btn-check';
  btnCheck.onclick = checkAnswer;
  actions.appendChild(btnCheck);

  const row = document.createElement('div');
  row.className = 'row';

  const btnHint = document.createElement('button');
  btnHint.className = 'btn secondary small';
  btnHint.style.flex = '1';
  btnHint.textContent = '💡 Подсказка';
  btnHint.onclick = showHint;
  row.appendChild(btnHint);

  const btnRetry = document.createElement('button');
  btnRetry.className = 'btn secondary small';
  btnRetry.style.flex = '1';
  btnRetry.textContent = '🔁 Ещё раз';
  btnRetry.onclick = function() { renderLesson(); };
  row.appendChild(btnRetry);

  actions.appendChild(row);

  if (state.completed.indexOf(lesson.id) !== -1) {
    const b = document.createElement('button');
    b.className = 'btn secondary';
    b.textContent = '← К карте уроков';
    b.onclick = goMap;
    actions.appendChild(b);
  }

  const bar = document.createElement('div');
  bar.className = 'progress-wrap';
  bar.innerHTML =
    '<div class="progress-bar"><div class="progress-fill" style="width:' + (state.completed.length / LESSONS.length) * 100 + '%"></div></div>' +
    '<div class="progress-label">Прогресс модуля: ' + state.completed.length + '/' + LESSONS.length + '</div>';
  content.appendChild(bar);

  save();
}

/* ---------- 7. ЗАДАНИЕ: ПОРЯДОК ---------- */
let orderItems = [];

function renderOrderTask(task) {
  const list = document.getElementById('order-list');
  if (!list.dataset.initialized) {
    orderItems = task.items.slice().sort(function() { return Math.random() - 0.5; });
    list.dataset.initialized = "1";
  }
  list.innerHTML = '';

  orderItems.forEach(function(item, i) {
    const el = document.createElement('div');
    el.className = 'order-item';
    el.draggable = true;
    el.dataset.index = i;
    el.innerHTML = '<span class="handle">☰</span><span>' + item + '</span><span class="drop-hint">↕</span>';

    el.addEventListener('dragstart', function(e) {
      e.dataTransfer.setData('text/plain', i);
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', function() { el.classList.remove('dragging'); });
    el.addEventListener('dragover', function(e) { e.preventDefault(); });
    el.addEventListener('drop', function(e) {
      e.preventDefault();
      const from = +e.dataTransfer.getData('text/plain');
      const to = +el.dataset.index;
      if (from === to) return;
      const moved = orderItems.splice(from, 1)[0];
      orderItems.splice(to, 0, moved);
      renderOrderTask({ items: orderItems, correct: task.correct });
    });
    el.addEventListener('click', function() {
      const idx = +el.dataset.index;
      if (idx > 0) {
        const tmp = orderItems[idx - 1];
        orderItems[idx - 1] = orderItems[idx];
        orderItems[idx] = tmp;
        renderOrderTask({ items: orderItems, correct: task.correct });
      }
    });
    list.appendChild(el);
  });
  list.dataset.correct = JSON.stringify(task.correct);
}

/* ---------- 8. ЗАДАНИЕ: ВЫБОР ---------- */
let selectedChoice = null;

function renderChoiceTask(task) {
  const wrap = document.getElementById('choices');
  wrap.innerHTML = '';
  selectedChoice = null;
  task.choices.forEach(function(c, i) {
    const el = document.createElement('div');
    el.className = 'choice';
    el.textContent = c;
    el.onclick = function() {
      if (el.classList.contains('correct') || el.classList.contains('wrong')) return;
      wrap.querySelectorAll('.choice').forEach(function(x) { x.classList.remove('selected'); });
      el.classList.add('selected');
      selectedChoice = i;
    };
    wrap.appendChild(el);
  });
}

/* ---------- 9. ПРОВЕРКА ОТВЕТА ---------- */
function checkAnswer() {
  const lesson = LESSONS[state.currentLesson];
  const fb = document.getElementById('feedback');
  const task = lesson.task;
  let isCorrect = false;

  if (task.type === 'order') {
    const list = document.getElementById('order-list');
    const correct = JSON.parse(list.dataset.correct);
    isCorrect = JSON.stringify(orderItems) === JSON.stringify(correct);
    document.querySelectorAll('.order-item').forEach(function(el, i) {
      el.style.borderColor = orderItems[i] === correct[i] ? '#35d07f' : '#ff5470';
    });
  } else if (task.type === 'choice') {
    if (selectedChoice === null) {
      fb.className = 'feedback show err';
      fb.innerHTML = 'Выбери один из вариантов 👆';
      return;
    }
    isCorrect = selectedChoice === task.correctIndex;
    document.querySelectorAll('.choice').forEach(function(el, i) {
      if (i === task.correctIndex) el.classList.add('correct');
      else if (i === selectedChoice) el.classList.add('wrong');
    });
  }

  if (isCorrect) {
    fb.className = 'feedback show ok';
    fb.innerHTML = '✅ Верно! Отличная работа!';

    if (state.completed.indexOf(lesson.id) === -1) {
      state.score += 100;
      state.completed.push(lesson.id);
      save();
      document.getElementById('lesson-score').textContent = state.score;

      const actions = document.getElementById('lesson-actions');
      const cont = document.createElement('button');
      cont.className = 'btn';
      cont.textContent = state.completed.length === LESSONS.length
        ? '🎉 Завершить модуль'
        : 'Следующий урок →';
      cont.onclick = function() {
        if (state.completed.length === LESSONS.length) showFinal();
        else {
          let next = -1;
          for (let i = 0; i < LESSONS.length; i++) {
            if (state.completed.indexOf(LESSONS[i].id) === -1) { next = i; break; }
          }
          openLesson(next === -1 ? 0 : next);
        }
      };
      actions.appendChild(cont);
    }
    document.getElementById('btn-check').disabled = true;
  } else {
    state.attempts[lesson.id] = (state.attempts[lesson.id] || 0) + 1;
    fb.className = 'feedback show err';
    let text = '❌ Пока не так. Попробуй ещё раз!';
    if (state.attempts[lesson.id] >= 2) {
      text += '<div class="hint">💡 Подсказка: ' + task.hint + '</div>';
    }
    fb.innerHTML = text;
    save();
  }
}

/* ---------- 10. ПОДСКАЗКА ---------- */
function showHint() {
  const lesson = LESSONS[state.currentLesson];
  const fb = document.getElementById('feedback');
  fb.className = 'feedback show';
  fb.style.background = 'rgba(255,209,102,.12)';
  fb.style.border = '1px solid #ffd166';
  fb.style.color = '#ffd166';
  fb.innerHTML = '💡 ' + lesson.task.hint;
}

/* ---------- 11. ФИНАЛЬНЫЙ ЭКРАН ---------- */
function showFinal() {
  document.getElementById('final-lessons').textContent = state.completed.length;
  document.getElementById('final-score').textContent = state.score;
  const badges = document.getElementById('final-badges');
  badges.innerHTML = '';
  LESSONS.forEach(function(l) {
    const b = document.createElement('div');
    b.className = 'badge earned';
    b.innerHTML = '<div class="ico">' + l.emoji + '</div>Урок ' + l.id;
    badges.appendChild(b);
  });
  show('screen-final');
}

/* ---------- 12. ПЕРЕЗАПУСК МОДУЛЯ ---------- */
function restartModule() {
  state = { currentLesson: 0, completed: [], score: 0, attempts: {}, onboardStep: 0 };
  save();
  goMap();
}

/* ---------- 13. СТАРТ ---------- */
renderMap();
