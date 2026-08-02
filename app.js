
const DATA_VERSION = "5";
const FAVORITES_KEY = "asepFavorites";
const WRONGS_KEY = "asepWrongs";
const STATS_KEY = "asepStats";
const QUESTION_STATS_KEY = "asepQuestionStatsV1";
const RECENT_REGISTRY_KEY = "asepRecentRegistryQuestionsV1";
const RECENT_CAT_KEY = "asepRecentCatQuestionsV1";
const CAT_HISTORY_KEY = "asepCatHistoryV139";
const STUDY_PLAN_KEY = "asepStudyPlanV14";
const STUDY_PLAN_LOG_KEY = "asepStudyPlanLogV14";
const RECENT_REGISTRY_LIMIT = 120;
const RECENT_CAT_LIMIT = 80;
const WORK_HISTORY_KEY = "asepWorkBehaviourHistory";
const WORK_SEEN_KEY = "asepWorkBehaviourSeen";
const WORK_DATA_URL = "data/work_behaviour.json?v=11";
const WELCOME_USER_NAME_KEY = "asepUserName";
const WELCOME_LAST_MESSAGE_KEY = "asepWelcomeLastMessage";

const WELCOME_MESSAGES = [
  "Κάθε μικρό βήμα χτίζει σταθερή πρόοδο.",
  "Η συνέπεια σήμερα κάνει τη διαφορά αύριο.",
  "Λίγη συγκεντρωμένη μελέτη αξίζει πολύ.",
  "Η πρόοδος έρχεται μία ερώτηση τη φορά.",
  "Συνέχισε με καθαρό στόχο και σταθερό ρυθμό.",
  "Κάθε επανάληψη ενισχύει τη γνώση σου.",
  "Η σημερινή προσπάθεια είναι επένδυση στον στόχο σου.",
  "Μείνε προσηλωμένος στο επόμενο ουσιαστικό βήμα.",
  "Η καλή προετοιμασία χτίζεται με συνέπεια.",
  "Δώσε χρόνο στη γνώση να γίνει σιγουριά.",
  "Η συγκέντρωση μετατρέπει τον χρόνο σε πρόοδο.",
  "Κράτησε σταθερό ρυθμό και καθαρή σκέψη.",
  "Κάθε σωστή συνήθεια ενισχύει την προετοιμασία σου.",
  "Σήμερα μπορείς να γνωρίζεις λίγο περισσότερα.",
  "Η υπομονή και η επανάληψη φέρνουν αποτέλεσμα.",
  "Προχώρα οργανωμένα, χωρίς περιττή πίεση.",
  "Η γνώση δυναμώνει κάθε φορά που επιστρέφεις.",
  "Ένας σαφής στόχος κάνει τη μελέτη αποτελεσματική.",
  "Εστίασε στην ποιότητα της σημερινής προσπάθειας.",
  "Η σταθερότητα είναι ισχυρότερη από τη βιασύνη.",
  "Κάθε ολοκληρωμένη ενότητα σε φέρνει πιο κοντά.",
  "Δούλεψε μεθοδικά και εμπιστεύσου την πρόοδό σου.",
  "Η προετοιμασία σου εξελίσσεται μαζί με κάθε προσπάθεια.",
  "Συνέχισε ήρεμα, οργανωμένα και αποφασιστικά."
];

const ApplicationState = {
  read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  },

  write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  readList(key) {
    const value = this.read(key, []);
    return Array.isArray(value) ? value : [];
  },

  readObject(key, fallback = {}) {
    const value = this.read(key, fallback);
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : fallback;
  }
};

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
let currentQuestionStartedAt = null;
let activeStudyPlanTask = null;

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

let catMode = "";
let catQuestions = [];
let catIndex = 0;
let catScore = 0;
let catAnswered = 0;
let catCurrentDifficulty = 5;
let catDifficultyHistory = [];
let catQuestionTimer = null;
let catTimeRemaining = 0;
let catTotalSeconds = 24 * 60;
let catStartedAt = null;
let catEndedByTime = false;
let catLocked = false;
let catCurrentQuestion = null;
let catUsedQuestionSignatures = new Set();
let catReviewRecords = [];
let catReviewFilter = "wrong";
let catResponseRecords = [];
let catCorrectStreak = 0;
let catCategoryStats = {
  numeric: {total: 0, correct: 0},
  symbols: {total: 0, correct: 0},
  matrix: {total: 0, correct: 0}
};

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
  const registryScreens = new Set(["registryHub","testHub","smartSetup","testSetup","testHome","studySetup","quizScreen","resultScreen","statsScreen"]);
  const catScreens = new Set(["catHub","catPracticeSetup","adaptiveCatSetup","catPreparing","catQuiz","catResults","catReview","catHistory"]);
  const workScreens = new Set(["workHome","workPracticeSetup","workQuiz","workResults","workHistory"]);
  const planScreens = new Set(["studyPlanHub","studyPlanSetup","studyPlanToday","studyPlanProgress"]);
  const helpScreens = new Set(["helpHub","asepGuide","appGuide"]);

  document.body.classList.remove("theme-screen-registry", "theme-screen-cat", "theme-screen-work", "theme-screen-plan", "theme-screen-help");
  if (registryScreens.has(id)) document.body.classList.add("theme-screen-registry");
  if (catScreens.has(id)) document.body.classList.add("theme-screen-cat");
  if (workScreens.has(id)) document.body.classList.add("theme-screen-work");
  if (planScreens.has(id)) document.body.classList.add("theme-screen-plan");
  if (helpScreens.has(id)) document.body.classList.add("theme-screen-help");

  [
    "home",
    "studyPlanHub",
    "studyPlanSetup",
    "studyPlanToday",
    "studyPlanProgress",
    "helpHub",
    "asepGuide",
    "appGuide",
    "registryHub",
    "catHub",
    "catPracticeSetup",
    "adaptiveCatSetup",
    "catPreparing",
    "catQuiz",
    "catResults",
    "catReview",
    "catHistory",
    "testHub",
    "smartSetup",
    "testSetup",
    "testHome",
    "studySetup",
    "quizScreen",
    "resultScreen",
    "workHome",
    "workPracticeSetup",
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
  document.body.classList.remove("cat-exam-active", "cat-exam-setup");
  clearStudyTimer();
  clearWorkTimer();
  clearCatTimer();
  updateHomeDashboard();
  renderSmartWelcome();
  setFooter("home");
  showOnly("home");
}

function getWelcomeGreeting(hour = new Date().getHours()) {
  if (hour >= 5 && hour < 12) return {icon:"☀️", text:"Καλημέρα"};
  if (hour >= 12 && hour < 15) return {icon:"🌤️", text:"Καλό μεσημέρι"};
  if (hour >= 15 && hour < 19) return {icon:"🌇", text:"Καλό απόγευμα"};
  return {icon:"🌙", text:"Καλησπέρα"};
}

function selectWelcomeMessage(randomValue = Math.random()) {
  const previous = sessionStorage.getItem(WELCOME_LAST_MESSAGE_KEY);
  const initialIndex = Math.min(
    WELCOME_MESSAGES.length - 1,
    Math.floor(Math.max(0, Math.min(0.999999, randomValue)) * WELCOME_MESSAGES.length)
  );
  let index = initialIndex;

  if (WELCOME_MESSAGES.length > 1 && WELCOME_MESSAGES[index] === previous) {
    index = (index + 1) % WELCOME_MESSAGES.length;
  }

  const message = WELCOME_MESSAGES[index];
  sessionStorage.setItem(WELCOME_LAST_MESSAGE_KEY, message);
  return message;
}

function renderSmartWelcome() {
  const greetingElement = document.getElementById("welcomeGreeting");
  const iconElement = document.getElementById("welcomeIcon");
  const messageElement = document.getElementById("welcomeMessage");
  if (!greetingElement || !iconElement || !messageElement) return;

  const greeting = getWelcomeGreeting();
  const storedName = ApplicationState.read(WELCOME_USER_NAME_KEY, "");
  const userName = typeof storedName === "string" ? storedName.trim() : "";

  iconElement.textContent = greeting.icon;
  greetingElement.textContent = userName
    ? `${greeting.text}, ${userName}!`
    : `${greeting.text}!`;
  messageElement.textContent = selectWelcomeMessage();
}

function openRegistryHub() {
  document.body.classList.remove("cat-exam-active", "cat-exam-setup");
  updateHomeDashboard();
  setFooter("registry");
  showOnly("registryHub");
}

function openWorkPracticeSetup() {
  setFooter("work");
  showOnly("workPracticeSetup");
}

