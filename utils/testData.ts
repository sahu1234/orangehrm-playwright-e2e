export interface EmployeeTestData {
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
    employeeId: string;
    leaveEntitlementDays: string;
    leaveType: string;
    leaveFromDate: string;
    leaveToDate: string;
    leaveComment: string;
}

function formatIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function generateEmployeeData(): EmployeeTestData {
    const timeSuffix = Date.now().toString().slice(-5);
    const randomSuffix = Math.floor(10 + Math.random() * 90).toString();
    const uniqueCode = `${timeSuffix}${randomSuffix}`;

    const firstName = `Auto${timeSuffix}`;
    const middleName = 'QA';
    const lastName = `Tester${randomSuffix}`;

    //Pick a weekday window two weeks ahead to avoid weekend/holiday edge cases
    const start = new Date();
    start.setDate(start.getDate() + 14);
    if (start.getDay() === 0) start.setDate(start.getDate() + 1);
    if (start.getDay() === 6) start.setDate(start.getDate() + 2);

    const end = new Date(start);

    return {
        firstName,
        middleName,
        lastName,
        fullName: `${firstName} ${middleName} ${lastName}`,
        employeeId: `E${uniqueCode}`,
        leaveEntitlementDays: '10',
        leaveType: 'CAN - Personal',
        leaveFromDate: formatIsoDate(start),
        leaveToDate: formatIsoDate(end),
        leaveComment: `Automated E2E leave assignment (${uniqueCode})`,

    };


}