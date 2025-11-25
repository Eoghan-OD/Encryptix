// Encryptix - Hashing demo with "Verify" revealing second line

(function () {
  const originalInput = document.getElementById("hash-original");
  const checkInput = document.getElementById("hash-check");
  const saveBtn = document.getElementById("hash-save");
  const showVerifyBtn = document.getElementById("hash-show-verify");
  const compareBtn = document.getElementById("hash-compare");
  const verifyBlock = document.getElementById("hash-verify-block");
  const resultBox = document.getElementById("hash-result");

  if (
    !originalInput ||
    !checkInput ||
    !saveBtn ||
    !showVerifyBtn ||
    !compareBtn ||
    !verifyBlock ||
    !resultBox
  ) {
    console.warn("Hashing demo: required elements not found on the page.");
    return;
  }

  if (!window.crypto || !window.crypto.subtle) {
    resultBox.textContent =
      "Your browser does not support the Web Crypto API needed for this hashing demo.";
    saveBtn.disabled = true;
    showVerifyBtn.disabled = true;
    compareBtn.disabled = true;
    return;
  }

  let storedHash = null;

  function bufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return bufferToHex(digest);
  }

  // Step 1: Save hash
  saveBtn.addEventListener("click", async () => {
    const text = (originalInput.value || "").trim();
    if (!text) {
      resultBox.textContent = "Please type some text in Step 1 before saving the hash.";
      return;
    }

    try {
      const hash = await sha256(text);
      storedHash = hash;

      // Reset second line when a new hash is saved
      verifyBlock.style.display = "none";
      checkInput.value = "";

      resultBox.textContent =
        "Hash saved.\n\n" +
        "This is the fingerprint we store instead of your text:\n" +
        hash +
        "\n\nPress “Verify” to check another text against this hash.";
    } catch (err) {
      console.error("Error while hashing original text:", err);
      resultBox.textContent = "Something went wrong while creating the hash.";
    }
  });

  // Show Step 2 when user clicks Verify
  showVerifyBtn.addEventListener("click", () => {
    if (!storedHash) {
      resultBox.textContent =
        "There is no stored hash yet. Use Step 1 and press “Save hash” first.";
      return;
    }

    verifyBlock.style.display = "block";
    resultBox.textContent =
      "Now type text in Step 2 and press “Check matching” to see if it matches the stored hash.";
  });

  // Step 2: Compare with stored hash
  compareBtn.addEventListener("click", async () => {
    if (!storedHash) {
      resultBox.textContent =
        "There is no stored hash yet. Use Step 1 and press “Save hash” first.";
      verifyBlock.style.display = "none";
      return;
    }

    const text = (checkInput.value || "").trim();
    if (!text) {
      resultBox.textContent =
        "Please type some text in Step 2 so we can compare it with the stored hash.";
      return;
    }

    try {
      const newHash = await sha256(text);
      const match = newHash === storedHash;

      if (match) {
        resultBox.textContent =
          "✅ The hashes match.\n\n" +
          "This means the text in Step 2 is exactly the same as the original text.\n\n" +
          "Stored hash:\n" +
          storedHash +
          "\n\n" +
          "Hash of Step 2 text:\n" +
          newHash;
      } else {
        resultBox.textContent =
          "❌ The hashes are different.\n\n" +
          "This means the text has changed, even if the change is very small.\n\n" +
          "Stored hash:\n" +
          storedHash +
          "\n\n" +
          "Hash of Step 2 text:\n" +
          newHash;
      }
    } catch (err) {
      console.error("Error while comparing hashes:", err);
      resultBox.textContent = "Something went wrong while comparing the hashes.";
    }
  });
})();
