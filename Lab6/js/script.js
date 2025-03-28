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
            <nav>
                <ul>
                    <li><button onclick="renderCharacterSheet()"><i class="fas fa-user"></i> Персонаж</button></li>
                    <li><button onclick="apiHandler.fetchDnDClasses()"><i class="fas fa-dragon"></i> Классы D&D</button></li>
                </ul>
            </nav>
            <div id="edit-controls">
                <button onclick="toggleEditMode()"><i class="fas fa-edit"></i> ${document.body.classList.contains('edit-mode') ? 'Закрыть редактирование' : 'Редактировать'}</button>
                ${document.body.classList.contains('edit-mode') ? `
                    <button onclick="addBlock('text')"><i class="fas fa-font"></i> Текстовый блок</button>
                    <button onclick="addBlock('list')"><i class="fas fa-list"></i> Список</button>
                    <button onclick="addBlock('stats')"><i class="fas fa-chart-bar"></i> Характеристики</button>
                    <button onclick="clearLocalStorage()"><i class="fas fa-trash"></i> Очистить всё</button>
                ` : ''}
            </div>
        `;
    }
}

function addBlock(type) {
    if (!document.body.classList.contains('edit-mode')) return;
    const id = `block-${Date.now()}`;
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
    if (confirm("Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.")) {
        localStorage.clear();
        blocks = [
            new TextBlock("name", "Имя персонажа", "Имя персонажа"),
            new StatsBlock("stats", "Характеристики", {"Сила": 10, "Ловкость": 12, "Интеллект": 14}),
            new ListBlock("items", "Снаряжение", ["Меч", "Щит", "Зелье"])
        ];
        renderBlocks();
    }
}

function onDragStart(event) {
    if (!document.body.classList.contains('edit-mode')) return;
    draggedBlockId = event.target.id;
    event.dataTransfer.setData("text/plain", event.target.id);
    event.target.style.opacity = "0.5";
}

function onDragOver(event) {
    if (!document.body.classList.contains('edit-mode')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
}

function onDrop(event) {
    if (!document.body.classList.contains('edit-mode')) return;
    event.preventDefault();
    const targetBlock = event.target.closest(".block");
    if (!targetBlock) return;
    
    const targetBlockId = targetBlock.id;
    if (draggedBlockId && draggedBlockId !== targetBlockId) {
        const draggedIndex = blocks.findIndex(block => block.id === draggedBlockId);
        const targetIndex = blocks.findIndex(block => block.id === targetBlockId);

        const draggedBlock = blocks.splice(draggedIndex, 1)[0];
        blocks.splice(targetIndex, 0, draggedBlock);

        saveToLocalStorage();
        renderBlocks();
    }
    draggedBlockId = null;
    event.target.style.opacity = "1";
}

class ApiHandler {
    constructor() {
        this.loadingElements = {};
    }

    showLoading(id) {
        const element = document.getElementById(id);
        if (element) {
            this.loadingElements[id] = element.innerHTML;
            element.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Загрузка...</div>';
        }
    }

    hideLoading(id) {
        const element = document.getElementById(id);
        if (element && this.loadingElements[id]) {
            element.innerHTML = this.loadingElements[id];
            delete this.loadingElements[id];
        }
    }

    showError(message, containerId = 'api-content') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="api-error">${message}</div>`;
        }
    }

    async fetchDndClasses() {
        const containerId = 'api-content';
        this.showLoading(containerId);
        
        try {
            const response = await fetch('https://www.dnd5eapi.co/api/classes');
            if (!response.ok) throw new Error('Ошибка загрузки данных');
            const data = await response.json();
            
            let html = '<h2>Классы D&D 5e</h2><div class="classes-grid">';
            data.results.forEach(cls => {
                html += `
                    <div class="class-card">
                        <h3>${cls.name}</h3>
                        <button onclick="apiHandler.getClassDetails('${cls.index}')">Подробнее</button>
                    </div>
                `;
            });
            html += '</div>';
            
            document.getElementById(containerId).innerHTML = html;
        } catch (error) {
            this.showError(error.message, containerId);
        }
    }

    async getClassDetails(classIndex) {
        const containerId = 'api-content';
        this.showLoading(containerId);
        
        try {
            const response = await fetch(`https://www.dnd5eapi.co/api/classes/${classIndex}`);
            if (!response.ok) throw new Error('Ошибка загрузки данных');
            const data = await response.json();
            
            let html = `
                <h2>${data.name}</h2>
                <button onclick="apiHandler.fetchDndClasses()" class="back-btn">← Назад</button>
                <div class="class-details">
                    <p><strong>Хиты:</strong> ${data.hit_die}</p>
                    <p><strong>Основная характеристика:</strong> ${data.proficiency_choices[0].desc}</p>
                    <h3>Умения:</h3>
                    <ul>
                        ${data.proficiencies.map(p => `<li>${p.name}</li>`).join('')}
                    </ul>
                </div>
            `;
            
            document.getElementById(containerId).innerHTML = html;
        } catch (error) {
            this.showError(error.message, containerId);
        }
    }
    async fetchRandomNumberFact() {
        const containerId = 'api-content';
        this.showLoading(containerId);
        
        try {
            // Получаем случайный факт о числе
            const response = await fetch('http://numbersapi.com/random/trivia?json');
            if (!response.ok) throw new Error('Ошибка загрузки факта о числе');
            const data = await response.json();
            
            const html = `
                <h2>Случайный числовой факт</h2>
                <div class="fact-card">
                    <div class="number">${data.number}</div>
                    <p class="fact-text">${data.text}</p>
                    <button onclick="apiHandler.fetchRandomNumberFact()" class="add-btn">Другой факт</button>
                </div>
            `;
            
            document.getElementById(containerId).innerHTML = html;
        } catch (error) {
            const fallbackFacts = [
                {number: 7, text: "7 - самое любимое число в мире."},
                {number: 42, text: "42 - Ответ на Главный Вопрос Жизни, Вселенной и Всего Остального."},
                {number: 13, text: "13 считается несчастливым числом во многих культурах."}
            ];
            const randomFact = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
            
            const html = `
                <div class="api-warning">
                    <i class="fas fa-exclamation-triangle"></i> Используются локальные факты
                </div>
                <div class="fact-card">
                    <div class="number">${randomFact.number}</div>
                    <p class="fact-text">${randomFact.text}</p>
                    <button onclick="apiHandler.fetchRandomNumberFact()" class="add-btn">Попробовать снова</button>
                </div>
            `;
            
            document.getElementById(containerId).innerHTML = html;
        }
    }
    
    async fetchRandomDogImage() {
        const containerId = 'api-content';
        this.showLoading(containerId);
        
        try {
            // Получаем случайное изображение собаки
            const response = await fetch('https://dog.ceo/api/breeds/image/random');
            if (!response.ok) throw new Error('Ошибка загрузки изображения собаки');
            const data = await response.json();
            
            // Извлекаем породу из URL
            const breed = data.message.split('/')[4];
            
            const html = `
                <h2>Случайная собака</h2>
                <div class="dog-card">
                    <img src="${data.message}" alt="Случайная собака" class="dog-image">
                    <p class="dog-breed">Порода: ${breed.replace('-', ' ')}</p>
                    <button onclick="apiHandler.fetchRandomDogImage()" class="add-btn">Другая собака</button>
                </div>
            `;
            
            document.getElementById(containerId).innerHTML = html;
        } catch (error) {
            const fallbackDogs = [
                {message: "https://images.dog.ceo/breeds/labrador/n02099712_741.jpg", breed: "labrador"},
                {message: "https://images.dog.ceo/breeds/husky/n02110185_1469.jpg", breed: "husky"},
                {message: "https://images.dog.ceo/breeds/pug/n02110958_15626.jpg", breed: "pug"}
            ];
            const randomDog = fallbackDogs[Math.floor(Math.random() * fallbackDogs.length)];
            
            const html = `
                <div class="api-warning">
                    <i class="fas fa-exclamation-triangle"></i> Используются локальные изображения
                </div>
                <div class="dog-card">
                    <img src="${randomDog.message}" alt="Случайная собака" class="dog-image">
                    <p class="dog-breed">Порода: ${randomDog.breed}</p>
                    <button onclick="apiHandler.fetchRandomDogImage()" class="add-btn">Попробовать снова</button>
                </div>
            `;
            
            document.getElementById(containerId).innerHTML = html;
        }
    }
}

