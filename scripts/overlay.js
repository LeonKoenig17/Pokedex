function openOverlay(id) {
    const overlay = document.getElementById("cardOverlay");
    const cardDisplay = overlay.getElementById("cardDisplay");
    overlay.style.display = "flex";
    // cardDisplay.innerHtml = 
    const overlayCard = document.querySelector(".cardDisplay .card");
    overlayCard.classList.add("large");
    overlayCard.classList.remove("isButton");
}