function openOverlay(id) {
    const overlay = document.getElementById("cardOverlay");
    overlay.addEventListener("click", closeOverlay);
    overlay.style.display = "flex";

    const pokeDisplay = document.getElementById("pokemonDisplay");
    const pokemon = pokemonArray[id];
    document.querySelector("#pokemonDisplay h3").innerHTML = pokemon.name;
    document.querySelector("#pokemonDisplay img").src = pokemon.image;
    const types = document.querySelector("#pokemonDisplay #types");
    pokemon.types.forEach(type => {
        types.innerHTML += `
            <div>
                <span class="${type} typeIcon"></span>
                <span>${type}</span>
            </div>`;
    })

    document.getElementById("stats").classList.add("active");
    document.getElementById("statsBtn").classList.add("activeBtn");
    document.body.style.overflowY = "hidden";

    renderOverlay(id);
}

function renderOverlay(id) {
    let pokemon = pokemonArray[id];

    renderArrows(id);
    setPokemonHeight(pokemon);
    setStats(pokemon);
    displayAbilities(pokemon);
    displayEvoChain(pokemon);
}

function closeOverlay(event) {
    const overlay = document.getElementById("cardOverlay");
    
    if (event.target === overlay) {
        resetOverlay();
    }
}

function resetOverlay() {
        const overlay = document.getElementById("cardOverlay");
        const cardDisplay = document.getElementById("cardDisplay");
        const abilities = document.getElementById("abilities");
        const evoChain = document.getElementById("evoChain");
        evoChain.innerHTML = "";
        const btns = document.querySelectorAll("#boxHeader button");
        btns.forEach(btn => btn.classList.remove("activeBtn"));
        const tabs = document.querySelectorAll("#boxContent > div");
        tabs.forEach(tab => tab.classList.remove("active"));
        abilities.innerHTML = "";
        // cardDisplay.innerHTML = "";
        overlay.style.display = "none";
        document.body.style.overflowY = "auto";
}

function toggleTab(id) {
    const tabs = document.querySelectorAll("#boxContent > div");
    const btns = document.querySelectorAll("#boxHeader button");
    btns.forEach(btn => btn.classList.remove("activeBtn"));
    document.getElementById(id).classList.add("activeBtn");
    tabs.forEach(tab => tab.classList.remove("active"));
    switch (id) {
        case "statsBtn": tabs[0].classList.add("active");
            break;
        case "abilitiesBtn": tabs[1].classList.add("active");
            break;
        case "evoChainBtn": tabs[2].classList.add("active");
            break;
        default:
            break;
    }
}

let humanHeight = 170;

function setPokemonHeight(pokemon) {
    const humanImg = document.getElementById("humanImg");
    const pokemonImg = document.getElementById("pokemonImg");
    let percentage = pokemon.height / humanHeight;

    if (percentage < 1) {
        humanImg.style.height = "100%";
        pokemonImg.style.height = `${percentage * 100}%`;
    } else {
        percentage = humanHeight / pokemon.height;
        humanImg.style.height = `${percentage * 100}%`;
        pokemonImg.style.height = "100%";
    }
}

const maxStats = [255, 190, 250, 194, 250, 200];

function setStats(pokemon) {
    const {hitpoints, attack, defense, specialAttack, specialDefense, speed} = pokemon;
    let stats = [hitpoints, attack, defense, specialAttack, specialDefense, speed];
    const baseXp = document.querySelector("#XpWeight #xp");
    const weight = document.querySelector("#XpWeight #wt");
    const statBars = document.querySelectorAll(".statBar");

    baseXp.innerHTML = "XP: " + pokemon.experience;
    weight.innerHTML = "Weight: " + pokemon.weight + "kg";

    for (i = 0; i < stats.length; i++) {
        let percentage = (stats[i] / maxStats[i]) * 100;
        statBars[i].style.width = `${percentage}%`;
    }
}

function displayAbilities(pokemon) {
    const abilities = document.getElementById("abilities");
    pokemon.abilities.forEach(ability => {
        let name = ability.name.charAt(0).toUpperCase() + ability.name.slice(1);
        abilities.innerHTML += `
            <div class="ability">
                <h3>${name}</h3>
                <p>${ability.description}</p>
            </div>
        `;
    })
}

function displayEvoChain(pokemon) {
    const evoChain = document.getElementById("evoChain");
    pokemon.evolutions.forEach(evo => {
        let name = evo.name.charAt(0).toUpperCase() + evo.name.slice(1);
        evoChain.innerHTML += `
            <div class="evo">
                <img src="${evo.image}" alt="evo">
                <span>${name}</span>
            </div>
        `;
    })
}

function renderArrows(id) {
    const leftArrow = document.getElementById("leftArrow");
    const rightArrow = document.getElementById("rightArrow");
    if (id == 0) {
        leftArrow.style.visibility = "hidden";
    } else {
        leftArrow.style.visibility = "visible";
    }
    if (id == pokemonArray.length - 1) {
        rightArrow.style.visibility = "hidden";
    } else {
        rightArrow.style.visibility = "visible";
    }
}

function previousCard() {
    const card = document.querySelector("#cardDisplay div");
    const previousCard = parseInt(card.id) - 1;
    resetOverlay();
    openOverlay(previousCard);
}

function nextCard() {
    const card = document.querySelector("#cardDisplay div");
    const nextCard = parseInt(card.id) + 1;
    resetOverlay();
    openOverlay(nextCard);
}