function openOverlay(id) {
    const overlay = document.getElementById("cardOverlay");
    const cardDisplay = document.getElementById("cardDisplay");
    const originalCard = document.getElementById(id);
    const card = originalCard.cloneNode(true);
    document.getElementById("stats").classList.add("active");
    document.getElementById("statsBtn").classList.add("activeBtn");
    let pokemon = pokemonArray[id];
    document.body.style.overflowY = "hidden";
    overlay.addEventListener("click", closeOverlay);
    cardDisplay.appendChild(card);
    card.classList.add("large");
    card.classList.remove("isButton");
    card.onclick = null;
    overlay.style.display = "flex";
    setPokemonHeight(pokemon);
    setStats(pokemon);
    displayAbilities(pokemon);
    displayEvoChain(pokemon);
}

function closeOverlay(event) {
    const overlay = document.getElementById("cardOverlay");
    const cardDisplay = document.getElementById("cardDisplay");
    const abilities = document.getElementById("abilities");
    
    if (event.target === overlay) {
        const evoChain = document.getElementById("evoChain");
        evoChain.innerHTML = "";
        const btns = document.querySelectorAll("#boxHeader button");
        btns.forEach(btn => btn.classList.remove("activeBtn"));
        const tabs = document.querySelectorAll("#boxContent > div");
        tabs.forEach(tab => tab.classList.remove("active"));
        abilities.innerHTML = "";
        cardDisplay.innerHTML = "";
        overlay.style.display = "none";
        document.body.style.overflowY = "auto";
        console.log(leftArrow);
    }
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

function previousCard(id) {
    if (id != 0) {
        const button = document.getElementById(id);
        const card = document.querySelector("#cardDisplay div");
        const previousCard = card.id - 1;
        button.addEventListener("click", closeOverlay);
        openOverlay(previousCard);
    }
}

function nextCard() {

}