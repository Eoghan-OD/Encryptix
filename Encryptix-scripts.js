/* =============================
   Mobile Menu Toggle
   ============================= */
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    siteNav.classList.toggle('open');
  });
}

/* =============================
   Progress Bar Helper
   ============================= */
function animateProgress(barId) {
  const bar = document.getElementById(barId);
  if (!bar) return;
  bar.style.width = '0%';
  setTimeout(() => { bar.style.width = '100%'; }, 50);
  setTimeout(() => { bar.style.width = '0%'; }, 1500);
}

/* =============================
   SYMMETRIC (Caesar Cipher)
   ============================= */
const symEncryptBtn = document.getElementById('sym-encrypt');
const symDecryptBtn = document.getElementById('sym-decrypt');

function caesarEncrypt(str, key) {
  return str.replace(/[a-z]/gi, (c) => {
    const base = c === c.toUpperCase() ? 65 : 97;
    return String.fromCharCode((c.charCodeAt(0) - base + key) % 26 + base);
  });
}
function caesarDecrypt(str, key) {
  return caesarEncrypt(str, 26 - key);
}

if (symEncryptBtn) {
  symEncryptBtn.addEventListener('click', () => {
    const text = document.getElementById('sym-text').value;
    const key = parseInt(document.getElementById('sym-key').value);
    if (!text || isNaN(key)) return alert('Enter text and a key (1-25)');
    animateProgress('sym-progress');
    document.getElementById('sym-result').textContent = caesarEncrypt(text, key);
  });
}
if (symDecryptBtn) {
  symDecryptBtn.addEventListener('click', () => {
    const text = document.getElementById('sym-text').value;
    const key = parseInt(document.getElementById('sym-key').value);
    if (!text || isNaN(key)) return alert('Enter text and a key (1-25)');
    animateProgress('sym-progress');
    document.getElementById('sym-result').textContent = caesarDecrypt(text, key);
  });
}

/* =============================
   ASYMMETRIC (RSA Demo)
   ============================= */
let demoKeys = {};
const asymGenerateBtn = document.getElementById('asym-generate');
const asymEncryptBtn = document.getElementById('asym-encrypt');
const asymDecryptBtn = document.getElementById('asym-decrypt');

async function generateDemoKeys() {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: 1024, publicExponent: new Uint8Array([1,0,1]), hash: "SHA-256" },
    true,
    ["encrypt","decrypt"]
  );
  demoKeys = keyPair;
  document.getElementById('asym-keys').textContent = "Public and private key generated (demo use only)";
}

if (asymGenerateBtn) {
  asymGenerateBtn.addEventListener('click', async () => {
    animateProgress('asym-progress');
    await generateDemoKeys();
  });
}

if (asymEncryptBtn) {
  asymEncryptBtn.addEventListener('click', async () => {
    const txt = document.getElementById('asym-text').value;
    if (!demoKeys.publicKey) return alert('Generate keys first');
    if (!txt) return alert('Enter text');
    animateProgress('asym-progress');
    const enc = new TextEncoder().encode(txt);
    const encrypted = await window.crypto.subtle.encrypt({name:"RSA-OAEP"}, demoKeys.publicKey, enc);
    document.getElementById('asym-result').textContent = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  });
}

if (asymDecryptBtn) {
  asymDecryptBtn.addEventListener('click', async () => {
    const txt = document.getElementById('asym-result').textContent;
    if (!demoKeys.privateKey) return alert('Generate keys first');
    if (!txt) return alert('No ciphertext to decrypt');
    animateProgress('asym-progress');
    const bytes = Uint8Array.from(atob(txt), c => c.charCodeAt(0));
    const decrypted = await window.crypto.subtle.decrypt({name:"RSA-OAEP"}, demoKeys.privateKey, bytes);
    document.getElementById('asym-result').textContent = new TextDecoder().decode(decrypted);
  });
}

/* =============================
   HASHING (SHA-256 with VERIFY)
   ============================= */
