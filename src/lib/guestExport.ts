import { guestStore } from '@/lib/guestStore';

const download = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const stamp = () => new Date().toISOString().slice(0, 10);

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const toCsv = (headers: string[], rows: unknown[][]) =>
  [headers, ...rows].map(r => r.map(csvCell).join(',')).join('\n');

/** One tap: download everything kept on this phone (products + sales) as a zip-free bundle. */
export const exportGuestData = () => {
  const products = guestStore.getProducts();
  const sales = guestStore.getSales();

  const productsCsv = toCsv(
    [
      'Name',
      'Supplier',
      'Purchase date',
      'Quantity bought',
      'Unit',
      'Buying price',
      'Transport cost',
      'Stall fee',
      'Selling price',
      'Quantity sold',
      'Quantity discarded',
    ],
    products.map(p => [
      p.name,
      p.supplier,
      p.purchaseDate,
      p.quantityBought,
      p.unitOfMeasurement,
      p.buyingPrice,
      p.transportCost,
      p.stallFee,
      p.sellingPrice,
      p.quantitySold,
      p.quantityDiscarded,
    ]),
  );

  const salesCsv = toCsv(
    ['Date', 'Products counted', 'Total profit'],
    sales.map(s => [s.date, s.products?.length ?? 0, s.totalProfit]),
  );

  download(`tengesa4profit-products-${stamp()}.csv`, productsCsv, 'text/csv;charset=utf-8');
  download(`tengesa4profit-sales-${stamp()}.csv`, salesCsv, 'text/csv;charset=utf-8');
  download(
    `tengesa4profit-backup-${stamp()}.json`,
    JSON.stringify({ exportedAt: new Date().toISOString(), products, sales }, null, 2),
    'application/json',
  );

  return { products: products.length, sales: sales.length };
};
