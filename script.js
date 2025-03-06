const BASE_URL = "https://pokeapi.co/api/v2/";

window.addEventListener("load", function() {
    let deckSize = 10;
    
    for (let i = 1; i <= deckSize; i++) {
        loadData(`pokemon/${i}`);
    }
    
})

function createCard(name, types, sprite) {
    return `
        <div class="card">
            <div class="cardHeader">
                <h3>${name}</h3>
                <span>HP</span>
                <div class="types">
                    <span class="grass"></span>
                    ${types}
                </div>
            </div>
            <img class="image" src="${sprite}" alt="card image">
        </div>
    `;
}

async function loadData(path="") {
    try {
        const mainContent = document.getElementById("mainContent");
        
        let response = await fetch(BASE_URL + path);
        let data = await response.json();
        console.log(data);

        let name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
        let types = data.types;
        let typeString = "";
        let sprite = data.sprites.front_default;
        // base XP
        // height
        // weight
        // abilities
        // stats (hp, attack, defense)
        
        types.forEach(type => {
            let nextType = type.type.name;
            typeString += `<span>${nextType}</span>`;
        });

        mainContent.innerHTML += createCard(name, typeString, sprite);
    } catch (error) {
        console.error("ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    }
}