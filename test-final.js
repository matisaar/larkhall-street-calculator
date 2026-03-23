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
  const dscr = monthlyMortgage > 0 ? noi / 12 / monthlyMortgage : 0;
  const breakeven = grossRent > 0 ? totalExpenses / grossRent : 0;
  const cfPerDoor = i.numRooms > 0 ? monthlyCF / i.numRooms : 0;
  const grm = grossRent > 0 ? (i.purchasePrice + totalReno) / (grossRent * 12) : 0;
  return { downPayment, mortgage, closingCosts, totalReno, contingency, totalCashIn, parentLoan,
    monthlyMortgage, grossRent, egi, propTaxMo, pmFee, totalExpenses, monthlyCF, annualCF,
    noi, capRate, coc, dscr, breakeven, cfPerDoor, grm };
}
const defaults = {
  purchasePrice: 420000, downPaymentPct: 20, closingCostPct: 3, mortgageRate: 5, amortYears: 25,
  newBrUpstairs: 3000, newBrMiddle: 3000, paintingNewRooms: 500, futureBsmtBr: 5000, contingencyPct: 0,
  yourCash: 70000, numRooms: 8, rentPerRoom: 650, vacancyPct: 5,
  propertyTaxAnnual: 2530, insurance: 175, utilities: 800, maintenance: 150, pmPct: 10,
};
let passed = 0, failed = 0;
function assert(label, cond) { if (cond) { passed++; } else { failed++; console.log("  FAIL:", label); } }
function assertClose(label, a, b, tol) { tol = tol || 0.01; assert(label, Math.abs(a - b) < tol); }

console.log("=== Default values ===");
const r = calc(defaults);
assert("Down Payment = 84000", r.downPayment === 84000);
assert("Mortgage = 336000", r.mortgage === 336000);
assert("Closing Costs = 12600", r.closingCosts === 12600);
assert("Total Reno = 11500", r.totalReno === 11500);
assert("Total Cash In = 108100", r.totalCashIn === 108100);
assert("Parent Loan = 38100", r.parentLoan === 38100);
assert("Gross Rent = 5200", r.grossRent === 5200);
assert("EGI = 4940", r.egi === 4940);
assertClose("Prop Tax/mo = 210.83", r.propTaxMo, 210.8333);
assert("PM Fee = 520", r.pmFee === 520);
assertClose("Mortgage payment", r.monthlyMortgage, pmt(0.05/12, 300, 336000));
assertClose("CF = EGI - Expenses", r.monthlyCF, r.egi - r.totalExpenses);
assertClose("Annual CF = Monthly * 12", r.annualCF, r.monthlyCF * 12);
assertClose("NOI correct", r.noi, 37010, 1);
assertClose("Cap Rate", r.capRate, 37010 / 431500, 0.0001);
assertClose("CoC", r.coc, r.annualCF / 108100, 0.0001);
assertClose("DSCR", r.dscr, 37010 / 12 / r.monthlyMortgage, 0.01);
assertClose("Breakeven", r.breakeven, r.totalExpenses / 5200, 0.001);
assertClose("CF per Door", r.cfPerDoor, r.monthlyCF / 8, 0.01);
assertClose("GRM", r.grm, 431500 / 62400, 0.01);

console.log("=== Edge: 100% down ===");
const r3 = calc(Object.assign({}, defaults, { downPaymentPct: 100 }));
assert("Mortgage = 0", r3.mortgage === 0);
assert("DSCR = 0 (not Infinity)", r3.dscr === 0);
assert("DSCR is finite", isFinite(r3.dscr));

console.log("=== Edge: 0 rooms ===");
const r4 = calc(Object.assign({}, defaults, { numRooms: 0 }));
assert("cfPerDoor = 0", r4.cfPerDoor === 0);
assert("breakeven = 0", r4.breakeven === 0);
assert("GRM = 0", r4.grm === 0);
assert("cfPerDoor finite", isFinite(r4.cfPerDoor));
assert("breakeven finite", isFinite(r4.breakeven));
assert("GRM finite", isFinite(r4.grm));

console.log("=== Edge: 0% rate ===");
const r5 = calc(Object.assign({}, defaults, { mortgageRate: 0 }));
assertClose("pmt(0%)", r5.monthlyMortgage, 336000 / 300);

console.log("=== Negative CF ===");
const r8 = calc(Object.assign({}, defaults, { rentPerRoom: 400, vacancyPct: 20 }));
assert("CF is negative", r8.monthlyCF < 0);

console.log("=== Contingency ===");
const r9 = calc(Object.assign({}, defaults, { contingencyPct: 15 }));
assert("Contingency = 1725", r9.contingency === 1725);
assert("Total Reno = 13225", r9.totalReno === 13225);

console.log("=== fmt/pct guards ===");
function fmt(n) { if (n === undefined || n === null || !isFinite(n)) return "$0"; return (n<0?"\u2212":"")+"$"+Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g,","); }
function pct(n) { if (n === undefined || n === null || !isFinite(n)) return "0.0%"; return (n*100).toFixed(1)+"%"; }
assert("fmt(Inf)=$0", fmt(Infinity) === "$0");
assert("fmt(-Inf)=$0", fmt(-Infinity) === "$0");
assert("fmt(NaN)=$0", fmt(NaN) === "$0");
assert("pct(Inf)=0.0%", pct(Infinity) === "0.0%");
assert("pct(NaN)=0.0%", pct(NaN) === "0.0%");
assert("fmt neg has minus", fmt(-500).startsWith("\u2212"));

console.log("\n=====  PASSED: " + passed + " / FAILED: " + failed + "  =====");
process.exit(failed > 0 ? 1 : 0);
