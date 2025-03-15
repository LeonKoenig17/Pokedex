// bugs:
// implement:
    // card overlay:
    // overlay should close when clicking in empty space
    // body not scrollable while overlay is open
    // go to next/previous card by clicking arrows

window.addEventListener("load", function() {
    reset();
})


function reset() {
    const mainContent = document.getElementById("mainContent");
    mainContent.innerHTML = "";
    console.log(mainContent.innerHTML);
    pokemonArray = [];
    cardIndex = 0;
    offset = 30;
    start("");
}


function getInput() {
    const inputField = document.getElementById("searchInput");
    let input = inputField.value.trim();
    pokemonArray = [];
    cardIndex = 0;
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
        let responseToJson = await fetch(path).then(res => res.json()); // all-pokemon array
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
        loadingBar.style.width = 0;
    } catch (error) {
        console.error("startError: " + error);
    }
}

let loadingContent = [];

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
    loadingContent.forEach(card => mainContent.innerHTML += card);
    loadingContent = [];
    setBackgroundColor();
    console.log(pokemonArray);
}


async function loadMore() {
    let path = `https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0`;
    let responseToJson = await fetch(path).then(res => res.json());
    let selectionArray = [];
    
    for (let i = offset; i < (offset + 30); i++) {
        if (i >= responseToJson.results.length) break;
        selectionArray.push(responseToJson.results[i].url);
    }
    offset += 30;
    
    await processSelection(selectionArray);
    loadMoreBtn.style.display = "block";
    selectionArray = [];
}


async function loadData(selectionArray) {
    const loadingBar = document.getElementById("loadingBar");
    let cardIndex = 0;
    for (const url of selectionArray) {
        let data = await fetch(url).then(res => res.json());
        await getStats(data);
        cardIndex++;
        let percentage = (cardIndex / selectionArray.length) * 100;
        loadingBar.style.width = percentage + "%";
    }
}


let pokemonArray = [];
let cardIndex = 0;

async function getStats(pokemon) {
    try {
        let {name, types, sprites, stats, base_experience, height, weight, abilities, species} = pokemon;
        let formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        let typeNames = types.map(type => type.type.name);
        let [hp, attack, defense, specialAttack, specialDefense, speed] = stats.map(stat => stat.base_stat);
        height *= 10;
        weight = Math.round(weight / 10);

        let abilityPromises = abilities.map(async (i) => {
            let responseToJson = await fetch(i.ability.url).then(res => res.json());
            let description = responseToJson.effect_entries.find(entry => entry.language.name === "en")?.effect || "No description available";
            return {name: responseToJson.name, description};
        })

        let abilityData = await Promise.all(abilityPromises);
        let speciesToJson = await fetch(species.url).then(res => res.json());
        let evoChainToJson = await fetch(speciesToJson.evolution_chain.url).then(res => res.json());
        
        let evoChainArray = [];
        let path = evoChainToJson.chain;

        while (path) {
            let evoData = await getEvolutionData(path);
            if (evoData) evoChainArray.push(evoData);
            path = path.evolves_to.length ? path.evolves_to[0] : null;
        }

        let typeString = "";
        types.forEach(type => {
            let nextType = type.type.name;
            typeString += `<span class="${nextType} typeIcon"></span>`;
        });

        let abilityString = "";
        abilities.forEach(ability => {
            let nextAbility = ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1);
            abilityString += `${nextAbility}<br>`;
        })
        
        let newPokemon = {
            index: cardIndex,
            name: formattedName,
            image: sprites.front_default,
            types: typeNames,
            hitpoints: hp,
            attack: attack, 
            defense: defense, 
            specialAttack: specialAttack, 
            specialDefense: specialDefense, 
            speed: speed,
            experience: base_experience, 
            height: height,
            weight: weight,
            abilities: abilityData,
            evolutions: evoChainArray
        }

        pokemonArray.push(newPokemon);
        loadingContent.push(createCard(newPokemon, typeString, abilityString));
        cardIndex++;
    } catch (error) {
        console.error("getStatsError: " + error)
    }
}


async function getEvolutionData(evoPath) {
    if (!evoPath) return null;
    let tracedPokemon = await tracePokemon(evoPath.species.url);
    return {
        name: evoPath.species.name,
        image: tracedPokemon.sprites.front_default
    }
}


async function tracePokemon(url) {
    let speciesBkToJson = await fetch(url).then(res => res.json());
    let pokemonBkToJson = await fetch(speciesBkToJson.varieties[0].pokemon.url).then(res => res.json());
    return pokemonBkToJson;
}


function createCard(pokemon, types, abilities) {
    return `
        <div id="${pokemon.index}" class="card isButton" onclick="openOverlay(this.id)">
            <div class="cardHeader">
                <h3>${pokemon.name}</h3>
                <span>${pokemon.hitpoints}HP</span>
                <div class="types">${types}</div>
            </div>
            <div class="image">
                <img src="${pokemon.image}" alt="card image">
            </div>
            <div class="info">
                <span>XP: ${pokemon.experience}</span>
                <span>HT: ${pokemon.height}cm</span>
                <span>WT: ${pokemon.weight}kg</span>
            </div>
            <div class="attributes">
                <table>
                    <tr>
                        <td>Attack:</td>
                        <td>${pokemon.attack}</td>
                    </tr>
                    <tr>
                        <td>Defense:</td>
                        <td>${pokemon.defense}</td>
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
    
    cards.forEach(card => {
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