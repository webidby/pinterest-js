import { getBoards, addBoard, getBoardByName, addPinToBoard } from './storage.js';

const boardSelect = document.getElementById('boardSelect');
const newBoardInput = document.getElementById('newBoardName');
const createBoardBtn = document.getElementById('createBoardBtn');
const pinsContainer = document.querySelector('.pins-container');

const PINS_API_URL = 'https://681294a3129f6313e20effc5.mockapi.io/api/v1/pins';

// Рендер выпадающего списка досок
function renderBoardOptions() {
    const boards = getBoards();
    boardSelect.innerHTML = '';
    boards.forEach(board => {
        const opt = document.createElement('option');
        opt.value = board.name;
        opt.textContent = board.name;
        boardSelect.appendChild(opt);
    });
}

// Создание доски
createBoardBtn.addEventListener('click', () => {
    const name = newBoardInput.value.trim();
    if (name) {
        addBoard(name);
        renderBoardOptions();
        newBoardInput.value = '';
    }
});

// Загрузка пинов с mockapi
async function loadPins() {
    try {
        const res = await fetch(PINS_API_URL);
        const pins = await res.json();

        pinsContainer.innerHTML = '';
        pins.forEach(pin => {
            const el = document.createElement('div');
            el.className = 'pin';
            el.innerHTML = `
        <img src="${pin.image}" alt="${pin.title}">
        <div class="pin-description">${pin.title}</div>
        <button class="circle-btn" data-id="${pin.id}">+</button>
      `;
            pinsContainer.appendChild(el);
        });
    } catch (e) {
        console.error('Ошибка при загрузке пинов:', e);
        pinsContainer.innerHTML = `<p>Не удалось загрузить пины 😢</p>`;
    }
}

// Добавление пина в доску
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('circle-btn')) {
        const boardName = boardSelect.value;
        if (!boardName) return alert('Сначала выбери доску!');

        const pinEl = e.target.closest('.pin');
        const pin = {
            id: e.target.dataset.id,
            title: pinEl.querySelector('.pin-description').textContent,
            image: pinEl.querySelector('img').src
        };
        addPinToBoard(boardName, pin);
        alert(`Пин добавлен в доску "${boardName}"`);
    }
});

// Инициализация
renderBoardOptions();
loadPins();
