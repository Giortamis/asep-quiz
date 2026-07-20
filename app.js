
const DATA_VERSION = "5";
const FAVORITES_KEY = "asepFavorites";
const WRONGS_KEY = "asepWrongs";
const STATS_KEY = "asepStats";

const FILES = {
  constitutional: "constitutional.json",
  administrative: "administrative.json",
  eu: "eu.json",
  economics: "economics.json",
  it: "it.json",
  history: "history.json",
  civil_servants: "civil_servants.json",
  gdpr: "gdpr.json",
  business: "business.json",
  hr: "hr.json",
  ethics: "ethics.json"
};

let categories = [];
let categoryMap = new Map();
let currentQuestions = [];
let currentIndex = 0;

let mode = "";
let score = 0;
let answerLocked = false;
let testAnswered = 0;
let quizFinished = false;

let studyTimer = null;
let studySeconds = 5;
let autoNext = false;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  categories = await fetch(
    `data/categories.json?v=${DATA_VERSION}`
  ).then(response => response.json());

  categories.forEach(category => {
    categoryMap.set(category.id, category);
  });

  renderCategoryControls();
  goHome();
}

function showOnly(id) {
  [
    "home",
    "testSetup",
    "testHome",
    "studySetup",
    "quizScreen",
    "resultScreen",
    "statsScreen"
  ].forEach(screenId => {
    document
      .getElementById(screenId)
      .classList.toggle("hidden", screenId !== id);
  });
}

function goHome() {
  clearStudyTimer();
  showOnly("home");
}

function renderCategoryControls() {
  const checks = document.getElementById("categoryChecks");
  const study = document.getElementById("studyCategory");

  checks.innerHTML = "";
  study.innerHTML = "";

  study.add(new Option("Όλες οι ενότητες", "all"));
  study.add(new Option("⭐ Μόνο αγαπημένες", "favorites"));
  study.add(new Option("❌ Μόνο λάθη", "wrongs"));

  categories.forEach(category => {
    const label = document.createElement("label");
    label.className = "check";

    label.innerHTML = `
      <input
        type="checkbox"
        class="category-check"
        value="${category.id}"
      >
      ${category.name}
    `;

    checks.appendChild(label);
    study.add(new Option(category.name, category.id));
  });

  ensureClearWrongsButton();

  document
    .getElementById("allCategories")
    .addEventListener("change", event => {
      document
        .querySelectorAll(".category-check")
        .forEach(checkbox => {
          checkbox.checked = event.target.checked;
        });
    });

  document
    .querySelectorAll(".category-check")
    .forEach(checkbox => {
      checkbox.addEventListener("change", () => {
        const all = [
          ...document.querySelectorAll(".category-check")
        ];

        document.getElementById("allCategories").checked =
          all.every(item => item.checked);
      });
    });
}

function ensureClearWrongsButton() {
  if (document.getElementById("clearWrongsButton")) {
    return;
  }

  const studySelect = document.getElementById("studyCategory");

  const button = document.createElement("button");
  button.id = "clearWrongsButton";
  button.type = "button";
  button.className = "secondary";
  button.textContent = "🗑 Καθαρισμός λαθών";
  button.onclick = clearAllWrongs;

  studySelect.parentNode.insertBefore(
    button,
    studySelect.nextSibling
  );
}

function openTest() {
  const saved = getSavedCategories();

  if (saved.length === 0) {
    document
      .querySelectorAll(".category-check")
      .forEach(checkbox => {
        checkbox.checked = true;
      });

    document.getElementById("allCategories").checked = true;
    showOnly("testSetup");
  } else {
    updateTestHome(saved);
    showOnly("testHome");
  }
}

function getSavedCategories() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("asepTestCategories") || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTestCategories() {
  const selected = [
    ...document.querySelectorAll(".category-check:checked")
  ].map(item => item.value);

  if (selected.length === 0) {
    showMessage("Επίλεξε τουλάχιστον μία ενότητα.");
    return;
  }

  localStorage.setItem(
    "asepTestCategories",
    JSON.stringify(selected)
  );

  updateTestHome(selected);
  showOnly("testHome");
}

function updateTestHome(selected) {
  const names = selected
    .map(id => categoryMap.get(id)?.name)
    .filter(Boolean);

  document.getElementById("activeSummary").innerHTML = `
    <strong>Ενεργές ενότητες: ${names.length}</strong>
    <br>
    <small>${names.join(" · ")}</small>
  `;
}

