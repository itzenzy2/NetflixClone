/**
 * BatFlix icon generator
 *
 * Rasterizes the same bat silhouette used by the BatLogo component into
 * PNG icons (favicon, Android, iOS) with zero dependencies: a hand-rolled
 * SVG path flattener + winding test + PNG encoder built on node:zlib.
 *
 * Run: node scripts/gen-icons.mjs
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

// Same path as components/BatLogo.js
const BAT_PATH =
  'M12 1.5 L10.5 4 A1.5 1.5 0 0 0 9 5.5 L9 7 C6.5 7.5 3.5 9 2 12 ' +
  'C0.8 14.2 2 16 4 16 C6 16 8.5 14.5 10.5 11.5 L12 10 L13.5 11.5 ' +
  'C15.5 14.5 18 16 20 16 C22 16 23.2 14.2 22 12 C20.5 9 17.5 7.5 15 7 ' +
  'L15 5.5 A1.5 1.5 0 0 0 13.5 4 L12 1.5 Z';

// ---------------------------------------------------------------------------
// CRC32 (for PNG chunks)
// ---------------------------------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // filter: none
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---------------------------------------------------------------------------
// SVG path parsing + flattening
// ---------------------------------------------------------------------------
function parsePath(d) {
  const cmds = [];
  const re = /([MLACZ])\s*([^MLACZ]*)/g;
  let m;
  while ((m = re.exec(d)) !== null) {
    const cmd = m[1];
    const nums = (m[2].match(/-?\d*\.?\d+/g) || []).map(Number);
    if (cmd === 'M') cmds.push({ cmd, x: nums[0], y: nums[1] });
    else if (cmd === 'L') cmds.push({ cmd, x: nums[0], y: nums[1] });
    else if (cmd === 'A')
      cmds.push({ cmd, rx: nums[0], ry: nums[1], rot: nums[2], laf: nums[3], sf: nums[4], x: nums[5], y: nums[6] });
    else if (cmd === 'C')
      cmds.push({ cmd, x1: nums[0], y1: nums[1], x2: nums[2], y2: nums[3], x: nums[4], y: nums[5] });
    else if (cmd === 'Z') cmds.push({ cmd });
  }
  return cmds;
}

// SVG arc -> cubic beziers (standard a2c algorithm)
function a2c(x1, y1, rx, ry, angle, laf, sf, x2, y2) {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  let rx1 = Math.abs(rx);
  let ry1 = Math.abs(ry);
  const x1p = cos * dx + sin * dy;
  const y1p = -sin * dx + cos * dy;
  let rxsq = rx1 * rx1;
  let rysq = ry1 * ry1;
  const x1psq = x1p * x1p;
  const y1psq = y1p * y1p;
  let lambda = x1psq / rxsq + y1psq / rysq;
  if (lambda > 1) {
    const s = Math.sqrt(lambda);
    rx1 *= s;
    ry1 *= s;
    rxsq = rx1 * rx1;
    rysq = ry1 * ry1;
  }
  const sign = laf === sf ? -1 : 1;
  const denom = rxsq * y1psq + rysq * x1psq;
  let num = Math.sqrt(Math.max(0, (rxsq * rysq - rxsq * y1psq - rysq * x1psq) / denom)) * sign;
  const cxp = (num * rx1 * y1p) / ry1;
  const cyp = (num * -ry1 * x1p) / rx1;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2;
  const cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  const th1 = Math.atan2((y1p - cyp) / ry1, (x1p - cxp) / rx1);
  const th2 = Math.atan2((-y1p - cyp) / ry1, (-x1p - cxp) / rx1);
  let dth = th2 - th1;
  if (!sf && dth > 0) dth -= 2 * Math.PI;
  if (sf && dth < 0) dth += 2 * Math.PI;
  const segs = Math.max(1, Math.ceil(Math.abs(dth / (Math.PI / 2))));
  const dt = dth / segs;
  const t = (Math.tan(dt / 2) * 4) / 3;
  const out = [];
  let th = th1;
  for (let i = 0; i < segs; i++) {
    const t1 = th;
    const t2 = th + dt;
    const c1x = cx + rx1 * (Math.cos(t1) - t * Math.sin(t1));
    const c1y = cy + ry1 * (Math.sin(t1) + t * Math.cos(t1));
    const c2x = cx + rx1 * (Math.cos(t2) + t * Math.sin(t2));
    const c2y = cy + ry1 * (Math.sin(t2) - t * Math.cos(t2));
    const ex = cx + rx1 * Math.cos(t2);
    const ey = cy + ry1 * Math.sin(t2);
    out.push({ c1x, c1y, c2x, c2y, ex, ey });
    th = t2;
  }
  return out;
}

function cubicPoint(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

const STEPS = 24;

function flattenPath(d) {
  const cmds = parsePath(d);
  const segs = [];
  let cur = null;
  let start = null;
  for (const c of cmds) {
    if (c.cmd === 'M') {
      cur = { x: c.x, y: c.y };
      start = cur;
    } else if (c.cmd === 'L') {
      segs.push([cur.x, cur.y, c.x, c.y]);
      cur = { x: c.x, y: c.y };
    } else if (c.cmd === 'C') {
      let px = cur.x;
      let py = cur.y;
      for (let i = 1; i <= STEPS; i++) {
        const t = i / STEPS;
        const x = cubicPoint(cur.x, c.x1, c.x2, c.x, t);
        const y = cubicPoint(cur.y, c.y1, c.y2, c.y, t);
        segs.push([px, py, x, y]);
        px = x;
        py = y;
      }
      cur = { x: c.x, y: c.y };
    } else if (c.cmd === 'A') {
      const cubics = a2c(cur.x, cur.y, c.rx, c.ry, c.rot, c.laf, c.sf, c.x, c.y);
      for (const cb of cubics) {
        let px = cur.x;
        let py = cur.y;
        for (let i = 1; i <= STEPS; i++) {
          const t = i / STEPS;
          const x = cubicPoint(cur.x, cb.c1x, cb.c2x, cb.ex, t);
          const y = cubicPoint(cur.y, cb.c1y, cb.c2y, cb.ey, t);
          segs.push([px, py, x, y]);
          px = x;
          py = y;
        }
        cur = { x: cb.ex, y: cb.ey };
      }
    } else if (c.cmd === 'Z') {
      segs.push([cur.x, cur.y, start.x, start.y]);
      cur = start;
    }
  }
  return segs;
}

// Nonzero winding test
function insidePath(px, py, segs) {
  let wn = 0;
  for (const [x1, y1, x2, y2] of segs) {
    if (y1 <= py) {
      if (y2 > py && (x2 - x1) * (py - y1) - (px - x1) * (y2 - y1) > 0) wn++;
    } else if (y2 <= py && (x2 - x1) * (py - y1) - (px - x1) * (y2 - y1) < 0) wn--;
  }
  return wn !== 0;
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
const SS = 4; // supersampling factor

function inRoundedRect(px, py, size, r) {
  const cx = Math.min(Math.max(px, r), size - r);
  const cy = Math.min(Math.max(py, r), size - r);
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

function renderIcon(size, opts = {}) {
  const { bg = [11, 11, 14, 255], fg = [229, 9, 20, 255], corner = 0.2 } = opts;
  const segs = flattenPath(BAT_PATH);
  const padP = 1.2; // padding in 24-unit path space
  const radius = size * corner;
  const buf = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS;
          const py = y + (sy + 0.5) / SS;
          if (!inRoundedRect(px, py, size, radius)) continue;
          // Map the pixel into the 24-unit path space with padding on all sides
          const bx = padP + (px / size) * (24 - 2 * padP);
          const by = padP + (py / size) * (24 - 2 * padP);
          const col = insidePath(bx, by, segs) ? fg : bg;
          r += col[0];
          g += col[1];
          b += col[2];
          a += col[3];
        }
      }
      const n = SS * SS;
      const i = (y * size + x) * 4;
      buf[i] = Math.round(r / n);
      buf[i + 1] = Math.round(g / n);
      buf[i + 2] = Math.round(b / n);
      buf[i + 3] = Math.round(a / n);
    }
  }
  return buf;
}

// ASCII preview to eyeball the shape in the terminal
function asciiPreview(size) {
  const buf = renderIcon(size, { corner: 0 });
  const w = 44;
  const h = 20;
  let out = '';
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const x = Math.floor((col / w) * size);
      const y = Math.floor((row / h) * size);
      const i = (y * size + x) * 4;
      out += buf[i + 3] > 128 && buf[i] > 100 ? '#' : buf[i + 3] > 40 ? '.' : ' ';
    }
    out += '\n';
  }
  return out;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const targets = [
  { file: 'favicon.png', size: 64, corner: 0.18 },
  { file: 'icon-192.png', size: 192, corner: 0.2 },
  { file: 'icon-512.png', size: 512, corner: 0.2 },
  { file: 'apple-touch-icon.png', size: 180, corner: 0.2 },
];

console.log(asciiPreview(96));
console.log('---');

for (const t of targets) {
  const rgba = renderIcon(t.size, { corner: t.corner });
  const png = encodePNG(t.size, t.size, rgba);
  writeFileSync(join(OUT_DIR, t.file), png);
  console.log(`${t.file}: ${t.size}x${t.size}, ${(png.length / 1024).toFixed(1)} KB`);
}
