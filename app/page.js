"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const defaultInputs = {
  purchasePrice: 420000,
  downPaymentPct: 20,
  closingCostPct: 3,
  mortgageRate: 5,
  amortYears: 25,
  newBrUpstairs: 3000,
  newBrMiddle: 3000,
  paintingNewRooms: 500,
  contingencyPct: 0,
  yourCash: 70000,
  numRooms: 8,
  rentPerRoom: 650,
  vacancyPct: 5,
  propertyTaxAnnual: 2530,
  insurance: 175,
  utilitiesWinter: 1500,
  utilitiesSummer: 500,
  maintenance: 150,
  pmPct: 10,
};

function fmt(n) {
  if (n === undefined || n === null || !isFinite(n)) return "$0";
  return (
    (n < 0 ? "\u2212" : "") +
    "$" +
    Math.abs(Math.round(n))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  );
}

function pct(n) {
  if (n === undefined || n === null || !isFinite(n)) return "0.0%";
  return (n * 100).toFixed(1) + "%";
}

function pmt(rate, nper, pv) {
  if (rate === 0) return pv / nper;
  return (pv * rate * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1);
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function monthlyUtilities(winter, summer) {
  const avg = (winter + summer) / 2;
  const amp = (winter - summer) / 2;
  return Array.from({ length: 12 }, (_, m) => Math.round(avg + amp * Math.cos((2 * Math.PI * m) / 12)));
}

function calc(i) {
  const downPayment = i.purchasePrice * (i.downPaymentPct / 100);
  const mortgage = i.purchasePrice - downPayment;
  const closingCosts = i.purchasePrice * (i.closingCostPct / 100);
  const renoSubtotal =
    i.newBrUpstairs + i.newBrMiddle + i.paintingNewRooms;
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
  const utilByMonth = monthlyUtilities(i.utilitiesWinter, i.utilitiesSummer);
  const utilitiesAvg = utilByMonth.reduce((a, b) => a + b, 0) / 12;
  const totalExpenses =
    monthlyMortgage + propTaxMo + i.insurance + utilitiesAvg + i.maintenance + pmFee;
  const monthlyCF = egi - totalExpenses;
  const annualCF = monthlyCF * 12;
  const noi =
    (egi - propTaxMo - i.insurance - utilitiesAvg - i.maintenance - pmFee) * 12;
  const capRate = noi / (i.purchasePrice + totalReno);
  const coc = annualCF / totalCashIn;
  const dscr = monthlyMortgage > 0 ? noi / 12 / monthlyMortgage : 0;
  const breakeven = grossRent > 0 ? totalExpenses / grossRent : 0;
  const cfPerDoor = i.numRooms > 0 ? monthlyCF / i.numRooms : 0;
  const grm = grossRent > 0 ? (i.purchasePrice + totalReno) / (grossRent * 12) : 0;

  return {
    downPayment, mortgage, closingCosts, totalReno, contingency,
    totalCashIn, parentLoan, monthlyMortgage, grossRent, egi, propTaxMo, pmFee,
    totalExpenses, monthlyCF, annualCF, noi, capRate, coc, dscr,
    breakeven, cfPerDoor, grm, utilByMonth, utilitiesAvg,
  };
}

/* -- Components ------------------------------------------------ */

function InputRow({ label, field, inputs, onChange, prefix = "$", suffix = "", step = 1, note }) {
  return (
    <div className="input-row">
      <div className="input-label-wrap">
        <div className="input-label">{label}</div>
        {note && <div className="input-note">{note}</div>}
      </div>
      <div className="input-field">
        {prefix && <span className="input-affix">{prefix}</span>}
        <input
          type="number"
          value={inputs[field]}
          onChange={(e) => onChange(field, parseFloat(e.target.value) || 0)}
          step={step}
        />
        {suffix && <span className="input-affix">{suffix}</span>}
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight, note }) {
  const colorClass = highlight
    ? typeof value === "string" && value.startsWith("\u2212") ? "c-red" : "c-green"
    : "c-default";
  return (
    <div className="result-row">
      <div className="input-label-wrap">
        <div className="result-label">{label}</div>
        {note && <div className="result-note">{note}</div>}
      </div>
      <span className={`result-value ${colorClass}`}>{value}</span>
    </div>
  );
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <span className="section-title">{title}</span>
        <span className="section-toggle">{open ? "\u2212" : "+"}</span>
      </div>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}

function UtilityChart({ months }) {
  const max = Math.max(...months);
  return (
    <div className="util-chart">
      {months.map((v, i) => (
        <div key={i} className="util-bar-col">
          <span className="util-bar-val">{fmt(v)}</span>
          <div className="util-bar" style={{ height: max > 0 ? (v / max * 48) + "px" : "2px" }} />
          <span className="util-bar-label">{MONTH_NAMES[i]}</span>
        </div>
      ))}
    </div>
  );
}

function ScenarioAnalysis({ inputs }) {
  const [overrides, setOverrides] = useState({
    rentPerRoom: inputs.rentPerRoom,
    vacancyPct: inputs.vacancyPct,
    mortgageRate: inputs.mortgageRate,
    numRooms: inputs.numRooms,
    purchasePrice: inputs.purchasePrice,
  });

  useEffect(() => {
    setOverrides((prev) => ({
      rentPerRoom: prev.rentPerRoom === inputs.rentPerRoom ? prev.rentPerRoom : inputs.rentPerRoom,
      vacancyPct: prev.vacancyPct === inputs.vacancyPct ? prev.vacancyPct : inputs.vacancyPct,
      mortgageRate: prev.mortgageRate === inputs.mortgageRate ? prev.mortgageRate : inputs.mortgageRate,
      numRooms: prev.numRooms === inputs.numRooms ? prev.numRooms : inputs.numRooms,
      purchasePrice: prev.purchasePrice === inputs.purchasePrice ? prev.purchasePrice : inputs.purchasePrice,
    }));
  }, [inputs.rentPerRoom, inputs.vacancyPct, inputs.mortgageRate, inputs.numRooms, inputs.purchasePrice]);

  const scenario = { ...inputs, ...overrides };
  const base = calc(inputs);
  const s = calc(scenario);
  const changed = s.monthlyCF !== base.monthlyCF;

  const sliders = [
    { label: "Rent / Room", key: "rentPerRoom", min: 400, max: 1000, step: 25, fmt: (v) => fmt(v) },
    { label: "Vacancy", key: "vacancyPct", min: 0, max: 50, step: 5, fmt: (v) => v + "%" },
    { label: "Interest Rate", key: "mortgageRate", min: 2, max: 10, step: 0.25, fmt: (v) => v.toFixed(2) + "%" },
    { label: "# Rooms", key: "numRooms", min: 4, max: 12, step: 1, fmt: (v) => v },
    { label: "Purchase Price", key: "purchasePrice", min: 300000, max: 500000, step: 5000, fmt: (v) => fmt(v) },
  ];

  return (
    <div>
      {sliders.map(({ label, key, min, max, step, fmt: fmtVal }) => (
        <div key={key} className="slider-row">
          <div className="slider-label">
            <span>{label}</span>
            <span className="slider-value">{fmtVal(overrides[key])}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={overrides[key]}
            onChange={(e) => setOverrides({ ...overrides, [key]: parseFloat(e.target.value) })}
            className="slider-input"
          />
        </div>
      ))}
      <div className="scenario-results">
        <div className="scenario-grid">
          <div className="scenario-card">
            <div className="scenario-card-label">Monthly CF</div>
            <div className={"scenario-card-value " + (s.monthlyCF >= 0 ? "c-green" : "c-red")}>{fmt(s.monthlyCF)}</div>
            {changed && <div className="scenario-card-delta">{s.monthlyCF >= base.monthlyCF ? "+" : ""}{fmt(s.monthlyCF - base.monthlyCF)} vs base</div>}
          </div>
          <div className="scenario-card">
            <div className="scenario-card-label">Annual CF</div>
            <div className={"scenario-card-value " + (s.annualCF >= 0 ? "c-green" : "c-red")}>{fmt(s.annualCF)}</div>
            {changed && <div className="scenario-card-delta">{s.annualCF >= base.annualCF ? "+" : ""}{fmt(s.annualCF - base.annualCF)} vs base</div>}
          </div>
          <div className="scenario-card">
            <div className="scenario-card-label">CoC Return</div>
            <div className="scenario-card-value">{pct(s.coc)}</div>
          </div>
          <div className="scenario-card">
            <div className="scenario-card-label">DSCR</div>
            <div className="scenario-card-value">{isFinite(s.dscr) ? s.dscr.toFixed(2) + "x" : "N/A"}</div>
          </div>
          <div className="scenario-card">
            <div className="scenario-card-label">Cap Rate</div>
            <div className="scenario-card-value">{pct(s.capRate)}</div>
          </div>
          <div className="scenario-card">
            <div className="scenario-card-label">Mortgage</div>
            <div className="scenario-card-value">{fmt(s.monthlyMortgage)}/mo</div>
          </div>
        </div>
        {changed && (
          <button className="reset-btn" onClick={() => setOverrides({
            rentPerRoom: inputs.rentPerRoom,
            vacancyPct: inputs.vacancyPct,
            mortgageRate: inputs.mortgageRate,
            numRooms: inputs.numRooms,
            purchasePrice: inputs.purchasePrice,
          })}>Reset to base</button>
        )}
      </div>
    </div>
  );
}

/* -- Main ------------------------------------------------------- */

const POLL_INTERVAL = 3000;

export default function Calculator() {
  const [inputs, setInputs] = useState(defaultInputs);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [lastSavedBy, setLastSavedBy] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("connecting");
  const lastSaveTimestamp = useRef(null);
  const isSaving = useRef(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/data");
        if (res.ok) {
          const data = await res.json();
          if (data.inputs) {
            setInputs((prev) => ({ ...prev, ...data.inputs }));
            setLastSaved(data.savedAt);
            setLastSavedBy(data.savedBy);
            lastSaveTimestamp.current = data.savedAt;
          }
          setSyncStatus("connected");
        }
      } catch {
        setSyncStatus("offline");
      }
      setLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(async () => {
      if (isSaving.current) return;
      try {
        const res = await fetch("/api/data");
        if (res.ok) {
          const data = await res.json();
          if (data.savedAt && data.savedAt !== lastSaveTimestamp.current) {
            if (data.inputs) {
              setInputs((prev) => ({ ...prev, ...data.inputs }));
              setLastSaved(data.savedAt);
              setLastSavedBy(data.savedBy);
              lastSaveTimestamp.current = data.savedAt;
            }
          }
          setSyncStatus("connected");
        }
      } catch {
        setSyncStatus("offline");
      }
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loaded]);

  const save = useCallback(async (newInputs) => {
    setSaving(true);
    isSaving.current = true;
    try {
      const res = await fetch("/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: newInputs, savedBy: "web" }),
      });
      if (res.ok) {
        const data = await res.json();
        setLastSaved(data.savedAt);
        setLastSavedBy(data.savedBy);
        lastSaveTimestamp.current = data.savedAt;
        setSyncStatus("connected");
      }
    } catch {
      setSyncStatus("offline");
    }
    isSaving.current = false;
    setSaving(false);
  }, []);

  const onChange = useCallback(
    (field, value) => {
      const newInputs = { ...inputs, [field]: value };
      setInputs(newInputs);
      save(newInputs);
    },
    [inputs, save]
  );

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  const r = calc(inputs);

  const syncColors = { connected: "var(--green)", offline: "var(--red)", connecting: "var(--yellow)" };
  const syncLabels = { connected: "Synced", offline: "Offline", connecting: "Connecting..." };

  return (
    <div className="app-container">
      <div className="header">
        <h1 className="header-title">100 Larkhall St, St. John&apos;s, NL</h1>
        <a className="header-link" href="https://www.realtor.ca/real-estate/29486289/100-larkhall-street-st-johns" target="_blank" rel="noopener noreferrer">REALTOR.ca</a>
        <div className="header-sync">
          <span className="sync-dot" style={{ background: syncColors[syncStatus] }} />
          <span>
            {syncLabels[syncStatus]}
            {saving && " \u2014 saving..."}
            {lastSaved && !saving && ` \u00b7 ${new Date(lastSaved).toLocaleString()}`}
          </span>
        </div>
      </div>

      <div className="two-col">
        <div>
          <Section title="Purchase Assumptions">
            <InputRow label="Purchase Price" field="purchasePrice" inputs={inputs} onChange={onChange} step={5000} />
            <InputRow label="Down Payment %" field="downPaymentPct" inputs={inputs} onChange={onChange} prefix="" suffix="%" step={5} />
            <ResultRow label="Down Payment $" value={fmt(r.downPayment)} />
            <InputRow label="Closing Costs (est. 3%)" field="closingCostPct" inputs={inputs} onChange={onChange} prefix="" suffix="%" step={0.5} note="Legal, inspection, land transfer" />
            <InputRow label="Mortgage Rate (5yr fixed)" field="mortgageRate" inputs={inputs} onChange={onChange} prefix="" suffix="%" step={0.1} />
            <InputRow label="Amortization (years)" field="amortYears" inputs={inputs} onChange={onChange} prefix="" suffix="yr" step={5} />
            <ResultRow label="Monthly Mortgage Payment (P&I)" value={fmt(r.monthlyMortgage)} />
            <ResultRow label="Mortgage Amount" value={fmt(r.mortgage)} />
          </Section>

          <Section title="Renovation Budget">
            <InputRow label="New BR upstairs (wall + door)" field="newBrUpstairs" inputs={inputs} onChange={onChange} step={500} note="Split room beside dining room — handyman job" />
            <InputRow label="New BR middle floor (wall + door)" field="newBrMiddle" inputs={inputs} onChange={onChange} step={500} note="Bottom of stairs on lower level" />
            <InputRow label="Painting (new rooms only)" field="paintingNewRooms" inputs={inputs} onChange={onChange} step={100} note="Handyman $20/hr, gets discounts on paint" />
            <InputRow label="Contingency" field="contingencyPct" inputs={inputs} onChange={onChange} prefix="" suffix="%" step={5} />
            <ResultRow label="Total Renovation" value={fmt(r.totalReno)} />
          </Section>

          <Section title="Funding Breakdown">
            <ResultRow label="Down Payment" value={fmt(r.downPayment)} />
            <ResultRow label="Closing Costs" value={fmt(r.closingCosts)} />
            <ResultRow label="Renovation" value={fmt(r.totalReno)} />
            <ResultRow label="Total Cash Needed" value={fmt(r.totalCashIn)} />
            <InputRow label="Your Cash (out of pocket)" field="yourCash" inputs={inputs} onChange={onChange} step={5000} />
            <ResultRow label="Parent Loan Needed" value={fmt(r.parentLoan)} highlight />
          </Section>

          <Section title="Monthly Income">
            <InputRow label="Number of Rooms" field="numRooms" inputs={inputs} onChange={onChange} prefix="" suffix="rooms" step={1} />
            <InputRow label="Rent per Room (utilities included)" field="rentPerRoom" inputs={inputs} onChange={onChange} step={25} />
            <InputRow label="Vacancy Rate" field="vacancyPct" inputs={inputs} onChange={onChange} prefix="" suffix="%" step={1} note="Near MUN & Health Sciences – strong demand" />
            <ResultRow label="Gross Monthly Rent" value={fmt(r.grossRent)} />
            <ResultRow label="Effective Gross Income (EGI)" value={fmt(r.egi)} />
          </Section>

          <Section title="Monthly Operating Expenses">
            <ResultRow label="Mortgage (P&I)" value={fmt(r.monthlyMortgage)} />
            <InputRow label="Property Tax (annual)" field="propertyTaxAnnual" inputs={inputs} onChange={onChange} step={100} note="$2,530/yr per REALTOR.ca listing" />
            <InputRow label="Insurance" field="insurance" inputs={inputs} onChange={onChange} step={10} />
            <InputRow label="Utilities – Winter peak (Jan)" field="utilitiesWinter" inputs={inputs} onChange={onChange} step={50} note="Electric baseboard + oil heat; 3390 sqft" />
            <InputRow label="Utilities – Summer low (Jul)" field="utilitiesSummer" inputs={inputs} onChange={onChange} step={50} note="Lights, hot water, minimal heat" />
            <ResultRow label="Utilities (12-mo avg)" value={fmt(r.utilitiesAvg)} note="Seasonal cosine curve Jan→Dec" />
            <UtilityChart months={r.utilByMonth} />
            <InputRow label="Maintenance & CapEx Reserve" field="maintenance" inputs={inputs} onChange={onChange} step={25} note="1968 build – budget conservatively" />
            <InputRow label="Property Management (10% of gross per room)" field="pmPct" inputs={inputs} onChange={onChange} prefix="" suffix="%" step={1} note="Your existing PM arrangement" />
            <ResultRow label="Total Monthly Expenses" value={fmt(r.totalExpenses)} />
          </Section>
        </div>

        <div>
          <Section title="Cash Flow">
            <ResultRow label="Monthly Cash Flow" value={fmt(r.monthlyCF)} highlight />
            <ResultRow label="Annual Cash Flow" value={fmt(r.annualCF)} highlight />
          </Section>

          <Section title="Key Metrics">
            <ResultRow label="Cap Rate" value={pct(r.capRate)} note="NOI / Total Cost (purchase + reno)" />
            <ResultRow label="Cash-on-Cash Return" value={pct(r.coc)} note="Annual CF / Total Cash In" />
            <ResultRow label="DSCR (Debt Service Coverage)" value={isFinite(r.dscr) ? r.dscr.toFixed(2) + "x" : "N/A"} note="NOI / Debt Service; >1.2x = healthy" />
            <ResultRow label="Gross Rent Multiplier" value={r.grm.toFixed(1) + "x"} />
            <ResultRow label="Break-even Occupancy" value={pct(r.breakeven)} note="Expenses / Gross Rent" />
            <ResultRow label="Monthly CF per Door" value={fmt(r.cfPerDoor)} />
          </Section>

          <Section title="What-If Scenario">
            <ScenarioAnalysis inputs={inputs} />
          </Section>
        </div>
      </div>
    </div>
  );
}
