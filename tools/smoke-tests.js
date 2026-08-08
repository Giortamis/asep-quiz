"use strict";

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const projectRoot = path.resolve(__dirname, "..");
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function createServer() {
  return http.createServer((request, response) => {
    const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
    const filePath = path.resolve(projectRoot, relativePath);

    if (!filePath.startsWith(`${projectRoot}${path.sep}`) || !fs.existsSync(filePath)) {
      response.writeHead(404).end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream"
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

async function invoke(page, functionName, ...args) {
  await page.evaluate(
    async ({ name, values }) => {
      if (typeof window[name] !== "function") throw new Error(`Missing function: ${name}`);
      await window[name](...values);
    },
    { name: functionName, values: args }
  );
}

async function expectVisible(page, id) {
  await page.locator(`#${id}:not(.hidden)`).waitFor({ state: "visible", timeout: 5000 });
}

async function main() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const runtimeErrors = [];

  page.on("pageerror", error => runtimeErrors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("response", response => {
    if (response.status() >= 400) runtimeErrors.push(`${response.status()} ${response.url()}`);
  });

  const tests = [];
  const test = (name, run) => tests.push({ name, run });
  const reset = async () => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await expectVisible(page, "home");
  };

  test("Application startup", async () => {
    await reset();
    await expectVisible(page, "home");
  });

  test("Smart Welcome Hero Card", async () => {
    await reset();
    const hero = page.locator("#smartWelcomeCard");
    await hero.waitFor({ state: "visible", timeout: 5000 });
    if (await hero.locator("button").count() !== 0) {
      throw new Error("Hero Card must not contain buttons");
    }
    if (await hero.locator('[data-placeholder="true"]').count() !== 1) {
      throw new Error("Hero Card logo placeholder is missing");
    }

    const welcomeChecks = await page.evaluate(() => {
      const greetings = [
        getWelcomeGreeting(8),
        getWelcomeGreeting(13),
        getWelcomeGreeting(17),
        getWelcomeGreeting(22)
      ];
      sessionStorage.removeItem("asepWelcomeLastMessage");
      const firstMessage = selectWelcomeMessage(0);
      const secondMessage = selectWelcomeMessage(0);
      return { greetings, firstMessage, secondMessage };
    });

    const greetingTexts = welcomeChecks.greetings.map(item => item.text);
    if (greetingTexts.join("|") !== "Καλημέρα|Καλό μεσημέρι|Καλό απόγευμα|Καλησπέρα") {
      throw new Error(`Unexpected time greetings: ${greetingTexts.join(", ")}`);
    }
    if (welcomeChecks.firstMessage === welcomeChecks.secondMessage) {
      throw new Error("Hero Card repeated the same message consecutively");
    }

    await page.evaluate(() => {
      localStorage.setItem("asepUserName", JSON.stringify("Γιώργο"));
    });
    await invoke(page, "goHome");
    const namedGreeting = await page.locator("#welcomeGreeting").textContent();
    if (!namedGreeting.includes("Γιώργο")) {
      throw new Error("Hero Card did not display the stored user name");
    }
  });

  test("Category loading", async () => {
    await reset();
    const count = await page.locator(".category-check").count();
    if (count !== 11) throw new Error(`Expected 11 categories, found ${count}`);
  });

  test("Study", async () => {
    await reset();
    await invoke(page, "openStudy");
    await page.selectOption("#studyCategory", "constitutional");
    await invoke(page, "startStudy");
    await expectVisible(page, "quizScreen");
  });

  test("Test", async () => {
    await reset();
    await page.evaluate(() => localStorage.setItem("asepTestCategories", '["constitutional"]'));
    await invoke(page, "openTest");
    await page.fill("#testCount", "1");
    await invoke(page, "startTest");
    await expectVisible(page, "quizScreen");
  });

  test("Smart Test", async () => {
    await reset();
    await invoke(page, "startSmartTest");
    await invoke(page, "prepareSmartTest");
    await invoke(page, "launchSmartTest");
    await expectVisible(page, "quizScreen");
  });

  test("CAT", async () => {
    await reset();
    await invoke(page, "openCatPracticeSetup");
    await page.selectOption("#catPracticeCount", "10");
    await invoke(page, "startCatPractice");
    await expectVisible(page, "catQuiz");
  });

  test("Work Behaviour", async () => {
    await reset();
    await invoke(page, "openWorkBehaviour");
    await invoke(page, "openWorkPracticeSetup");
    await page.selectOption("#workCount", "5");
    await invoke(page, "startWorkPractice");
    await expectVisible(page, "workQuiz");
  });

  test("Statistics", async () => {
    await reset();
    await invoke(page, "openStats");
    await expectVisible(page, "statsScreen");
  });

  test("Shared Application State", async () => {
    await reset();
    await page.evaluate(() => {
      const questionKey = "constitutional:constitutional-1";
      localStorage.setItem("asepFavorites", JSON.stringify([questionKey]));
      localStorage.setItem("asepWrongs", JSON.stringify([questionKey]));
      localStorage.setItem("asepRecentRegistryQuestionsV1", JSON.stringify([questionKey]));
      localStorage.setItem("asepWorkBehaviourSeen", JSON.stringify([1, 2]));
      localStorage.setItem("asepStats", JSON.stringify({
        total: 1,
        correct: 0,
        wrong: 1,
        tests: 1,
        byCategory: { constitutional: { total: 1, correct: 0, wrong: 1 } }
      }));
      localStorage.setItem("asepQuestionStatsV1", JSON.stringify({
        [questionKey]: { appearances: 1, correct: 0, wrong: 1, answerCount: 1 }
      }));
    });

    await invoke(page, "openStats");
    await expectVisible(page, "statsScreen");
    const displayedState = await page.evaluate(() => ({
      total: document.getElementById("statsTotal").textContent,
      wrong: document.getElementById("statsWrong").textContent,
      favorites: document.getElementById("statsFavorites").textContent,
      savedWrongs: document.getElementById("statsSavedWrongs").textContent
    }));
    if (
      displayedState.total !== "1" ||
      displayedState.wrong !== "1" ||
      displayedState.favorites !== "1" ||
      displayedState.savedWrongs !== "1"
    ) {
      throw new Error(`Shared statistics state mismatch: ${JSON.stringify(displayedState)}`);
    }

    await invoke(page, "openStudyFiltered", "favorites");
    await invoke(page, "startStudy");
    await expectVisible(page, "quizScreen");
    const favoriteQuestion = await page.locator("#questionText").textContent();
    if (favoriteQuestion !== "Η λαϊκή κυριαρχία, στο πολίτευμά μας, είναι:") {
      throw new Error("Study did not read the shared favorites state");
    }
  });

  test("Study Planner", async () => {
    await reset();
    await invoke(page, "openStudyPlanHub");
    await expectVisible(page, "studyPlanHub");
    await invoke(page, "openStudyPlanSetup");
    await expectVisible(page, "studyPlanSetup");

    await invoke(page, "startPlanRegistryTask", "new", 10);
    await expectVisible(page, "quizScreen");

    const selectedQuestions = [];
    for (let index = 0; index < 10; index++) {
      selectedQuestions.push(await page.locator("#questionText").textContent());
      await invoke(page, "revealStudyAnswer");
      await invoke(page, "nextQuestion");
    }

    if (new Set(selectedQuestions).size !== selectedQuestions.length) {
      throw new Error("Study Plan returned duplicate registry questions");
    }

    const appearanceCount = await page.evaluate(() => {
      const stats = JSON.parse(localStorage.getItem("asepQuestionStatsV1") || "{}");
      return Object.values(stats).filter(item => Number(item.appearances) > 0).length;
    });
    if (appearanceCount !== 10) {
      throw new Error(`Expected 10 shared appearance records, found ${appearanceCount}`);
    }

    await reset();
    await page.evaluate(() => {
      localStorage.setItem("asepWrongs", '["constitutional:constitutional-1"]');
    });
    await invoke(page, "startPlanRegistryTask", "review", 10);
    await expectVisible(page, "quizScreen");
    const reviewQuestion = await page.locator("#questionText").textContent();
    if (reviewQuestion !== "Η λαϊκή κυριαρχία, στο πολίτευμά μας, είναι:") {
      throw new Error("Study Plan review did not respect the shared wrong-question filter");
    }
  });

  test("Study Planner Work progress integrity", async () => {
    const completeCurrentTriad = async () => {
      const statements = page.locator("#workStatements .work-statement");
      await statements.nth(0).click();
      await statements.nth(1).click();
      await invoke(page, "nextWorkTriad");
    };
    const readWorkProgress = () => page.evaluate(() => {
      const log = JSON.parse(localStorage.getItem("asepStudyPlanLogV14") || "{}");
      return {
        seen: JSON.parse(localStorage.getItem("asepWorkBehaviourSeen") || "[]").length,
        completed: Number(log[localDateKey()]?.workTriads) || 0
      };
    });

    await reset();
    await invoke(page, "startPlanWorkTask", 5);
    await expectVisible(page, "workQuiz");
    const uniqueCount = await page.evaluate(() => new Set(workTriads.map(item => item.id)).size);
    if (uniqueCount !== 5) throw new Error(`Expected 5 unique Work triads, found ${uniqueCount}`);
    await invoke(page, "finishWorkAttempt", false, true);
    const zeroProgress = await readWorkProgress();
    if (zeroProgress.seen !== 0 || zeroProgress.completed !== 0) {
      throw new Error(`Zero-completion Work progress changed: ${JSON.stringify(zeroProgress)}`);
    }

    await reset();
    await invoke(page, "startPlanWorkTask", 5);
    await completeCurrentTriad();
    await completeCurrentTriad();
    await invoke(page, "finishWorkAttempt", false, true);
    const partialProgress = await readWorkProgress();
    if (partialProgress.seen !== 2 || partialProgress.completed !== 2) {
      throw new Error(`Partial Work progress mismatch: ${JSON.stringify(partialProgress)}`);
    }
    await page.reload({ waitUntil: "networkidle" });
    const reloadedProgress = await readWorkProgress();
    if (reloadedProgress.seen !== 2 || reloadedProgress.completed !== 2) {
      throw new Error(`Reloaded Work progress mismatch: ${JSON.stringify(reloadedProgress)}`);
    }

    await reset();
    await invoke(page, "startPlanWorkTask", 3);
    await completeCurrentTriad();
    await completeCurrentTriad();
    await completeCurrentTriad();
    await expectVisible(page, "workResults");
    const fullProgress = await readWorkProgress();
    if (fullProgress.seen !== 3 || fullProgress.completed !== 3) {
      throw new Error(`Full Work progress mismatch: ${JSON.stringify(fullProgress)}`);
    }
  });

  test("Study Planner Registry review targets", async () => {
    const scenarios = [
      { pool: 20, expected: 14 },
      { pool: 14, expected: 14 },
      { pool: 2, expected: 2 },
      { pool: 0, expected: 0 }
    ];

    for (const scenario of scenarios) {
      await reset();
      await page.evaluate(pool => {
        const wrongs = Array.from(
          { length: pool },
          (_, index) => `constitutional:constitutional-${index + 1}`
        );
        localStorage.setItem("asepWrongs", JSON.stringify(wrongs));
      }, scenario.pool);

      const target = await page.evaluate(() => calculateStudyPlanTargets({
        targetDate: "2099-12-31",
        registry: true,
        cat: false,
        work: false
      }).registryReview);
      if (target !== scenario.expected) {
        throw new Error(`Review target for pool ${scenario.pool}: expected ${scenario.expected}, found ${target}`);
      }

      if (target > 0) {
        await invoke(page, "startPlanRegistryTask", "review", target);
        await expectVisible(page, "quizScreen");
        const delivered = await page.evaluate(() => ({
          count: currentQuestions.length,
          unique: new Set(currentQuestions.map(question => `${question.categoryId}:${question.id}`)).size
        }));
        if (delivered.count !== target || delivered.unique !== target) {
          throw new Error(`Review delivery mismatch for pool ${scenario.pool}: ${JSON.stringify(delivered)}`);
        }
      }
    }
  });

  test("Study Planner persisted-state fallback", async () => {
    await reset();
    const missingPlan = await page.evaluate(() => getStudyPlan());
    if (missingPlan !== null) throw new Error("Missing Study Plan state did not return null");

    const validPlan = {
      targetDate: "2099-12-31",
      registry: true,
      cat: false,
      work: true,
      createdAt: "2026-08-08T00:00:00.000Z",
      updatedAt: "2026-08-08T00:00:00.000Z"
    };
    await page.evaluate(plan => {
      localStorage.setItem("asepStudyPlanV14", JSON.stringify(plan));
    }, validPlan);
    await page.reload({ waitUntil: "networkidle" });
    const loadedPlan = await page.evaluate(() => getStudyPlan());
    if (!loadedPlan || loadedPlan.targetDate !== validPlan.targetDate || !loadedPlan.registry || !loadedPlan.work) {
      throw new Error(`Valid Study Plan did not load: ${JSON.stringify(loadedPlan)}`);
    }

    const invalidPlans = [
      "malformed",
      {},
      { targetDate: "2026-02-30", registry: true, cat: false, work: false },
      { targetDate: "2099-12-31", registry: "true", cat: false, work: false },
      { targetDate: "2099-12-31", registry: false, cat: false, work: false }
    ];
    for (const invalidPlan of invalidPlans) {
      const original = JSON.stringify(invalidPlan);
      await page.evaluate(plan => {
        localStorage.setItem("asepStudyPlanV14", JSON.stringify(plan));
      }, invalidPlan);
      await page.reload({ waitUntil: "networkidle" });
      const result = await page.evaluate(() => ({
        plan: getStudyPlan(),
        stored: localStorage.getItem("asepStudyPlanV14")
      }));
      if (result.plan !== null) {
        throw new Error(`Invalid Study Plan was accepted: ${original}`);
      }
      if (result.stored !== original) {
        throw new Error(`Invalid Study Plan was silently migrated: ${original}`);
      }
    }
  });

  let failures = 0;
  try {
    for (const item of tests) {
      const errorCount = runtimeErrors.length;
      try {
        await item.run();
        if (runtimeErrors.length > errorCount) {
          throw new Error(runtimeErrors.slice(errorCount).join(" | "));
        }
        console.log(`PASS ${item.name}`);
      } catch (error) {
        failures++;
        console.error(`FAIL ${item.name}: ${error.message}`);
      }
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }

  if (failures > 0) {
    console.error(`\nSmoke tests failed: ${failures}/${tests.length}.`);
    process.exitCode = 1;
  } else {
    console.log(`\nSmoke tests passed: ${tests.length}/${tests.length}.`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
