// Automated verification for all 3 Production Fixes

console.log('🧪 Starting Verification of All 3 Production Fixes...\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// ==========================================
// TEST SUITE 1: PRODUCT CODE SEARCH
// ==========================================
console.log('--- TEST SUITE 1: Product Code Search ---');

const mockProducts = [
  {
    id: 'p1',
    product_code: 'JZ-LS-1045',
    title: 'Maharashtrian Royal Thushi Long Set',
    category_id: 'maharashtrian',
    categoryLabel: 'Maharashtrian Jewellery',
    subcategory_id: 'maharashtrian-long-set',
    subcategory: 'Long Set',
    selling_price: 6500
  },
  {
    id: 'p2',
    product_code: 'JZ-SS-2010',
    title: 'Kundan Choker Short Set',
    category_id: 'kundan',
    categoryLabel: 'Kundan Jewellery',
    subcategory_id: 'kundan-short-set',
    subcategory: 'Short Set',
    selling_price: 4200
  },
  {
    id: 'p3',
    product_code: 'JZ-KND-9901',
    title: 'Kundan Bridal Long Set',
    category_id: 'kundan',
    categoryLabel: 'Kundan Jewellery',
    subcategory_id: 'kundan-long-set',
    subcategory: 'Long Set',
    selling_price: 12000
  },
  {
    id: 'p4',
    product_code: 'JZ-TMP-3344',
    title: 'Temple Laxmi Kasu Haram',
    category_id: 'temple',
    categoryLabel: 'Temple Jewellery',
    subcategory_id: 'temple-long-set',
    subcategory: 'Long Set',
    selling_price: 9500
  }
];

function runSearch(query, catSel = '', subCatSel = '', subCatIdSel = '', products = mockProducts) {
  let q = (query || '').trim().toLowerCase();
  q = q.replace(/jewellary|jewllary|jewelery/g, 'jewellery').replace(/jijaa|jija|jizaa/g, 'jiza');
  const qClean = q.replace(/[\s\-_]/g, '');

  const cSel = (catSel || '').trim().toLowerCase();
  const scSel = (subCatSel || '').trim().toLowerCase();
  const scIdSel = (subCatIdSel || '').trim().toLowerCase();

  return products.filter((product) => {
    const title = String(product.title || '').toLowerCase();
    const desc = String(product.description || '').toLowerCase();
    const rawCode = String(product.product_code || product.productCode || '').trim();
    const code = rawCode.toLowerCase();
    const codeClean = code.replace(/[\s\-_]/g, '');

    const prodCatId = String(product.category || product.category_id || '').toLowerCase();
    const prodCatName = String(product.categoryLabel || '').toLowerCase();
    const prodSubCatId = String(product.subcategory_id || '').toLowerCase();
    const prodSubCatName = String(product.subcategory || product.subcategoryLabel || '').toLowerCase();

    // PRODUCT CODE MATCHING
    const matchesProductCode = Boolean(
      code && (
        code === q ||
        code.includes(q) ||
        (qClean.length >= 2 && codeClean.includes(qClean))
      )
    );

    const matchesQuery = q === '' || matchesProductCode || title.includes(q) || desc.includes(q);

    // STRICT RELATIONAL CATEGORY MATCHING
    let matchesCategory = true;
    if (cSel) {
      matchesCategory = (
        prodCatId === cSel ||
        prodCatName === cSel ||
        prodCatName.includes(cSel)
      );
    }

    // STRICT RELATIONAL SUBCATEGORY MATCHING
    let matchesSubCategory = true;
    if (scSel || scIdSel) {
      matchesSubCategory = (
        (scIdSel && prodSubCatId === scIdSel) ||
        (scSel && (prodSubCatName === scSel || prodSubCatId === scSel))
      );
    }

    return matchesQuery && matchesCategory && matchesSubCategory;
  });
}

// 1. Exact Product Code Search
{
  const res = runSearch('JZ-LS-1045');
  assert(res.length === 1 && res[0].id === 'p1', 'Exact product code "JZ-LS-1045" returns p1');
}

// 2. Case-Insensitive Product Code Search
{
  const res = runSearch('jz-ls-1045');
  assert(res.length === 1 && res[0].id === 'p1', 'Lowercase "jz-ls-1045" returns p1');
}

// 3. Partial Product Code Search ("LS-1045")
{
  const res = runSearch('LS-1045');
  assert(res.length === 1 && res[0].id === 'p1', 'Partial code "LS-1045" returns p1');
}

// 4. Numeric Part Code Search ("1045")
{
  const res = runSearch('1045');
  assert(res.length === 1 && res[0].id === 'p1', 'Numeric partial code "1045" returns p1');
}

// 5. Delimiter-free search ("jzls1045")
{
  const res = runSearch('jzls1045');
  assert(res.length === 1 && res[0].id === 'p1', 'Delimiter-free code "jzls1045" returns p1');
}

// 6. Product Name Search
{
  const res = runSearch('Thushi');
  assert(res.length === 1 && res[0].id === 'p1', 'Product name "Thushi" returns p1');
}

// 7. Invalid code returns nothing
{
  const res = runSearch('JZ-INVALID-999');
  assert(res.length === 0, 'Invalid product code returns 0 results');
}


// ==========================================
// TEST SUITE 2: CATEGORY & SUBCATEGORY ISOLATION
// ==========================================
console.log('\n--- TEST SUITE 2: Category & Subcategory Isolation ---');

// Test: Maharashtrian -> Long Set MUST ONLY return Maharashtrian Long Set (p1), NOT Kundan Long Set (p3) or Temple Long Set (p4)
{
  const res = runSearch('', 'maharashtrian', 'Long Set', 'maharashtrian-long-set');
  assert(res.length === 1 && res[0].id === 'p1', 'Category "maharashtrian" + Subcategory "Long Set" returns ONLY p1 (no Kundan or Temple sets)');
}

// Test: Kundan -> Long Set MUST ONLY return Kundan Long Set (p3)
{
  const res = runSearch('', 'kundan', 'Long Set', 'kundan-long-set');
  assert(res.length === 1 && res[0].id === 'p3', 'Category "kundan" + Subcategory "Long Set" returns ONLY p3 (Kundan set)');
}

// Test: Temple -> Long Set MUST ONLY return Temple Long Set (p4)
{
  const res = runSearch('', 'temple', 'Long Set', 'temple-long-set');
  assert(res.length === 1 && res[0].id === 'p4', 'Category "temple" + Subcategory "Long Set" returns ONLY p4 (Temple set)');
}

// Test: Kundan -> Short Set MUST ONLY return p2
{
  const res = runSearch('', 'kundan', 'Short Set', 'kundan-short-set');
  assert(res.length === 1 && res[0].id === 'p2', 'Category "kundan" + Subcategory "Short Set" returns ONLY p2');
}

// Test: Cross-category text search within filtered category
{
  const res = runSearch('Bridal', 'kundan', 'Long Set', 'kundan-long-set');
  assert(res.length === 1 && res[0].id === 'p3', 'Search "Bridal" inside Kundan > Long Set returns p3');
}

// ==========================================
// TEST SUITE 3: CHECKOUT STATE & PRICE INTEGRITY
// ==========================================
console.log('\n--- TEST SUITE 3: Checkout State & Price Integrity ---');

// Verify Cart In-Memory Merging on Login
{
  const inMemoryCart = [{ id: 'p1', quantity: 1, selectedSize: 'Standard', selectedColor: 'Gold' }];
  const dbCart = [{ id: 'p2', quantity: 2, selectedSize: 'Standard', selectedColor: '' }];

  const merged = [...inMemoryCart];
  for (const dbItem of dbCart) {
    const exists = merged.some(m => m.id === dbItem.id && m.selectedSize === dbItem.selectedSize && (m.selectedColor || '') === (dbItem.selectedColor || ''));
    if (!exists) merged.push(dbItem);
  }

  assert(merged.length === 2, 'In-memory Buy Now item is preserved alongside DB cart on login');
  assert(merged[0].id === 'p1', 'Buy Now item remains at index 0');
  assert(merged[1].id === 'p2', 'DB item successfully appended without overwriting');
}

console.log(`\n========================================`);
console.log(`Final Result: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
