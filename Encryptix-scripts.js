/* ==================================================
   Encryptix demo scripts
   Simple, readable code for teaching purposes
   ================================================== */

/* Short helpers */
const $ = (id) => document.getElementById(id);
const text = (id, value = "") => { const el = $(id); if (el) el.textContent = value; };

/* Attach events once DOM is ready */
document.addEventListener("DOMContentLoaded", () => {
  // Symmetric demo
  $("sym-encrypt")?.addEventListener("click", () => {
    const msg = $("sym-text").value || "";
    const k = clampKey($("sym-key").value);
    text("sym-result", msg ? `Encrypted: ${caesar(msg, k)}` : "Enter a message and key.");
  });

  $("sym-decrypt")?.addEventListener("click", () => {
    const msg = $("sym-text").value || "";
    const k = clampKey($("sym-key").value);
    text("sym-result", msg ? `Decrypted: ${caesar(msg, 26 - k)}` : "Enter a message and key.");
  });

  // Asymmetric demo
  let demoKeys = null;
  $("asym-generate")?.addEventListener("click", () => {
    demoKeys = generateToyKeyPair();
    text("asym-keys", `Public: ${demoKeys.public}  Private: ${demoKeys.private}`);
    text("asym-result", "");
  });

  $("asym-encrypt")?.addEventListener("click", () => {
    const msg = $("asym-text").value || "";
    if (!demoKeys) { text("asym-result", "Generate keys first."); return; }
    const cipher = encryptWithPublic(msg, demoKeys.public);
    text("asym-result", `Encrypted: ${cipher}`);
  });

  $("asym-decrypt")?.addEventListener("click", () => {
    const msg = $("asym-text").value || "";
    if (!demoKeys) { text("asym-result", "Generate keys first."); return; }
    const plain = decryptWithPrivate(msg, demoKeys.private);
    text("asym-result", `Decrypted: ${plain}`);
  });

  // Hashing demo
  $("hash-generate")?.addEventListener("click", async () => {
    const input = $("hash-input").value || "";
    if (!input) { text("hash-result", "Enter text to hash."); return; }
    const digest = await sha256Hex(input);
    text("hash-result", digest);
  });

  // Hybrid demo
  $("hybrid-run")?.addEventListener("click", () => {
    const msg = $("hybrid-text").value || "";
    if (!msg) { text("hybrid-result", "Enter a message."); return; }
    const symKey = Math.floor(Math.random() * 25) + 1; // 1..25
    const symCipher = caesar(msg, symKey);
    const pub = "PUB-7";  // toy public key
    const encKey = encryptKeyToy(symKey, pub);
    text("hybrid-result", `Cipher: ${symCipher}  Encrypted key: ${encKey}  (receiver uses private key to recover ${symKey})`);
  });

  // Reset
  $("reset-btn")?.addEventListener("click", () => {
    ["sym-text","sym-key","asym-text","hash-input","hybrid-text"].forEach(id => { const el = $(id); if (el) el.value = ""; });
    ["sym-result","asym-keys","asym-result","hash-result","hybrid-result"].forEach(id => text(id, ""));
  });
});

/* ==================================================
   Symmetric helper - Caesar shift
   ================================================== */
function clampKey(value) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return 3;           // default small shift
  return Math.min(25, Math.max(1, n));     // 1..25
}

function caesar(str, shift) {
  return [...str].map(ch => shiftChar(ch, shift)).join("");
}

function shiftChar(ch, shift) {
  const code = ch.charCodeAt(0);
  const A = 65, Z = 90, a = 97, z = 122;
  if (code >= A && code <= Z) return String.fromCharCode(((code - A + shift) % 26) + A);
  if (code >= a && code <= z) return String.fromCharCode(((code - a + shift) % 26) + a);
  return ch;
}

/* ==================================================
   Asymmetric toy demo
   This is a teaching toy. Not real RSA.
   Public key is PUB-k which reverses then shifts by k.
   Private key is PRI-k which unshifts then reverses.
   ================================================== */
function generateToyKeyPair() {
  const k = Math.floor(Math.random() * 9) + 3; // 3..11
  return { public: `PUB-${k}`, private: `PRI-${k}` };
}

function encryptWithPublic(message, pub) {
  const k = parseInt(pub.split("-")[1], 10);
  const reversed = [...message].reverse().join("");
  return caesar(reversed, k);
}

function decryptWithPrivate(cipher, pri) {
  const k = parseInt(pri.split("-")[1], 10);
  const unshifted = caesar(cipher, 26 - (k % 26));
  return [...unshifted].reverse().join("");
}

/* ==================================================
   Hashing - SHA-256 via Web Crypto, fallback if needed
   ================================================== */
async function sha256Hex(textIn) {
  if (window.crypto && window.crypto.subtle) {
    const enc = new TextEncoder().encode(textIn);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback: very simple non cryptographic hash for very old browsers
  let h = 0;
  for (let i = 0; i < textIn.length; i++) {
    h = (h << 5) - h + textIn.charCodeAt(i);
    h |= 0;
  }
  return `fallback-${Math.abs(h)}`;
}

/* ==================================================
   Hybrid demo helper
   ================================================== */
function encryptKeyToy(symKey, pub) {
  const k = parseInt(pub.split("-")[1], 10);
  // turn key into a two letter string then shift
  const raw = `K${String(symKey).padStart(2, "0")}`;
  return caesar(raw, k);
}
