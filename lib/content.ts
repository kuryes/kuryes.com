// @ts-nocheck
import fs from 'fs/promises';
import path from 'path';

export interface PageData {
  slug: string;
  title: string;
  intro: string;
  platform: string;
  package_fee: number;
  packages_per_day: number;
  work_days_per_month: number;
  fuel_cost_per_day: number;
  content?: string;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'pages.json');

export async function getPages(): Promise<PageData[]> {
  try {
    const fileContents = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading pages.json:', error);
    return [];
  }
}

export async function getPageBySlug(slug: string): Promise<PageData | null> {
  const pages = await getPages();
  return pages.find(p => p.slug === slug) || null;
}

export async function savePages(pages: PageData[]): Promise<boolean> {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(pages, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing pages.json:', error);
    return false;
  }
}
