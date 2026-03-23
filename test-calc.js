// Test suite for calc() function
function pmt(rate, nper, pv) {
  if (rate === 0) return pv / nper;
  return (pv * rate * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1);
}

function calc(i) {
  const downPayment = i.purchasePrice * (i.downPaymentPct / 100);
  const mortgage = i.purchasePrice - downPayment;
  const closingCosts = i.purchasePrice * (i.closingCostPct / 100);
  const renoSubtotal = i.newBrUpstairs + i.newBrMiddle + i.paintingNewRooms + i.futureBsmtBr;
  const contingency = renoSubtotal * (i.contingencyPct / 100);
  const totalReno = renoSubtotal + contingency;
  const totalCashIn = downPayment + closingCosts + totalReno;
  const parentLoan = Math.max(0, totalCashIn - i.yourCash);
  const monthlyRate = i.mortgageRate / 100 / 12;
  const nPayments = i.amortYears * 12;
  const monthlyMortgage = pmt(monthlyRate, nPayments, mortgage);
  const grossRent = i.numRooms * i.rentPerRoom;
  const egi = grossRent * (1 - i.vacancyPct / 100);
  const propTaxMo = i.propertyTaxAnnual / 12;
  const pmFee = grossRent * (i.pmPct / 100);
  const totalExpenses = monthlyMortgage + propTaxMo + i.insurance + i.utilities + i.maintenance + pmFee;
  const monthlyCF = egi - totalExpenses;
  const annualCF = monthlyCF * 12;
  const noi = (egi - propTaxMo - i.insurance - i.utilities - i.maintenance - pmFee) * 12;
  const capRate = noi / (i.purchasePrice + totalReno);
  const coc = annualCF / totalCashIn;
  const dscr = noi / 12 / monthlyMortgage;
  const breakeven = totalExpenses / grossRent;
  const cfPerDoor = monthlyCF / i.numRooms;
  const grm = (i.purchasePrice + totalReno) / (grossRent * 12);
  return { downPayment, mortgage, closingCosts, totalReno, contingency, totalCashIn, parentLoan,
    monthlyMortgage, grossRent, egi, propTaxMo, pmFee, totalExpenses, monthlyCF, annualCF,
    noi, capRate, coc, dscr, breakeven, cfPerDoor, grm, renoSubtotal };
}

const defaults = {
  purchasePrice: 420000, downPaymentPct: 20, closingCostPct: 3, mortgageRate: 5, amortYears: 25,
  newBrUpstairs: 3000, newBrMiddle: 3000, paintingNewRooms: 500, futureBsmtBr: 5000, contingencyPct: 0,
  yourCash: 70000, numRooms: 8, rentPerRoom: 650, vacancyPct: 5,
  propertyTaxAnnual: 2530, insurance: 175, utilities: 800, maintenance: 150, pmPct: 10,
};

let passed = 0, failed = 0;
function assert(label, condition) {
  if (condition) { passed++; console.log("  PASS:", label); }
  else { failed++; console.log("  FAIL:", label); }
}
function assertClose(label, a, b, tol = 0.01) {
  assert(label + " (" + a.toFixed(4) + " ~ " + b.toFixed(4) + ")", Math.abs(a - b) < tol);
}

console.log("=== TEST 1: Default values ===");
const r = calc(defaults);
assert("Down Payment = 84000", r.downPayment === 84000);
assert("Mortgage = 336000", r.mortgage === 336000);
assert("Closing Costs = 12600", r.closingCosts === 12600);
assert("Reno Subtotal = 11500", r.renoSubtotal === 11500);
assert("Total Reno = 11500 (0% contingency)", r.totalReno === 11500);
assert("Total Cash In = 108100", r.totalCashIn === 108100);
assert("Parent Loan = 38100", r.parentLoan === 38100);
assert("Gross Rent = 5200", r.grossRent === 5200);
assert("EGI = 4940", r.egi === 4940);
assertClose("Prop Tax/mo = 210.83", r.propTaxMo, 210.833333);
assert("PM Fee = 520", r.pmFee === 520);

// Verify mortgage payment: standard formula for 5%/12 rate, 300 payments, $336K
const expectedPmt = pmt(0.05 / 12, 300, 336000);
assertClose("Monthly mortgage matches pmt()", r.monthlyMortgage, expectedPmt);

// Cash flow = EGI - total expenses
assertClose("CF = EGI - Expenses", r.monthlyCF, r.egi - r.totalExpenses);

// Annual CF = monthly * 12
assertClose("Annual CF = Monthly * 12", r.annualCF, r.monthlyCF * 12);

