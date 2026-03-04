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
  city?: string;
}

const KURYE_KAZANCI_SUFFIX = '-kurye-kazanci';

/** Parses PSEO slug into city (optional) and platform. Supports:
 *  - platform-kurye-kazanci (e.g. getir-kurye-kazanci)
 *  - city-platform-kurye-kazanci (e.g. istanbul-getir-kurye-kazanci)
 */
export function parsePseoSlug(slug: string): { city: string | null; platformKey: string } {
  if (!slug.endsWith(KURYE_KAZANCI_SUFFIX)) {
    return { city: null, platformKey: '' };
  }
  const prefix = slug.slice(0, -KURYE_KAZANCI_SUFFIX.length);
  const parts = prefix.split('-');
  if (parts.length === 1) {
    return { city: null, platformKey: parts[0] ?? '' };
  }
  const platformKey = parts[parts.length - 1] ?? '';
  const city = parts.slice(0, -1).join('-');
  return { city: city || null, platformKey };
}

const DATA_FILE = path.join(process.cwd(), 'data', 'pages.json');

export async function getPages(): Promise<PageData[]> {
  try {
    const fileContents = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(fileContents);
  } catch {
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
  } catch {
    return false;
  }
}
