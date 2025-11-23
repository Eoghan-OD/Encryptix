// Hashing demo using SHA-256
(function () {
  const inputEl = document.getElementById("hash-input");
  const btnGenerate = document.getElementById("hash-generate");
  const btnVerify = document.getElementById("hash-verify");
  const resultEl = document.getElementById("hash-result");

  if (!inputEl || !btnGenerate || !btnVerify || !resultEl) {
    return;
  }

  if (!window.crypto || !window.crypto.subtle) {
    resultEl.textContent =
      "Your browser does not support the Web Crypto API. This demo needs a modern browser to run.";
    return;
  }

  const enc = new TextEncoder();
  let lastHashHex = null;

  function toHex(bytes) {
    return Array.from(new Uint8Array(bytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  btnGenerate.addEventListener("click", async () => {
    const text = inputEl.value;
    if (!text) {
      resultEl.textContent = "Please enter some text to hash.";
      return;
    }

    const digest = await crypto.subtle.digest("SHA-256", enc.encode(text));
    const hex = toHex(digest);
    lastHashHex = hex;

    resultEl.textContent =
      "SHA-256 hash:\n" +
      hex +
      "\n\nIn practice, a vet system would store only this hash of a password or record, not the original value.";
  });

  btnVerify.addEventListener("click", async () => {
    if (!lastHashHex) {
      resultEl.textContent =
        "Generate a hash first, then change the text and click Verify to see if it still matches.";
      return;
    }

    const text = inputEl.value;
    const digest = await crypto.subtle.digest("SHA-256", enc.encode(text));
    const hex = toHex(digest);

    if (hex === lastHashHex) {
      resultEl.textContent =
        "The hash matches the last value. This is like confirming a password or record has not changed.";
    } else {
      resultEl.textContent =
        "The hash does not match the last value. This suggests the text has changed in some way.";
    }
  });
})();
