# OrangeHRM End-to-End QA Automation Framework (Playwright + TypeScript)

[[https://github.com/<your-username>/<your-repo-name>/actions/workflows/playwright.yml/badge.svg]](https://github.com/<your-username>/<your-repo-name>/actions/workflows/playwright.yml)
[[https://img.shields.io/badge/Allure%20Report-View%20Live-brightgreen?logo=qameta&logoColor=white]](https://<your-username>.github.io/<your-repo-name>/)
[[https://img.shields.io/badge/TypeScript-Strict%20Mode-3178C6?logo=typescript&logoColor=white]](https://www.typescriptlang.org/)
[[https://img.shields.io/badge/Playwright-Cross--Browser-2EAD33?logo=playwright&logoColor=white]](https://playwright.dev/)

A production-grade End-to-End test automation framework built with **Playwright** and **TypeScript (strict mode)** targeting the [OrangeHRM Live Demo](https://opensource-demo.orangehrmlive.com/) enterprise HR platform.

> **[View Live Allure Test Report →](https://<your-username>.github.io/<your-repo-name>/)** *(auto-deployed on every push to `main` via GitHub Actions)*

## Demo & Report Preview

[docs/allure-preview.png]

*(Tip: Replace `docs/allure-preview.png` with a screenshot of your Allure dashboard or a 10-second `.gif` of `npx playwright test --ui`.)*

## Architecture Highlights

- **Page Object Model (POM):** Clean separation between resilient user-facing locators (`getByRole`, `getByPlaceholder`), page actions (`pages/LoginPage.ts`, `pages/PimPage.ts`, `pages/LeavePage.ts`), and test assertions.
- **Session Reuse via Setup Project:** Authenticates once in `tests/auth.setup.ts` and persists `storageState` to `.auth/admin.json`, eliminating redundant login steps across Chromium, Firefox, and WebKit.
- **Zero Hardcoded Sleeps:** Uses Playwright web-first assertions and explicit DOM state waits (waiting for `.oxd-loading-spinner` and async `"Searching...."` autocomplete states to resolve).
- **Idempotent Test Data & Self-Cleaning Teardown:** `utils/testData.ts` generates unique 8-character Employee IDs and future weekday leave dates, and Step 4 deletes the test employee so repeated CI runs leave zero orphan data.
- **Rich Observability:** Multi-reporter pipeline (`list`, Playwright `html`, and `allure-playwright`) with step-level Allure hierarchy (`epic`, `feature`, `severity`), failure screenshots, video retention, and Trace Viewer (`retain-on-failure`).

## E2E Scenario Coverage (`tests/employee-lifecycle.spec.ts`)

| Step | Module | Validated Workflow |
| :--- | :--- | :--- |
| **1. Employee Onboarding** | PIM | Creates dynamic employee, uploads `fixtures/avatar.png` via `setInputFiles()`, verifies Personal Details redirect |
| **2. Leave Entitlement & Assignment** | Leave | Handles async autocomplete dropdown, adds 10 days entitlement, confirms modal, assigns leave for date range |
| **3. Dynamic Table Search** | PIM | Searches Employee List by unique ID, waits for table spinner to clear, asserts exact row details |
| **4. Teardown / Cleanup** | PIM | Deletes test employee from dynamic table and asserts `"Successfully Deleted"` toast |

## Local Setup & Execution

```bash
# 1. Install dependencies & browsers
npm ci
npx playwright install --with-deps

# 2. Run on Chromium (fast local feedback)
npm run test:chromium

# 3. Run full cross-browser suite (Chromium, Firefox, WebKit)
npm test

# 4. Generate & open interactive Allure Report
npm run report:allure


### 3. Activate the Live Report & Screenshot on GitHub

1. **Add the preview image:** Take a screenshot of your local Allure Report (`npm run report:allure`), save it as `docs/allure-preview.png`, and commit it.
2. **Push to `main`:** Once the GitHub Actions workflow finishes its first run, it will create a `gh-pages` branch automatically.
3. **Enable GitHub Pages (one-time):** In your GitHub repo, go to **Settings → Pages → Build and deployment → Branch**, select **`gh-pages`** (`/ (root)`), and click **Save**—your live Allure link in the README will go active within a minute.
