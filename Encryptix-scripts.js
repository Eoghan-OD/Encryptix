// ===============================
// Encryptix JavaScript Functions
// ===============================

// --- Symmetric Encryption (Caesar Cipher - Sean) ---
function caesarEncrypt(text, key) {
    return text.split('').map(ch => {
        const code = ch.charCodeAt(0);
        if (code >= 65 && code <= 90)
            return String.fromCharCode(((code - 65 + key) % 26) + 65);
        if (code >= 97 && code <= 122)
            return String.fromCharCode(((code - 97 + key) % 26) + 97);
        return ch;
    }).join('');
}

function demoSymmetric() {
    const word = prompt("Enter a word to encrypt:");
    const key = parseInt(prompt("Enter a key (1–25):"), 10);
    if (!word || isNaN(key)) return alert("Invalid input.");
    const encrypted = caesarEncrypt(word, key);
    const decrypted = caesarEncrypt(encrypted, 26 - key);
    document.getElementById("symResult").innerHTML =
        `<strong>Encrypted:</strong> ${encrypted}<br><strong>Decrypted:</strong> ${decrypted}`;
}

// --- Asymmetric Encryption (Eoghan) ---
function demoAsymmetric() {
    const message = prompt("Enter a message to encrypt with a public key:");
    if (!message) return;
    const publicKey = Math.floor(Math.random() * 9999) + 1000;
    const privateKey = publicKey + 3;
    const encrypted = btoa(message + publicKey);
    const decrypted = atob(encrypted).replace(publicKey, "");
    document.getElementById("asymResult").innerHTML =
        `<strong>Public Key:</strong> ${publicKey}<br>
         <strong>Private Key:</strong> ${privateKey}<br>
         <strong>Encrypted:</strong> ${encrypted}<br>
         <strong>Decrypted:</strong> ${decrypted}`;
}

// --- Hashing (Bradley) ---
async function demoHashing() {
    const text = document.getElementById("hashInput").value;
    if (!text) return alert("Enter text to hash!");
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById("hashResult").innerHTML = `<strong>SHA-256 Hash:</strong><br>${hashHex}`;
}

// --- Hybrid Encryption (Vitalina) ---
function demoHybrid() {
    const message = prompt("Enter a message to encrypt (hybrid):");
    if (!message) return;
    const symmetricKey = Math.floor(Math.random() * 25) + 1;
    const encryptedMsg = caesarEncrypt(message, symmetricKey);
    const asymmetricKey = Math.floor(Math.random() * 9999) + 1000;
    const encryptedKey = btoa(symmetricKey + asymmetricKey);
    document.getElementById("hybridResult").innerHTML =
        `<strong>Original Message:</strong> ${message}<br>
         <strong>Symmetric Key:</strong> ${symmetricKey}<br>
         <strong>Encrypted Message:</strong> ${encryptedMsg}<br>
         <strong>Encrypted Key (Asymmetric):</strong> ${encryptedKey}`;
}

// --- Reset All Demos ---
function resetAll() {
    document.getElementById("symResult").innerHTML = "";
    document.getElementById("asymResult").innerHTML = "";
    document.getElementById("hashResult").innerHTML = "";
    document.getElementById("hybridResult").innerHTML = "";
    document.getElementById("hashInput").value = "";
    alert("All demo results cleared!");
}
