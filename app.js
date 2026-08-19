
const themeToggle = document.getElementById("themeToggle");

function getPreferredTheme() {
  const savedTheme = localStorage.getItem("ayocerita-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("ayocerita-theme", theme);

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute("content", theme === "dark" ? "#121212" : "#f7f5ef");
  }
}

applyTheme(getPreferredTheme());

themeToggle?.addEventListener("click", () => {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "light";

  applyTheme(currentTheme === "dark" ? "light" : "dark");
});

const form = document.getElementById("storyForm");
const storyInput = document.getElementById("story");
const characterCount = document.getElementById("characterCount");
const submitButton = document.getElementById("submitButton");
const submitLabel = submitButton.querySelector("span");
const message = document.getElementById("message");

const MAX_LENGTH = 3000;

// Supabase public frontend configuration.
// Publishable key memang boleh digunakan di browser selama RLS aktif.
const SUPABASE_URL = "https://jkceeoicgkaqxxfhbyvb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_M4C04PLeLSgZA-SWc8zG1w_STjsTvCZ";

function updateFormState() {
  const value = storyInput.value;
  const trimmed = value.trim();

  characterCount.textContent = `${value.length} / ${MAX_LENGTH}`;
  submitButton.disabled = trimmed.length === 0;

  if (message.classList.contains("show")) {
    message.className = "message";
    message.textContent = "";
  }
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type} show`;
}

storyInput.addEventListener("input", updateFormState);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const content = storyInput.value.trim();

  if (!content || content.length > MAX_LENGTH) return;

  submitButton.disabled = true;
  submitLabel.textContent = "Mengirim...";

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/stories`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase error:", response.status, errorText);
      throw new Error("Gagal menyimpan cerita.");
    }

    storyInput.value = "";
    characterCount.textContent = `0 / ${MAX_LENGTH}`;

    showMessage(
      "Cerita kamu sudah terkirim. Makasih udah mau cerita 🤍",
      "success"
    );
  } catch (error) {
    console.error(error);
    showMessage(
      "Cerita belum berhasil dikirim. Coba lagi ya.",
      "error"
    );
  } finally {
    submitLabel.textContent = "Kirim Cerita";
    submitButton.disabled = storyInput.value.trim().length === 0;
  }
});

updateFormState();
