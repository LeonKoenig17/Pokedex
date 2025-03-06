window.addEventListener("load", function() {
    setTimeout(generateColors, 100)   
})

function generateColors() {
    const allContainers = document.querySelectorAll("body *");

    allContainers.forEach(container => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        
        container.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    })
}