function updateHomeDashboard() {
  const stats = getStats();
  const success = stats.total > 0
    ? Math.round((stats.correct / stats.total) * 100)
    : 0;
  const favorites = getFavorites().length;
  const wrongs = getWrongs().length;
  const workSeen = getWorkSeenIds().length;

  const values = {
    homeStudyMetric: stats.total > 0
      ? `${stats.total.toLocaleString("el-GR")} απαντημένες`
      : `${getRegistryQuestionTotal().toLocaleString("el-GR")} ερωτήσεις`,
    homeTestsMetric: stats.tests > 0
      ? `${stats.tests} ολοκληρωμένα τεστ`
      : `${categories.length || 11} ενότητες`,
    homeStatsMetric: `Μέση επιτυχία ${success}%`,
    homeWorkMetric: `${Math.min(workSeen, 228)} / 228 τριάδες`,
    homePlanMetric: getStudyPlanHomeMetric(),
    homeSuccess: `${success}%`,
    homeWrongs: wrongs.toLocaleString("el-GR"),
    homeFavorites: favorites.toLocaleString("el-GR"),
    homeCompletedTests: stats.tests.toLocaleString("el-GR")
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
}

function getRegistryQuestionTotal() {
  return categories.reduce(
    (total, category) => total + (Number(category.count) || 0),
    0
  );
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
  return ApplicationState.readList("asepTestCategories");
}

function saveTestCategories() {
  const selected = [
    ...document.querySelectorAll(".category-check:checked")
  ].map(item => item.value);

  if (selected.length === 0) {
    showMessage("Επίλεξε τουλάχιστον μία ενότητα.");
    return;
  }

  ApplicationState.write("asepTestCategories", selected);

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

  ApplicationState.remove("asepTestCategories");

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

  const unique = new Map();
  questions.forEach(question => unique.set(questionUniqueKey(question), question));
  return [...unique.values()];
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
  const recent = new Set(getRecentRegistryQuestions());
  const normalized = {};

  ids.forEach(id => {
    const unique = new Map();
    (byCategory[id] || []).forEach(question => {
      const enriched = { ...question, categoryId: id };
      unique.set(questionUniqueKey(enriched), enriched);
    });
    normalized[id] = [...unique.values()];
  });

  const availableTotal = ids.reduce((sum, id) => sum + normalized[id].length, 0);
  const target = Math.min(total, availableTotal);
  if (target <= 0) return [];

  const allocation = {};
  let usedSlots = 0;
  ids.forEach(id => {
    const raw = target * (normalized[id].length / availableTotal);
    allocation[id] = Math.min(normalized[id].length, Math.floor(raw));
    usedSlots += allocation[id];
  });

  const remainders = ids.map(id => ({
    id,
    remainder: target * (normalized[id].length / availableTotal) - allocation[id]
  })).sort((a, b) => b.remainder - a.remainder);

  let left = target - usedSlots;
  let guard = 0;
  while (left > 0 && guard < 10000) {
    let allocated = false;
    for (const item of remainders) {
      if (allocation[item.id] < normalized[item.id].length && left > 0) {
        allocation[item.id]++;
        left--;
        allocated = true;
      }
    }
    if (!allocated) break;
    guard++;
  }

  const selected = [];
  const selectedKeys = new Set();
  ids.forEach(id => {
    const pool = preferNotRecent(normalized[id], recent);
    for (const question of pool) {
      const key = questionUniqueKey(question);
      if (selectedKeys.has(key)) continue;
      selectedKeys.add(key);
      selected.push(question);
      if (selected.filter(item => item.categoryId === id).length >= allocation[id]) break;
    }
  });

  if (selected.length < target) {
    const fallback = preferNotRecent(ids.flatMap(id => normalized[id]), recent);
    for (const question of fallback) {
      const key = questionUniqueKey(question);
      if (selectedKeys.has(key)) continue;
      selectedKeys.add(key);
      selected.push(question);
      if (selected.length >= target) break;
    }
  }

  return shuffle(selected.slice(0, target));
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
  } else if (filter === "unread") {
    document.querySelector(".unread-filter")?.classList.add("active");
  }
}

async function startStudy(options = {}) {
  const studySelect = document.getElementById("studyCategory");
  const selected = options.filter || studySelect.dataset.filter || studySelect.value;

  studySeconds = Number.isInteger(options.studySeconds)
    ? options.studySeconds
    : parseInt(document.getElementById("studySeconds").value, 10);

  if (
    !Number.isInteger(studySeconds) ||
    studySeconds < 1 ||
    studySeconds > 300
  ) {
    showMessage("Δώσε χρόνο από 1 έως 300 δευτερόλεπτα.");
    return;
  }

  autoNext = typeof options.autoNext === "boolean"
    ? options.autoNext
    : document.getElementById("autoNextStudy").checked;

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

    currentQuestions = currentQuestions.filter(isWrong);

    if (currentQuestions.length === 0) {
      showMessage("Δεν υπάρχουν αποθηκευμένες λάθος ερωτήσεις.");
      return;
    }
  } else if (selected === "unread") {
    currentQuestions = await loadQuestions(
      categories.map(category => category.id)
    );

    currentQuestions = currentQuestions.filter(isUnreadQuestion);

    if (currentQuestions.length === 0) {
      showMessage("Έχεις ήδη διαβάσει όλες τις διαθέσιμες ερωτήσεις.");
      return;
    }
  } else {
    const ids =
      selected === "all"
        ? categories.map(category => category.id)
        : [selected];

    currentQuestions = await loadQuestions(ids);
  }

  const randomize = typeof options.randomize === "boolean"
    ? options.randomize
    : document.getElementById("randomStudy").checked;

  if (randomize) {
    currentQuestions = shuffle(currentQuestions);
  }

  if (Number.isInteger(options.limit) && options.limit > 0) {
    currentQuestions = takeUnique(
      currentQuestions,
      options.limit,
      new Set(),
      new Set(getRecentRegistryQuestions())
    );
  }

  if (options.planTaskKind) {
    activeStudyPlanTask = {
      kind: options.planTaskKind,
      expected: currentQuestions.length
    };
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
  currentQuestionStartedAt = Date.now();
  recordQuestionAppearance(question);
  addRecentRegistryQuestion(question);

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
  recordQuestionAnswer(
    question,
    isCorrectAnswer,
    currentQuestionStartedAt ? Date.now() - currentQuestionStartedAt : 0
  );

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

  completeActiveStudyPlanRegistryTask();
  showOnly("resultScreen");
}

function getFavorites() {
  return ApplicationState.readList(FAVORITES_KEY);
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

  ApplicationState.write(FAVORITES_KEY, favorites);

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
  return ApplicationState.readList(WRONGS_KEY);
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

    ApplicationState.write(WRONGS_KEY, wrongs);
  }
}

