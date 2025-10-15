import { test, expect } from 'playwright-test-coverage';
import { Franchise, Role, Store, User } from "../src/service/pizzaService";
import { Page } from '@playwright/test';

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 
    'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] },
    'a@jwt.com': { id: '1', name: 'Admin', email: 'a@jwt.com', password: 'admin', roles: [{ role: Role.Admin }] },
    'f@jwt.com': { id: '2', name: 'pizza franchise', email: 'f@jwt.com', password: 'franchisee', roles: [{ role: Role.Franchisee }] }
  };
  const franchises: Franchise[] = [
    {
      id: "2",
      name: 'LotaPizza',
      stores: [
        { id: "4", name: 'Lehi' },
        { id: "5", name: 'Springville' },
        { id: "6", name: 'American Fork' },
      ],
    },
    { id: "3", name: 'PizzaCorp', stores: [{ id: "7", name: 'Spanish Fork' }] },
    { id: "4", name: 'topSpot', stores: [] },
    { id: "5", name: 'another', stores: [] },
    { id: "6", name: 'andAnother', stores: [] },
    { id: "7", name: 'andAnother', stores: [] },
    { id: "8", name: 'andAnother', stores: [] },
  ]
  const stores: Store[] = [];

  // Authorize login for the given user
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
        name: registerReq.name,
        email: registerReq.email,
        roles: [{ role: Role.Diner }]
      };
      const registerRes = {
        user: user,
        token: 'abcdef'
      };
      await route.fulfill({ json: registerRes });
    }
  });

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    if (route.request().method() == "GET") {
      const franchiseRes = {
        franchises: franchises,
      };
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: franchiseRes });
    } else if (route.request().method() == "POST") {
      const franchiseReq = route.request().postDataJSON();
      expect(route.request().method()).toBe('POST');
      const franchise: Franchise = {
        stores: [],
        id: "1",
        name: franchiseReq.name,
        admins: []
      };
      franchises.push(franchise);
      await route.fulfill({ json: franchise });
    }
  });

  // Order a pizza.
  await page.route('*/**/api/order', async (route) => {
    if (route.request().method() == "POST") {
      const orderReq = route.request().postDataJSON();
      const orderRes = {
        order: { ...orderReq, id: 23 },
        jwt: 'eyJpYXQ',
      };
      expect(route.request().method()).toBe('POST');
      await route.fulfill({ json: orderRes });
    } else if (route.request().method() == "GET") {
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: { dinerId: 4, orders: [] }})
    }
  });

  await page.route('*/**/api/franchise/2', async (route) => {
    expect(route.request().method()).toBe('GET');
    const franchise: Franchise = {
      id: "1",
        name: "pizzaPocket",
        admins: [
            {
                id: "2",
                name: "pizza franchisee",
                email: "f@jwt.com"
            }
        ],
        stores: stores
    }
    await route.fulfill({ json: [franchise] });
  });

  await page.route('*/**/api/franchise/1/store', async (route) => {
    const storeReq = route.request().postDataJSON();
    expect(route.request().method()).toBe('POST');
    const store: Store = { id: "1", name: storeReq.name, totalRevenue: 0 };
    stores.push(store);
    await route.fulfill({ json: store });
  });

  await page.goto('/');
}

test('login', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('register', async ({ page }) => {
  basicInit(page);
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('newUser');
  await page.getByRole('textbox', { name: 'Email address' }).fill('newUser@email.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('n');

  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByRole('link', { name: 'n', exact: true })).toBeVisible();
});

test('logout', async ({page}) => {
  basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
});

test('purchase with login', async ({ page }) => {
  await basicInit(page);

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});

test('create franchise', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).fill('test');
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('a@jwt.com');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('textbox', { name: 'Filter franchises' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Filter franchises' }).fill('test');
  await page.getByRole('button', { name: 'Submit' }).nth(1).click();
  await expect(page.getByRole('cell', { name: 'test', exact: true })).toBeVisible();
});

test('diner dashboard', async ({page}) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'KC' }).click();
  await expect(page.locator('div').filter({ hasText: 'name: Kai Chenemail:' }).nth(4)).toBeVisible();
});

test('create store', async ({page}) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();

  await page.getByRole('button', { name: 'Create store' }).click();
  await page.getByRole('textbox', { name: 'store name' }).fill('testStore');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('cell', { name: 'testStore' })).toBeVisible();
})