let lastHash = "";
const hashBtn = document.getElementById('hash-generate');
const hashVerifyBtn = document.getElementById('hash-verify');

if (hashBtn) {
  hashBtn.addEventListener('click', async () => {
    const txt = document.getElementById('hash-input').value;
    if (!txt) return alert('Enter text to hash');
    animateProgress('hash-progress');
    const data = new TextEncoder().encode(txt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    lastHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('hash-result').textContent = lastHash;
  });
}

if (hashVerifyBtn) {
  hashVerifyBtn.addEventListener('click', async () => {
    if (!lastHash) return alert('Generate a hash first');
    const txt = document.getElementById('hash-input').value;
    if (!txt) return alert('Enter text to verify');
    const data = new TextEncoder().encode(txt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    animateProgress('hash-progress');
    if (hashHex === lastHash) {
      document.getElementById('hash-result').textContent = "✅ Match: Text produces the same hash.";
    } else {
      document.getElementById('hash-result').textContent = "❌ No match: Text does not match the stored hash.";
    }
  });
}

/* =============================
   HYBRID (AES + RSA with Decrypt)
   ============================= */
const hybridEncryptBtn = document.getElementById('hybrid-run');
const hybridDecryptBtn = document.getElementById('hybrid-decrypt');
let hybridStore = {cipher: null, iv: null, wrappedKey: null, rsaKeys: null};

if (hybridEncryptBtn) {
  hybridEncryptBtn.addEventListener('click', async () => {
    const txt = document.getElementById('hybrid-text').value;
    if (!txt) return alert('Enter text');
    animateProgress('hybrid-progress');

    // Generate AES key
    const aesKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 128 }, true, ["encrypt","decrypt"]);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder().encode(txt);
    const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, enc);

    // Generate RSA keypair
    const rsaKeys = await crypto.subtle.generateKey(
      { name: "RSA-OAEP", modulusLength: 1024, publicExponent: new Uint8Array([1,0,1]), hash: "SHA-256" },
      true, ["encrypt","decrypt"]
    );
    const rawAes = await crypto.subtle.exportKey("raw", aesKey);
    const wrappedKey = await crypto.subtle.encrypt({name:"RSA-OAEP"}, rsaKeys.publicKey, rawAes);

    hybridStore = {cipher, iv, wrappedKey, rsaKeys};

    document.getElementById('hybrid-result').textContent =
      `Hybrid done: AES message encrypted & key wrapped with RSA. You can now decrypt.`;
  });
}

if (hybridDecryptBtn) {
  hybridDecryptBtn.addEventListener('click', async () => {
    if (!hybridStore.cipher || !hybridStore.rsaKeys) return alert('Run the hybrid encryption first');
    animateProgress('hybrid-progress');

    // Unwrap AES key
    const rawKey = await crypto.subtle.decrypt({name:"RSA-OAEP"}, hybridStore.rsaKeys.privateKey, hybridStore.wrappedKey);
    const aesKey = await crypto.subtle.importKey("raw", rawKey, {name:"AES-GCM"}, false, ["decrypt"]);
    const decrypted = await crypto.subtle.decrypt({name:"AES-GCM", iv: hybridStore.iv}, aesKey, hybridStore.cipher);

    document.getElementById('hybrid-result').textContent = `Decrypted: ${new TextDecoder().decode(decrypted)}`;
  });
}

/* =============================
   RESET
   ============================= */
const resetBtn = document.getElementById('reset-btn');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    ['sym-text','sym-key','asym-text','hash-input','hybrid-text'].forEach(id=>{
      const el=document.getElementById(id); if(el) el.value='';
    });
    ['sym-result','asym-result','hash-result','hybrid-result','asym-keys'].forEach(id=>{
      const el=document.getElementById(id); if(el) el.textContent='';
    });
    ['sym-progress','asym-progress','hash-progress','hybrid-progress'].forEach(id=>{
      const el=document.getElementById(id); if(el) el.style.width='0%';
    });
    lastHash = "";
    hybridStore = {cipher: null, iv: null, wrappedKey: null, rsaKeys: null};
  });
}
