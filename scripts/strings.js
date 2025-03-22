function createCard(pokemon, types, abilities) {
    return `
        <div id="${pokemon.id}" class="card isButton" onclick="openOverlay(this.id)">
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