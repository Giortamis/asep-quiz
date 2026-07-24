
const DATA_VERSION = "5";
const FAVORITES_KEY = "asepFavorites";
const WRONGS_KEY = "asepWrongs";
const STATS_KEY = "asepStats";
const WORK_HISTORY_KEY = "asepWorkBehaviourHistory";
const WORK_SEEN_KEY = "asepWorkBehaviourSeen";
const WORK_DATA_URL = "data/work_behaviour.json?v=11";

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

let workBank = null;
let workTriads = [];
let workIndex = 0;
let workAnswers = [];
let workFirstChoice = null;
let workSecondChoice = null;
let workTimerInterval = null;
let workTimeRemaining = 0;
let workStartedAt = null;
let workIsFullSimulation = false;
let workTimedMode = false;

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
    "testHub",
    "smartSetup",
    "testSetup",
    "testHome",
    "studySetup",
    "quizScreen",
    "resultScreen",
    "workHome",
    "workQuiz",
    "workResults",
    "workHistory",
    "statsScreen"
  ].forEach(screenId => {
    document
      .getElementById(screenId)
      .classList.toggle("hidden", screenId !== id);
  });
}

function goHome() {
  clearStudyTimer();
  clearWorkTimer();
  setFooter("home");
  showOnly("home");
}