const apiHandler = new ApiHandler();

function buildPage() {
    document.body.innerHTML = "";

    const header = document.createElement("header");
    header.innerHTML = `
        <nav>
            <ul>
                <li><button onclick="renderCharacterSheet()"><i class="fas fa-user"></i> Персонаж</button></li>
                <li><button onclick="apiHandler.fetchDndClasses()"><i class="fas fa-book"></i> Классы D&D</button></li>
                <li><button onclick="apiHandler.fetchRandomNumberFact()"><i class="fas fa-calculator"></i> Факты о числах</button></li>
                <li><button onclick="apiHandler.fetchRandomDogImage()"><i class="fas fa-dog"></i> Случайные собаки</button></li>
            </ul>
        </nav>
        <div id="edit-controls"></div>
    `;
    document.body.appendChild(header);

    const main = document.createElement("main");
    main.id = "content";
    document.body.appendChild(main);

    const apiContainer = document.createElement("div");
    apiContainer.id = "api-content";
    apiContainer.className = "api-container";
    document.body.appendChild(apiContainer);

    loadFromLocalStorage();
    renderHeader();
    renderCharacterSheet();
}

function renderCharacterSheet() {
    document.getElementById('api-content').innerHTML = '';
    renderBlocks();
}

function renderHeader() {
    const editControls = document.getElementById("edit-controls");
    if (editControls) {
        editControls.innerHTML = `
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

document.addEventListener("DOMContentLoaded", buildPage);