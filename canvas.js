const symbols = "%*-=+*#0369 ";
const sourceImage = "./red-lily.jpg";

function createFlower(canvas, { interactive = false } = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = sourceImage;

  img.addEventListener("load", () => {
    const width = canvas.width;
    const height = canvas.height;
    const fontSize = Math.max(8, Math.round(width / 52));
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const drawWidth = img.naturalWidth * scale;
    const drawHeight = img.naturalHeight * scale;
    ctx.drawImage(img, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    const pixels = ctx.getImageData(0, 0, width, height).data;
    const points = [];

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "white";
    ctx.font = `${fontSize}px monospace`;
    for (let y = 0; y < height; y += fontSize) {
      for (let x = 0; x < width; x += fontSize) {
        const index = (y * width + x) * 4;
        const brightness = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
        const point = { char: symbols[Math.floor((brightness / 255) * (symbols.length - 1))], originalX: x, originalY: y, currentX: x, currentY: y, velocityX: 0, velocityY: 0 };
        points.push(point);
        ctx.fillText(point.char, x, y + fontSize);
      }
    }

    if (!interactive || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pointer = { x: -999, y: -999 };
    let activePointerId = null;
    const updatePointer = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.x = (event.clientX - rect.left) * (width / rect.width);
      pointer.y = (event.clientY - rect.top) * (height / rect.height);
    };
    canvas.addEventListener("pointerdown", (event) => {
      activePointerId = event.pointerId;
      canvas.setPointerCapture(event.pointerId);
      updatePointer(event);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" && event.pointerId !== activePointerId) return;
      updatePointer(event);
    });
    const releasePointer = (event) => {
      if (event.pointerId !== activePointerId && event.pointerType !== "mouse") return;
      activePointerId = null;
      pointer.x = -999;
      pointer.y = -999;
    };
    canvas.addEventListener("pointerup", releasePointer);
    canvas.addEventListener("pointercancel", releasePointer);
    canvas.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse") { pointer.x = -999; pointer.y = -999; }
    });

    function animate() {
      points.forEach((point) => {
        const distance = Math.hypot(point.currentX - pointer.x, point.currentY - pointer.y);
        if (distance > 0 && distance < 50) {
          point.velocityX += ((point.currentX - pointer.x) / distance) * 0.9;
          point.velocityY += ((point.currentY - pointer.y) / distance) * 0.9;
        }
        point.velocityX += (point.originalX - point.currentX) * 0.025;
        point.velocityY += (point.originalY - point.currentY) * 0.025;
        point.velocityX *= 0.9;
        point.velocityY *= 0.9;
        point.currentX += point.velocityX;
        point.currentY += point.velocityY;
      });
      ctx.clearRect(0, 0, width, height);
      points.forEach((point) => ctx.fillText(point.char, point.currentX, point.currentY + fontSize));
      requestAnimationFrame(animate);
    }
    animate();
  }, { once: true });
}

createFlower(document.getElementById("myCanvas"), { interactive: window.matchMedia("(hover: hover) and (pointer: fine)").matches });

const dialog = document.getElementById("flower-dialog");
const previewCanvas = document.getElementById("myCanvas");
const closeButton = document.querySelector(".dialog-close");
let modalStarted = false;
let lockedScrollY = 0;

const openFlowerDialog = () => {
  if (!modalStarted) {
    createFlower(document.getElementById("flower-modal-canvas"), { interactive: true });
    modalStarted = true;
  }
  lockedScrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.width = "100%";
  document.body.classList.add("dialog-open");
  dialog?.showModal();
};

if (previewCanvas && window.matchMedia("(hover: none), (pointer: coarse)").matches) {
  previewCanvas.setAttribute("role", "button");
  previewCanvas.setAttribute("tabindex", "0");
  previewCanvas.setAttribute("aria-haspopup", "dialog");
  previewCanvas.addEventListener("pointerdown", openFlowerDialog);
  previewCanvas.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFlowerDialog();
    }
  });
}

closeButton?.addEventListener("click", () => dialog?.close());
dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
dialog?.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  window.scrollTo(0, lockedScrollY);
});
