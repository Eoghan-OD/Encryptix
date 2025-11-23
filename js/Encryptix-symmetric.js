// Client side file encryptor (AES-GCM + PBKDF2)
const MAGIC = new TextEncoder().encode("ENX1");
const SALT_LEN = 16;
const IV_LEN = 12;
const PBKDF2_ITER = 200000;

const enc = new TextEncoder();
const dec = new TextDecoder();

const $ = (id) => document.getElementById(id);

const setStatus = (msg, ok = false, err = false) => {
  const el = $("fe-status");
  if (!el) return;
  el.textContent = msg;
  el.style.color = err ? "#8a0000" : ok ? "#116611" : "inherit";
};

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsArrayBuffer(file);
  });
}

async function deriveKey(pass, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(pass),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITER, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function isEncryptedFormat(buf) {
  const bytes = new Uint8Array(buf);
  if (bytes.byteLength < MAGIC.byteLength + SALT_LEN + IV_LEN + 1) return false;
  for (let i = 0; i < MAGIC.length; i++) {
    if (bytes[i] !== MAGIC[i]) return false;
  }
  return true;
}

function downloadBlob(bytes, filename) {
  const blob = new Blob([bytes]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

(function attachHandlers() {
  const btnEnc = $("fe-encrypt");
  const btnDec = $("fe-decrypt");
  if (!btnEnc || !btnDec) return;

  btnEnc.addEventListener("click", async () => {
    try {
      setStatus("Encrypting...");
      const file = $("fe-file").files[0];
      const pass = $("fe-pass").value;

      if (!file) {
        setStatus("Please choose a file to encrypt.", false, true);
        return;
      }
      if (!pass) {
        setStatus("Please enter a key phrase.", false, true);
        return;
      }

      const plainBuf = await readFileAsArrayBuffer(file);
      const salt = new Uint8Array(SALT_LEN);
      const iv = new Uint8Array(IV_LEN);
      crypto.getRandomValues(salt);
      crypto.getRandomValues(iv);

      const key = await deriveKey(pass, salt);
      const ciphertext = new Uint8Array(
        await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plainBuf)
      );

      const outBytes = new Uint8Array(
        MAGIC.byteLength + SALT_LEN + IV_LEN + ciphertext.byteLength
      );
      outBytes.set(MAGIC, 0);
      outBytes.set(salt, MAGIC.byteLength);
      outBytes.set(iv, MAGIC.byteLength + SALT_LEN);
      outBytes.set(ciphertext, MAGIC.byteLength + SALT_LEN + IV_LEN);

      const outName = (file.name || "file") + ".enc";
      downloadBlob(outBytes, outName);
      setStatus("Encrypted successfully. Saved " + outName, true);
    } catch (err) {
      console.error(err);
      setStatus(
        "Encryption failed. Please check the file and try again.",
        false,
        true
      );
    }
  });

  btnDec.addEventListener("click", async () => {
    try {
      setStatus("Decrypting...");
      const file = $("fe-file").files[0];
      const pass = $("fe-pass").value;

      if (!file) {
        setStatus("Please choose the .enc file to decrypt.", false, true);
        return;
      }
      if (!pass) {
        setStatus("Please enter the original key phrase.", false, true);
        return;
      }

      const inBuf = await readFileAsArrayBuffer(file);
      if (!isEncryptedFormat(inBuf)) {
        setStatus(
          "This file does not look like an Encryptix .enc file.",
          false,
          true
        );
        return;
      }

      const bytes = new Uint8Array(inBuf);
      const saltStart = MAGIC.byteLength;
      const ivStart = saltStart + SALT_LEN;
      const ctStart = ivStart + IV_LEN;

      const salt = bytes.slice(saltStart, saltStart + SALT_LEN);
      const iv = bytes.slice(ivStart, ivStart + IV_LEN);
      const ciphertext = bytes.slice(ctStart);

      const key = await deriveKey(pass, salt);
      const plainBuf = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext
      );

      let outName =
        file.name.replace(/\.enc$/i, "") || file.name + ".decrypted.txt";
      if (!/\.txt$/i.test(outName)) outName += ".txt";

      downloadBlob(new Uint8Array(plainBuf), outName);
      setStatus("Decrypted successfully. Saved " + outName, true);
    } catch (err) {
      console.error(err);
      setStatus(
        "Decryption failed. This usually means the key phrase is incorrect or the file is corrupted.",
        false,
        true
      );
    }
  });
})();
