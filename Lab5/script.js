class Block {
    constructor(id, title = "Новый блок") {
        this.id = id;
        this.title = title;
    }
}

class TextBlock extends Block {
    constructor(id, title = "Текстовый блок", text = "") {
        super(id, title);
        this.text = text;
    }
    toHTML() {
        return `<div class="block" id="${this.id}" draggable="true" ondragstart="onDragStart(event)" ondragover="onDragOver(event)" ondrop="onDrop(event)">
            ${document.body.classList.contains('edit-mode') ? `<button class="delete-btn" onclick="deleteBlock('${this.id}')">×</button>` : ''}
            <div class="block-title" ${document.body.classList.contains('edit-mode') ? 'contenteditable="true"' : ''} oninput="updateTitle('${this.id}', this.innerText)">${this.title}</div>
            <p ${document.body.classList.contains('edit-mode') ? 'contenteditable="true"' : ''} oninput="updateText('${this.id}', this.innerText)">${this.text}</p>
        </div>`;
    }
}

class ListBlock extends Block {
    constructor(id, title = "Список", items = []) {
        super(id, title);
        this.items = items;
    }
    toHTML() {
        return `<div class="block" id="${this.id}" draggable="true" ondragstart="onDragStart(event)" ondragover="onDragOver(event)" ondrop="onDrop(event)">
            ${document.body.classList.contains('edit-mode') ? `<button class="delete-btn" onclick="deleteBlock('${this.id}')">×</button>` : ''}
            <div class="block-title" ${document.body.classList.contains('edit-mode') ? 'contenteditable="true"' : ''} oninput="updateTitle('${this.id}', this.innerText)">${this.title}</div>
            <ul>
                ${this.items.map((item, index) => `
                    <li>
                        <span ${document.body.classList.contains('edit-mode') ? 'contenteditable="true"' : ''} oninput="updateList('${this.id}', ${index}, this.innerText)">${item}</span>
                        ${document.body.classList.contains('edit-mode') ? `<button class="delete-item-btn" onclick="deleteListItem('${this.id}', ${index})">×</button>` : ''}
                    </li>
                `).join("")}
            </ul>
            ${document.body.classList.contains('edit-mode') ? `<button class="add-btn" onclick="addListItem('${this.id}')">Добавить элемент</button>` : ''}
        </div>`;
    }
}

class StatsBlock extends Block {
    constructor(id, title = "Характеристики", stats = {}) {
        super(id, title);
        this.stats = stats;
    }
    toHTML() {
        return `<div class="block" id="${this.id}" draggable="true" ondragstart="onDragStart(event)" ondragover="onDragOver(event)" ondrop="onDrop(event)">
            ${document.body.classList.contains('edit-mode') ? `<button class="delete-btn" onclick="deleteBlock('${this.id}')">×</button>` : ''}
            <div class="block-title" ${document.body.classList.contains('edit-mode') ? 'contenteditable="true"' : ''} oninput="updateTitle('${this.id}', this.innerText)">${this.title}</div>
            ${Object.entries(this.stats).map(([key, value]) => `
                <div class="stat">
                    <span class="stat-key" ${document.body.classList.contains('edit-mode') ? 'contenteditable="true"' : ''} oninput="updateStatKey('${this.id}', '${key}', this.innerText)">${key}:</span>
                    <span ${document.body.classList.contains('edit-mode') ? 'contenteditable="true"' : ''} oninput="updateStats('${this.id}', '${key}', this.innerText)">${value}</span>
                    ${document.body.classList.contains('edit-mode') ? `<button class="delete-item-btn" onclick="deleteStat('${this.id}', '${key}')">×</button>` : ''}
                </div>
            `).join("")}
            ${document.body.classList.contains('edit-mode') ? `<button class="add-btn" onclick="addStat('${this.id}')">Добавить характеристику</button>` : ''}
        </div>`;
    }
}

let blocks = [];
let draggedBlockId = null;

function saveToLocalStorage() {
    localStorage.setItem("blocks", JSON.stringify(blocks));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem("blocks");
    if (data) {
        const parsedBlocks = JSON.parse(data);
        blocks = parsedBlocks.map(block => {
            if (block.text !== undefined) {
                return new TextBlock(block.id, block.title, block.text);
            } else if (block.items !== undefined) {
                return new ListBlock(block.id, block.title, block.items);
            } else if (block.stats !== undefined) {
                return new StatsBlock(block.id, block.title, block.stats);
            }
        });
    } else {
        blocks = [
            new TextBlock("name", "Имя персонажа", "Имя персонажа"),
            new StatsBlock("stats", "Характеристики", {"Сила": 10, "Ловкость": 12, "Интеллект": 14}),
            new ListBlock("items", "Снаряжение", ["Меч", "Щит", "Зелье"])
        ];
    }
}

function renderBlocks() {
    document.getElementById("content").innerHTML = blocks.map(block => block.toHTML()).join("");
}

function toggleEditMode() {
    document.body.classList.toggle("edit-mode");
    renderHeader();
    renderBlocks();
}

function renderHeader() {
    const header = document.querySelector("header");
    if (header) {
        header.innerHTML = `
            <button onclick="toggleEditMode()">Редактировать</button>
            ${document.body.classList.contains('edit-mode') ? `
                <button onclick="addBlock('text')">Добавить текстовый блок</button>
                <button onclick="addBlock('list')">Добавить список</button>
                <button onclick="addBlock('stats')">Добавить характеристики</button>
                <button onclick="clearLocalStorage()">Очистить всё</button>
            ` : ''}
        `;
    }
}

