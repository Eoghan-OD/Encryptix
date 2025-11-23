// Asymmetric encryption demo using RSA-OAEP
(function () {
  const runBtn = document.getElementById("asym-run");
  const stepsEl = document.getElementById("asym-steps");
  const inputEl = document.getElementById("asym-text");

  if (!runBtn || !stepsEl) {
    return;
  }

  if (!window.crypto || !window.crypto.subtle) {
    stepsEl.textContent =
      "Your browser does not support the Web Crypto API. This demo needs a modern browser to run.";
    return;
  }

  const enc = new TextEncoder();
  const dec = new TextDecoder();

  runBtn.addEventListener("click", async () => {
    try {
      const raw = (inputEl && inputEl.value ? inputEl.value : "").trim();
      const message =
        raw ||
        "Example: Appointment details for Bella the dog on Friday at 3pm.";

      stepsEl.textContent =
        "Step 1: Generating a public and private key pair for the clinic...";

      const keyPair = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      stepsEl.textContent += "\n\nStep 2: Encrypting the message with the clinic public key...";

      const plaintextBytes = enc.encode(message);
      const ciphertextBuf = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        keyPair.publicKey,
        plaintextBytes
      );
      const cipherBytes = new Uint8Array(ciphertextBuf);

      let cipherStr = "";
      for (let i = 0; i < cipherBytes.length; i++) {
        cipherStr += String.fromCharCode(cipherBytes[i]);
      }
      const cipherB64 = btoa(cipherStr).slice(0, 96) + "...";

      stepsEl.textContent +=
        "\nEncrypted sample (truncated):\n" + cipherB64;

      stepsEl.textContent +=
        "\n\nStep 3: Decrypting with the clinic private key...";

      const decryptedBuf = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        keyPair.privateKey,
        ciphertextBuf
      );
      const decryptedText = dec.decode(decryptedBuf);

      stepsEl.textContent +=
        "\nDecrypted message:\n" + decryptedText;

      stepsEl.textContent +=
        "\n\nIn a real vet clinic, the public key would be shared with trusted partners, " +
        "while the private key is kept secret on a secure system.";
    } catch (err) {
      console.error(err);
      stepsEl.textContent =
        "Something went wrong while running the demo. This usually means the browser blocked the cryptography functions.";
    }
  });
})();