function resetTestCategories() {
  const confirmed = confirm(
    "Θέλεις να αλλάξεις τις ενότητες του διαγωνισμού; " +
    "Τα στατιστικά δεν θα διαγραφούν."
  );

  if (!confirmed) {
    return;
  }

  localStorage.removeItem("asepTestCategories");

  document
    .querySelectorAll(".category-check")
    .forEach(checkbox => {
      checkbox.checked = true;
    });

  document.getElementById("allCategories").checked = true;
  showOnly("testSetup");
}

async function loadQuestions(ids) {
  const sets = await Promise.all(
    ids.map(id =>
      fetch(
        `data/${FILES[id]}?v=${DATA_VERSION}`
      ).then(response => response.json())
    )
  );

  const questions = [];

  sets.forEach((set, index) => {
    const categoryId = ids[index];

    set.forEach(question => {
      questions.push({
        ...question,
        categoryId
      });
    });
  });

  return questions;
}

async function startTest() {
  const selected = getSavedCategories();

  const requested = parseInt(
    document.getElementById("testCount").value,
    10
  );

  if (
    !Number.isInteger(requested) ||
    requested < 1 ||
    requested > 100
  ) {
    showMessage("Δώσε αριθμό ερωτήσεων από 1 έως 100.");
    return;
  }

  const byCategory = {};

  for (const id of selected) {
    byCategory[id] = await fetch(
      `data/${FILES[id]}?v=${DATA_VERSION}`
    ).then(response => response.json());
  }

  currentQuestions = buildProportionalTest(
    byCategory,
    requested
  );

  if (currentQuestions.length === 0) {
    showMessage("Δεν βρέθηκαν διαθέσιμες ερωτήσεις.");
    return;
  }

  mode = "test";
  score = 0;
  currentIndex = 0;
  testAnswered = 0;
  quizFinished = false;

  showOnly("quizScreen");
  renderQuestion();
}

function buildProportionalTest(byCategory, total) {
  const ids = Object.keys(byCategory);

  const availableTotal = ids.reduce(
    (sum, id) => sum + byCategory[id].length,
    0
  );

  const target = Math.min(total, availableTotal);

  let result = [];
  const allocation = {};
  let used = 0;

  ids.forEach(id => {
    const raw =
      target *
      (byCategory[id].length / availableTotal);

    allocation[id] = Math.floor(raw);
    used += allocation[id];
  });

  const remainders = ids
    .map(id => ({
      id,
      remainder:
        target *
          (byCategory[id].length / availableTotal) -
        allocation[id]
    }))
    .sort((a, b) => b.remainder - a.remainder);

  let left = target - used;
  let remainderIndex = 0;

  while (left > 0 && remainders.length > 0) {
    const id =
      remainders[
        remainderIndex % remainders.length
      ].id;

    if (allocation[id] < byCategory[id].length) {
      allocation[id]++;
      left--;
    }

    remainderIndex++;

    if (remainderIndex > 10000) {
      break;
    }
  }

  ids.forEach(id => {
    const selectedQuestions = shuffle([
      ...byCategory[id]
    ]).slice(0, allocation[id]);

    selectedQuestions.forEach(question => {
      result.push({
        ...question,
        categoryId: id
      });
    });
  });

  return shuffle(result);
}

function openStudy() {
  showOnly("studySetup");
}

function openStudyFiltered(filter) {
  showOnly("studySetup");
  document.getElementById("studyCategory").value = filter;
}

async function startStudy() {
  const selected =
    document.getElementById("studyCategory").value;

  studySeconds = parseInt(
    document.getElementById("studySeconds").value,
    10
  );

  if (
    !Number.isInteger(studySeconds) ||
    studySeconds < 1 ||
    studySeconds > 300
  ) {
    showMessage("Δώσε χρόνο από 1 έως 300 δευτερόλεπτα.");
    return;
  }

  autoNext =
    document.getElementById("autoNextStudy").checked;

  if (selected === "favorites") {
    currentQuestions = await loadQuestions(
      categories.map(category => category.id)
    );

    currentQuestions =
      currentQuestions.filter(isFavorite);

    if (currentQuestions.length === 0) {
      showMessage(
        "Δεν έχεις αποθηκεύσει αγαπημένες ερωτήσεις."
      );
      return;
    }
  } else if (selected === "wrongs") {
    currentQuestions = await loadQuestions(
      categories.map(category => category.id)
    );

    currentQuestions =
      currentQuestions.filter(isWrong);

    if (currentQuestions.length === 0) {
      showMessage(
        "Δεν υπάρχουν αποθηκευμένες λάθος ερωτήσεις."
      );
      return;
    }
  } else {
    const ids =
      selected === "all"
        ? categories.map(category => category.id)
        : [selected];

    currentQuestions = await loadQuestions(ids);
  }

  if (
    document.getElementById("randomStudy").checked
  ) {
    currentQuestions = shuffle(currentQuestions);
  }

  mode = "study";
  currentIndex = 0;
  score = 0;
  quizFinished = false;

  showOnly("quizScreen");
  renderQuestion();
}

