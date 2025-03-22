let timeout;
let isLoading = false;
let fetchedUrls = {};
let offset = 30;
let loadingContent = [];
let pokemonArray = [];
let abortController = new AbortController();


async function compareUrls(url) {
    let result = "";
    let isStored = fetchedUrls.hasOwnProperty(url);
    if (isStored) {
        result = fetchedUrls[url];
    } else {
        let newData = await fetch(url).then(res => res.json());
        fetchedUrls[url] = newData;
        result = newData;
    }
    return result;
}


window.addEventListener("load", function() {
    document.getElementById("searchInput").addEventListener("input", function() {
        // clearTimeout(timeout);
        // timeout = setTimeout(() => {
            const inputField = document.getElementById("searchInput");
            let input = inputField.value.trim();
            if (input.length >= 3) {
                abortController.abort();
                abortController = new AbortController();
                getInput();
            } else if (input.length == 0){
                reset();
            }
        // }, 1000);
    })
    reset();
})


function reset() {
    window.scrollTo({top: 0})
    const inputField = document.getElementById("searchInput");
    inputField.value = "";

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
        // isLoading = true;
    }
}


async function start(input) {
    try {
        const loadMoreBtn = document.getElementById("loadMoreBtn");
        let selectionArray = [];
        
        if (input != "") {
            let path = `https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0`;
            let responseToJson = await compareUrls(path);
            processInput(responseToJson, input, selectionArray, loadMoreBtn);
        } else {
            let path = `https://pokeapi.co/api/v2/pokemon?limit=30&offset=0`;
            let responseToJson = await compareUrls(path);
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
    let path = `https://pokeapi.co/api/v2/pokemon?limit=${offset + 30}&offset=0`;
    let responseToJson = await compareUrls(path);
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
    try {
        let progress = 0;

        const pokemonDataArray = await Promise.all(selectionArray.map(url => compareUrls(url)));
        await Promise.all(pokemonDataArray.map(async (data, index) => {
            await getStats(data);
            progress++;
            updateLoadingBar(progress, selectionArray);
        }));

        console.log(pokemonArray);
        
        pokemonArray.sort((a, b) => a.id - b.id);
        for (let i = (offset - 30); i < pokemonArray.length; i++) {
            let typeString = generateTypeIcons(pokemonArray[i].types);
            let abilityString = generateAbilityString(pokemonArray[i].abilities);
            loadingContent.push(createCard(pokemonArray[i], typeString, abilityString));
        }
    } catch (error) {
        console.error(error);
    }
}


function updateLoadingBar(progress, selectionArray) {
    const loadingBar = document.getElementById("loadingBar");
    const percentage = (progress / selectionArray.length) * 100;
    loadingBar.style.width = percentage + "%";
}


async function getStats(pokemon) {
    try {
        let formattedPokemon = formatPokemonData(pokemon);
        let abilityData = await fetchAbilities(pokemon.abilities);
        let evoChainArray = await fetchEvolutionChain(pokemon.species.url);
        
        let newPokemon = {
            ...formattedPokemon,
            id: pokemon.id,
            abilities: abilityData,
            evolutions: evoChainArray
        }

        pokemonArray.push(newPokemon);
    } catch (error) {
        console.error("getStatsError: " + error)
    }
}


function formatPokemonData(pokemon) {
    let {id, name, types, sprites, stats, base_experience, height, weight} = pokemon;
    let formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    let typeNames = types.map(type => type.type.name);
    let [hp, attack, defense, specialAttack, specialDefense, speed] = stats.map(stat => stat.base_stat);

    return {
        id, 
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
        let responseToJson = await compareUrls(i.ability.url);
        let description = responseToJson.effect_entries.find(entry => entry.language.name === "en")?.effect || "No description available";
        return {name: responseToJson.name, description};
    }));
}


async function fetchEvolutionChain(speciesUrl) {
    let speciesToJson = await compareUrls(speciesUrl);
    let evoChainToJson = await compareUrls(speciesToJson.evolution_chain.url);
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
    let speciesBkToJson = await compareUrls(url);
    let pokemonBkToJson = await compareUrls(speciesBkToJson.varieties[0].pokemon.url);
    return pokemonBkToJson;
}


function generateTypeIcons(types) {
    let typeString = "";
    types.forEach(type => {
        typeString += `<span class="${type} typeIcon"></span>`;
    });

    return typeString;
}


function generateAbilityString(abilities) {
    let abilityString = "";
    abilities.forEach(ability => {
        let nextAbility = ability.name.charAt(0).toUpperCase() + ability.name.slice(1);
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