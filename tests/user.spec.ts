import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';

async function basicInit(page: Page) {
    let loggedInUser: User | undefined;
    const validUsers: Record<string, User> = { 
        'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] },
        'a@jwt.com': { id: '1', name: 'Admin', email: 'a@jwt.com', password: 'admin', roles: [{ role: Role.Admin }] },
        'f@jwt.com': { id: '2', name: 'pizza franchise', email: 'f@jwt.com', password: 'franchisee', roles: [{ role: Role.Franchisee }] }
    };

    await page.route('*/**/api/auth', async (route) => {
        if (route.request().method() == "PUT") {
            const loginReq = route.request().postDataJSON();
            const user = validUsers[loginReq.email];
            if (!user || user.password !== loginReq.password) {
                await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
                return;
            }
            loggedInUser = validUsers[loginReq.email];
            const loginRes = {
                user: loggedInUser,
                token: 'abcdef',
            };
            expect(route.request().method()).toBe('PUT');
            await route.fulfill({ json: loginRes });
        } else if (route.request().method() == "POST") {
            const registerReq = route.request().postDataJSON();
            const user = {
                id: '4',
                name: registerReq.name,
                email: registerReq.email,
                password: registerReq.password,
                roles: [{ role: Role.Diner }]
            };
            validUsers[user.email] = user
            const registerRes = {
                user: user,
                token: 'abcdef'
            };
            await route.fulfill({ json: registerRes });
        } else if (route.request().method() == "DELETE") {
            loggedInUser = undefined
            await route.fulfill({ json: { message: "logout successful"} });
        }
    });

    await page.route('*/**/api/user/4', async (route) => {
        if (route.request().method() == "PUT") {
            const req = route.request().postDataJSON();
            validUsers[req.email].name = req.name;
            if (req.password) validUsers[req.email].password = req.password;
            loggedInUser = validUsers[req.email];
            const loginRes = {
                user: loggedInUser,
                token: 'abcdef',
            };
            expect(route.request().method()).toBe('PUT');
            await route.fulfill({ json: loginRes });
        } else if (route.request().method() == "DELETE") {
            delete validUsers['user4@jwt.com'];
        }
    });

    await page.route(/\/api\/user(\?.*)?$/, async (route) => {
        if (route.request().method() == "GET") {
            const userRes = {
                users: Object.values(validUsers),
            };
            expect(route.request().method()).toBe('GET');
            await route.fulfill({ json: userRes });
        }
    });
    await page.goto('/');
}


test('updateUser', async ({ page }) => {
    await basicInit(page);
    const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');
    await page.getByRole('button', { name: 'Register' }).click();

    await page.getByRole('link', { name: 'pd' }).click();

    await expect(page.getByRole('main')).toContainText('pizza diner');
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.locator('h3')).toContainText('Edit user');
    await page.getByRole('textbox').first().fill('pizza dinerx');
    await page.getByRole('button', { name: 'Update' }).click();

    await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

    await expect(page.getByRole('main')).toContainText('pizza dinerx');
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.getByRole('link', { name: 'Login' }).click();

    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.getByRole('link', { name: 'pd' }).click();

    await expect(page.getByRole('main')).toContainText('pizza dinerx');
});

test('changePassword', async ({ page }) => {
    await basicInit(page);
    const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');
    await page.getByRole('button', { name: 'Register' }).click();

    await page.getByRole('link', { name: 'pd' }).click();

    await expect(page.getByRole('main')).toContainText('pizza diner');
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.locator('h3')).toContainText('Edit user');
    await page.locator('#password').fill('a');
    await page.getByRole('button', { name: 'Update' }).click();

    await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

    await page.getByRole('link', { name: 'Logout' }).click();
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('a');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('link', { name: 'pd' })).toBeVisible();
});

test('see UserList and delete', async ({ page }) => {
    await basicInit(page);
    const email = `user4@jwt.com`;
    const name = `user${Math.floor(Math.random() * 10000)}`
    await page.goto('/')
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill(name);
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');
    await page.getByRole('button', { name: 'Register' }).click();

    await page.getByRole('link', { name: 'Logout' }).click();
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Filter users' }).click();
    await page.getByRole('textbox', { name: 'Filter users' }).fill(name);
    await page.getByRole('cell', { name: `${name} Submit` }).getByRole('button').click();
    await expect(page.getByRole('cell', { name: email })).toBeVisible();
    await page.getByRole('row', { name: `${name} ${email}` }).getByRole('button').click();
    await page.getByRole('cell', { name: `${name} Submit` }).getByRole('button').click();
    await expect(page.getByRole('cell', { name: email })).not.toBeVisible();
});