function renderQuestion() {
  clearStudyTimer();
  answerLocked = false;

  const question = currentQuestions[currentIndex];

  document.getElementById(
    "quizCounter"
  ).textContent =
    `Ερώτηση ${currentIndex + 1} ` +
    `από ${currentQuestions.length}`;

  document.getElementById(
    "quizModeLabel"
  ).textContent =
    mode === "test"
      ? "Τεστ"
      : `Απάντηση σε ${studySeconds}″`;

  document.getElementById(
    "progressBar"
  ).style.width =
    `${
      (currentIndex / currentQuestions.length) *
      100
    }%`;

  document.getElementById(
    "quizCategory"
  ).textContent =
    categoryMap.get(question.categoryId)?.name ||
    question.categoryId;

  document.getElementById(
    "questionText"
  ).textContent = question.question;

  ensureFavoriteButton();
  updateFavoriteButton(question);

  document.getElementById(
    "feedback"
  ).textContent = "";

  document
    .getElementById("nextButton")
    .classList.add("hidden");

  document
    .getElementById("revealButton")
    .classList.toggle(
      "hidden",
      mode !== "study"
    );

  const answersBox =
    document.getElementById("answers");

  answersBox.innerHTML = "";

  question.answers.forEach(
    (answerText, index) => {
      const button =
        document.createElement("button");

      button.className = "answer";

      button.textContent =
        `${["Α", "Β", "Γ", "Δ"][index]}. ` +
        answerText;

      if (mode === "test") {
        button.onclick = () =>
          chooseTestAnswer(index);
      }

      answersBox.appendChild(button);
    }
  );

  if (mode === "study") {
    studyTimer = setTimeout(
      revealStudyAnswer,
      studySeconds * 1000
    );
  }
}

function chooseTestAnswer(selected) {
  if (answerLocked) {
    return;
  }

  answerLocked = true;

  const question =
    currentQuestions[currentIndex];

  const buttons = [
    ...document.querySelectorAll(".answer")
  ];

  buttons.forEach(button => {
    button.disabled = true;
  });

  const isCorrectAnswer = selected === question.correct;
  testAnswered++;
  recordAnswer(question.categoryId, isCorrectAnswer);

  if (isCorrectAnswer) {
    buttons[selected].classList.add("correct");
    score++;

    removeWrong(question);

    document.getElementById(
      "feedback"
    ).textContent = "✓ Σωστή απάντηση";
  } else {
    buttons[selected].classList.add("wrong");

    buttons[
      question.correct
    ].classList.add("correct");

    addWrong(question);

    document.getElementById(
      "feedback"
    ).textContent =
      `✗ Λάθος — σωστή απάντηση: ` +
      `${["Α", "Β", "Γ", "Δ"][question.correct]}`;
  }

  setTimeout(nextQuestion, 1600);
}

function revealStudyAnswer() {
  if (answerLocked) {
    return;
  }

  answerLocked = true;
  clearStudyTimer();

  const question =
    currentQuestions[currentIndex];

  const buttons = [
    ...document.querySelectorAll(".answer")
  ];

  buttons[
    question.correct
  ].classList.add("correct");

  document.getElementById(
    "feedback"
  ).textContent =
    `Σωστή απάντηση: ` +
    `${["Α", "Β", "Γ", "Δ"][question.correct]}`;

  document
    .getElementById("revealButton")
    .classList.add("hidden");

  if (autoNext) {
    setTimeout(nextQuestion, 1800);
  } else {
    document
      .getElementById("nextButton")
      .classList.remove("hidden");
  }
}

