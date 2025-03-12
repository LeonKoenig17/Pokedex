// bugs:
// implement:
    // card overlay:
    // overlay should close when clicking in empty space
    // body not scrollable while overlay is open
    // go to next/previous card by clicking arrows

    //overlayContent 
    // ability + description
        // abilityURL: pokemon.abilities[i].ability.url
        // description: urlJson().effect_entries[1].effect
    // evolutions + images

window.addEventListener("load", function() {
    reset();
})


function reset() {
    const mainContent = document.getElementById("mainContent");
    mainContent.innerHTML = "";
    start("");
}


function getInput() {
    const inputField = document.getElementById("searchInput");
    let input = inputField.value.trim();
    if (input != "") {
        start(input);
    }
}


let offset = 30;

async function start(input) {
    try {
        const mainContent = document.getElementById("mainContent");
        const loadMoreBtn = document.getElementById("loadMoreBtn");
        let path = `https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0`;
        let response = await fetch(path);
        let responseToJson = await response.json(); // all-pokemon array
        let selectionArray = [];

        if (input != "") {
            mainContent.innerHTML = "";
            responseToJson.results.forEach(pokemon => {
                if(pokemon.name.toLowerCase().includes(input.toLowerCase())) {
                    selectionArray.push(pokemon.url);
                }
            })
            processSelection(selectionArray);
        } else {
            for (let i = 0; i < offset; i++) {
                selectionArray.push(responseToJson.results[i].url);
            }
            await processSelection(selectionArray);
            loadMoreBtn.style.display = "block";
        }
    } catch (error) {
        console.error("startError: " + error);
    }
}

let loadingContent = "";

async function processSelection(selectionArray) {
    const mainContent = document.getElementById("mainContent");
    const overlay = document.getElementById("loading");
    const searchBtn = document.getElementById("searchBtn");
    const heading = document.getElementById("heading");
    const loadMoreBtn = document.getElementById("loadMoreBtn");

    searchBtn.removeEventListener("click", getInput);
    heading.removeEventListener("click", reset);
    loadMoreBtn.style.display = "none";
    showLoading(overlay);

    await loadData(selectionArray);

    searchBtn.addEventListener("click", getInput);
    heading.addEventListener("click", reset);
    hideLoading(overlay);
    mainContent.innerHTML += loadingContent;
    setBackgroundColor();
    loadingContent = "";
}


async function loadMore() {
    let path = `https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0`;
    let response = await fetch(path);
    let responseToJson = await response.json();
    let selectionArray = [];
    
    for (let i = offset; i < (offset + 30); i++) {
        if (i >= responseToJson.results.length) break;
        selectionArray.push(responseToJson.results[i].url);
    }
    offset += 5;
    
    await processSelection(selectionArray);
    loadMoreBtn.style.display = "block";
    setBackgroundColor();
}


async function loadData(selectionArray) {
    const loadingBar = document.getElementById("loadingBar");
    let cardIndex = 0;
    for (const url of selectionArray) {
        let response = await fetch(url);
        let data = await response.json();
        processCardData(data);
        cardIndex++;
        let percentage = (cardIndex / selectionArray.length) * 100;
        loadingBar.style.width = percentage + "%";
    }
}


function processCardData(pokemon) {
    let name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    let types = pokemon.types;
    let typeString = "";
    let sprite = pokemon.sprites.front_default;
    let hp = pokemon.stats[0].base_stat;
    let attack = pokemon.stats[1].base_stat;
    let defense = pokemon.stats[2].base_stat;
    let baseXP = pokemon.base_experience;
    let height = pokemon.height * 10;
    let weight = Math.round(pokemon.weight / 10);
    let abilities = pokemon.abilities;
    let abilityString = "";

    types.forEach(type => {
        let nextType = type.type.name;
        typeString += `<span class="${nextType} typeIcon"></span>`;
    });

    abilities.forEach(ability => {
        let nextAbility = ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1);
        abilityString += `${nextAbility}<br>`;
    })
    
    loadingContent += createCard(name, typeString, sprite, hp, attack, defense, baseXP, height, weight, abilityString);
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
            <div class="image">
                <img src="${sprite}" alt="card image">
            </div>
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


let rotationInterval;

function showLoading(overlay) {
    const loadingSpinner = overlay.querySelector("img");
    overlay.style.display = "flex";
    let angle = 0;
    clearInterval(rotationInterval);
    rotationInterval = setInterval(() => {
        angle += 25;
        loadingSpinner.style.transform = `rotate(${angle}deg)`;
    }, 200)
}


function hideLoading(overlay) {
    overlay.style.display = "none";
    clearInterval(rotationInterval);
}