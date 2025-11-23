// Hybrid encryption concept demo
(function () {
  const inputEl = document.getElementById("hybrid-text");
  const btnEncrypt = document.getElementById("hybrid-run");
  const btnDecrypt = document.getElementById("hybrid-decrypt");
  const resultEl = document.getElementById("hybrid-result");

  if (!inputEl || !btnEncrypt || !btnDecrypt || !resultEl) {
    return;
  }

  let storedPlain = null;
  let storedSessionKey = null;

  function randomHex(len) {
    const bytes = new Uint8Array(len);
    if (window.crypto && window.crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < len; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  btnEncrypt.addEventListener("click", () => {
    const message = inputEl.value.trim();
    if (!message) {
      resultEl.textContent = "Please enter a message to encrypt.";
      return;
    }

    storedPlain = message;
    storedSessionKey = randomHex(16);

    const xorPreview = btoa(message).slice(0, 40) + "...";
    const wrappedKeyPreview = randomHex(24);

    resultEl.textContent =
      "Step 1: A random symmetric session key is created for this message only:\n" +
      storedSessionKey +
      "\n\nStep 2: The message is encrypted quickly with that session key (symmetric encryption).\n" +
      "Example encrypted data (truncated):\n" +
      xorPreview +
      "\n\nStep 3: The session key itself is encrypted with the clinic public key.\n" +
      "Wrapped key (truncated):\n" +
      wrappedKeyPreview +
      "\n\nIn practice, only the clinic private key can unwrap the session key and read the original message.";
  });

  btnDecrypt.addEventListener("click", () => {
    if (!storedPlain || !storedSessionKey) {
      resultEl.textContent =
        "Run the Encrypt (Hybrid) step first so there is a session key and message to decrypt.";
      return;
    }

    resultEl.textContent =
      "The clinic uses its private key to unwrap the session key, then uses that key to decrypt the data.\n\n" +
      "Decrypted message:\n" +
      storedPlain;
  });
})();