function nextQuestion() {
  clearStudyTimer();
  currentIndex++;

  if (currentIndex < currentQuestions.length) {
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function finishEarly() {
  if (confirm("Θέλεις να σταματήσεις;")) {
    finishQuiz();
  }
}

function finishQuiz() {
  if (quizFinished) return;
  quizFinished = true;
  clearStudyTimer();

  if (mode === "test") {
    if (testAnswered > 0) {
      incrementCompletedTests();
    }

    const percentage = testAnswered > 0
      ? Math.round((score / testAnswered) * 100)
      : 0;

    document.getElementById("resultScore").textContent = `${percentage}%`;
    document.getElementById("resultDetails").textContent =
      `Απαντήθηκαν: ${testAnswered} — Σωστές: ${score} — Λάθος: ${testAnswered - score}`;
  } else {
    document.getElementById("resultScore").textContent = "Ολοκλήρωση";
    document.getElementById("resultDetails").textContent =
      `Εμφανίστηκαν ${Math.min(currentIndex, currentQuestions.length)} από ${currentQuestions.length} ερωτήσεις.`;
  }

  showOnly("resultScreen");
}

function getFavorites() {
  try {
    const favorites = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "[]"
    );

    return Array.isArray(favorites)
      ? favorites
      : [];
  } catch {
    return [];
  }
}

function favoriteKey(question) {
  return `${question.categoryId}:${question.id}`;
}

function isFavorite(question) {
  return getFavorites().includes(
    favoriteKey(question)
  );
}

function toggleFavorite() {
  const question =
    currentQuestions[currentIndex];

  if (!question) {
    return;
  }

  const key = favoriteKey(question);
  const favorites = getFavorites();
  const index = favorites.indexOf(key);

  if (index >= 0) {
    favorites.splice(index, 1);

    showMessage(
      "Αφαιρέθηκε από τις αγαπημένες."
    );
  } else {
    favorites.push(key);

    showMessage(
      "Προστέθηκε στις αγαπημένες."
    );
  }

  localStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(favorites)
  );

  updateFavoriteButton(question);
}

function ensureFavoriteButton() {
  if (document.getElementById("favoriteButton")) {
    return;
  }

  const questionText =
    document.getElementById("questionText");

  const button =
    document.createElement("button");

  button.id = "favoriteButton";
  button.type = "button";
  button.className = "favorite-button";
  button.onclick = toggleFavorite;

  questionText.parentNode.insertBefore(
    button,
    questionText
  );
}

function updateFavoriteButton(question) {
  const button =
    document.getElementById("favoriteButton");

  if (!button) {
    return;
  }

  const favorite = isFavorite(question);

  button.textContent = favorite
    ? "★ Αγαπημένη"
    : "☆ Προσθήκη στις αγαπημένες";

  button.setAttribute(
    "aria-pressed",
    favorite ? "true" : "false"
  );

  button.title = favorite
    ? "Αφαίρεση από τις αγαπημένες"
    : "Προσθήκη στις αγαπημένες";
}

function getWrongs() {
  try {
    const wrongs = JSON.parse(
      localStorage.getItem(WRONGS_KEY) || "[]"
    );

    return Array.isArray(wrongs)
      ? wrongs
      : [];
  } catch {
    return [];
  }
}

function wrongKey(question) {
  return `${question.categoryId}:${question.id}`;
}

function isWrong(question) {
  return getWrongs().includes(
    wrongKey(question)
  );
}

function addWrong(question) {
  const key = wrongKey(question);
  const wrongs = getWrongs();

  if (!wrongs.includes(key)) {
    wrongs.push(key);

    localStorage.setItem(
      WRONGS_KEY,
      JSON.stringify(wrongs)
    );
  }
}

function removeWrong(question) {
  const key = wrongKey(question);
  const wrongs = getWrongs();
  const index = wrongs.indexOf(key);

  if (index >= 0) {
    wrongs.splice(index, 1);

    localStorage.setItem(
      WRONGS_KEY,
      JSON.stringify(wrongs)
    );
  }
}

function clearAllWrongs() {
  const wrongs = getWrongs();

  if (wrongs.length === 0) {
    showMessage("Δεν υπάρχουν αποθηκευμένα λάθη.");
    return;
  }

  const confirmed = confirm(
    `Θέλεις να διαγράψεις και τις ${wrongs.length} ` +
    "αποθηκευμένες λάθος ερωτήσεις;"
  );

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(WRONGS_KEY);

  showMessage(
    "Οι λάθος ερωτήσεις διαγράφηκαν."
  );
}

