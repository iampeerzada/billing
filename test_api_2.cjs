const fetch = require('node-fetch');

async function test() {
  const req = await fetch('http://localhost:3000/api/invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': 'admin',
      'x-company-id': 'default'
    },
    body: JSON.stringify({
      id: "123",
      type: "invoice",
      invoiceNumber: "INV-123",
      date: "2026-04-23",
      customer: { name: "Test" },
      items: [{ name: "Item", price: 10, quantity: 1 }],
      taxType: "INTRA",
      subtotal: 10,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 10,
      status: "Unpaid"
    })
  });
  console.log(req.status, await req.text());
}
test();
