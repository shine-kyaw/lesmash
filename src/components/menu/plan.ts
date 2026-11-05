import type { MenuCategory, MenuItem, Branch } from '../../lib/content';
import manifest from '../../data/media-manifest.json';

/**
 * Turns the content collections into the pages of the printed-style menu.
 * Nothing about a dish or a price is written here: this file only decides which
 * page a record lands on.
 */

const dimsByPath = new Map<string, { width: number; height: number }>(
  (manifest as { path: string; width: number; height: number }[]).map((m) => [
    m.path,
    { width: m.width, height: m.height },
  ])
);

export function dims(src: string): { width: number; height: number } {
  return dimsByPath.get(src) ?? { width: 900, height: 675 };
}

/** 5500 -> "5.5K", 10000 -> "10K". Prices are stored as MMK integers. */
export function formatK(mmk: number): string {
  const k = mmk / 1000;
  return `${Number.isInteger(k) ? k : Number(k.toFixed(1))}K`;
}

/** Short label for the jump row; falls back to the category's own name. */
const SHORT: Record<string, string> = {
  burgers: 'Burgers',
  brunch: 'Brunch',
  mains: 'Mains',
  salads: 'Salads',
  snacks: 'Snacks',
  drinks: 'Drinks',
  cocktails: 'Cocktails',
  bottled: 'Bottled',
};
export const shortName = (c: MenuCategory) => SHORT[c.slug] ?? c.name;

export interface ListBlock {
  label: string | null;
  items: { name: string; price: string | null }[];
}

export type PageSpec =
  | { kind: 'cover' }
  | {
      kind: 'cards';
      category: MenuCategory;
      items: MenuItem[];
      part: number;
      parts: number;
    }
  | {
      kind: 'list';
      category: MenuCategory;
      /** Either two packed columns, or one flowing block (ungrouped lists). */
      columns: ListBlock[][];
      flow: boolean;
      part: number;
      parts: number;
    }
  | { kind: 'visit'; branches: Branch[] }
  | { kind: 'filler' }
  | { kind: 'back' };

const CARDS_PER_PAGE = 6;
const COL_ROWS = 20; // rows a drinks column holds before the next block moves over

function chunk<T>(arr: T[], pages: number): T[][] {
  const per = Math.ceil(arr.length / pages);
  return Array.from({ length: pages }, (_, i) => arr.slice(i * per, (i + 1) * per)).filter(
    (c) => c.length
  );
}

function listBlocks(category: MenuCategory): ListBlock[] {
  const price = (n: string) => {
    const v = category.listPrices[n];
    return v === undefined ? null : formatK(v);
  };
  const groups = category.listGroups.length
    ? category.listGroups
    : [{ label: null as string | null, items: category.listItems }];
  return groups.map((g) => ({
    label: g.label,
    items: g.items.map((name) => ({ name, price: price(name) })),
  }));
}

function packLists(blocks: ListBlock[]): { columns: ListBlock[][]; flow: boolean }[] {
  // One ungrouped block flows into two CSS columns by itself.
  if (blocks.length === 1 && !blocks[0].label) return [{ columns: [[blocks[0]]], flow: true }];
  const cost = (b: ListBlock) => b.items.length + 2;
  const pages: { cols: ListBlock[][]; rows: number[] }[] = [];
  const fresh = () => ({ cols: [[], []] as ListBlock[][], rows: [0, 0] });
  let cur = fresh();
  for (const b of blocks) {
    let col = cur.rows[0] + cost(b) <= COL_ROWS || cur.rows[0] === 0 ? 0
      : cur.rows[1] + cost(b) <= COL_ROWS || cur.rows[1] === 0 ? 1 : -1;
    if (col === -1) {
      pages.push(cur);
      cur = fresh();
      col = 0;
    }
    cur.cols[col].push(b);
    cur.rows[col] += cost(b);
  }
  pages.push(cur);
  return pages.map((p) => ({ columns: p.cols, flow: false }));
}

export function buildPages(
  categories: MenuCategory[],
  byCategory: (slug: string) => MenuItem[],
  branches: Branch[]
): { pages: PageSpec[]; firstPageOf: Record<string, number> } {
  const pages: PageSpec[] = [{ kind: 'cover' }];
  const firstPageOf: Record<string, number> = {};

  for (const category of categories) {
    if (category.layout === 'list') {
      const blocks = listBlocks(category).filter((b) => b.items.length);
      if (!blocks.length) continue;
      const packed = packLists(blocks);
      firstPageOf[category.slug] = pages.length;
      packed.forEach((p, i) =>
        pages.push({ kind: 'list', category, columns: p.columns, flow: p.flow, part: i + 1, parts: packed.length })
      );
    } else {
      const items = byCategory(category.slug);
      if (!items.length) continue;
      const parts = Math.max(1, Math.ceil(items.length / CARDS_PER_PAGE));
      const groups = chunk(items, parts);
      firstPageOf[category.slug] = pages.length;
      groups.forEach((g, i) =>
        pages.push({ kind: 'cards', category, items: g, part: i + 1, parts: groups.length })
      );
    }
  }

  pages.push({ kind: 'visit', branches });
  // The book is whole sheets, so the back cover must land on an even index.
  if ((pages.length + 1) % 2 !== 0) pages.splice(pages.length - 1, 0, { kind: 'filler' });
  pages.push({ kind: 'back' });
  return { pages, firstPageOf };
}