function removeWrong(question) {
  const key = wrongKey(question);
  const wrongs = getWrongs();
  const index = wrongs.indexOf(key);

  if (index >= 0) {
    wrongs.splice(index, 1);

    ApplicationState.write(WRONGS_KEY, wrongs);
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

  ApplicationState.remove(WRONGS_KEY);

  showMessage(
    "Οι λάθος ερωτήσεις διαγράφηκαν."
  );
}

function getQuestionStats() {
  return ApplicationState.readObject(QUESTION_STATS_KEY);
}

function saveQuestionStats(stats) {
  ApplicationState.write(QUESTION_STATS_KEY, stats);
}

function getQuestionStat(question) {
  return getQuestionStats()[questionUniqueKey(question)] || null;
}

function isUnreadQuestion(question) {
  const item = getQuestionStat(question);
  return !item || (Number(item.appearances) || 0) === 0;
}

function recordQuestionAppearance(question) {
  if (!question) return;
  const stats = getQuestionStats();
  const key = questionUniqueKey(question);
  const item = stats[key] || {
    appearances: 0,
    correct: 0,
    wrong: 0,
    totalAnswerTimeMs: 0,
    answerCount: 0,
    correctStreak: 0,
    lastSeenAt: null,
    lastAnsweredAt: null,
    lastAnswerCorrect: null
  };
  item.appearances++;
  item.lastSeenAt = new Date().toISOString();
  stats[key] = item;
  saveQuestionStats(stats);
}

function recordQuestionAnswer(question, correct, elapsedMs) {
  if (!question) return;
  const stats = getQuestionStats();
  const key = questionUniqueKey(question);
  const item = stats[key] || {
    appearances: 0,
    correct: 0,
    wrong: 0,
    totalAnswerTimeMs: 0,
    answerCount: 0,
    correctStreak: 0,
    lastSeenAt: null,
    lastAnsweredAt: null,
    lastAnswerCorrect: null
  };

  if (correct) {
    item.correct++;
    item.correctStreak++;
  } else {
    item.wrong++;
    item.correctStreak = 0;
  }

  const safeElapsed = Number.isFinite(elapsedMs) && elapsedMs > 0 ? elapsedMs : 0;
  item.totalAnswerTimeMs += safeElapsed;
  item.answerCount++;
  item.averageAnswerTimeMs = item.answerCount > 0
    ? Math.round(item.totalAnswerTimeMs / item.answerCount)
    : 0;
  item.lastAnsweredAt = new Date().toISOString();
  item.lastAnswerCorrect = Boolean(correct);
  stats[key] = item;
  saveQuestionStats(stats);
}

function getStoredList(key) {
  return ApplicationState.readList(key);
}

function pushRecentKey(storageKey, key, limit) {
  const values = getStoredList(storageKey).filter(item => item !== key);
  values.unshift(key);
  ApplicationState.write(storageKey, values.slice(0, limit));
}

function getRecentRegistryQuestions() {
  return getStoredList(RECENT_REGISTRY_KEY);
}

function addRecentRegistryQuestion(question) {
  if (!question) return;
  pushRecentKey(RECENT_REGISTRY_KEY, questionUniqueKey(question), RECENT_REGISTRY_LIMIT);
}

function getRecentCatQuestions() {
  return getStoredList(RECENT_CAT_KEY);
}

function addRecentCatQuestion(signature) {
  if (!signature) return;
  pushRecentKey(RECENT_CAT_KEY, signature, RECENT_CAT_LIMIT);
}

function preferNotRecent(pool, recentSet) {
  const unique = new Map();
  pool.forEach(question => unique.set(questionUniqueKey(question), question));
  const values = [...unique.values()];
  const fresh = shuffle(values.filter(question => !recentSet.has(questionUniqueKey(question))));
  const recent = shuffle(values.filter(question => recentSet.has(questionUniqueKey(question))));
  return [...fresh, ...recent];
}

function getStats() {
  const emptyStats = { total: 0, correct: 0, wrong: 0, tests: 0, byCategory: {} };
  const stored = ApplicationState.readObject(STATS_KEY, emptyStats);

  return {
    total: Number(stored.total) || 0,
    correct: Number(stored.correct) || 0,
    wrong: Number(stored.wrong) || 0,
    tests: Number(stored.tests) || 0,
    byCategory: stored.byCategory && typeof stored.byCategory === "object"
      ? stored.byCategory
      : {}
  };
}

function saveStats(stats) {
  ApplicationState.write(STATS_KEY, stats);
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

  ApplicationState.remove(STATS_KEY);
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

function takeUnique(pool,count,used,recentSet = new Set()){
  const picked=[];
  const candidates=preferNotRecent(pool, recentSet);
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
  const total = parseInt(document.getElementById("smartCount").value, 10);
  const allQuestions = await loadQuestions(categories.map(category => category.id));
  const wrongSet = new Set(getWrongs());
  const recentSet = new Set(getRecentRegistryQuestions());

  const wrongPool = allQuestions.filter(question => wrongSet.has(questionUniqueKey(question)));
  const unreadPool = allQuestions.filter(isUnreadQuestion);

  const wrongTarget = Math.floor(total * 0.50);
  const unreadTarget = Math.floor(total * 0.30);
  const randomTarget = total - wrongTarget - unreadTarget;
  const used = new Set();

  const fromWrongs = takeUnique(wrongPool, wrongTarget, used, recentSet);
  const missingWrongs = wrongTarget - fromWrongs.length;

  const fromUnread = takeUnique(
    unreadPool,
    unreadTarget + missingWrongs,
    used,
    recentSet
  );
  const missingUnread = unreadTarget + missingWrongs - fromUnread.length;

  const fromRandom = takeUnique(
    allQuestions,
    randomTarget + Math.max(0, missingUnread),
    used,
    recentSet
  );

  let selected = [...fromWrongs, ...fromUnread, ...fromRandom];
  if (selected.length < total) {
    selected.push(...takeUnique(allQuestions, total - selected.length, used, new Set()));
  }

  currentQuestions = shuffle(selected.slice(0, total));
  window.smartComposition = {
    wrongs: fromWrongs.length,
    unread: fromUnread.length,
    random: currentQuestions.length - fromWrongs.length - fromUnread.length
  };

  const preview = document.getElementById("smartPreview");
  preview.innerHTML = `
    <strong>Το τεστ δημιουργήθηκε από:</strong>
    <div>❌ ${window.smartComposition.wrongs} ερωτήσεις από τα λάθη σου</div>
    <div>📘 ${window.smartComposition.unread} αδιάβαστες ερωτήσεις</div>
    <div>🎲 ${window.smartComposition.random} τυχαίες ερωτήσεις</div>
    <small>Αν κάποια κατηγορία δεν έχει αρκετές διαθέσιμες ερωτήσεις, το υπόλοιπο συμπληρώνεται αυτόματα χωρίς διπλοεγγραφές.</small>
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
    footer.textContent = "Εκπαιδευτικό υλικό προσομοίωσης εργασιακών συμπεριφορών — μη επίσημη πιστοποιημένη βαθμολογία ή τράπεζα ΑΣΕΠ";
  } else if (section === "cat") {
    footer.textContent = "Εκπαιδευτική προσομοίωση της προσαρμοστικής εξέτασης (CAT) του ΑΣΕΠ";
  } else if (section === "plan") {
    footer.textContent = "Προσωπικό σχέδιο μελέτης με κοινό μηχανισμό Μητρώου, CAT και Εργασιακών Συμπεριφορών";
  } else if (section === "help") {
    footer.textContent = "Βοήθεια και οδηγίες χρήσης της εφαρμογής";
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
  return ApplicationState.readList(WORK_SEEN_KEY);
}

function saveWorkSeenIds(ids) {
  ApplicationState.write(WORK_SEEN_KEY, ids);
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

async function startWorkPractice(options = {}) {
  try {
    await loadWorkBank();

    const count = Number.isInteger(options.count)
      ? Math.max(1, Math.min(76, options.count))
      : parseInt(document.getElementById("workCount").value, 10);
    workTimedMode = typeof options.timed === "boolean"
      ? options.timed
      : document.getElementById("workTimed").checked;
    workIsFullSimulation = false;

    const seconds = workTimedMode
      ? Math.max(120, Math.round(count * (1800 / 76)))
      : 0;

    beginWorkAttempt(count, seconds);
    return true;
  } catch (error) {
    console.error(error);
    showMessage("Δεν ήταν δυνατή η έναρξη της εξάσκησης.");
    return false;
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
  completeActiveStudyPlanWorkTask(record.completedTriads);
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
  return ApplicationState.readList(WORK_HISTORY_KEY);
}

function saveWorkHistoryRecord(record) {
  const history = getWorkHistory();
  history.unshift(record);
  ApplicationState.write(WORK_HISTORY_KEY, history.slice(0, 50));
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

  ApplicationState.remove(WORK_HISTORY_KEY);
  renderWorkHistory();
  showMessage("Το ιστορικό διαγράφηκε.");
}


function openCatHub() {
  document.body.classList.remove("cat-exam-active", "cat-exam-setup");
  clearCatTimer();
  setFooter("cat");
  showOnly("catHub");
}

function openCatPracticeSetup() {
  setFooter("cat");
  showOnly("catPracticeSetup");
}

function openAdaptiveCatSetup() {
  document.body.classList.remove("cat-exam-active");
  document.body.classList.add("cat-exam-setup");
  setFooter("cat");
  showOnly("adaptiveCatSetup");
}

function catRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function catShuffleCopy(items) {
  return shuffle([...items]);
}

function catBuildOptions(correct, distractors) {
  const unique = [...new Set([correct, ...distractors])]
    .filter(value => Number.isFinite(value) || typeof value === "string");

  let offset = 1;
  while (unique.length < 4) {
    if (typeof correct === "number") {
      unique.push(correct + offset);
      if (unique.length < 4) unique.push(correct - offset);
    } else {
      unique.push(`${correct}${offset}`);
    }
    offset++;
  }

  return catShuffleCopy(unique.slice(0, 4));
}

function generateArithmeticSequence(difficulty) {
  const start = catRandomInt(1, 12 + difficulty);
  const step = catRandomInt(1, 2 + Math.ceil(difficulty / 2));
  const sequence = Array.from({length: 5}, (_, i) => start + i * step);
  const correct = start + 5 * step;

  return {
    category: "numeric",
    generator: "arithmetic",
    difficulty,
    question: "Ποιος αριθμός συνεχίζει σωστά την ακολουθία;",
    visual: sequence.join("   "),
    options: catBuildOptions(correct, [correct + step, correct - step, correct + 2 * step]),
    correct,
    explanation: `Ο κανόνας είναι σταθερή πρόσθεση ${step}.`
  };
}

function generateGeometricSequence(difficulty) {
  const ratio = catRandomInt(2, difficulty >= 7 ? 4 : 3);
  const start = catRandomInt(1, difficulty >= 6 ? 4 : 3);
  const length = difficulty >= 8 ? 5 : 4;
  const sequence = Array.from({length}, (_, i) => start * (ratio ** i));
  const correct = start * (ratio ** length);

  return {
    category: "numeric",
    generator: "geometric",
    difficulty,
    question: "Ποιος αριθμός συνεχίζει σωστά την ακολουθία;",
    visual: sequence.join("   "),
    options: catBuildOptions(correct, [correct + ratio, correct - ratio, sequence.at(-1) + ratio]),
    correct,
    explanation: `Κάθε όρος πολλαπλασιάζεται επί ${ratio}.`
  };
}

function generateAlternatingSequence(difficulty) {
  const start = catRandomInt(2, 10);
  const add = catRandomInt(2, 3 + Math.floor(difficulty / 3));
  const multiply = difficulty >= 7 ? 3 : 2;
  const seq = [start];

  for (let i = 1; i < 6; i++) {
    seq.push(i % 2 === 1 ? seq.at(-1) + add : seq.at(-1) * multiply);
  }

  const correct = seq.at(-1) + add;

  return {
    category: "numeric",
    generator: "alternating",
    difficulty,
    question: "Ποιος αριθμός συνεχίζει σωστά την εναλλασσόμενη ακολουθία;",
    visual: seq.join("   "),
    options: catBuildOptions(correct, [seq.at(-1) * multiply, correct + add, correct - add]),
    correct,
    explanation: `Οι πράξεις εναλλάσσονται: +${add}, ×${multiply}.`
  };
}

function generateFibonacciLike(difficulty) {
  const a = catRandomInt(1, 4 + Math.floor(difficulty / 3));
  const b = catRandomInt(a, a + 5);
  const seq = [a, b];

  while (seq.length < 6) {
    seq.push(seq.at(-1) + seq.at(-2));
  }

  const correct = seq.at(-1) + seq.at(-2);

  return {
    category: "numeric",
    generator: "fibonacci",
    difficulty,
    question: "Ποιος αριθμός συνεχίζει σωστά την ακολουθία;",
    visual: seq.join("   "),
    options: catBuildOptions(correct, [seq.at(-1) * 2, correct + a, correct - b]),
    correct,
    explanation: "Κάθε όρος είναι το άθροισμα των δύο προηγούμενων."
  };
}

function generateSquareSequence(difficulty) {
  const start = catRandomInt(1, 4 + Math.floor(difficulty / 2));
  const count = 5;
  const seq = Array.from({length: count}, (_, i) => (start + i) ** 2);
  const correct = (start + count) ** 2;

  return {
    category: "numeric",
    generator: "squares",
    difficulty,
    question: "Ποιος αριθμός συνεχίζει σωστά την ακολουθία;",
    visual: seq.join("   "),
    options: catBuildOptions(correct, [correct + 2 * (start + count), correct - 2 * (start + count), (start + count + 1) ** 2]),
    correct,
    explanation: "Οι όροι είναι διαδοχικά τετράγωνα αριθμών."
  };
}

function rotateSymbol(symbol, steps = 1) {
  const arrows = ["↑", "→", "↓", "←"];
  const index = arrows.indexOf(symbol);
  if (index < 0) return symbol;
  return arrows[(index + steps) % arrows.length];
}

function generateRotationSymbols(difficulty) {
  const arrows = ["↑", "→", "↓", "←"];
  const startIndex = catRandomInt(0, 3);
  const step = difficulty >= 7 ? 2 : 1;
  const seq = Array.from({length: 5}, (_, i) => arrows[(startIndex + i * step) % 4]);
  const correct = arrows[(startIndex + 5 * step) % 4];

  return {
    category: "symbols",
    generator: "rotation",
    difficulty,
    question: "Ποιο σύμβολο συνεχίζει σωστά τη μεταβολή;",
    visual: seq.join("   "),
    options: catShuffleCopy(arrows),
    correct,
    explanation: `Το βέλος περιστρέφεται κατά ${step === 1 ? "90°" : "180°"} κάθε φορά.`
  };
}

function generateAlternatingSymbols(difficulty) {
  const pairs = [
    ["●", "○"],
    ["■", "□"],
    ["▲", "△"],
    ["◆", "◇"]
  ];
  const [a, b] = pairs[catRandomInt(0, pairs.length - 1)];
  const seq = Array.from({length: 7}, (_, i) => i % 2 === 0 ? a : b);
  const correct = b;

  const pool = ["●","○","■","□","▲","△","◆","◇"].filter(x => x !== correct);

  return {
    category: "symbols",
    generator: "alternating_symbols",
    difficulty,
    question: "Ποιο σύμβολο συνεχίζει σωστά το μοτίβο;",
    visual: seq.join("   "),
    options: catShuffleCopy([correct, ...catShuffleCopy(pool).slice(0, 3)]),
    correct,
    explanation: "Τα δύο σύμβολα εναλλάσσονται."
  };
}

function generateGrowingSymbols(difficulty) {
  const symbol = ["●","■","▲","◆"][catRandomInt(0, 3)];
  const groups = difficulty >= 7 ? [1, 2, 4, 7] : [1, 2, 3, 4];
  const correctCount = difficulty >= 7 ? 11 : 5;
  const visual = groups.map(count => symbol.repeat(count)).join("   ");

  const options = [correctCount, correctCount - 1, correctCount + 1, correctCount + 2]
    .map(count => symbol.repeat(Math.max(1, count)));

  return {
    category: "symbols",
    generator: "growing_symbols",
    difficulty,
    question: "Ποια ομάδα συμβόλων συνεχίζει σωστά το μοτίβο;",
    visual,
    options: catShuffleCopy(options),
    correct: symbol.repeat(correctCount),
    explanation: difficulty >= 7
      ? "Το πλήθος αυξάνεται κατά 1, έπειτα 2, έπειτα 3 και μετά 4."
      : "Το πλήθος των συμβόλων αυξάνεται κατά ένα."
  };
}

function generateMatrixShift(difficulty) {
  const symbols = ["●","■","▲"];
  const shift = difficulty >= 7 ? 2 : 1;
  const row1 = symbols;
  const row2 = symbols.map((_, i) => symbols[(i + shift) % 3]);
  const row3 = symbols.map((_, i) => symbols[(i + 2 * shift) % 3]);
  const correct = row3[2];

  return {
    category: "matrix",
    generator: "matrix_shift",
    difficulty,
    question: "Ποιο σύμβολο λείπει από τον πίνακα;",
    visual: `${row1.join("  ")}\n${row2.join("  ")}\n${row3[0]}  ${row3[1]}  ?`,
    options: catShuffleCopy(["●","■","▲","◆"]),
    correct,
    explanation: "Κάθε σειρά αποτελεί κυκλική μετατόπιση της προηγούμενης."
  };
}

function generateMatrixCount(difficulty) {
  const symbol = ["●","■","▲"][catRandomInt(0, 2)];
  const base = difficulty >= 7 ? 2 : 1;
  const counts = [
    [base, base + 1, base + 2],
    [base + 1, base + 2, base + 3],
    [base + 2, base + 3, null]
  ];
  const correctCount = base + 4;

  const lines = counts.map(row =>
    row.map(value => value === null ? "?" : symbol.repeat(value)).join("   ")
  );

  const options = [correctCount, correctCount - 1, correctCount + 1, correctCount + 2]
    .map(count => symbol.repeat(count));

  return {
    category: "matrix",
    generator: "matrix_count",
    difficulty,
    question: "Ποια ομάδα συμβόλων συμπληρώνει σωστά τον πίνακα;",
    visual: lines.join("\n"),
    options: catShuffleCopy(options),
    correct: symbol.repeat(correctCount),
    explanation: "Το πλήθος αυξάνεται κατά ένα προς τα δεξιά και προς τα κάτω."
  };
}

function generateMatrixRotation(difficulty) {
  const row1 = ["↑","→","↓"];
  const row2 = row1.map(x => rotateSymbol(x, 1));
  const row3 = row2.map(x => rotateSymbol(x, 1));
  const correct = row3[2];

  return {
    category: "matrix",
    generator: "matrix_rotation",
    difficulty,
    question: "Ποιο βέλος λείπει από τον πίνακα;",
    visual: `${row1.join("  ")}\n${row2.join("  ")}\n${row3[0]}  ${row3[1]}  ?`,
    options: catShuffleCopy(["↑","→","↓","←"]),
    correct,
    explanation: "Κάθε στοιχείο περιστρέφεται κατά 90° στην επόμενη σειρά."
  };
}

const CAT_GENERATORS = [
  {category: "numeric", min: 1, max: 10, fn: generateArithmeticSequence},
  {category: "numeric", min: 2, max: 10, fn: generateGeometricSequence},
  {category: "numeric", min: 4, max: 10, fn: generateAlternatingSequence},
  {category: "numeric", min: 3, max: 10, fn: generateFibonacciLike},
  {category: "numeric", min: 2, max: 9, fn: generateSquareSequence},
  {category: "symbols", min: 1, max: 10, fn: generateRotationSymbols},
  {category: "symbols", min: 1, max: 7, fn: generateAlternatingSymbols},
  {category: "symbols", min: 3, max: 10, fn: generateGrowingSymbols},
  {category: "matrix", min: 3, max: 10, fn: generateMatrixShift},
  {category: "matrix", min: 4, max: 10, fn: generateMatrixCount},
  {category: "matrix", min: 5, max: 10, fn: generateMatrixRotation}
];

function generateCatQuestion(difficulty, category = "all") {
  const eligible = CAT_GENERATORS.filter(generator =>
    difficulty >= generator.min &&
    difficulty <= generator.max &&
    (category === "all" || generator.category === category)
  );

  const fallback = CAT_GENERATORS.filter(generator =>
    category === "all" || generator.category === category
  );

  const pool = eligible.length > 0 ? eligible : fallback;
  const selected = pool[catRandomInt(0, pool.length - 1)];
  return selected.fn(difficulty);
}

function catQuestionSignature(question) {
  return `${question.generator}|${question.visual}|${question.correct}`;
}

function generateUniqueCatQuestion(difficulty, category = "all") {
  const difficultyOrder = [
    difficulty,
    ...Array.from({ length: 10 }, (_, index) => index + 1)
      .filter(level => level !== difficulty)
      .sort((a, b) => Math.abs(a - difficulty) - Math.abs(b - difficulty))
  ];

  for (const level of difficultyOrder) {
    for (let attempt = 0; attempt < 160; attempt++) {
      const question = generateCatQuestion(level, category);
      const signature = catQuestionSignature(question);

      if (catUsedQuestionSignatures.has(signature)) continue;

      catUsedQuestionSignatures.add(signature);
      addRecentCatQuestion(signature);
      return question;
    }
  }

  throw new Error("Δεν ήταν δυνατή η δημιουργία μοναδικής ερώτησης CAT.");
}

function formatCatSymbols(value) {
  const text = String(value);
  return text.replace(/[●○■□▲△◆◇]{2,}/g, run => Array.from(run).join(" "));
}

function catSymbolSvg(symbol) {
  const common = 'viewBox="0 0 24 24" aria-hidden="true" focusable="false"';
  const shapes = {
    "●": `<svg ${common}><circle cx="12" cy="12" r="7" fill="currentColor"/></svg>`,
    "○": `<svg ${common}><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>`,
    "■": `<svg ${common}><rect x="5" y="5" width="14" height="14" fill="currentColor"/></svg>`,
    "□": `<svg ${common}><rect x="5" y="5" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>`,
    "▲": `<svg ${common}><path d="M12 4 L20 19 H4 Z" fill="currentColor"/></svg>`,
    "△": `<svg ${common}><path d="M12 4 L20 19 H4 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>`,
    "◆": `<svg ${common}><path d="M12 3 L21 12 L12 21 L3 12 Z" fill="currentColor"/></svg>`,
    "◇": `<svg ${common}><path d="M12 3 L21 12 L12 21 L3 12 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>`
  };
  return shapes[symbol] || null;
}

function renderCatSymbolsHtml(value) {
  const text = formatCatSymbols(value);
  return Array.from(text).map(char => {
    const svg = catSymbolSvg(char);
    if (svg) {
      return `<span class="cat-symbol-glyph" aria-label="${char}">${svg}</span>`;
    }
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === '"') return "&quot;";
    return char;
  }).join("");
}