// NOI should NOT include mortgage (operating income)
const expectedNOI = (r.egi - r.propTaxMo - r.insurance - r.utilities - r.maintenance - r.pmFee) * 12;
assertClose("NOI excludes mortgage", r.noi, expectedNOI);

// Cap Rate = NOI / total investment
assertClose("Cap Rate = NOI / (price + reno)", r.capRate, r.noi / (420000 + 11500));

// CoC = Annual CF / Total Cash In
assertClose("CoC = Annual CF / Total Cash In", r.coc, r.annualCF / r.totalCashIn);

// DSCR = monthly NOI / monthly mortgage
assertClose("DSCR = NOI/12 / mortgage payment", r.dscr, r.noi / 12 / r.monthlyMortgage);

// Break-even = total expenses / gross rent
assertClose("Break-even = expenses / gross rent", r.breakeven, r.totalExpenses / r.grossRent);

// CF per door
assertClose("CF per door = CF / rooms", r.cfPerDoor, r.monthlyCF / 8);

// GRM
assertClose("GRM = total cost / annual gross rent", r.grm, (420000 + 11500) / (5200 * 12));

console.log("\n=== TEST 2: 0% vacancy ===");
const r2 = calc({ ...defaults, vacancyPct: 0 });
assert("EGI = Gross Rent", r2.egi === r2.grossRent);

console.log("\n=== TEST 3: 100% down payment (no mortgage) ===");
const r3 = calc({ ...defaults, downPaymentPct: 100 });
assert("Mortgage = 0", r3.mortgage === 0);
assert("Monthly mortgage = 0", r3.monthlyMortgage === 0);
console.log("  INFO: DSCR =", r3.dscr, "(division by zero issue)");
assert("DSCR is Infinity or NaN (BUG)", !isFinite(r3.dscr));

console.log("\n=== TEST 4: 0 rooms ===");
const r4 = calc({ ...defaults, numRooms: 0 });
assert("Gross Rent = 0", r4.grossRent === 0);
console.log("  INFO: CF per Door =", r4.cfPerDoor);
console.log("  INFO: Break-even =", r4.breakeven);
console.log("  INFO: GRM =", r4.grm);
assert("cfPerDoor is NaN (BUG: division by 0)", !isFinite(r4.cfPerDoor));
assert("breakeven is Infinity (BUG: division by 0)", !isFinite(r4.breakeven));
assert("GRM is Infinity (BUG: division by 0)", !isFinite(r4.grm));

console.log("\n=== TEST 5: 0% mortgage rate ===");
const r5 = calc({ ...defaults, mortgageRate: 0 });
assertClose("pmt(0%) = principal / payments", r5.monthlyMortgage, 336000 / 300);

console.log("\n=== TEST 6: Cash exceeds total needed ===");
const r6 = calc({ ...defaults, yourCash: 200000 });
assert("Parent Loan = 0", r6.parentLoan === 0);

console.log("\n=== TEST 7: Negative cash flow scenario ===");
const r8 = calc({ ...defaults, rentPerRoom: 400, vacancyPct: 20 });
assert("Monthly CF is negative", r8.monthlyCF < 0);

console.log("\n=== TEST 8: Contingency adds correctly ===");
const r9 = calc({ ...defaults, contingencyPct: 15 });
assert("Contingency = 1725", r9.contingency === 11500 * 0.15);
assert("Total Reno = 13225", r9.totalReno === 11500 + 1725);

console.log("\n=== TEST 9: High vacancy (50%) ===");
const r10 = calc({ ...defaults, vacancyPct: 50 });
assert("EGI = half of gross", r10.egi === 2600);

console.log("\n=== TEST 10: fmt() negative value display ===");
// The UI uses Unicode minus \u2212 for negative values
// Check that the highlight logic works: value.startsWith("\u2212")
const fmt = (n) => (n < 0 ? "\u2212" : "") + "$" + Math.abs(n).toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const negVal = fmt(-500);
const posVal = fmt(500);
assert("Negative value starts with Unicode minus", negVal.startsWith("\u2212"));
assert("Positive value does NOT start with Unicode minus", !posVal.startsWith("\u2212"));
assert("Negative format: \u2212$500", negVal === "\u2212$500");
assert("Positive format: $500", posVal === "$500");

console.log("\n=============================");
console.log("PASSED:", passed);
console.log("FAILED:", failed);
console.log("=============================");

if (failed > 0) {
  console.log("\nKNOWN ISSUES:");
  console.log("1. Division by zero: DSCR when mortgage=0, cfPerDoor when rooms=0, breakeven when grossRent=0, GRM when grossRent=0");
  console.log("2. These produce Infinity/NaN which will display as 'Infinity%' or 'NaN' in the UI");
}
