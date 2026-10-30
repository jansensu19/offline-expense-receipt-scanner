import { ExpenseCategory } from "@/types/expense";

export type ParsedReceipt = {
  merchant: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
};

function parseCurrencyNumber(raw: string): number {
  let str = raw.replace(/\s+/g, '');
  if (str.includes(',') && str.includes('.')) {
    if (str.lastIndexOf('.') > str.lastIndexOf(',')) {
      str = str.replace(/,/g, '');
    } else {
      str = str.replace(/\./g, '').replace(',', '.');
    }
    return parseFloat(str);
  }
  if (/^\d{1,4}[.,]\d{2}$/.test(str)) {
    return parseFloat(str.replace(',', '.'));
  }
  return parseFloat(str.replace(/[.,]/g, ''));
}

export function parseReceiptText(rawText: string): ParsedReceipt {
  console.log('--- RAW OCR TEXT ---\n', rawText);
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 2);
  const merchantLine = lines.find(
    (line) =>
      /[a-zA-Z]{4,}/.test(line) &&
      !/^(welcome|thank|receipt|struk|copy|tanggal|date|time|kasir|cashier|jl\.|jalan|telp|npwp|facebook|instagram|twitter|tiktok|share|save|mengutamakan|emergency|sedang|silakan|rincian)/i.test(
        line
      )
  );
  const merchant = merchantLine || lines[0] || 'Scanned Merchant';
  const amountRegex = /\d{1,3}(?:[\s.,]\d{3})+(?:[.,]\d{2})?|\d+(?:[.,]\d{2})?/g;
  let amount = 0;
  const totalLines = lines.filter(
    (line) =>
      /(total|jumlah|jim\s*lah|tagihan|amount|kami\s*bayar|we\s*pay)/i.test(line) &&
      !/(sub\s*total|item|qty|diskon|disc|change|kembali)/i.test(line)
  );
  for (const line of totalLines) {
    const matches = line.match(amountRegex);
    if (matches && matches.length > 0) {
      const candidate = parseCurrencyNumber(matches[matches.length - 1]);
      if (!isNaN(candidate) && candidate > 0 && candidate < 100000000) {
        amount = candidate; 
      }
    }
  }
  if (amount === 0) {
    const allMatches = rawText.match(amountRegex) || [];
    const validAmounts = allMatches
      .map(parseCurrencyNumber)
      .filter((n) => !isNaN(n) && n > 1 && n < 100000000 && n !== 2023 && n !== 2025 && n !== 2026);
    amount = validAmounts.length > 0 ? Math.max(...validAmounts) : 0;
  }
  const lower = rawText.toLowerCase();
  let category: ExpenseCategory = 'Other';
  if (/coffee|kopi|cafe|starbucks|resto|food|mart|alfamart|indomaret|bakery|kitchen|tea|burger|mie|ayam|nasi|warung/.test(lower)) {
    category = 'Food';
  } else if (/apple|tech|electronic|computer|digital|software|gadget|fone/.test(lower)) {
    category = 'Tech';
  } else if (/uber|grab|gojek|shell|pertamina|spbu|gas|fuel|hotel|flight|train|parkir|tol|forex|money\s*changer/.test(lower)) {
    category = 'Travel';
  }
  let date = new Date().toISOString().split('T')[0];
  const isoMatch = rawText.match(/\b(20\d{2})[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])\b/);
  const dmy4Match = rawText.match(/\b(0[1-9]|[12]\d|3[01])[-/.](0[1-9]|1[0-2])[-/.](20\d{2})\b/);
  const shortYearMatch = rawText.match(/\b(\d{2})[-/.](\d{2})[-/.](\d{2})\b/);
  if (isoMatch) {
    date = `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  } else if (dmy4Match) {
    date = `${dmy4Match[3]}-${dmy4Match[2]}-${dmy4Match[1]}`;
  } else if (shortYearMatch) {
    const p1 = parseInt(shortYearMatch[1], 10);
    const p2 = parseInt(shortYearMatch[2], 10);
    const yr = `20${shortYearMatch[3]}`;
    const month = p2 > 12 ? shortYearMatch[1] : shortYearMatch[2];
    const day = p2 > 12 ? shortYearMatch[2] : shortYearMatch[1];
    date = `${yr}-${month}-${day}`;
  }
  return { merchant, amount, category, date };
}

export async function recognizeReceiptFromBase64(
  base64Image: string,
): Promise<ParsedReceipt> {
  const formData = new FormData();
  const formattedBase64 = base64Image.startsWith("data:image")
    ? base64Image
    : `data:image/jpeg;base64,${base64Image}`;
  formData.append("base64Image", formattedBase64);
  formData.append("language", "eng");
  formData.append("isTable", "true");
  formData.append("scale", "true");
  formData.append("OCREngine", "2");

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: {
      apikey: "helloworld",
    },
    body: formData,
  });

  const result = await response.json();
  const rawText: string = result?.ParsedResults?.[0]?.ParsedText || "";

  if (!rawText.trim()) {
    throw new Error("Could not read text from image");
  }

  return parseReceiptText(rawText);
}
