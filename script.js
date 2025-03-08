window.addEventListener("load", function() {
    const BASE_URL = "https://pokeapi.co/api/v2/";
    loadAllData(BASE_URL, "pokemon?limit=100000&offset=0", deckSize = 10);
})

async function loadAllData(BASE_URL, path="", deckSize) {
    try {
        let response = await fetch(BASE_URL + path);
        let responseToJson = await response.json();

        for (let i = 0; i < deckSize; i++) {
            await loadData(responseToJson.results[i].url); // waits for LoadData() to finish before executing again
        }

        getCards();
    } catch (error) {
        console.error("loadAllData Error: " + error);
    }
}

async function loadData(path="") {
    let response = await fetch(path);
    let data = await response.json();
    processCardData(data);
}

function processCardData(data) {
    const mainContent = document.getElementById("mainContent");        
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
    let bgColor = "";
    let bgColors = [];

    types.forEach(type => {
        let nextType = type.type.name;
        typeString += `<span class="${nextType} typeIcon"></span>`;
       bgColors.push(nextType);
    });

    bgColors.forEach(color => {
        // console.log(color);
        // window.getComputedStyle(color).backgroundColor;
    })

    abilities.forEach(ability => {
        let nextAbility = ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1);
        abilityString += `${nextAbility}<br>`;
    })
    
    mainContent.innerHTML += createCard(name, typeString, sprite, hp, attack, defense, baseXP, height, weight, abilityString, bgColors);
}

function createCard(name, types, sprite, hp, attack, defense, xp, height, weight, abilities, bgColor) {
    return `
        <div class="card ${bgColor}">
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

function getCards() {
    let cards = document.querySelectorAll(".card");
    console.log(cards);
}