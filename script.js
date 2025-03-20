let timeout;
let isLoading = false;

window.addEventListener("load", function() {
    document.getElementById("searchInput").addEventListener("input", function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const inputField = document.getElementById("searchInput");
            let input = inputField.value.trim();
            if (input.length >= 3) {
                getInput();
            }
        }, 1000);
    })
    reset();
})


function reset() {
    const mainContent = document.getElementById("mainContent");
    mainContent.innerHTML = "";
    
    const reloadBtn = document.getElementById("reloadMain");
    reloadBtn.style.display = "none";

    const noRes = document.getElementById("noRes");
    noRes.style.display = "none";

    pokemonArray = [];
    cardIndex = 0;
    offset = 30;

    start("");
}


function getInput() {
    const inputField = document.getElementById("searchInput");
    let input = inputField.value.trim();

    const reloadBtn = document.getElementById("reloadMain");
    reloadBtn.style.display = "none";

    const noRes = document.getElementById("noRes");
    noRes.style.display = "none";

    pokemonArray = [];
    cardIndex = 0;
    
    if (!isLoading) {
        start(input);
        isLoading = true;
    }
}


let offset = 30;

async function start(input) {
    try {
        const loadMoreBtn = document.getElementById("loadMoreBtn");
        let path = `https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0`;
        let responseToJson = await fetch(path).then(res => res.json()); // all-pokemon array
        let selectionArray = [];

        if (input != "") {
            processInput(responseToJson, input, selectionArray, loadMoreBtn);
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

async function processInput(responseToJson, input, selectionArray, loadMoreBtn) {
    const reloadBtn = document.getElementById("reloadMain");
    const mainContent = document.getElementById("mainContent");
    const noRes = document.getElementById("noRes");
    mainContent.innerHTML = "";
    responseToJson.results.forEach(pokemon => {
        if (pokemon.name.toLowerCase().includes(input.toLowerCase())) {
            selectionArray.push(pokemon.url);
        }
    });

    if (selectionArray.length == 0) {
        noRes.style.display = "block";
        noRes.innerHTML = `<h3>Sorry! There are no results for "${input}".</h3>`;
        loadMoreBtn.style.display = "none";
        isLoading = false;
        reloadBtn.style.display = "block";
    } else {
        await processSelection(selectionArray);
        reloadBtn.style.display = "block";
    }
}

async function processSelection(selectionArray) {
    const mainContent = document.getElementById("mainContent");
    const overlay = document.getElementById("loading");
    const loadMoreBtn = document.getElementById("loadMoreBtn");

    loadMoreBtn.style.display = "none";
    showLoading(overlay);

    await loadData(selectionArray);

    hideLoading(overlay);
    loadingContent.forEach(card => mainContent.innerHTML += card);
    loadingContent = [];
    setBackgroundColor();
    isLoading = false;
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
    
    selectionArray = await renderMore(selectionArray);
}


async function renderMore(selectionArray) {
    const overlay = document.getElementById("loading");
    originalParent = overlay.parentNode;
    const darkBg = document.getElementById("darkBg");
    darkBg.style.display = "flex";
    darkBg.appendChild(overlay);
    document.body.style.overflowY = "hidden";
    await processSelection(selectionArray);
    darkBg.style.display = "none";
    document.body.style.overflowY = "auto";
    originalParent.appendChild(overlay);
    loadMoreBtn.style.display = "block";
    selectionArray = [];
    return selectionArray;
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
        let formattedPokemon = formatPokemonData(pokemon);
        let abilityData = await fetchAbilities(pokemon.abilities);
        let evoChainArray = await fetchEvolutionChain(pokemon.species.url);
        let typeString = generateTypeIcons(pokemon.types);
        let abilityString = generateAbilityString(pokemon.abilities);
        
        let newPokemon = {
            ...formattedPokemon,
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


function formatPokemonData(pokemon) {
    let {name, types, sprites, stats, base_experience, height, weight} = pokemon;
    let formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    let typeNames = types.map(type => type.type.name);
    let [hp, attack, defense, specialAttack, specialDefense, speed] = stats.map(stat => stat.base_stat);

    return {
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
        height: height * 10,
        weight: Math.round(weight / 10),
    }
}


async function fetchAbilities(abilities) {
    return await Promise.all(abilities.map(async (i) => {
        let responseToJson = await fetch(i.ability.url).then(res => res.json());
        let description = responseToJson.effect_entries.find(entry => entry.language.name === "en")?.effect || "No description available";
        return {name: responseToJson.name, description};
    }));
}


async function fetchEvolutionChain(speciesUrl) {
    let speciesToJson = await fetch(speciesUrl).then(res => res.json());
    let evoChainToJson = await fetch(speciesToJson.evolution_chain.url).then(res => res.json());
    let evoChainArray = [];
    let path = evoChainToJson.chain;

    while (path) {
        let evoData = await getEvolutionData(path);
        if (evoData) evoChainArray.push(evoData);
        path = path.evolves_to.length ? path.evolves_to[0] : null;
    }

    return evoChainArray;
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


function generateTypeIcons(types) {
    let typeString = "";
    types.forEach(type => {
        let nextType = type.type.name;
        typeString += `<span class="${nextType} typeIcon"></span>`;
    });

    return typeString;
}


function generateAbilityString(abilities) {
    let abilityString = "";
    abilities.forEach(ability => {
        let nextAbility = ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1);
        abilityString += `${nextAbility}<br>`;
    })

    return abilityString;
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