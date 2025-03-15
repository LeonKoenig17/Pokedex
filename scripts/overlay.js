function openOverlay(id) {
    const overlay = document.getElementById("cardOverlay");
    const cardDisplay = document.getElementById("cardDisplay");
    const originalCard = document.getElementById(id);
    const card = originalCard.cloneNode(true);
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
}

function closeOverlay(event) {
    const overlay = document.getElementById("cardOverlay");
    const cardDisplay = document.getElementById("cardDisplay");
    
    if (event.target === overlay) {
        cardDisplay.innerHTML = "";
        overlay.style.display = "none";
        document.body.style.overflowY = "auto";
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

function setStats(pokemon) {
    const baseXp = document.querySelector("#XpWeight #xp");
    const weight = document.querySelector("#XpWeight #wt");

    baseXp.innerHTML = "XP: " + pokemon.experience;
    weight.innerHTML = "Weight: " + pokemon.weight + "kg";
}