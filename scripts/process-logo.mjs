import sharp from "sharp";

const SRC = "C:/Users/uSistem/Desktop/лого.png";
const OUT_ORIG = "C:/Projects/NEXT-TOUR/client/public/images/nexttour-logo-lockup.png";       // оригинал (для светлых мест)
const OUT_LIGHT = "C:/Projects/NEXT-TOUR/client/public/images/nexttour-logo-lockup-light.png"; // для тёмного фона
const PREVIEW = "C:/Users/uSistem/AppData/Local/Temp/claude/preview-light.png";

const BLUE = [96, 190, 245];   // #60BEF5 — голубой для TOUR
const MOUNTAIN_SCALE = 1.28;   // насколько крупнее делаем горы (и выше, и шире)

const base = sharp(SRC).trim();
const { data, info } = await base.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels: ch } = info;
const isGreen = (r, g, b) => g - Math.max(r, b) > 22;

// --- Геометрия: полоса надписи NEXT/TOUR и линия раздела «горы / надпись» ---
const rowGreen = new Array(height).fill(0);
const rowOpaque = new Array(height).fill(0);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * ch;
    if (data[i + 3] === 0) continue;
    rowOpaque[y]++;
    if (isGreen(data[i], data[i + 1], data[i + 2])) rowGreen[y]++;
  }
}
const maxRow = Math.max(...rowGreen);
const thr = maxRow * 0.2;
let bandTop = height, bandBottom = 0;
for (let y = 0; y < height; y++) {
  if (rowGreen[y] >= thr) { if (y < bandTop) bandTop = y; if (y > bandBottom) bandBottom = y; }
}
bandBottom += 6;
// линия раздела — самая «пустая» строка над надписью (пробел между горами и NEXT)
let splitY = bandTop, minOp = Infinity;
for (let y = Math.max(0, bandTop - 90); y < bandTop; y++) {
  if (rowOpaque[y] < minOp) { minOp = rowOpaque[y]; splitY = y; }
}

// --- Точные границы гор (непрозрачные пиксели выше splitY) ---
let mx0 = width, mx1 = 0, my0 = splitY, my1 = 0;
for (let y = 0; y < splitY; y++) {
  for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * ch + 3] === 0) continue;
    if (x < mx0) mx0 = x; if (x > mx1) mx1 = x;
    if (y < my0) my0 = y; if (y > my1) my1 = y;
  }
}
const mtnW = mx1 - mx0 + 1, mtnH = my1 - my0 + 1, mtnBottom = my1 + 1;

// --- Перекраска для светлой версии ---
const light = Buffer.from(data);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * ch;
    if (light[i + 3] === 0) continue;
    const r = light[i], g = light[i + 1], b = light[i + 2];
    if (isGreen(r, g, b)) {
      light[i] = 255; light[i + 1] = 255; light[i + 2] = 255;       // NEXT + точки -> белый
    } else if (y >= bandTop - 6 && y <= bandBottom) {
      light[i] = BLUE[0]; light[i + 1] = BLUE[1]; light[i + 2] = BLUE[2]; // TOUR -> голубой
    } else {
      light[i] = 255; light[i + 1] = 255; light[i + 2] = 255;       // горы + подпись -> белый
    }
  }
}

// --- Увеличиваем горы, низ остаётся на месте, центр по горизонтали сохраняется ---
async function enlargeMountains(pngBuf) {
  const mtn = await sharp(pngBuf).extract({ left: mx0, top: my0, width: mtnW, height: mtnH }).toBuffer();
  const sW = Math.round(mtnW * MOUNTAIN_SCALE), sH = Math.round(mtnH * MOUNTAIN_SCALE);
  const mtnBig = await sharp(mtn).resize({ width: sW, height: sH, fit: "fill" }).toBuffer();

  const mtnCenterX = (mx0 + mx1 + 1) / 2;                 // сохраняем центр гор
  const newMtnTop = mtnBottom - sH;                        // низ гор на прежнем месте
  const extraTop = Math.max(0, -newMtnTop);
  const desiredLeft = Math.round(mtnCenterX - sW / 2);
  const extraLeft = Math.max(0, -desiredLeft, (desiredLeft + sW) - width);
  const canvasW = width + 2 * extraLeft;
  const canvasH = height + extraTop;
  const shiftX = extraLeft;

  return sharp({ create: { width: canvasW, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      // низ (надпись NEXT TOUR + подпись) — без изменений
      { input: await sharp(pngBuf).extract({ left: 0, top: splitY, width, height: height - splitY }).toBuffer(),
        left: shiftX, top: extraTop + splitY },
      // увеличенные горы
      { input: mtnBig, left: shiftX + desiredLeft, top: extraTop + newMtnTop },
    ])
    .png().toBuffer();
}

const origPng = await base.clone().png().toBuffer();
const lightPng = await sharp(light, { raw: { width, height, channels: ch } }).png().toBuffer();

await sharp(await enlargeMountains(origPng)).trim().toFile(OUT_ORIG);
const lightFinal = await sharp(await enlargeMountains(lightPng)).trim().toBuffer();
await sharp(lightFinal).toFile(OUT_LIGHT);

// Превью на тёмно-синем фоне шапки
const logo = await sharp(lightFinal).resize({ width: 520 }).toBuffer();
const lm = await sharp(logo).metadata();
await sharp({ create: { width: 600, height: lm.height + 80, channels: 4, background: "#0b1f3a" } })
  .composite([{ input: logo, gravity: "center" }])
  .png().toFile(PREVIEW);

console.log(`mtn ${mtnW}x${mtnH} -> scale ${MOUNTAIN_SCALE}; splitY=${splitY}`);
console.log("saved:", OUT_LIGHT);
