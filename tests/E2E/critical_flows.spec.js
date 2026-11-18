import { test, expect } from '@playwright/test';

test.describe('NutriSync Critical User Flows & PWA Health', () => {
    test('Landing page renders properly with PWA metadata', async ({ page }) => {
        await page.goto('/');

        // Verifikasi judul utama
        await expect(page).toHaveTitle(/NutriSync/i);

        // Verifikasi keberadaan manifest PWA
        const manifestLink = page.locator('link[rel="manifest"]');
        await expect(manifestLink).toHaveCount(1);
    });

    test('OpenAPI specification and Swagger UI are accessible', async ({ request, page }) => {
        // Test API specification YAML endpoint
        const openApiResp = await request.get('/openapi.yaml');
        expect(openApiResp.status()).toBe(200);
        const yamlText = await openApiResp.text();
        expect(yamlText).toContain('title: NutriSync API');

        // Test Swagger UI portal
        await page.goto('/api-docs.html');
        await expect(page).toHaveTitle(/NutriSync API Documentation/i);
    });

    test('Offline Sync API rejects invalid payload or missing client_uuid', async ({ request }) => {
        const response = await request.post('/patient/nutrition/sync-offline', {
            data: {
                logs: [
                    {
                        barcode: '8991001200000',
                        // Missing client_uuid -> should fail validation or require auth
                    },
                ],
            },
        });

        // Unauthenticated or invalid payload must return 401/419/422/302 redirect
        expect([302, 401, 419, 422]).toContain(response.status());
    });
});
