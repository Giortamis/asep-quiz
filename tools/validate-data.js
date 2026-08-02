"use strict";

const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const dataDirectory = path.join(projectRoot, "data");
const errors = [];
const warnings = [];

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${path.relative(projectRoot, filePath)}: invalid JSON (${error.message})`);
    return null;
  }
}

function normalizedQuestionText(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLocaleLowerCase("el-GR");
}

function validateQuestionFile(category, questions, questionTexts) {
  const relativeFile = `data/${category.id}.json`;
  const ids = new Set();

  if (!Array.isArray(questions)) {
    errors.push(`${relativeFile}: expected a JSON array`);
    return 0;
  }

  questions.forEach((question, index) => {
    const location = `${relativeFile}[${index}]`;

    if (!question || typeof question !== "object" || Array.isArray(question)) {
      errors.push(`${location}: expected an object`);
      return;
    }

    if (typeof question.id !== "string" || !question.id.trim()) {
      errors.push(`${location}: missing ID`);
    } else if (ids.has(question.id)) {
      errors.push(`${relativeFile}: duplicate ID "${question.id}"`);
    } else {
      ids.add(question.id);
    }

    if (typeof question.question !== "string" || !question.question.trim()) {
      errors.push(`${location}: missing question text`);
    } else {
      const key = normalizedQuestionText(question.question);
      if (!questionTexts.has(key)) questionTexts.set(key, []);
      questionTexts.get(key).push(`${category.id}:${question.id}`);
    }

    if (!Array.isArray(question.answers) || question.answers.length === 0) {
      errors.push(`${location}: answers must be a non-empty array`);
    } else if (
      !Number.isInteger(question.correct) ||
      question.correct < 0 ||
      question.correct >= question.answers.length
    ) {
      errors.push(`${location}: invalid correct index "${question.correct}"`);
    }
  });

  if (!Number.isInteger(category.count) || category.count !== questions.length) {
    errors.push(
      `${relativeFile}: category total mismatch (declared ${category.count}, actual ${questions.length})`
    );
  }

  return questions.length;
}

function validateWorkBehaviour() {
  const relativeFile = "data/work_behaviour.json";
  const work = readJson(path.join(dataDirectory, "work_behaviour.json"));
  if (!work) return;

  if (!Array.isArray(work.triads)) {
    errors.push(`${relativeFile}: triads must be an array`);
    return;
  }

  const ids = new Set();
  work.triads.forEach((triad, index) => {
    if (ids.has(triad.id)) errors.push(`${relativeFile}: duplicate triad ID "${triad.id}"`);
    ids.add(triad.id);
    if (!Array.isArray(triad.statements) || triad.statements.length !== 3) {
      errors.push(`${relativeFile}[${index}]: each triad must contain three statements`);
    }
  });

  if (work.bank_summary?.triads !== work.triads.length) {
    errors.push(
      `${relativeFile}: triad total mismatch (declared ${work.bank_summary?.triads}, actual ${work.triads.length})`
    );
  }
}

function main() {
  if (!fs.existsSync(dataDirectory)) {
    console.error("Validation failed: data directory not found.");
    process.exitCode = 1;
    return;
  }

  const jsonFiles = fs.readdirSync(dataDirectory).filter(file => file.endsWith(".json"));
  jsonFiles.forEach(file => readJson(path.join(dataDirectory, file)));

  const categories = readJson(path.join(dataDirectory, "categories.json"));
  const questionTexts = new Map();
  let totalQuestions = 0;

  if (!Array.isArray(categories)) {
    errors.push("data/categories.json: expected a JSON array");
  } else {
    const categoryIds = new Set();
    categories.forEach((category, index) => {
      if (!category?.id || categoryIds.has(category.id)) {
        errors.push(`data/categories.json[${index}]: missing or duplicate category ID`);
        return;
      }
      categoryIds.add(category.id);

      const filePath = path.join(dataDirectory, `${category.id}.json`);
      if (!fs.existsSync(filePath)) {
        errors.push(`data/${category.id}.json: file not found`);
        return;
      }

      const questions = readJson(filePath);
      if (questions) totalQuestions += validateQuestionFile(category, questions, questionTexts);
    });
  }

  for (const [text, locations] of questionTexts) {
    if (locations.length > 1) {
      warnings.push(`duplicate question text (${locations.join(", ")}): "${text}"`);
    }
  }

  validateWorkBehaviour();

  warnings.forEach(warning => console.warn(`WARNING: ${warning}`));

  if (errors.length > 0) {
    errors.forEach(error => console.error(`ERROR: ${error}`));
    console.error(`\nValidation failed with ${errors.length} error(s).`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `Validation passed: ${jsonFiles.length} JSON files, ${categories.length} categories, ` +
    `${totalQuestions} questions, ${warnings.length} duplicate-text warning(s).`
  );
}

main();
