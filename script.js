const BASE_URL = "https://pokeapi.co/api/v2/";

let deckSize = 10;

window.addEventListener("load", function() {
    loadAllData("pokemon?limit=100000&offset=0");
})

window.addEventListener("DOMContentLoaded", function() {
    getColors();
})

function getColors() {
    console.log("DOMContentLoaded");
    const elements = document.querySelectorAll(".typeIcon");
    console.log(elements);
}

async function loadAllData(path="") {
    try {
        let response = await fetch(BASE_URL + path);
        let responseToJson = await response.json();

        for (let i = 0; i < deckSize; i++) {
            loadData(responseToJson.results[i].url);
        }
    } catch (error) {
        console.error("loadAllData Error: " + error);
    }
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

async function loadData(path="") {
    try {
        const mainContent = document.getElementById("mainContent");        

        let response = await fetch(path);
        let data = await response.json();

        // console.log(data);

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

        mainContent.innerHTML += createCard(name, typeString, sprite, hp, attack, defense, baseXP, height, weight, abilityString);
    } catch (error) {
        console.error("loadData Error:" + error);
    }
}