function resetCatStats() {
  catCategoryStats = {
    numeric: {total: 0, correct: 0},
    symbols: {total: 0, correct: 0},
    matrix: {total: 0, correct: 0}
  };
}

function startCatPractice() {
  const count = parseInt(document.getElementById("catPracticeCount").value, 10);
  const category = document.getElementById("catPracticeCategory").value;

  catMode = "practice";
  catUsedQuestionSignatures = new Set(getRecentCatQuestions());
  catReviewRecords = [];
  catResponseRecords = [];
  catCorrectStreak = 0;
  catQuestions = Array.from({length: count}, () => {
    const difficulty = catRandomInt(2, 8);
    return generateUniqueCatQuestion(difficulty, category);
  });

  catIndex = 0;
  catScore = 0;
  catAnswered = 0;
  catDifficultyHistory = [];
  resetCatStats();
  clearCatTimer();
  setFooter("cat");
  showOnly("catQuiz");
  renderCatQuestion();
}

function startAdaptiveCat() {
  clearCatTimer();
  document.body.classList.remove("cat-exam-setup");
  document.body.classList.add("cat-exam-active");
  showOnly("catPreparing");

  window.setTimeout(beginAdaptiveCatExam, 1300);
}

function beginAdaptiveCatExam() {
  const count = 18;

  catMode = "adaptive";
  catQuestions = new Array(count);
  catIndex = 0;
  catScore = 0;
  catAnswered = 0;
  catCurrentDifficulty = 5;
  catDifficultyHistory = [];
  catUsedQuestionSignatures = new Set(getRecentCatQuestions());
  catReviewRecords = [];
  catResponseRecords = [];
  catCorrectStreak = 0;
  catTimeRemaining = catTotalSeconds;
  catStartedAt = Date.now();
  catEndedByTime = false;
  resetCatStats();
  setFooter("cat");
  showOnly("catQuiz");
  startCatTotalTimer();
  renderCatQuestion();
}