function renderCategoryControls() {
  const checks = document.getElementById("categoryChecks");
  const study = document.getElementById("studyCategory");

  checks.innerHTML = "";
  study.innerHTML = "";

  study.add(new Option("Όλες οι ενότητες", "all"));

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

  study.addEventListener("change", () => {
    study.dataset.filter = "";
    updateStudyFilterState("");
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
  const study = document.getElementById("studyCategory");
  study.value = "all";
  study.dataset.filter = "";
  updateStudyFilterState("");
  showOnly("studySetup");
}

function openStudyFiltered(filter) {
  document.getElementById("studyCategory").dataset.filter = filter;
  updateStudyFilterState(filter);
  showOnly("studySetup");
}

function updateStudyFilterState(filter) {
  document.querySelectorAll(".study-filter").forEach(button => {
    button.classList.remove("active");
  });

  if (filter === "favorites") {
    document.querySelector(".favorite-filter")?.classList.add("active");
  } else if (filter === "wrongs") {
    document.querySelector(".wrong-filter")?.classList.add("active");
  }
}

async function startStudy() {
  const studySelect = document.getElementById("studyCategory");
  const selected = studySelect.dataset.filter || studySelect.value;

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


function openTestHub(){
  showOnly("testHub");
}

function comingSoon(name){
  showMessage(name + " - Προσεχώς");
}

async function startQuickTest(){
  const saved = getSavedCategories();
  const selected = saved.length > 0
    ? saved
    : categories.map(category => category.id);

  const byCategory = {};
  for (const id of selected) {
    byCategory[id] = await fetch(
      `data/${FILES[id]}?v=${DATA_VERSION}`
    ).then(response => response.json());
  }

  currentQuestions = buildProportionalTest(byCategory, 10);
  mode = "test";
  score = 0;
  currentIndex = 0;
  testAnswered = 0;
  quizFinished = false;

  showOnly("quizScreen");
  renderQuestion();
}

function startSmartTest(){
  document.getElementById("smartPreview").classList.add("hidden");
  document.getElementById("smartPrepareButton").classList.remove("hidden");
  document.getElementById("smartStartButton").classList.add("hidden");
  showOnly("smartSetup");
}

function questionUniqueKey(question){
  return `${question.categoryId}:${question.id}`;
}

function takeUnique(pool,count,used){
  const picked=[];
  const candidates=shuffle([...pool]);
  for(const question of candidates){
    const key=questionUniqueKey(question);
    if(used.has(key))continue;
    used.add(key);
    picked.push(question);
    if(picked.length>=count)break;
  }
  return picked;
}

async function prepareSmartTest(){
  const total=parseInt(document.getElementById("smartCount").value,10);
  const stats=getStats();

  const allQuestions=await loadQuestions(categories.map(category=>category.id));
  const wrongSet=new Set(getWrongs());
  const wrongPool=allQuestions.filter(question=>wrongSet.has(questionUniqueKey(question)));

  const weakest=categories
    .map(category=>{
      const item=stats.byCategory[category.id]||{total:0,correct:0};
      return {
        id:category.id,
        total:item.total,
        percent:item.total>0 ? item.correct/item.total : 1
      };
    })
    .filter(item=>item.total>0)
    .sort((a,b)=>a.percent-b.percent || b.total-a.total)
    .slice(0,3)
    .map(item=>item.id);

  const weakSet=new Set(weakest);
  const weakPool=allQuestions.filter(question=>weakSet.has(question.categoryId));

  const wrongTarget=Math.floor(total*0.50);
  const weakTarget=Math.floor(total*0.30);
  const randomTarget=total-wrongTarget-weakTarget;
  const used=new Set();

  const fromWrongs=takeUnique(wrongPool,wrongTarget,used);
  const fromWeak=takeUnique(weakPool,weakTarget+(wrongTarget-fromWrongs.length),used);
  const initialRandomNeed=randomTarget+
    Math.max(0,weakTarget+(wrongTarget-fromWrongs.length)-fromWeak.length);
  const fromRandom=takeUnique(allQuestions,initialRandomNeed,used);

  let selected=[...fromWrongs,...fromWeak,...fromRandom];
  if(selected.length<total){
    selected.push(...takeUnique(allQuestions,total-selected.length,used));
  }

  currentQuestions=shuffle(selected.slice(0,total));
  window.smartComposition={
    wrongs:fromWrongs.length,
    weak:fromWeak.length,
    random:currentQuestions.length-fromWrongs.length-fromWeak.length,
    weakest
  };

  const weakNames=weakest.map(id=>categoryMap.get(id)?.name||id).join(" · ") || "Δεν υπάρχουν ακόμη";
  const preview=document.getElementById("smartPreview");
  preview.innerHTML=`
    <strong>Το τεστ δημιουργήθηκε από:</strong>
    <div>❌ ${window.smartComposition.wrongs} ερωτήσεις από τα λάθη σου</div>
    <div>📉 ${window.smartComposition.weak} ερωτήσεις από τις 3 χειρότερες ενότητες</div>
    <div>🎲 ${window.smartComposition.random} τυχαίες ερωτήσεις</div>
    <small><strong>Αδύναμες ενότητες:</strong> ${weakNames}</small>
    ${stats.total < 20
      ? '<small>Το ιστορικό είναι ακόμη μικρό, επομένως το υπόλοιπο τεστ συμπληρώθηκε με τυχαίες ερωτήσεις.</small>'
      : ''}
  `;
  preview.classList.remove("hidden");
  document.getElementById("smartPrepareButton").classList.add("hidden");
  document.getElementById("smartStartButton").classList.remove("hidden");
}

function launchSmartTest(){
  if(!currentQuestions.length){
    showMessage("Δημιούργησε πρώτα το Έξυπνο Τεστ.");
    return;
  }
  mode="test";
  score=0;
  currentIndex=0;
  testAnswered=0;
  quizFinished=false;
  showOnly("quizScreen");
  renderQuestion();
}


function setFooter(section) {
  const footer = document.getElementById("appFooter");
  if (!footer) return;

  if (section === "work") {
    footer.textContent = "Εκπαιδευτικό υλικό προσομοίωσης εργασιακών συμπεριφορών — μη επίσημη τράπεζα ΑΣΕΠ";
  } else if (section === "home") {
    footer.textContent = "Εφαρμογή προετοιμασίας για τον Γραπτό Διαγωνισμό ΑΣΕΠ";
  } else {
    footer.textContent = "Πηγή δεδομένων: Επίσημο Μητρώο Θεμάτων Γνώσεων ΑΣΕΠ";
  }
}

async function loadWorkBank() {
  if (workBank) return workBank;

  const response = await fetch(WORK_DATA_URL);
  if (!response.ok) {
    throw new Error("Δεν φορτώθηκε το work_behaviour.json");
  }

  workBank = await response.json();
  return workBank;
}

async function openWorkBehaviour() {
  clearWorkTimer();
  setFooter("work");

  try {
    await loadWorkBank();
    showOnly("workHome");
  } catch (error) {
    console.error(error);
    showMessage("Σφάλμα φόρτωσης της τράπεζας εργασιακών συμπεριφορών.");
  }
}

function getWorkSeenIds() {
  try {
    const ids = JSON.parse(localStorage.getItem(WORK_SEEN_KEY) || "[]");
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

function saveWorkSeenIds(ids) {
  localStorage.setItem(WORK_SEEN_KEY, JSON.stringify(ids));
}

function chooseWorkTriads(count) {
  const all = workBank.triads;
  let seen = new Set(getWorkSeenIds());
  let unseen = all.filter(item => !seen.has(item.id));

  if (unseen.length < count) {
    seen = new Set();
    unseen = [...all];
  }

  const selected = shuffle([...unseen]).slice(0, count);
  selected.forEach(item => seen.add(item.id));
  saveWorkSeenIds([...seen]);

  return selected;
}

async function startWorkPractice() {
  try {
    await loadWorkBank();

    const count = parseInt(document.getElementById("workCount").value, 10);
    workTimedMode = document.getElementById("workTimed").checked;
    workIsFullSimulation = false;

    const seconds = workTimedMode
      ? Math.max(120, Math.round(count * (1800 / 76)))
      : 0;

    beginWorkAttempt(count, seconds);
  } catch (error) {
    console.error(error);
    showMessage("Δεν ήταν δυνατή η έναρξη της εξάσκησης.");
  }
}

async function startFullWorkSimulation() {
  try {
    await loadWorkBank();

    if (!confirm(
      "Η πλήρης προσομοίωση περιλαμβάνει 76 τριάδες και συνολικό χρόνο 30 λεπτών. Θέλεις να ξεκινήσεις;"
    )) return;

    workTimedMode = true;
    workIsFullSimulation = true;
    beginWorkAttempt(76, 30 * 60);
  } catch (error) {
    console.error(error);
    showMessage("Δεν ήταν δυνατή η έναρξη της πλήρους προσομοίωσης.");
  }
}

function beginWorkAttempt(count, seconds) {
  workTriads = chooseWorkTriads(count);
  workIndex = 0;
  workAnswers = [];
  workFirstChoice = null;
  workSecondChoice = null;
  workStartedAt = Date.now();
  workTimeRemaining = seconds;

  setFooter("work");
  showOnly("workQuiz");

  if (seconds > 0) {
    startWorkTimer();
  } else {
    document.getElementById("workTimer").textContent = "Χωρίς χρόνο";
  }

  renderWorkTriad();
}

function startWorkTimer() {
  clearWorkTimer();
  updateWorkTimerDisplay();

  workTimerInterval = setInterval(() => {
    workTimeRemaining--;
    updateWorkTimerDisplay();

    if (workTimeRemaining <= 0) {
      clearWorkTimer();
      finishWorkAttempt(true);
    }
  }, 1000);
}

function updateWorkTimerDisplay() {
  const minutes = Math.floor(Math.max(0, workTimeRemaining) / 60);
  const seconds = Math.max(0, workTimeRemaining) % 60;
  document.getElementById("workTimer").textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function clearWorkTimer() {
  if (workTimerInterval) {
    clearInterval(workTimerInterval);
    workTimerInterval = null;
  }
}

function setWorkInstruction(text, state = "active") {
  const banner = document.getElementById("workInstruction");
  if (!banner) return;

  banner.textContent = text;
  banner.classList.remove(
    "work-instruction-pulse",
    "work-instruction-complete"
  );

  if (state === "complete") {
    banner.classList.add("work-instruction-complete");
  } else {
    void banner.offsetWidth;
    banner.classList.add("work-instruction-pulse");
  }
}

function renderWorkTriad() {
  const triad = workTriads[workIndex];
  workFirstChoice = null;
  workSecondChoice = null;

  document.getElementById("workCounter").textContent =
    `Τριάδα ${workIndex + 1} από ${workTriads.length}`;

  document.getElementById("workProgress").style.width =
    `${(workIndex / workTriads.length) * 100}%`;

  const box = document.getElementById("workStatements");
  box.innerHTML = "";

  triad.statements.forEach(statement => {
    const button = document.createElement("button");
    button.className = "work-statement";
    button.dataset.statementId = statement.id;
    button.innerHTML = `
      <span class="work-letter">${statement.id}</span>
      <span>${statement.text}</span>
      <span class="work-rank"></span>
    `;
    button.onclick = () => chooseWorkStatement(statement.id);
    box.appendChild(button);
  });

  setWorkInstruction(
    "Επίλεξε πρώτα τη δήλωση που σε αντιπροσωπεύει περισσότερο."
  );

  document.getElementById("workNextButton").disabled = true;
}

function chooseWorkStatement(statementId) {
  if (!workFirstChoice) {
    workFirstChoice = statementId;
    updateWorkStatementButtons();

    setWorkInstruction(
      "Επίλεξε τώρα τη δεύτερη πιο κοντινή σε εσένα δήλωση."
    );
    return;
  }

  if (statementId === workFirstChoice) {
    workFirstChoice = null;
    workSecondChoice = null;
    updateWorkStatementButtons();

    setWorkInstruction(
      "Επίλεξε πρώτα τη δήλωση που σε αντιπροσωπεύει περισσότερο."
    );
    document.getElementById("workNextButton").disabled = true;
    return;
  }

  if (!workSecondChoice) {
    workSecondChoice = statementId;
    updateWorkStatementButtons();

    setWorkInstruction(
      "Η κατάταξη ολοκληρώθηκε. Πάτησε «Επόμενη».",
      "complete"
    );
    document.getElementById("workNextButton").disabled = false;
    return;
  }

  if (statementId === workSecondChoice) {
    workSecondChoice = null;
    updateWorkStatementButtons();

    setWorkInstruction(
      "Επίλεξε τώρα τη δεύτερη πιο κοντινή σε εσένα δήλωση."
    );
    document.getElementById("workNextButton").disabled = true;
  }
}

function updateWorkStatementButtons() {
  const triad = workTriads[workIndex];
  const thirdChoice = workFirstChoice && workSecondChoice
    ? triad.statements
        .map(item => item.id)
        .find(id => id !== workFirstChoice && id !== workSecondChoice)
    : null;

  document.querySelectorAll(".work-statement").forEach(button => {
    const id = button.dataset.statementId;
    const rank = button.querySelector(".work-rank");

    button.classList.remove("rank-first", "rank-second", "rank-third");
    rank.textContent = "";

    if (id === workFirstChoice) {
      button.classList.add("rank-first");
      rank.textContent = "1η";
    } else if (id === workSecondChoice) {
      button.classList.add("rank-second");
      rank.textContent = "2η";
    } else if (id === thirdChoice) {
      button.classList.add("rank-third");
      rank.textContent = "3η";
    }
  });
}

function nextWorkTriad() {
  if (!workFirstChoice || !workSecondChoice) {
    showMessage("Ολοκλήρωσε πρώτα την κατάταξη.");
    return;
  }

  const triad = workTriads[workIndex];
  const thirdChoice = triad.statements
    .map(item => item.id)
    .find(id => id !== workFirstChoice && id !== workSecondChoice);

  workAnswers.push({
    triadId: triad.id,
    ranking: [workFirstChoice, workSecondChoice, thirdChoice]
  });

  workIndex++;

  if (workIndex < workTriads.length) {
    renderWorkTriad();
  } else {
    finishWorkAttempt(false);
  }
}

function finishWorkEarly() {
  if (!confirm("Θέλεις να τερματίσεις την προσπάθεια;")) return;
  finishWorkAttempt(false, true);
}

function finishWorkAttempt(timeExpired = false, stoppedEarly = false) {
  clearWorkTimer();

  const completed = workAnswers.length;
  const required = workTriads.length;

  if (workFirstChoice && workSecondChoice && workIndex < workTriads.length) {
    const triad = workTriads[workIndex];
    const thirdChoice = triad.statements
      .map(item => item.id)
      .find(id => id !== workFirstChoice && id !== workSecondChoice);

    workAnswers.push({
      triadId: triad.id,
      ranking: [workFirstChoice, workSecondChoice, thirdChoice]
    });
  }

  const result = calculateWorkProfile();
  const record = {
    id: Date.now(),
    date: new Date().toISOString(),
    type: workIsFullSimulation ? "full" : "practice",
    requestedTriads: required,
    completedTriads: workAnswers.length,
    timed: workTimedMode,
    timeExpired,
    stoppedEarly,
    durationSeconds: Math.max(0, Math.round((Date.now() - workStartedAt) / 1000)),
    scores: result.scores
  };

  saveWorkHistoryRecord(record);
  renderWorkResults(record);
  showOnly("workResults");
}

function calculateWorkProfile() {
  const raw = {};
  const max = {};

  workBank.skills.forEach(skill => {
    raw[skill.id] = 0;
    max[skill.id] = 0;
  });

  const triadById = new Map(workBank.triads.map(item => [item.id, item]));

  workAnswers.forEach(answer => {
    const triad = triadById.get(answer.triadId);
    if (!triad) return;

    answer.ranking.forEach((statementId, index) => {
      const statement = triad.statements.find(item => item.id === statementId);
      if (!statement) return;

      const rankMultiplier = [3, 2, 1][index];

      Object.entries(statement.skills).forEach(([skillId, weight]) => {
        if (raw[skillId] === undefined) {
          raw[skillId] = 0;
          max[skillId] = 0;
        }

        raw[skillId] += weight * rankMultiplier;
        max[skillId] += weight * 3;
      });
    });
  });

  const scores = {};
  Object.keys(raw).forEach(skillId => {
    scores[skillId] = max[skillId] > 0
      ? Math.round((raw[skillId] / max[skillId]) * 100)
      : 0;
  });

  return { raw, max, scores };
}

function workScoreLabel(score) {
  if (score >= 90) return "Πολύ Ισχυρή Ένδειξη";
  if (score >= 75) return "Ισχυρή Ένδειξη";
  if (score >= 60) return "Καλή Ένδειξη";
  if (score >= 40) return "Μέτρια Ένδειξη";
  return "Χρειάζεται Βελτίωση";
}

function workScoreClass(score) {
  if (score >= 75) return "work-score-high";
  if (score >= 60) return "work-score-good";
  if (score >= 40) return "work-score-mid";
  return "work-score-low";
}

function renderWorkResults(record) {
  const summary = document.getElementById("workResultSummary");
  const completionText = `${record.completedTriads}/${record.requestedTriads} τριάδες`;

  let status = "Ολοκληρωμένη προσπάθεια";
  if (record.timeExpired) status = "Ο χρόνος ολοκληρώθηκε";
  if (record.stoppedEarly) status = "Η προσπάθεια τερματίστηκε πρόωρα";

  summary.innerHTML = `
    <strong>${status}</strong>
    <span>${completionText}</span>
  `;

  const container = document.getElementById("workSkillsResults");
  container.innerHTML = "";

  workBank.skills.forEach(skill => {
    const score = record.scores[skill.id] || 0;
    const item = document.createElement("div");
    item.className = "work-skill-card";
    item.innerHTML = `
      <div class="work-skill-head">
        <strong>${skill.name}</strong>
        <span class="${workScoreClass(score)}">${score}%</span>
      </div>
      <div class="work-skill-bar">
        <div style="width:${score}%"></div>
      </div>
      <small>${workScoreLabel(score)}</small>
    `;
    container.appendChild(item);
  });
}

function getWorkHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(WORK_HISTORY_KEY) || "[]");
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

function saveWorkHistoryRecord(record) {
  const history = getWorkHistory();
  history.unshift(record);
  localStorage.setItem(WORK_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

function openWorkHistory() {
  setFooter("work");
  renderWorkHistory();
  showOnly("workHistory");
}

function renderWorkHistory() {
  const history = getWorkHistory();
  const box = document.getElementById("workHistoryList");
  box.innerHTML = "";

  if (history.length === 0) {
    box.innerHTML = "<p>Δεν υπάρχουν ακόμη αποθηκευμένες προσπάθειες.</p>";
    return;
  }

  history.forEach((record, index) => {
    const date = new Date(record.date).toLocaleString("el-GR");
    const average = Math.round(
      Object.values(record.scores || {}).reduce((sum, value) => sum + value, 0) /
      Math.max(1, Object.keys(record.scores || {}).length)
    );

    const item = document.createElement("details");
    item.className = "work-history-item";

    const scoreRows = workBank.skills.map(skill => {
      const score = record.scores?.[skill.id] || 0;
      return `<div><span>${skill.name}</span><strong>${score}%</strong></div>`;
    }).join("");

    item.innerHTML = `
      <summary>
        <span>${record.type === "full" ? "Πλήρης προσομοίωση" : "Εξάσκηση"} — ${date}</span>
        <strong>${average}%</strong>
      </summary>
      <p>${record.completedTriads}/${record.requestedTriads} τριάδες</p>
      <div class="work-history-scores">${scoreRows}</div>
    `;

    box.appendChild(item);
  });
}

function clearWorkHistory() {
  if (!confirm("Θέλεις να διαγράψεις όλο το ιστορικό εργασιακών συμπεριφορών;")) return;

  localStorage.removeItem(WORK_HISTORY_KEY);
  renderWorkHistory();
  showMessage("Το ιστορικό διαγράφηκε.");
}
