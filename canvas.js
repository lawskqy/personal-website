const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
let img = document.createElement("img");
img.src = "/red-lily.jpg";
const symbols = "%*-=+*#0369 ";
const fontSize = 8;
const threshold = 0.7;
const pushRadius = 5;
const spring = 0.025;
const damping = 0.9;


img.addEventListener("load", function() {
    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw/img.naturalWidth, ch/img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    ctx.drawImage(img, (cw - drawW) / 2, (ch - drawH) / 2, drawW, drawH);

    const pixelData = ctx.getImageData(0, 0, cw, ch);

    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = "white";
    ctx.font = `${fontSize}px monospace`;
    let pixelArray = [];
    
    for (let row = 0; row < ch; row += fontSize) {
        for (let col = 0; col < cw; col += fontSize) {
            const idx = (row * cw + col) * 4;
            const r = pixelData.data[idx];
            const g = pixelData.data[idx + 1];
            const b = pixelData.data[idx + 2];
            const brightness = (r + g + b) / 3;
            const charIdx = Math.floor((brightness / 255) * (symbols.length - 1));
            ctx.fillText(symbols[charIdx], col, row + fontSize);
            pixelArray.push({
              char: symbols[charIdx],
              originalX: col,
              originalY: row,
              currentX: col,
              currentY: row,
              velocityX: 0,
              velocityY: 0
            });
        }
    }

    let mouse = {x: -999, y: -999};
    window.addEventListener("mousemove", e => {
        let rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    function updatePhysics() {

      for (let i = 0; i < pixelArray.length; i++) {
          let distance = Math.hypot(pixelArray[i].currentX - mouse.x, pixelArray[i].currentY - mouse.y);
          if (distance < 50) {
            let directionX = (pixelArray[i].currentX - mouse.x)/distance;
            let directionY = (pixelArray[i].currentY - mouse.y)/distance;
            pixelArray[i].velocityX += directionX;
            pixelArray[i].velocityY += directionY;
          }
          pixelArray[i].velocityX += ((pixelArray[i].originalX - pixelArray[i].currentX) * spring);
          pixelArray[i].velocityY += ((pixelArray[i].originalY - pixelArray[i].currentY) * spring);
          pixelArray[i].velocityX *= damping;
          pixelArray[i].velocityY *= damping;
          pixelArray[i].currentX += pixelArray[i].velocityX;
          pixelArray[i].currentY += pixelArray[i].velocityY;
      }

      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = "white";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < pixelArray.length; i++) {
        ctx.fillText(pixelArray[i].char, pixelArray[i].currentX, pixelArray[i].currentY);
      }

      requestAnimationFrame(updatePhysics);
    }

    updatePhysics();
});