function renderCatQuestion() {
  catLocked = false;

  if (catMode === "adaptive") {
    catCurrentQuestion = generateUniqueCatQuestion(catCurrentDifficulty, "all");
    catQuestions[catIndex] = catCurrentQuestion;
  } else {
    catCurrentQuestion = catQuestions[catIndex];
  }

  const question = catCurrentQuestion;
  const total = catQuestions.length;

  document.getElementById("catCounter").textContent =
    `Ερώτηση ${catIndex + 1} από ${total}`;

  document.getElementById("catProgress").style.width =
    `${((catIndex + 1) / total) * 100}%`;

  document.getElementById("catCategoryBadge").textContent =
    question.category === "numeric"
      ? "Αριθμητικές ακολουθίες"
      : question.category === "symbols"
      ? "Σύμβολα και μετασχηματισμοί"
      : "Λογικοί πίνακες";

  const difficultyBadge = document.getElementById("catDifficultyBadge");
  difficultyBadge.textContent = `Δυσκολία ${question.difficulty}/10`;
  difficultyBadge.classList.toggle("hidden", catMode === "adaptive");

  const categoryBadge = document.getElementById("catCategoryBadge");
  categoryBadge.classList.toggle("hidden", catMode === "adaptive");

  document.getElementById("catQuestionText").textContent = question.question;
  document.getElementById("catVisual").innerHTML = renderCatSymbolsHtml(question.visual).replace(/\n/g, "<br>");
  document.getElementById("catFeedback").textContent = "";
  document.getElementById("catNextButton").classList.add("hidden");

  const answers = document.getElementById("catAnswers");
  answers.innerHTML = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "answer cat-answer";
    button.dataset.optionIndex = String(index);
    button.innerHTML = `<span class="cat-option-label">${["Α","Β","Γ","Δ"][index]}.</span><span class="cat-option-content">${renderCatSymbolsHtml(option)}</span>`;
    button.onclick = () => chooseCatAnswer(option, button);
    answers.appendChild(button);
  });

  if (catMode === "adaptive") {
    updateCatTimerDisplay();
  } else {
    document.getElementById("catTimer").textContent = "Εξάσκηση";
  }
}

function startCatTotalTimer() {
  updateCatTimerDisplay();
  catQuestionTimer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - catStartedAt) / 1000);
    catTimeRemaining = Math.max(0, catTotalSeconds - elapsed);
    updateCatTimerDisplay();

    if (catTimeRemaining <= 0) {
      catEndedByTime = true;
      finishCat(false);
    }
  }, 250);
}

