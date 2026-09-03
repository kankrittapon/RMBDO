// Code.gs — Google Apps Script Web App for RMBDO Inventory & Wealth Ledger Sync
// Deploy: Extensions → Apps Script → Deploy → New deployment → Web App
//   Execute as: Me
//   Who has access: Anyone (or Anyone with link + API key check below)
// Sheet: Single tab named "Inventory" with 5 columns (case-insensitive, trimmed):
//   Item Name | Category | Quantity | Unit Price (Optional) | Notes
// Category examples: Cooking, Alchemy, Grinding, Enhancement, Liquid Silver
// Returns: { status:"ok", timestamp, inventory:{[itemName]:number}, ledger:[{name,category,quantity,estimatedPrice,notes}] }

const SHEET_NAME = 'Inventory';

function doGet(e) { return handle(e); }
function doPost(e) { return handle(e); }

function handle(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet "' + SHEET_NAME + '" not found');

    const values = sheet.getDataRange().getValues();
    if (values.length < 2) {
      return jsonResponse({ status: "ok", timestamp: new Date().toISOString(), inventory: {}, ledger: [] });
    }

    const headerRow = values[0].map(function(h){ return String(h).trim().toLowerCase(); });
    const idx = {
      name: headerRow.indexOf('item name'),
      category: headerRow.indexOf('category'),
      qty: headerRow.indexOf('quantity'),
      price: headerRow.findIndex(function(h){ return h.indexOf('unit price') !== -1; }),
      notes: headerRow.indexOf('notes')
    };
    if (idx.name === -1 || idx.qty === -1) throw new Error('Missing required columns: Item Name, Quantity');

    const inventory = {};
    const ledger = [];
    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      const name = String(row[idx.name] || '').trim();
      if (!name) continue;
      const qtyRaw = String(row[idx.qty] || '').replace(/,/g, '').trim();
      const qty = Number(qtyRaw) || 0;
      const category = idx.category !== -1 ? String(row[idx.category] || '').trim() || 'Uncategorized' : 'Uncategorized';
      const priceRaw = idx.price !== -1 ? String(row[idx.price] || '').trim() : '';
      const estimatedPrice = priceRaw ? (Number(priceRaw.replace(/[^0-9.\-]/g, '')) || null) : null;
      const notes = idx.notes !== -1 ? String(row[idx.notes] || '').trim() : '';
      inventory[name] = qty; // last row wins for duplicates
      ledger.push({ name: name, category: category, quantity: qty, estimatedPrice: estimatedPrice, notes: notes });
    }

    const out = { status: "ok", timestamp: new Date().toISOString(), inventory: inventory, ledger: ledger };
    return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    const out = { status: "error", timestamp: new Date().toISOString(), message: String(err) };
    return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
