import { test } from '@playwright/test';
import * as allure from 'allure-js-commons';
import path from 'path';
import { PimPage } from '../pages/PimPage';
import { LeavePage } from '../pages/LeavePage';
import { EmployeeTestData, generateEmployeeData } from '../utils/testData';
import { attachMilestoneScreenshot } from '../utils/allureHelper';


test.describe.serial('OrangeHRM End-to-End Employee Lifecycle', () => {
  let employee: EmployeeTestData;
  const avatarPath = path.resolve(__dirname, '../fixtures/avatar.png');

  test.beforeAll(() => {
    employee = generateEmployeeData();
  });

  test('Step 1: Onboard new employee with profile photo upload in PIM', async ({
    page,
  }) => {
    await allure.epic('Employee Lifecycle');
    await allure.feature('PIM - Employee Onboarding');
    await allure.severity('critical');

    const pimPage = new PimPage(page);

    await allure.step('Navigate to PIM > Add Employee', async () => {
      await page.goto('/web/index.php/dashboard/index');
      await pimPage.navigateToAddEmployee();
    });

    await allure.step(`Create employee ${employee.employeeId} with avatar`, async () => {
      await pimPage.createEmployee(employee, avatarPath);
      await attachMilestoneScreenshot(page, '1. Employee Created - Personal Details');

    });
  });

  test('Step 2: Add annual leave entitlement and assign leave to the employee', async ({
    page,
  }) => {
    await allure.epic('Employee Lifecycle');
    await allure.feature('Leave Management');
    await allure.severity('critical');

    const leavePage = new LeavePage(page);

    await allure.step('Add 10 days annual leave entitlement', async () => {
      await page.goto('/web/index.php/dashboard/index');
      await leavePage.navigateToAddEntitlements();
      await leavePage.addLeaveEntitlement(employee);
      await attachMilestoneScreenshot(page, '2a. Leave Entitlement Added');
      // ...after assignLeave:

    });

    await allure.step('Assign leave via autocomplete and date range', async () => {
      await leavePage.navigateToAssignLeave();
      await leavePage.assignLeave(employee);
      await attachMilestoneScreenshot(page, '2b. Leave Assigned');

    });
  });

  test('Step 3: Search dynamic PIM table by Employee ID and verify record', async ({
    page,
  }) => {
    await allure.epic('Employee Lifecycle');
    await allure.feature('PIM - Employee Directory');
    await allure.severity('normal');

    const pimPage = new PimPage(page);

    await page.goto('/web/index.php/dashboard/index');
    await pimPage.navigateToEmployeeList();
    await pimPage.searchByEmployeeId(employee.employeeId);
    await pimPage.verifyEmployeeInTable(employee);
    await attachMilestoneScreenshot(page, '3. Employee Verified in Dynamic Table');

  });

  test('Step 4: Teardown — Delete created employee record and verify toast', async ({
    page,
  }) => {
    await allure.epic('Employee Lifecycle');
    await allure.feature('PIM - Cleanup');
    await allure.severity('normal');

    const pimPage = new PimPage(page);

    await page.goto('/web/index.php/dashboard/index');
    await pimPage.navigateToEmployeeList();
    await pimPage.searchByEmployeeId(employee.employeeId);
    await pimPage.deleteEmployeeById(employee.employeeId);
    await attachMilestoneScreenshot(page, '4. Employee Deleted - Cleanup Complete');

  });
});
