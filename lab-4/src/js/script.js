const board = document.getElementById("kanban-board");
const columnIds = ['to-do', 'in-progress', 'done']

//funkcje pomocnicze

function generateUniqueId(){
    return `card-${Date.now()}-${Math.floor(Math.random()*1000)}`;
}

function getRandomColor(){
    const r = Math.floor(Math.random()*56)+200;
    const g = Math.floor(Math.random()*56)+200;
    const b = Math.floor(Math.random()*56)+200;

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function updateCardCount (columnId) {
    const columnElement = document.getElementById(columnId);
    if (columnElement){
       
        const cardsContainer = columnElement.querySelector('.cards-container');
        if (cardsContainer) {
            const cardCount = cardsContainer.querySelectorAll('.card').length;
            const countElement = columnElement.querySelector('.card-count');
            if (countElement){
                countElement.textContent = cardCount;
            }
        }
    }
}

function saveState() {
    const state={};
    columnIds.forEach(columnId => {
        const columnElement = document.getElementById(columnId)
        
        const cardsContainer = columnElement.querySelector('.cards-container');
        if(cardsContainer) {
             state[columnId] = Array.from(cardsContainer.querySelectorAll('.card')).map(cardEl =>{
                return{
                    id: cardEl.dataset.cardId,
                    title: cardEl.querySelector('.card-content').textContent,
                    color:cardEl.style.backgroundColor
                };
            });
        } else {
             state[columnId] = [];
        }
    });
    localStorage.setItem('kanbanState', JSON.stringify(state));
}

function loadState() {
    const savedState = localStorage.getItem('kanbanState');
    if (!savedState) return;

    const state = JSON.parse(savedState);

    columnIds.forEach(columnId => {
        const columnElement = document.getElementById(columnId);
        const cardsContainer = columnElement ? columnElement.querySelector('.cards-container') : null;
        
        if (!cardsContainer) return;

        cardsContainer.innerHTML = ''; 

        if (state[columnId]) {
            state[columnId].forEach(cardData => {
                const cardEl = createCard(cardData.title, cardData.color, cardData.id);
                cardsContainer.appendChild(cardEl);
                updateMoveButtons(cardEl);
            });
            updateCardCount(columnId);
            sortCards(columnId);
        }
    });
}


function sortCards(columnId) {
    const columnElement = document.getElementById(columnId);
    if (!columnElement) return;

    const cardsContainer = columnElement.querySelector('.cards-container');
    const sortSelect = columnElement.querySelector('.sort-select');
    if (!cardsContainer || !sortSelect) return;

    const sortType = sortSelect.value; 
    
    
    let cards = Array.from(cardsContainer.querySelectorAll('.card'));

    switch (sortType) {
        case 'date-asc':
            
            cards.sort((a, b) => {
                const idA = parseInt(a.dataset.cardId.split('-')[1]);
                const idB = parseInt(b.dataset.cardId.split('-')[1]);
                return idA - idB; 
            });
            break;
        case 'date-desc':
       
            cards.sort((a, b) => {
                const idA = parseInt(a.dataset.cardId.split('-')[1]);
                const idB = parseInt(b.dataset.cardId.split('-')[1]);
                return idB - idA; // Malejąco
            });
            break;
        case 'title-asc':
            
            cards.sort((a, b) => {
                const titleA = a.querySelector('.card-content').textContent.trim().toUpperCase();
                const titleB = b.querySelector('.card-content').textContent.trim().toUpperCase();
                if (titleA < titleB) return -1;
                if (titleA > titleB) return 1;
                return 0;
            });
            break;
    }

   
    cards.forEach(card => cardsContainer.appendChild(card));
    saveState();
}

//stworzenie karty

function createCard(title, color,id) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.style.backgroundColor = color;
    card.dataset.cardId = id;

    card.innerHTML =
    `
    <div class = "card-content" contentEditable="true">${title}</div>
    <div class="card-controls">
        <div>
            <button class="card-button move-button" data-action="move-left">←</button>
            <button class="card-button move-button" data-action="move-right">→</button>
        </div>
        <div>
            <button class="card-button" data-action="recolor">🎨</button>
            <button class="card-button" data-action="delete">x</button>
        </div>
    </div>
    `;
    
    return card;
}

function handleAddCard(columnId) {
    const newId = generateUniqueId();
    const newColor = getRandomColor();
    const defaultTitle = 'Nowa karta';

    const newCard = createCard(defaultTitle, newColor, newId);
    const column = document.getElementById(columnId);
    const cardsContainer = column.querySelector('.cards-container');

    if (cardsContainer) {
        cardsContainer.appendChild(newCard);
       
        newCard.querySelector('.card-content').focus();
    } else {
        column.appendChild(newCard)
        updateMoveButtons(newCard);
    }

    updateCardCount(columnId);
    sortCards(columnId);
    saveState();
    
}