function updateCatTimerDisplay() {
  const minutes = Math.floor(catTimeRemaining / 60);
  const seconds = catTimeRemaining % 60;
  document.getElementById("catTimer").textContent =
    `⏱ ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function clearCatTimer() {
  if (catQuestionTimer) {
    clearInterval(catQuestionTimer);
    catQuestionTimer = null;
  }
}

function chooseCatAnswer(selected, selectedButton) {
  if (catLocked) return;
  catLocked = true;

  const question = catCurrentQuestion;
  const isCorrect = selected === question.correct;
  catAnswered++;
  catReviewRecords.push({
    number: catIndex + 1,
    question: {...question},
    selected,
    correct: question.correct,
    isCorrect
  });

  catCategoryStats[question.category].total++;
  if (isCorrect) {
    catScore++;
    catCategoryStats[question.category].correct++;
  }

  document.querySelectorAll(".cat-answer").forEach(button => {
    button.disabled = true;

    if (catMode === "practice") {
      const optionIndex = Number(button.dataset.optionIndex);
      if (question.options[optionIndex] === question.correct) {
        button.classList.add("correct");
      }
    }
  });

  if (!isCorrect && catMode === "practice") {
    selectedButton.classList.add("wrong");
  }

  catDifficultyHistory.push(question.difficulty);
  catResponseRecords.push({difficulty: question.difficulty, isCorrect});

  if (catMode === "adaptive") {
    if (isCorrect) {
      catCorrectStreak += 1;
      if (catCorrectStreak >= 2) {
        catCurrentDifficulty = Math.min(10, catCurrentDifficulty + 1);
        catCorrectStreak = 0;
      }
    } else {
      catCurrentDifficulty = Math.max(1, catCurrentDifficulty - 1);
      catCorrectStreak = 0;
    }

    document.getElementById("catFeedback").textContent = "Η απάντηση καταχωρίστηκε.";
    setTimeout(nextCatQuestion, 350);
  } else {
    document.getElementById("catFeedback").textContent =
      `${isCorrect ? "✓ Σωστή απάντηση" : "✗ Λάθος απάντηση"} — ${question.explanation}`;
    document.getElementById("catNextButton").classList.remove("hidden");
  }
}

function nextCatQuestion() {
  catIndex++;

  if (catIndex < catQuestions.length) {
    renderCatQuestion();
  } else {
    finishCat(false);
  }
}

function finishCatEarly() {
  if (!confirm("Θέλεις να τερματίσεις το τεστ;")) return;
  finishCat(true);
}


function calculateCatAbility(responses) {
  if (!responses.length) return 0;

  // Εκπαιδευτική εκτίμηση τύπου IRT: η δυσκολία κάθε ερώτησης
  // επηρεάζει το Ability, όχι ο χρόνος απάντησης.
  const probability = (theta, difficulty) => {
    const itemDifficulty = -2.25 + ((difficulty - 1) / 9) * 4.5;
    return 1 / (1 + Math.exp(-1.2 * (theta - itemDifficulty)));
  };

  let low = -3;
  let high = 3;
  for (let i = 0; i < 45; i++) {
    const theta = (low + high) / 2;
    const scoreEquation = responses.reduce((sum, response) => {
      return sum + (response.isCorrect ? 1 : 0) - probability(theta, response.difficulty);
    }, 0);
    if (scoreEquation > 0) low = theta;
    else high = theta;
  }

  const theta = (low + high) / 2;
  return Math.round(Math.max(0, Math.min(100, ((theta + 3) / 6) * 100)));
}

function getCatHistory() {
  return ApplicationState.readList(CAT_HISTORY_KEY);
}

function saveCatHistoryRecord(record) {
  const history = getCatHistory();
  history.push(record);
  ApplicationState.write(CAT_HISTORY_KEY, history.slice(-100));
}

function formatCatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds || 0));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function buildCatComparison(ability, previousAbility) {
  if (!Number.isFinite(previousAbility)) {
    return `<div class="cat-comparison neutral"><strong>Πρώτη προσπάθεια</strong><span>Από την επόμενη προσομοίωση θα εμφανίζεται σύγκριση Ability.</span></div>`;
  }

  const difference = ability - previousAbility;
  if (difference > 0) {
    return `<div class="cat-comparison up"><strong>↑ +${difference} από την προηγούμενη προσπάθεια</strong><span>Συγχαρητήρια! Ξεπέρασες την προηγούμενη προσπάθειά σου.</span></div>`;
  }
  if (difference < 0) {
    return `<div class="cat-comparison down"><strong>↓ ${difference} από την προηγούμενη προσπάθεια</strong><span>Η σημερινή προσπάθεια ήταν χαμηλότερη. Δες τις απαντήσεις σου και δοκίμασε ξανά.</span></div>`;
  }
  return `<div class="cat-comparison neutral"><strong>→ Ίδιο Ability με την προηγούμενη προσπάθεια</strong><span>Η επίδοσή σου παρέμεινε σταθερή. Συνέχισε την εξάσκηση.</span></div>`;
}

function finishCat(stoppedEarly = false) {
  clearCatTimer();
  document.body.classList.remove("cat-exam-active", "cat-exam-setup");

  const attempted = catAnswered;
  const totalQuestions = catQuestions.length;
  const unanswered = Math.max(0, totalQuestions - attempted);
  const wrongAnswers = Math.max(0, attempted - catScore);
  const usedSeconds = catMode === "adaptive" && catStartedAt
    ? Math.min(catTotalSeconds, Math.floor((Date.now() - catStartedAt) / 1000))
    : 0;
  const usedTimeText = formatCatDuration(usedSeconds);
  const remainingSeconds = catMode === "adaptive" ? Math.max(0, catTotalSeconds - usedSeconds) : 0;
  const averageSeconds = attempted > 0 ? usedSeconds / attempted : 0;
  const percentage = attempted > 0 ? Math.round((catScore / attempted) * 100) : 0;
  const averageDifficulty = catDifficultyHistory.length > 0
    ? catDifficultyHistory.reduce((sum, value) => sum + value, 0) / catDifficultyHistory.length
    : 0;
  const ability = catMode === "adaptive" ? calculateCatAbility(catResponseRecords) : percentage;

  let comparisonHtml = "";
  if (catMode === "adaptive") {
    const history = getCatHistory();
    const previous = history.length ? history[history.length - 1] : null;
    comparisonHtml = buildCatComparison(ability, previous?.ability);
    saveCatHistoryRecord({
      date: new Date().toISOString(),
      ability,
      usedSeconds,
      averageSeconds,
      remainingSeconds,
      completed: attempted,
      stoppedEarly: Boolean(stoppedEarly),
      endedByTime: Boolean(catEndedByTime)
    });
  }

  completeActiveStudyPlanCatTask(catMode, attempted, stoppedEarly);

  document.getElementById("catResultTitle").textContent =
    catMode === "adaptive" ? "Αποτέλεσμα Προσομοίωσης CAT" : "Αποτέλεσμα Εξάσκησης";

  document.getElementById("catResultScore").innerHTML = catMode === "adaptive"
    ? `<span class="ability-label">Ability</span><strong>${ability}<small>/100</small></strong>`
    : `${percentage}%`;

  const categoryRows = Object.entries(catCategoryStats)
    .filter(([, stats]) => stats.total > 0)
    .map(([category, stats]) => {
      const name = category === "numeric" ? "Αριθμητικές ακολουθίες" : category === "symbols" ? "Σύμβολα" : "Λογικοί πίνακες";
      const pct = Math.round((stats.correct / stats.total) * 100);
      return `<div><span>${name}</span><strong>${pct}%</strong></div>`;
    }).join("");

  document.getElementById("catResultDetails").innerHTML = catMode === "adaptive" ? `
    ${comparisonHtml}
    <h3 class="cat-result-section-title">🧠 Επίδοση</h3>
    <div class="cat-result-grid">
      <div><span>Σωστές</span><strong>${catScore}</strong></div>
      <div><span>Λάθος</span><strong>${wrongAnswers}</strong></div>
      <div><span>Αναπάντητες</span><strong>${unanswered}</strong></div>
      <div><span>Μέση δυσκολία</span><strong>${averageDifficulty.toFixed(1)}/10</strong></div>
    </div>
    <h3 class="cat-result-section-title">⏱️ Διαχείριση χρόνου</h3>
    <div class="cat-result-grid cat-time-grid">
      <div><span>Συνολικός χρόνος</span><strong>${usedTimeText}</strong></div>
      <div><span>Μέσος χρόνος / ερώτηση</span><strong>${formatCatDuration(averageSeconds)}</strong></div>
      <div><span>Χρόνος που απέμεινε</span><strong>${formatCatDuration(remainingSeconds)}</strong></div>
    </div>
    <div class="cat-category-results">${categoryRows}</div>
    ${stoppedEarly ? '<p class="cat-result-note">Η προσπάθεια τερματίστηκε πρόωρα.</p>' : ''}
    ${catEndedByTime ? '<p class="cat-result-note">Ο συνολικός χρόνος των 24 λεπτών ολοκληρώθηκε.</p>' : ''}
    <p class="cat-result-note">Ο χρόνος εμφανίζεται μόνο ως πληροφορία διαχείρισης και δεν επηρεάζει το Ability.</p>
    <p class="cat-result-note">Ο δείκτης αποτελεί εκπαιδευτική εκτίμηση της εφαρμογής και όχι επίσημη βαθμολογία ΑΣΕΠ.</p>
  ` : `
    <div class="cat-result-grid">
      <div><span>Απαντήθηκαν</span><strong>${attempted}</strong></div>
      <div><span>Σωστές</span><strong>${catScore}</strong></div>
      <div><span>Λάθος</span><strong>${wrongAnswers}</strong></div>
      <div><span>Μέση δυσκολία</span><strong>${averageDifficulty.toFixed(1)}/10</strong></div>
      <div><span>Ποσοστό επιτυχίας</span><strong>${percentage}%</strong></div>
    </div>
    <div class="cat-category-results">${categoryRows}</div>
  `;

  setFooter("cat");
  showOnly("catResults");
}


function openCatHistory() {
  renderCatHistory();
  setFooter("cat");
  showOnly("catHistory");
}

function renderCatHistory() {
  const history = getCatHistory();
  const summary = document.getElementById("catHistorySummary");
  const list = document.getElementById("catHistoryList");
  if (!summary || !list) return;

  if (!history.length) {
    summary.innerHTML = "";
    list.innerHTML = '<p class="cat-review-empty">Δεν υπάρχουν ακόμη αποθηκευμένες προσομοιώσεις CAT.</p>';
    return;
  }

  const average = Math.round(history.reduce((sum, item) => sum + item.ability, 0) / history.length);
  const best = Math.max(...history.map(item => item.ability));
  summary.innerHTML = `
    <div><span>Μέσο Ability</span><strong>${average}</strong></div>
    <div><span>Καλύτερο</span><strong>${best}</strong></div>
    <div><span>Προσπάθειες</span><strong>${history.length}</strong></div>
  `;

  list.innerHTML = [...history].reverse().map((item, reverseIndex) => {
    const originalIndex = history.length - reverseIndex;
    const previous = history[originalIndex - 2];
    const diff = previous ? item.ability - previous.ability : null;
    const trend = diff === null ? "—" : diff > 0 ? `↑ +${diff}` : diff < 0 ? `↓ ${diff}` : "→ 0";
    return `<div class="cat-history-item">
      <div><span>Προσπάθεια ${originalIndex}</span><small>${new Date(item.date).toLocaleString("el-GR")}</small></div>
      <strong>${item.ability}<small>/100</small></strong>
      <span class="cat-history-trend">${trend}</span>
    </div>`;
  }).join("");
}

function clearCatHistory() {
  if (!confirm("Θέλεις να διαγράψεις όλο το ιστορικό CAT;")) return;
  ApplicationState.remove(CAT_HISTORY_KEY);
  renderCatHistory();
}

function openCatReview(filter = "wrong") {
  catReviewFilter = filter;
  renderCatReview();
  setFooter("cat");
  showOnly("catReview");
}

function setCatReviewFilter(filter) {
  catReviewFilter = filter;
  renderCatReview();
}

function renderCatReview() {
  const filters = document.querySelectorAll("[data-cat-review-filter]");
  filters.forEach(button => button.classList.toggle("active", button.dataset.catReviewFilter === catReviewFilter));

  const records = catReviewRecords.filter(record =>
    catReviewFilter === "all" ||
    (catReviewFilter === "wrong" && !record.isCorrect) ||
    (catReviewFilter === "correct" && record.isCorrect)
  );

  const list = document.getElementById("catReviewList");
  if (!records.length) {
    list.innerHTML = `<p class="cat-review-empty">Δεν υπάρχουν ${catReviewFilter === "wrong" ? "λάθος" : "σωστές"} απαντήσεις.</p>`;
    return;
  }

  list.innerHTML = records.map(record => {
    const q = record.question;
    const selectedText = record.selected === undefined ? "Δεν απαντήθηκε" : renderCatSymbolsHtml(record.selected);
    const correctText = renderCatSymbolsHtml(record.correct);
    return `
      <article class="cat-review-item ${record.isCorrect ? "is-correct" : "is-wrong"}">
        <div class="cat-review-heading">
          <strong>Ερώτηση ${record.number}</strong>
          <span>${record.isCorrect ? "✓ Σωστή" : "✗ Λάθος"}</span>
        </div>
        <p class="cat-review-question">${q.question}</p>
        <div class="cat-review-visual">${renderCatSymbolsHtml(q.visual).replace(/\n/g, "<br>")}</div>
        <p><b>Η απάντησή σου:</b> ${selectedText}</p>
        <p><b>Σωστή απάντηση:</b> ${correctText}</p>
        <p class="cat-review-explanation"><b>Εξήγηση:</b> ${q.explanation}</p>
      </article>`;
  }).join("");
}


// V14 — Σχέδιο Μελέτης και Βοήθεια
function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getStudyPlan() {
  const plan = ApplicationState.read(STUDY_PLAN_KEY, null);
  return plan && typeof plan === "object" ? plan : null;
}

function getStudyPlanLog() {
  return ApplicationState.readObject(STUDY_PLAN_LOG_KEY);
}

function saveStudyPlanLog(log) {
  ApplicationState.write(STUDY_PLAN_LOG_KEY, log);
}

function updateStudyPlanLog(field, amount = 1) {
  const log = getStudyPlanLog();
  const key = localDateKey();
  const today = log[key] || {registryNew:0, registryReview:0, catPractice:0, catSimulation:0, workTriads:0};
  today[field] = (Number(today[field]) || 0) + Math.max(0, Number(amount) || 0);
  log[key] = today;
  saveStudyPlanLog(log);
}

function getStudyPlanHomeMetric() {
  const plan = getStudyPlan();
  if (!plan) return "Δημιούργησε σχέδιο";
  const days = getPlanDaysRemaining(plan);
  return days > 0 ? `${days} ημέρες απομένουν` : "Η ημερομηνία έφτασε";
}

function getPlanDaysRemaining(plan) {
  if (!plan?.targetDate) return 0;
  const today = new Date(`${localDateKey()}T00:00:00`);
  const target = new Date(`${plan.targetDate}T00:00:00`);
  return Math.max(0, Math.floor((target - today) / 86400000) + 1);
}

function getPlanWeekLog() {
  const log = getStudyPlanLog();
  const now = new Date();
  const monday = new Date(now);
  const day = (now.getDay() + 6) % 7;
  monday.setDate(now.getDate() - day);
  const total = {catPractice:0, catSimulation:0};
  for (let i=0;i<7;i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate()+i);
    const item = log[localDateKey(date)] || {};
    total.catPractice += Number(item.catPractice)||0;
    total.catSimulation += Number(item.catSimulation)||0;
  }
  return total;
}

function calculateStudyPlanTargets(plan) {
  const days = Math.max(1, getPlanDaysRemaining(plan));
  const questionStats = getQuestionStats();
  const readCount = Object.values(questionStats).filter(item => (Number(item.appearances)||0) > 0).length;
  const unread = Math.max(0, getRegistryQuestionTotal() - readCount);
  const wrongs = getWrongs().length;
  const remainingWork = Math.max(0, 228 - getWorkSeenIds().length);
  const week = getPlanWeekLog();
  return {
    days,
    registryNew: plan.registry ? Math.min(100, Math.ceil(unread / days)) : 0,
    registryReview: plan.registry && wrongs > 0 ? Math.min(50, Math.max(5, Math.ceil(Math.min(unread || 10, 40) * 0.35))) : 0,
    catPractice: plan.cat && week.catPractice < 3 ? 1 : 0,
    catSimulation: plan.cat && week.catSimulation < 1 ? 1 : 0,
    workTriads: plan.work ? Math.min(76, Math.ceil(remainingWork / days)) : 0,
    unread,
    wrongs,
    remainingWork,
    week
  };
}

function openStudyPlanHub() {
  setFooter("plan");
  updateStudyPlanTiles();
  showOnly("studyPlanHub");
}

function updateStudyPlanTiles() {
  const plan = getStudyPlan();
  const todayMetric = document.getElementById("planTodayTileMetric");
  const progressMetric = document.getElementById("planProgressTileMetric");
  if (!plan) {
    if (todayMetric) todayMetric.textContent = "Χωρίς ενεργό σχέδιο";
    if (progressMetric) progressMetric.textContent = "Δημιούργησε σχέδιο";
    return;
  }
  const targets = calculateStudyPlanTargets(plan);
  const taskCount = [targets.registryNew>0, targets.registryReview>0, targets.catPractice>0, targets.catSimulation>0, targets.workTriads>0].filter(Boolean).length;
  if (todayMetric) todayMetric.textContent = `${taskCount} σημερινές εργασίες`;
  if (progressMetric) progressMetric.textContent = `${targets.days} ημέρες απομένουν`;
}

function openStudyPlanSetup() {
  const plan = getStudyPlan();
  const dateInput = document.getElementById("studyPlanTargetDate");
  const min = localDateKey();
  dateInput.min = min;
  dateInput.value = plan?.targetDate || (() => { const d=new Date(); d.setDate(d.getDate()+60); return localDateKey(d); })();
  document.getElementById("planRegistry").checked = plan ? Boolean(plan.registry) : true;
  document.getElementById("planCat").checked = plan ? Boolean(plan.cat) : true;
  document.getElementById("planWork").checked = plan ? Boolean(plan.work) : true;
  setFooter("plan");
  showOnly("studyPlanSetup");
}

function saveStudyPlan() {
  const targetDate = document.getElementById("studyPlanTargetDate").value;
  const registry = document.getElementById("planRegistry").checked;
  const cat = document.getElementById("planCat").checked;
  const work = document.getElementById("planWork").checked;
  if (!targetDate || targetDate < localDateKey()) {
    showMessage("Επίλεξε σημερινή ή μεταγενέστερη ημερομηνία.");
    return;
  }
  if (!registry && !cat && !work) {
    showMessage("Επίλεξε τουλάχιστον μία ενότητα.");
    return;
  }
  const existing = getStudyPlan();
  ApplicationState.write(STUDY_PLAN_KEY, {
    targetDate, registry, cat, work,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  updateHomeDashboard();
  showMessage("Το Σχέδιο Μελέτης αποθηκεύτηκε.");
  openTodayPlan();
}

function deleteStudyPlan() {
  if (!getStudyPlan()) { showMessage("Δεν υπάρχει ενεργό σχέδιο."); return; }
  if (!confirm("Θέλεις να διαγράψεις το ενεργό Σχέδιο Μελέτης;")) return;
  ApplicationState.remove(STUDY_PLAN_KEY);
  ApplicationState.remove(STUDY_PLAN_LOG_KEY);
  updateHomeDashboard();
  openStudyPlanHub();
}

function openTodayPlan() {
  const plan = getStudyPlan();
  if (!plan) { showMessage("Δημιούργησε πρώτα ένα Σχέδιο Μελέτης."); openStudyPlanSetup(); return; }
  const targets = calculateStudyPlanTargets(plan);
  const log = getStudyPlanLog()[localDateKey()] || {};
  document.getElementById("studyPlanTodaySummary").innerHTML = `<strong>${targets.days} ημέρες μέχρι τον στόχο</strong><span>Το φορτίο επανυπολογίζεται αυτόματα από την πραγματική σου πρόοδο.</span>`;
  const tasks=[];
  const addTask=(icon,title,target,done,action,label)=>{
    const complete=Math.min(done||0,target||0);
    const remaining=Math.max(0,(target||0)-complete);
    tasks.push(`<article class="plan-task ${remaining===0?'is-complete':''}"><div class="plan-task-icon">${icon}</div><div class="plan-task-body"><h3>${title}</h3><p>${complete} / ${target} ολοκληρώθηκαν</p><div class="plan-task-progress"><span style="width:${target?Math.min(100,Math.round(complete/target*100)):100}%"></span></div></div><button ${remaining===0?'disabled':''} onclick="${action}">${remaining===0?'Ολοκληρώθηκε':label}</button></article>`);
  };
  if (plan.registry) {
    if (targets.registryNew>0) addTask('📘','Νέες ερωτήσεις Μητρώου',targets.registryNew,log.registryNew,`startPlanRegistryTask('new',${targets.registryNew})`,'Έναρξη');
    if (targets.registryReview>0) addTask('🔁','Επαναλήψεις Μητρώου',targets.registryReview,log.registryReview,`startPlanRegistryTask('review',${targets.registryReview})`,'Έναρξη');
  }
  if (plan.cat) {
    if (targets.catPractice>0) addTask('🧩','Τεστ Εξάσκησης CAT',1,log.catPractice,'startPlanCatPractice()','Έναρξη');
    if (targets.catSimulation>0) addTask('🎓','Προσομοίωση Εξέτασης CAT',1,log.catSimulation,'startPlanCatSimulation()','Έναρξη Εξέτασης');
  }
  if (plan.work && targets.workTriads>0) addTask('🎭','Τριάδες Εργασιακών Συμπεριφορών',targets.workTriads,log.workTriads,`startPlanWorkTask(${targets.workTriads})`,'Έναρξη');
  document.getElementById("studyPlanTodayTasks").innerHTML = tasks.length ? tasks.join('') : '<p class="plan-empty">Το σημερινό πρόγραμμα έχει ολοκληρωθεί.</p>';
  setFooter("plan"); showOnly("studyPlanToday");
}

function openStudyPlanProgress() {
  const plan=getStudyPlan();
  if(!plan){showMessage("Δημιούργησε πρώτα ένα Σχέδιο Μελέτης.");openStudyPlanSetup();return;}
  const t=calculateStudyPlanTargets(plan);
  const registryQuestionTotal=getRegistryQuestionTotal();
  const read=Math.max(0,registryQuestionTotal-t.unread);
  const seen=Math.max(0,228-t.remainingWork);
  const catHistory=getCatHistory();
  const latestAbility=catHistory.length?catHistory[catHistory.length-1].ability:null;
  document.getElementById("studyPlanProgressSummary").innerHTML=`<strong>Στόχος: ${new Date(plan.targetDate+'T00:00:00').toLocaleDateString('el-GR')}</strong><span>${t.days} ημέρες απομένουν</span>`;
  const rows=[];
  if(plan.registry) rows.push(planProgressRow('📚 Μητρώο',read,registryQuestionTotal,`${t.unread} αδιάβαστες`));
  if(plan.cat) rows.push(planProgressRow('🧠 CAT',Math.min(catHistory.length,10),10,latestAbility===null?'Δεν υπάρχει ακόμη Ability':`Τελευταίο Ability: ${latestAbility}/100`));
  if(plan.work) rows.push(planProgressRow('🎭 Συμπεριφορές',seen,228,`${t.remainingWork} τριάδες απομένουν`));
  document.getElementById("studyPlanProgressDetails").innerHTML=rows.join('');
  setFooter("plan");showOnly("studyPlanProgress");
}

function planProgressRow(title,value,total,note){
  const pct=total?Math.min(100,Math.round(value/total*100)):0;
  return `<article class="plan-progress-row"><div><strong>${title}</strong><span>${note}</span></div><b>${pct}%</b><div class="plan-task-progress"><span style="width:${pct}%"></span></div></article>`;
}

async function startPlanRegistryTask(type,count){
  return startStudy({
    filter:type==='new'?'unread':'wrongs',
    limit:count,
    studySeconds:5,
    autoNext:false,
    randomize:false,
    planTaskKind:type==='new'?'registryNew':'registryReview'
  });
}

function completeActiveStudyPlanRegistryTask(){
  if(!activeStudyPlanTask || !['registryNew','registryReview'].includes(activeStudyPlanTask.kind)) return;
  const completed=Math.min(currentQuestions.length, Math.max(0,currentIndex));
  updateStudyPlanLog(activeStudyPlanTask.kind,completed);
  activeStudyPlanTask=null;
}

function startPlanCatPractice(){
  activeStudyPlanTask={kind:'catPractice'};
  document.getElementById('catPracticeCount').value='10';
  document.getElementById('catPracticeCategory').value='all';
  startCatPractice();
}

function startPlanCatSimulation(){activeStudyPlanTask={kind:'catSimulation'};startAdaptiveCat();}

function completeActiveStudyPlanCatTask(modeName,attempted,stoppedEarly){
  if(!activeStudyPlanTask) return;
  if(activeStudyPlanTask.kind==='catPractice' && modeName==='practice' && attempted>0) updateStudyPlanLog('catPractice',1);
  if(activeStudyPlanTask.kind==='catSimulation' && modeName==='adaptive' && attempted>0 && !stoppedEarly) updateStudyPlanLog('catSimulation',1);
  if(['catPractice','catSimulation'].includes(activeStudyPlanTask.kind)) activeStudyPlanTask=null;
}

async function startPlanWorkTask(count){
  activeStudyPlanTask={kind:'workTriads'};
  const started=await startWorkPractice({count,timed:false});
  if(!started) activeStudyPlanTask=null;
}

function completeActiveStudyPlanWorkTask(completed){
  if(activeStudyPlanTask?.kind!=='workTriads') return;
  updateStudyPlanLog('workTriads',completed);
  activeStudyPlanTask=null;
}

function openHelpHub(){setFooter('help');showOnly('helpHub');}
function openAsepGuide(){setFooter('help');showOnly('asepGuide');}
function openAppGuide(){setFooter('help');showOnly('appGuide');}
