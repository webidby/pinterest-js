import { getBoards, addBoard, getBoardByName, addPinToBoard } from './storage.js';

const boardSelect = document.getElementById('boardSelect');
const newBoardInput = document.getElementById('newBoardName');
const createBoardBtn = document.getElementById('createBoardBtn');
const pinsContainer = document.querySelector('.pins-container');
const searchInput = document.querySelector('.search-input');

const complainModal = document.getElementById('complainModal');
const complainText = document.getElementById('complainText');
const sendComplainBtn = document.getElementById('sendComplainBtn');
const closeComplainBtn = document.getElementById('closeComplainBtn');

const PINS_API_URL = 'https://681294a3129f6313e20effc5.mockapi.io/api/v1/pins';

let currentPins = [];
let currentBoard = 'all'; // all - показать все пины

// Меню выбора действий
let actionMenu = null;

// Рендер выпадающего списка досок
function renderBoardOptions() {
    const boards = getBoards();
    // очищаем, оставляя option all
    boardSelect.innerHTML = `<option value="all">Все пины</option>`;
    boards.forEach(board => {
        const opt = document.createElement('option');
        opt.value = board.name;
        opt.textContent = board.name;
        boardSelect.appendChild(opt);
    });
}

// Загрузка пинов с mockapi
async function loadPins() {
    try {
        const res = await fetch(PINS_API_URL);
        const pins = await res.json();
        currentPins = pins;
        renderPins();
    } catch (e) {
        console.error('Ошибка при загрузке пинов:', e);
        pinsContainer.innerHTML = `<p>Не удалось загрузить пины 😢</p>`;
    }
}

// Рендер пинов с учетом выбранной доски и поиска
function renderPins() {
    let pinsToShow = [];

    if (currentBoard === 'all') {
        pinsToShow = currentPins;
    } else {
        const board = getBoardByName(currentBoard);
        pinsToShow = board ? board.pins : [];
    }

    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        pinsToShow = pinsToShow.filter(pin => pin.title.toLowerCase().includes(searchTerm));
    }

    pinsContainer.innerHTML = '';

    if (pinsToShow.length === 0) {
        pinsContainer.innerHTML = '<p>Пины не найдены.</p>';
        return;
    }

    pinsToShow.forEach(pin => {
        const el = document.createElement('div');
        el.className = 'pin';
        el.dataset.id = pin.id;
        el.innerHTML = `
      <img src="${pin.image}" alt="${pin.title}">
      <div class="pin-description">${pin.title}</div>
      <button class="circle-btn">+</button>
    `;
        pinsContainer.appendChild(el);
    });
}

// Создание доски
createBoardBtn.addEventListener('click', () => {
    const name = newBoardInput.value.trim();
    if (!name) return alert('Введите название доски');
    if (addBoard(name)) {
        renderBoardOptions();
        newBoardInput.value = '';
    } else {
        alert('Доска с таким именем уже существует');
    }
});

// Обработка выбора доски
boardSelect.addEventListener('change', (e) => {
    currentBoard = e.target.value;
    renderPins();
});

// Обработка поиска
searchInput.addEventListener('input', () => {
    renderPins();
});

// Закрыть модалку жалобы
closeComplainBtn.addEventListener('click', () => {
    complainModal.classList.add('hidden');
    complainText.value = '';
});

// Отправить жалобу
sendComplainBtn.addEventListener('click', () => {
    const text = complainText.value.trim();
    if (!text) {
        alert('Пожалуйста, опишите жалобу');
        return;
    }
    alert('Жалоба отправлена: ' + text);
    complainText.value = '';
    complainModal.classList.add('hidden');
});

// Функция создания меню действий
function createActionMenu(x, y, pin) {
    if (actionMenu) {
        actionMenu.remove();
    }

    actionMenu = document.createElement('div');
    actionMenu.className = 'action-menu';
    actionMenu.style.top = y + 'px';
    actionMenu.style.left = x + 'px';

    // Кнопка для добавления пина на доску
    const addPinBtn = document.createElement('button');
    addPinBtn.textContent = 'Добавить на доску';
    addPinBtn.addEventListener('click', () => {
        if (currentBoard === 'all') {
            // Показать меню выбора доски, если доска не выбрана
            showBoardSelectionMenu(pin);
        }
    });
    actionMenu.appendChild(addPinBtn);

    // Кнопка пожаловаться
    const complainBtn = document.createElement('button');
    complainBtn.textContent = 'Пожаловаться';
    complainBtn.addEventListener('click', () => {
        complainModal.classList.remove('hidden');
        actionMenu.remove();
    });
    actionMenu.appendChild(complainBtn);

    document.body.appendChild(actionMenu);

    // Клик вне меню — закрыть его
    function onClickOutside(event) {
        if (!actionMenu.contains(event.target)) {
            actionMenu.remove();
            document.removeEventListener('click', onClickOutside);
        }
    }
    setTimeout(() => {
        document.addEventListener('click', onClickOutside);
    }, 0);
}

// Функция отображения меню для выбора доски
function showBoardSelectionMenu(pin) {
    const boardSelectMenu = document.createElement('div');
    boardSelectMenu.className = 'board-select-menu';

    const boards = getBoards();
    boards.forEach(board => {
        const boardOption = document.createElement('button');
        boardOption.textContent = board.name;
        boardOption.addEventListener('click', () => {
            addPinToBoard(board.name, pin);
            alert(`Пин добавлен в доску "${board.name}"`);
            boardSelectMenu.remove(); // Убираем меню после выбора
        });
        boardSelectMenu.appendChild(boardOption);
    });

    // Добавим меню выбора доски в body
    document.body.appendChild(boardSelectMenu);

    // Позиционируем меню рядом с кнопкой "Добавить на доску"
    const rect = actionMenu.getBoundingClientRect();
    boardSelectMenu.style.top = rect.bottom + 5 + 'px';
    boardSelectMenu.style.left = rect.left + 'px';

    // Клик вне меню — закрыть его
    function onClickOutside(event) {
        if (!boardSelectMenu.contains(event.target)) {
            boardSelectMenu.remove();
            document.removeEventListener('click', onClickOutside);
        }
    }
    setTimeout(() => {
        document.addEventListener('click', onClickOutside);
    }, 0);
}

// Обработка клика на кнопку "+"
pinsContainer.addEventListener('click', (e) => {
    if (!e.target.classList.contains('circle-btn')) return;

    e.stopPropagation(); // чтобы клик не закрыл меню сразу

    const pinEl = e.target.closest('.pin');
    const pin = {
        id: pinEl.dataset.id,
        title: pinEl.querySelector('.pin-description').textContent,
        image: pinEl.querySelector('img').src
    };

    // Позиция для меню
    const rect = e.target.getBoundingClientRect();
    createActionMenu(rect.right + 5, rect.top, pin);
});

// Инициализация
renderBoardOptions();
loadPins();
