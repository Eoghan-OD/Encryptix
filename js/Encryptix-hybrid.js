// js/Encryptix-hybrid.js

if (!window.crypto || !window.crypto.subtle) {
  console.warn("Web Crypto API not available in this browser.");
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function generateRsaKeyPair() {
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

async function generateAesKey() {
  return crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

const hybridState = {
  rsaKeyPair: null,
  encryptedAesKeyB64: null,
  ciphertextB64: null,
  ivB64: null,
};

async function runHybridEncrypt() {
  const input = document.getElementById("hybrid-text");
  const result = document.getElementById("hybrid-result");

  result.style.whiteSpace = "pre-wrap";
  result.style.wordBreak = "break-word";

  const message = input.value || "Hello from Encryptix (Hybrid Demo)!";

  if (!window.crypto || !window.crypto.subtle) {
    result.textContent =
      "Web Crypto API not supported. Use https:// or http://localhost.";
    return;
  }

  result.textContent = "Step 1: Generating keys for the demo...\n\n";

  try {
    const rsaKeyPair = await generateRsaKeyPair();
    const aesKey = await generateAesKey();
    hybridState.rsaKeyPair = rsaKeyPair;

    result.textContent +=
      "- Created clinic public/private key pair.\n" +
      "- Created a random data key (AES-GCM).\n\n";

    result.textContent +=
      "Step 2: Encrypting your message with the data key...\n";

    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      data
    );

    const ciphertextB64 = bufferToBase64(ciphertextBuffer);
    const ivB64 = bufferToBase64(iv.buffer);

    hybridState.ciphertextB64 = ciphertextB64;
    hybridState.ivB64 = ivB64;

    result.textContent +=
      "Encrypted message (truncated):\n" +
      ciphertextB64.slice(0, 80) +
      "...\n\n";

    result.textContent +=
      "Step 3: Encrypting the data key with the clinic public key...\n";

    const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);

    const encryptedAesKeyBuffer = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      rsaKeyPair.publicKey,
      rawAesKey
    );

    const encryptedAesKeyB64 = bufferToBase64(encryptedAesKeyBuffer);
    hybridState.encryptedAesKeyB64 = encryptedAesKeyB64;

    result.textContent +=
      "Encrypted data key (truncated):\n" +
      encryptedAesKeyB64.slice(0, 80) +
      "...\n\n";

    result.textContent +=
      "You can now click \"Decrypt\" to see the recovered message.\n";
  } catch (err) {
    console.error(err);
    result.textContent +=
      "An error occurred during encryption.";
  }
}

async function runHybridDecrypt() {
  const result = document.getElementById("hybrid-result");

  if (
    !hybridState.rsaKeyPair ||
    !hybridState.encryptedAesKeyB64 ||
    !hybridState.ciphertextB64 ||
    !hybridState.ivB64
  ) {
    result.textContent = "Run Encrypt first.";
    return;
  }

  if (!window.crypto || !window.crypto.subtle) {
    result.textContent = "Web Crypto API not supported.";
    return;
  }

  result.style.whiteSpace = "pre-wrap";
  result.style.wordBreak = "break-word";

  result.textContent = "Step 4: Decrypting on the clinic side...\n\n";

  try {
    const { rsaKeyPair, encryptedAesKeyB64, ciphertextB64, ivB64 } = hybridState;

    const encryptedAesKeyBuffer = base64ToBuffer(encryptedAesKeyB64);

    const decryptedAesKeyRaw = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      rsaKeyPair.privateKey,
      encryptedAesKeyBuffer
    );

    const aesKey = await crypto.subtle.importKey(
      "raw",
      decryptedAesKeyRaw,
      { name: "AES-GCM", length: 256 },
      true,
      ["decrypt"]
    );

    const ciphertextBuffer = base64ToBuffer(ciphertextB64);
    const ivBuffer = base64ToBuffer(ivB64);
    const iv = new Uint8Array(ivBuffer);

    const decryptedDataBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      aesKey,
      ciphertextBuffer
    );

    const decoder = new TextDecoder();
    const decryptedMessage = decoder.decode(decryptedDataBuffer);

    result.textContent +=
      "- Private key unlocked the data key.\n" +
      "- Data key decrypted the message.\n\n" +
      "Decrypted message:\n" +
      decryptedMessage +
      "\n";
  } catch (err) {
    console.error(err);
    result.textContent +=
      "An error occurred during decryption. Try Encrypt again.";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const encryptBtn = document.getElementById("hybrid-run");
  const decryptBtn = document.getElementById("hybrid-decrypt");

  if (encryptBtn) encryptBtn.addEventListener("click", runHybridEncrypt);
  if (decryptBtn) decryptBtn.addEventListener("click", runHybridDecrypt);
});