function addBlock(type) {
    if (!document.body.classList.contains('edit-mode')) return;
    const id = `block-${blocks.length + 1}`;
    let newBlock;
    if (type === "text") {
        newBlock = new TextBlock(id, "Текстовый блок", "Новый текст");
    } else if (type === "list") {
        newBlock = new ListBlock(id, "Список", ["Элемент 1", "Элемент 2"]);
    } else if (type === "stats") {
        newBlock = new StatsBlock(id, "Характеристики", {"Сила": 8, "Ловкость": 10});
    }
    blocks.push(newBlock);
    saveToLocalStorage();
    renderBlocks();
}

function deleteBlock(id) {
    if (!document.body.classList.contains('edit-mode')) return;
    blocks = blocks.filter(block => block.id !== id);
    saveToLocalStorage();
    renderBlocks();
}

function updateTitle(id, title) {
    if (!document.body.classList.contains('edit-mode')) return;
    const block = blocks.find(block => block.id === id);
    if (block) block.title = title;
    saveToLocalStorage();
}

function updateText(id, text) {
    if (!document.body.classList.contains('edit-mode')) return;
    const block = blocks.find(block => block.id === id);
    if (block) block.text = text;
    saveToLocalStorage();
}

function updateList(id, index, text) {
    if (!document.body.classList.contains('edit-mode')) return;
    const block = blocks.find(block => block.id === id);
    if (block) block.items[index] = text;
    saveToLocalStorage();
}

function updateStats(id, key, value) {
    if (!document.body.classList.contains('edit-mode')) return;
    const block = blocks.find(block => block.id === id);
    if (block) block.stats[key] = value;
    saveToLocalStorage();
}

function updateStatKey(id, oldKey, newKey) {
    if (!document.body.classList.contains('edit-mode')) return;
    const block = blocks.find(block => block.id === id);
    if (block && block.stats[oldKey] !== undefined) {
        const newStats = {};
        for (const [key, value] of Object.entries(block.stats)) {
            if (key === oldKey) {
                newStats[newKey] = value;
            } else {
                newStats[key] = value;
            }
        }
        block.stats = newStats;
        saveToLocalStorage();
        renderBlocks();
    }
}

function addListItem(id) {
    if (!document.body.classList.contains('edit-mode')) return;
    const block = blocks.find(block => block.id === id);
    if (block) {
        block.items.push("Новый элемент");
        saveToLocalStorage();
        renderBlocks();
    }
}

function deleteListItem(id, index) {
    if (!document.body.classList.contains('edit-mode')) return;
    const block = blocks.find(block => block.id === id);
    if (block) {
        block.items.splice(index, 1);
        saveToLocalStorage();
        renderBlocks();
    }
}

function addStat(id) {
    if (!document.body.classList.contains('edit-mode')) return;
    const block = blocks.find(block => block.id === id);
    if (block) {
        let newKey = "Новая характеристика";
        let counter = 1;
        while (block.stats[newKey] !== undefined) {
            newKey = `Новая характеристика ${counter}`;
            counter++;
        }
        block.stats[newKey] = "0";
        saveToLocalStorage();
        renderBlocks();
    }
}

function deleteStat(id, key) {
    if (!document.body.classList.contains('edit-mode')) return;
    const block = blocks.find(block => block.id === id);
    if (block) {
        delete block.stats[key];
        saveToLocalStorage();
        renderBlocks();
    }
}

function clearLocalStorage() {
    if (!document.body.classList.contains('edit-mode')) return;
    localStorage.clear();
    blocks = [
        new TextBlock("name", "Имя персонажа", "Имя персонажа"),
        new StatsBlock("stats", "Характеристики", {"Сила": 10, "Ловкость": 12, "Интеллект": 14}),
        new ListBlock("items", "Снаряжение", ["Меч", "Щит", "Зелье"])
    ];
    renderBlocks();
}

function onDragStart(event) {
    if (!document.body.classList.contains('edit-mode')) return;
    draggedBlockId = event.target.id;
    event.dataTransfer.setData("text/plain", event.target.id);
}

function onDragOver(event) {
    if (!document.body.classList.contains('edit-mode')) return;
    event.preventDefault();
}

function onDrop(event) {
    if (!document.body.classList.contains('edit-mode')) return;
    event.preventDefault();
    const targetBlockId = event.target.closest(".block").id;
    if (draggedBlockId && draggedBlockId !== targetBlockId) {
        const draggedIndex = blocks.findIndex(block => block.id === draggedBlockId);
        const targetIndex = blocks.findIndex(block => block.id === targetBlockId);

        const draggedBlock = blocks.splice(draggedIndex, 1)[0];
        blocks.splice(targetIndex, 0, draggedBlock);

        saveToLocalStorage();
        renderBlocks();
    }
    draggedBlockId = null;
}

function buildPage() {
    document.body.innerHTML = "";

    const header = document.createElement("header");
    document.body.appendChild(header);

    const main = document.createElement("main");
    main.id = "content";
    document.body.appendChild(main);


    loadFromLocalStorage();
    renderHeader();
    renderBlocks();
}

// Запускаем сборку страницы при загрузке
document.addEventListener("DOMContentLoaded", buildPage);