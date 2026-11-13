import { expect, Locator, Page } from '@playwright/test';
import { EmployeeTestData } from '../utils/testData';

export class PimPage {
    readonly page: Page;

    // Navigation
    readonly pimMenuLink: Locator;
    readonly addEmployeeTab: Locator;
    readonly employeeListTab: Locator;

    // Add Employee Form
    readonly firstNameInput: Locator;
    readonly middleNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly employeeIdInput: Locator;
    readonly photoFileInput: Locator;
    readonly saveButton: Locator;

    // Employee List Search & Table
    readonly searchEmployeeIdInput: Locator;
    readonly searchButton: Locator;
    readonly tableLoader: Locator;
    readonly tableRows: Locator;

    // Delete Confirmation Modal & Toast
    readonly confirmDeleteButton: Locator;
    readonly toastMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        this.pimMenuLink = page.getByRole('link', { name: 'PIM' });
        this.addEmployeeTab = page.getByRole('link', { name: 'Add Employee' });
        this.employeeListTab = page.getByRole('link', { name: 'Employee List' });

        this.firstNameInput = page.getByPlaceholder('First Name');
        this.middleNameInput = page.getByPlaceholder('Middle Name');
        this.lastNameInput = page.getByPlaceholder('Last Name');
        this.employeeIdInput = page
            .locator('.oxd-input-group', { hasText: 'Employee Id' })
            .locator('input');
        this.photoFileInput = page.locator('input[type="file"].oxd-file-input');
        this.saveButton = page.getByRole('button', { name: 'Save' });

        this.searchEmployeeIdInput = page
            .locator('.oxd-input-group', { hasText: 'Employee Id' })
            .locator('input');
        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.tableLoader = page.locator('.oxd-loading-spinner');
        this.tableRows = page.locator('.oxd-table-body .oxd-table-row');

        this.confirmDeleteButton = page.getByRole('button', { name: 'Yes, Delete' });
        this.toastMessage = page.locator('.oxd-toast-content-text');
    }

    async navigateToAddEmployee(): Promise<void> {
        await this.pimMenuLink.click();
        await this.addEmployeeTab.click();
        await expect(this.page).toHaveURL(/\/pim\/addEmployee/);
    }

    async navigateToEmployeeList(): Promise<void> {
        await this.pimMenuLink.click();
        await this.employeeListTab.click();
        await expect(this.page).toHaveURL(/\/pim\/viewEmployeeList/);
        await this.waitForTableToLoad();
    }

    async createEmployee(employee: EmployeeTestData, avatarPath: string): Promise<void> {
        await this.firstNameInput.fill(employee.firstName);
        await this.middleNameInput.fill(employee.middleName);
        await this.lastNameInput.fill(employee.lastName);

        // Clear auto-generated Employee ID before typing our unique ID
        await this.employeeIdInput.fill('');
        await this.employeeIdInput.fill(employee.employeeId);

        await this.photoFileInput.setInputFiles(avatarPath);
        await this.saveButton.click();

        await expect(this.page).toHaveURL(/\/pim\/viewPersonalDetails\/empNumber\/\d+/);
        await expect(
            this.page.getByRole('heading', { name: 'Personal Details' })
        ).toBeVisible();
    }

    async waitForTableToLoad(): Promise<void> {
        // Ensure any active spinner finishes before interacting with table rows
        await this.tableLoader.waitFor({ state: 'hidden' });
    }

    async searchByEmployeeId(employeeId: string): Promise<void> {
        await this.searchEmployeeIdInput.fill(employeeId);
        await this.searchButton.click();
        await this.waitForTableToLoad();
    }

    getRowByEmployeeId(employeeId: string): Locator {
        return this.tableRows.filter({ hasText: employeeId }).first();
    }

    async verifyEmployeeInTable(employee: EmployeeTestData): Promise<void> {
        const row = this.getRowByEmployeeId(employee.employeeId);
        await expect(row).toBeVisible();
        await expect(row).toContainText(employee.employeeId);
        await expect(row).toContainText(`${employee.firstName} ${employee.middleName}`);
        await expect(row).toContainText(employee.lastName);
    }

    async deleteEmployeeById(employeeId: string): Promise<void> {
        const row = this.getRowByEmployeeId(employeeId);
        await expect(row).toBeVisible();

        const deleteIconButton = row.locator('button:has(i.bi-trash)');
        await deleteIconButton.click();

        await expect(this.confirmDeleteButton).toBeVisible();
        await this.confirmDeleteButton.click();

        await expect(this.toastMessage.filter({ hasText: 'Successfully Deleted' })).toBeVisible();
        await this.waitForTableToLoad();
    }
}