function getStats() {
  const emptyStats = { total: 0, correct: 0, wrong: 0, tests: 0, byCategory: {} };

  try {
    const stored = JSON.parse(localStorage.getItem(STATS_KEY) || "null");
    if (!stored || typeof stored !== "object") return emptyStats;

    return {
      total: Number(stored.total) || 0,
      correct: Number(stored.correct) || 0,
      wrong: Number(stored.wrong) || 0,
      tests: Number(stored.tests) || 0,
      byCategory: stored.byCategory && typeof stored.byCategory === "object"
        ? stored.byCategory
        : {}
    };
  } catch {
    return emptyStats;
  }
}

function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function recordAnswer(categoryId, correct) {
  const stats = getStats();
  stats.total++;

  if (correct) stats.correct++;
  else stats.wrong++;

  if (!stats.byCategory[categoryId]) {
    stats.byCategory[categoryId] = { total: 0, correct: 0, wrong: 0 };
  }

  const categoryStats = stats.byCategory[categoryId];
  categoryStats.total++;

  if (correct) categoryStats.correct++;
  else categoryStats.wrong++;

  saveStats(stats);
}

function incrementCompletedTests() {
  const stats = getStats();
  stats.tests++;
  saveStats(stats);
}

function openStats() {
  renderStats();
  showOnly("statsScreen");
}

function renderStats() {
  const stats = getStats();
  const percentage = stats.total > 0
    ? Math.round((stats.correct / stats.total) * 100)
    : 0;

  document.getElementById("statsTotal").textContent = stats.total;
  document.getElementById("statsCorrect").textContent = stats.correct;
  document.getElementById("statsWrong").textContent = stats.wrong;
  document.getElementById("statsPercent").textContent = `${percentage}%`;
  document.getElementById("statsTests").textContent = stats.tests;
  document.getElementById("statsFavorites").textContent = getFavorites().length;
  document.getElementById("statsSavedWrongs").textContent = getWrongs().length;

  const body = document.getElementById("statsByCategory");
  body.innerHTML = "";

  const sortedCategories = [...categories].sort((a, b) => {
    const aStats = stats.byCategory[a.id] || { total: 0, correct: 0 };
    const bStats = stats.byCategory[b.id] || { total: 0, correct: 0 };

    const aPercent = aStats.total > 0 ? (aStats.correct / aStats.total) * 100 : 0;
    const bPercent = bStats.total > 0 ? (bStats.correct / bStats.total) * 100 : 0;

    return aPercent - bPercent;
  });

  sortedCategories.forEach(category => {
    const categoryStats = stats.byCategory[category.id] || { total: 0, correct: 0, wrong: 0 };
    const categoryPercentage = categoryStats.total > 0
      ? Math.round((categoryStats.correct / categoryStats.total) * 100)
      : 0;

    const color =
      categoryPercentage >= 75 ? '#198754' :
      categoryPercentage >= 50 ? '#fd7e14' :
      '#dc3545';

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${category.name}</td>
      <td>${categoryStats.correct}</td>
      <td>${categoryStats.wrong}</td>
      <td>${categoryStats.total}</td>
      <td><strong style="color:${color}">${categoryPercentage}%</strong></td>
    `;
    body.appendChild(row);
  });
}

function resetStats() {
  if (!confirm(
    "Θέλεις να μηδενίσεις όλα τα στατιστικά; Οι αγαπημένες και τα αποθηκευμένα λάθη δεν θα διαγραφούν."
  )) return;

  localStorage.removeItem(STATS_KEY);
  renderStats();
  showMessage("Τα στατιστικά μηδενίστηκαν.");
}

function clearStudyTimer() {
  if (studyTimer) {
    clearTimeout(studyTimer);
    studyTimer = null;
  }
}

function shuffle(array) {
  for (
    let index = array.length - 1;
    index > 0;
    index--
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1)
    );

    [
      array[index],
      array[randomIndex]
    ] = [
      array[randomIndex],
      array[index]
    ];
  }

  return array;
}

function showMessage(text) {
  const message =
    document.getElementById("message");

  message.textContent = text;
  message.classList.remove("hidden");

  setTimeout(() => {
    message.classList.add("hidden");
  }, 2600);
}
