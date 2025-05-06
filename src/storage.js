const BOARDS_KEY = 'pinterest-boards';

export function getBoards() {
    return JSON.parse(localStorage.getItem(BOARDS_KEY)) || [];
}

export function saveBoards(boards) {
    localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
}

export function addBoard(name) {
    const boards = getBoards();
    const newBoard = { name, pins: [] };
    boards.push(newBoard);
    saveBoards(boards);
    return newBoard;
}

export function getBoardByName(name) {
    return getBoards().find(board => board.name === name);
}

export function addPinToBoard(boardName, pin) {
    const boards = getBoards();
    const board = boards.find(b => b.name === boardName);
    if (board && !board.pins.find(p => p.id === pin.id)) {
        board.pins.push(pin);
        saveBoards(boards);
    }
}
