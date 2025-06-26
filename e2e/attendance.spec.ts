import { test, expect } from '@playwright/test';

test.describe('Attendance App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main attendance grid', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Feuille de Présence Mensuelle');
    
    // Check if the grid table is present
    await expect(page.locator('table')).toBeVisible();
    
    // Check if month navigation is present
    await expect(page.locator('button').filter({ hasText: /janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre/i })).toBeVisible();
  });

  test('should navigate between months', async ({ page }) => {
    const nextButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1);
    const prevButton = page.locator('button').filter({ has: page.locator('svg') }).nth(0);
    
    await nextButton.click();
    await expect(page.locator('h3')).not.toBe('');
    
    await prevButton.click();
    await expect(page.locator('h3')).not.toBe('');
  });

  test('should show import/export buttons', async ({ page }) => {
    await expect(page.locator('button').filter({ hasText: 'Importer Excel' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Exporter' })).toBeVisible();
  });

  test('should display pupil rows', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);
    
    // Check if at least one pupil row is visible
    const pupilRows = page.locator('tbody tr');
    await expect(pupilRows.first()).toBeVisible();
  });

  test('should display monthly stats in sidebar', async ({ page }) => {
    await expect(page.locator('text=Statistiques mensuelles')).toBeVisible();
    await expect(page.locator('text=Total absences')).toBeVisible();
    await expect(page.locator('text=Légende')).toBeVisible();
  });

  test('should show signature fields at bottom', async ({ page }) => {
    await expect(page.locator('text=Visa et date de contrôle')).toBeVisible();
    await expect(page.locator('text=Signature du directeur')).toBeVisible();
    await expect(page.locator('input[type="date"]')).toBeVisible();
  });
});