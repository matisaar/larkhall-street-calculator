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
  const propTaxMo = function pmt(rate, nper, pv) {
  if (rate === 0) return pv / nper;
  ;
  if (rate === 0) return pv /ly  return (pv * rate * Math.pow(1 + +}
function calc(i) {
  const downPayment = i.purchasePrice * (i.downPaymentPct / con  const downPaymeth  const mortgage = i.purchasePrice - downPayment;
  const closinit  const closingCosts = i.purchasePrice * (i.closte  const renoSubtotal = i.newBrUpstairs + i.newBrMiddle + i.paintito  const contingency = renoSubtotal * (i.contingencyPct / 100);
  const totalReno = renoSubtoke  const totalReno = renoSubtotal + contingency;
  const totalcf  const totalCashIn = downPayment + closingCosom  const parentLoan = Math.max(0, totalCashIn - i.yourCash);
lR  const monthlyRate = i.mortgageRate / 100 / 12;
  const nag  const nPayments = i.amortYears * 12;
  const as  const monthlyMortgage = pmt(monthly g  const gross, propTaxMo, pmFee, totalExpenses, monthlyCF, annual  const egi = grossRent * (1 - i.vacancyPct / Pe  const propTaxMo = function pmt(rate, nper, pv) {:   if (rate === 0)ntPct: 20, closingCostPct: 3, mortgageRate: 5, amortYears: 25,
  newBr  stfunction calc(i) {
  const downPayment = i.purchasePrice * (i.downP 5  const downPaymect  const closinit  const closingCosts = i.purchasePrice * (i.closte  const renoSubtotal = i.newBrUpstairs + i.newBrMiddle + i.paintai  const totalReno = renoSubtoke  const totalReno = renoSubtotal + contingency;
  const totalcf  const totalCashIn = downPayment + closingCosom  const parentLoan = Math.max(0, totalCashIn - i.you b  const totalcf  const totalCashIn = downPayment + closingCosole.log("=== DefaulR  const monthlyRate = i.mortgageRate / 100 / 12;
  const nag  const nPayments = i.amortYears * 12;
  const as  const mo60  const nag  const nPayments = i.amortYears * 12;s   const as  const monthlyMortgage = pmt(monthly al  newBr  stfunction calc(i) {
  const downPayment = i.purchasePrice * (i.downP 5  const downPaymect  const closinit  const closingCosts = i.purchasePrice * (i.closte  const renoSubtotal = i.newBrUpstairs + i.newBrMiddle + i.paintai  const totalReno = renoSubtoke  const totalReno = renoSubtot 2  const downPayment = i.purc20  const totalcf  const totalCashIn = downPayment + closingCosom  const parentLoan = Math.max(0, totalCashIn - i.you b  const totalcf  const totalCashIn = downPayment + closingCosole.log("=== DefaulR  const monthlyRate = i.mortgageRate / 100 / 12;
  const nag  const nPayments =  3  const nag  const nPayments = i.amortYears * 12;
  const as  const mo60  const nag  const nPayments = i.amortYears * 12;s   const as  const monthlyMortgage = pmt(monthly al  newBr  stfunction calc(i) {
  const downPayment = i.purchasePrice * (ire  const as  const mo60  const nag  const nPaymenos  const downPayment = i.purchasePrice * (i.downP 5  const downPaymect  const closinit  const closingCosts = i.purchasePrice * (i.closte  const renoSubt==  const nag  const nPayments =  3  const nag  const nPayments = i.amortYears * 12;
  const as  const mo60  const nag  const nPayments = i.amortYears * 12;s   const as  const monthlyMortgage = pmt(monthly al  newBr  stfunction calc(i) {
  const downPayment = i.purchasePrice * (ire  const as  const mo60  const nag  const nPaymenos  const downPayment = i.purchasePrice * (i.downP 5  const downPaymect  const closinit  const closingCosts = i.purchasePrice * (i.closte  const renoSubt==  const nag  const nPayments =  3  const nag  const nPaye(  const as  const mo60  const nag  const nPayments = i.amortYears * 12;s   const :   const downPayment = i.purchasePrice * (ire  const as  const mo60  const nag  const nPaymenos  const downPayment = i.purchasePrice * (i.downP 5  constga  const as  const mo60  const nag  const nPayments = i.amortYears * 12;s   const as  const monthlyMortgage = pmt(monthly al  newBr  stfunction calc(i) {
  const downPayment = i.purchasePrice * (ire  const as  const mo60  const nag  const nPaymenos  const downPayment = i.purchasePrice * (i.downP 5  const downPaymect  const closco  const downPayment = i.purchasePrice * (ire  const as  const mo60  const nag  const nPaymenos  const downPayment = i.purchasePrice * (i.downP 5  const+"  const downPayment = i.purchasePrice * (ire  const as  const mo60  const nag  const nPaymenos  const downPayment = i.purchasePrice * (i.downP 5  const downPaymect  const closco  const downPayment = i.purchasePrice * (ire  const as  const mo60  const nag  const nPaymenos  const downPayment = i.purchasePrice * (i.downP 5  const+"  const downPayment = i.purchasePrice * (ire  const as  const mo60  const nag  const nPaymenos  const downPayment = i.purchasePrice * (i.downP 5  const downPaymect  const closco  const downPayment = i.purchasePrice * (ire  const as  const mo60  const nag  const nPaymenos  const downPayment = i.purchasePrice * (i.downP 5  const+"  const downPayment = i.purchased > 0 ? 1 : 0);
