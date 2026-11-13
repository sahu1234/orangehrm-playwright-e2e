import { expect, Locator, Page } from '@playwright/test';
import { EmployeeTestData } from '../utils/testData';

export class LeavePage {
    readonly page: Page;

    // Navigation
    readonly leaveMenuLink: Locator;
    readonly entitlementsMenu: Locator;
    readonly addEntitlementsOption: Locator;
    readonly assignLeaveTab: Locator;

    // Shared Autocomplete & Dropdown Locators
    readonly employeeAutocompleteInput: Locator;
    readonly autocompleteListbox: Locator;
    readonly autocompleteSearchingOption: Locator;
    readonly leaveTypeDropdown: Locator;

    // Add Entitlements Form
    readonly entitlementInput: Locator;
    readonly saveButton: Locator;
    readonly confirmEntitlementButton: Locator;

    // Assign Leave Form
    readonly fromDateInput: Locator;
    readonly toDateInput: Locator;
    readonly commentTextarea: Locator;
    readonly assignButton: Locator;
    readonly toastMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        this.leaveMenuLink = page
            .getByRole('navigation', { name: 'Sidepanel' })
            .getByRole('link', { name: 'Leave', exact: true });

        this.entitlementsMenu = page.getByText('Entitlements', { exact: true });
        this.addEntitlementsOption = page.getByRole('menuitem', {
            name: 'Add Entitlements',
        });
        this.assignLeaveTab = page.getByRole('link', { name: 'Assign Leave' });

        this.employeeAutocompleteInput = page.getByPlaceholder('Type for hints...');
        this.autocompleteListbox = page.locator('.oxd-autocomplete-dropdown');
        this.autocompleteSearchingOption = this.autocompleteListbox.getByText(
            'Searching....',
            { exact: true }
        );
        this.leaveTypeDropdown = page
            .locator('.oxd-input-group', { hasText: 'Leave Type' })
            .locator('.oxd-select-text');

        this.entitlementInput = page
            .locator('.oxd-input-group', { hasText: 'Entitlement' })
            .locator('input');
        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.confirmEntitlementButton = page.getByRole('button', { name: 'Confirm' });

        this.fromDateInput = page
            .locator('.oxd-input-group', { hasText: 'From Date' })
            .locator('input');
        this.toDateInput = page
            .locator('.oxd-input-group', { hasText: 'To Date' })
            .locator('input');
        this.commentTextarea = page
            .locator('.oxd-input-group', { hasText: 'Comments' })
            .locator('textarea');
        this.assignButton = page.getByRole('button', { name: 'Assign' });
        this.toastMessage = page.locator('.oxd-toast-content-text');
    }

    async navigateToAddEntitlements(): Promise<void> {
        await this.leaveMenuLink.click();
        await this.entitlementsMenu.click();
        await this.addEntitlementsOption.click();
        await expect(this.page).toHaveURL(/\/leave\/addLeaveEntitlement/);
    }

    async navigateToAssignLeave(): Promise<void> {
        await this.leaveMenuLink.click();
        await this.assignLeaveTab.click();
        await expect(this.page).toHaveURL(/\/leave\/assignLeave/);
    }

    async selectEmployeeFromAutocomplete(
        searchText: string,
        fullNameToSelect: string
    ): Promise<void> {
        await this.employeeAutocompleteInput.fill(searchText);
        await expect(this.autocompleteListbox).toBeVisible();

        // Wait for OrangeHRM's async "Searching...." placeholder to disappear
        await this.autocompleteSearchingOption.waitFor({ state: 'hidden' });

        const option = this.autocompleteListbox.getByRole('option', {
            name: fullNameToSelect,
        });
        await expect(option).toBeVisible();
        await option.click();
    }

    async selectLeaveType(leaveType: string): Promise<void> {
        await this.leaveTypeDropdown.click();
        const dropdownOption = pageOption(this.page, leaveType);
        await expect(dropdownOption).toBeVisible();
        await dropdownOption.click();
    }

    async addLeaveEntitlement(employee: EmployeeTestData): Promise<void> {
        await this.selectEmployeeFromAutocomplete(
            employee.firstName,
            employee.fullName
        );
        await this.selectLeaveType(employee.leaveType);
        await this.entitlementInput.fill(employee.leaveEntitlementDays);
        await this.saveButton.click();

        // Confirm the "Updating Entitlement" modal
        await expect(this.confirmEntitlementButton).toBeVisible();
        await this.confirmEntitlementButton.click();

        await expect(
            this.toastMessage.filter({ hasText: 'Successfully Saved' })
        ).toBeVisible();
    }

    async assignLeave(employee: EmployeeTestData): Promise<void> {
        await this.selectEmployeeFromAutocomplete(
            employee.firstName,
            employee.fullName
        );
        await this.selectLeaveType(employee.leaveType);

        await this.fromDateInput.fill(employee.leaveFromDate);
        await this.toDateInput.fill('');
        await this.toDateInput.fill(employee.leaveToDate);
        await this.toDateInput.press('Tab');

        await this.commentTextarea.fill(employee.leaveComment);
        await this.assignButton.click();

        // Handle optional "Confirm Leave Assignment" modal if balance/overlap dialog appears
        const okConfirmButton = this.page.getByRole('button', { name: 'Ok' });
        if (await okConfirmButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await okConfirmButton.click();
        }

        await expect(
            this.toastMessage.filter({ hasText: 'Successfully Saved' })
        ).toBeVisible();
    }
}

function pageOption(page: Page, text: string): Locator {
    return page.getByRole('option', { name: text });
}