function openColorPicker(cardElement) {
  
    const colorInput = document.createElement('input');
    colorInput.type = 'color';

    const currentColor = cardElement.style.backgroundColor;
    colorInput.value = currentColor || '#ffffff';
    colorInput.addEventListener('input', () => {
        cardElement.style.backgroundColor = colorInput.value;
    });


    colorInput.addEventListener('change', () => {
        saveState();
        document.body.removeChild(colorInput);
    });

    colorInput.style.position = 'absolute';
    colorInput.style.opacity = 0; 

    colorInput.style.top = '-100px'; 
    colorInput.style.left = '-100px'; 
    
    document.body.appendChild(colorInput);
    colorInput.click();
}

//delegowanie

function initAddCardListeners(){
    const addButtons = document.querySelectorAll('.action-button[data-action="add-card"]');

    addButtons.forEach(button => {
        button.addEventListener('click', (event)=>{
            const column = event.target.closest('.kanban-column');
            if (column){
                handleAddCard(column.id);
            }
        });
    });
}

function moveCard(cardElement, direction) {
    const currentColumn = cardElement.closest('.kanban-column');
    if (!currentColumn) return;

    const currentIndex = columnIds.indexOf(currentColumn.id);
    let newIndex;

    if (direction === 'left' && currentIndex > 0) {
        newIndex = currentIndex - 1;
    } else if (direction === 'right' && currentIndex < columnIds.length - 1) {
        newIndex = currentIndex + 1;
    } else {
        return; 
    }

    const newColumnId = columnIds[newIndex];
    const newColumn = document.getElementById(newColumnId);
    const newCardsContainer = newColumn.querySelector('.cards-container');

    if (newCardsContainer) {
        newCardsContainer.appendChild(cardElement);

        updateCardCount(currentColumn.id);
        updateMoveButtons(cardElement);
        updateCardCount(newColumnId);
        sortCards(newColumnId);
        saveState();
    }
}

function updateMoveButtons(cardElement) {
    const currentColumn = cardElement.closest('.kanban-column');
    if (!currentColumn) return;

    const columnId = currentColumn.id;
    const currentIndex = columnIds.indexOf(columnId);
    
   
    const moveLeftButton = cardElement.querySelector('[data-action="move-left"]');
    const moveRightButton = cardElement.querySelector('[data-action="move-right"]');
    
    if (moveLeftButton) {
        
        if (currentIndex === 0) {
            moveLeftButton.style.display = 'none';
        } else {
            moveLeftButton.style.display = 'inline-block';
        }
    }

    if (moveRightButton) {
        
        if (currentIndex === columnIds.length - 1) {
            moveRightButton.style.display = 'none';
        } else {
            moveRightButton.style.display = 'inline-block';
        }
    }
}

function initDelegatedListeners() {
  
    board.addEventListener('click', (event) => {
        const target = event.target;
        const action = target.dataset.action;
        const card = target.closest('.card');
        
        if (!card) {
          
            if (target.dataset.action === 'recolor-column') {
                const column = target.closest('.kanban-column');
                if (column) {
                    const newColor = getRandomColor();
                    const cards = column.querySelectorAll('.cards-container .card');
                    cards.forEach(card => {
                        card.style.backgroundColor = newColor;
                    });
                    saveState();
                }
            }
            return; 
        }

        switch (action) {
            case 'delete':
                if (confirm('Czy na pewno chcesz usunąć tę kartę?')) {
                    const columnId = card.closest('.kanban-column').id;
                    card.remove();
                    updateCardCount(columnId);
                    saveState();
                }
                break;
            case 'move-left':
                moveCard(card, 'left');
                break;
            case 'move-right':
                moveCard(card, 'right');
                break;
            case 'recolor':
                openColorPicker(card);
                break;
        }
    });
    
    
    board.addEventListener('blur', (event) => {
        const target = event.target;
        if (target.classList.contains('card-content')) {
            saveState();
        }
    }, true);
}


//inicjowanie 

function initSortListeners() {
    const sortSelects = document.querySelectorAll('.sort-select');
    sortSelects.forEach(select => {
        select.addEventListener('change', (event) => {
            const columnId = event.target.dataset.columnId;
            sortCards(columnId);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadState(); 
    initAddCardListeners(); 
    initDelegatedListeners();
    initSortListeners();
});