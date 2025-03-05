window.onload = () => {
    const allContainers = document.querySelectorAll("body *");
    console.log(allContainers);
    allContainers.forEach(container => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);

        container.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    });
}