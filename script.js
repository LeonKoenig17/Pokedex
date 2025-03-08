window.addEventListener("load", function() {
    init();
})

async function init() {
    const overlay = document.getElementById("loading");
    showLoading(overlay);
    await loadAllData("pokemon?limit=100000&offset=0");
    hideLoading(overlay);
    renderCardList();
    setBackgroundColor();
}

function showLoading(overlay) {
    const loadingSpinner = overlay.querySelector("img");
    overlay.style.display = "flex";
    let angle = 0;

    setInterval(() => {
        angle += 25;
        loadingSpinner.style.transform = `rotate(${angle}deg)`;
    }, 200)
}

function hideLoading(overlay) {
    overlay.style.display = "none";
}

async function loadAllData(path="") {
    try {
        const BASE_URL = "https://pokeapi.co/api/v2/";
        const loadingBar = document.getElementById("loadingBar");
        loadingBar.style.width = "0";
        console.log(loadingBar.style.width);
        let deckSize = 40;
        let response = await fetch(BASE_URL + path);
        let responseToJson = await response.json();

        for (let i = 0; i < deckSize; i++) {
            await loadData(responseToJson.results[i].url);
            let percentage = ((i + 1) / deckSize) * 100;
            loadingBar.style.width = percentage + "%";
        }
        console.log(loadingBar.style.width);
    } catch (error) {
        console.error("loadAllData Error: " + error);
    }
}

async function loadData(path="") {
    let response = await fetch(path);
    let data = await response.json();
    processCardData(data);
}

let cardsToRender = "";

function processCardData(data) {      
    let name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
    let types = data.types;
    let typeString = "";
    let sprite = data.sprites.front_default;
    let hp = data.stats[0].base_stat;
    let attack = data.stats[1].base_stat;
    let defense = data.stats[2].base_stat;
    let baseXP = data.base_experience;
    let height = data.height * 10;
    let weight = Math.round(data.weight / 10);
    let abilities = data.abilities;
    let abilityString = "";

    types.forEach(type => {
        let nextType = type.type.name;
        typeString += `<span class="${nextType} typeIcon"></span>`;
    });

    abilities.forEach(ability => {
        let nextAbility = ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1);
        abilityString += `${nextAbility}<br>`;
    })
    
    cardsToRender += createCard(name, typeString, sprite, hp, attack, defense, baseXP, height, weight, abilityString);
    // setBackgroundColor();
}

function createCard(name, types, sprite, hp, attack, defense, xp, height, weight, abilities) {
    return `
        <div class="card">
            <div class="cardHeader">
                <h3>${name}</h3>
                <span>${hp}HP</span>
                <div class="types">
                    ${types}
                </div>
            </div>
            <img class="image" src="${sprite}" alt="card image">
            <div class="info">
                <span>XP: ${xp}</span>
                <span>HT: ${height}cm</span>
                <span>WT: ${weight}kg</span>
            </div>
            <div class="attributes">
                <table>
                    <tr>
                        <td>Attack:</td>
                        <td>${attack}</td>
                    </tr>
                    <tr>
                        <td>Defense:</td>
                        <td>${defense}</td>
                    </tr>
                    <tr>
                        <td>Abilities:</td>
                        <td>${abilities}</td>
                    </tr>
                </table>
            </div>
        </div>
    `;
}

function setBackgroundColor() {
    let cards = document.querySelectorAll(".card");
    
    let cardIndex = 1;
    cards.forEach(card => {
        cardIndex++;
        let types = card.querySelectorAll(".types span");
        let colors = [];
        types.forEach(type => {
            let color = window.getComputedStyle(type).backgroundColor;
            colors.push(color);
        })
        
        if (colors.length == 2) {
            card.style.background = `linear-gradient(135deg, ${colors[0]}75%, ${colors[1]}20%)`;
        } else {
            card.style.backgroundColor = `${colors[0]}`;
        }
    })
}

function renderCardList() {
    const mainContent = document.getElementById("mainContent");
    mainContent.innerHTML = cardsToRender;
}