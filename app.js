function minimizeApp() {
  window.electronAPI.minimize();
}

function toggleFullScreen() {
  window.electronAPI.toggleFullScreen();
}

function closeApp() {
  window.electronAPI.close();
}


const select = document.getElementById("pair");


select.addEventListener("change", function () {
  if (this.value === "Gold") {
    select.classList.add("gold-mode");
  } else {
    select.classList.remove("gold-mode");
  }
});
// ===== LOT GENERATION =====
const lotSelect = document.getElementById("lot");

for (let i = 1; i <= 100; i++) {
  let val = (i / 100).toFixed(2);
  let opt = document.createElement("option");
  opt.value = val;
  opt.textContent = val;
  lotSelect.appendChild(opt);
}

// ===== INPUTS =====
const pair = document.getElementById("pair");
const balance = document.getElementById("balance");
const entry = document.getElementById("entry");
const profit = document.getElementById("profit");
const lot = document.getElementById("lot");
const account = document.getElementById("account");

// ===== OUTPUTS =====
const tp = document.getElementById("tp");
const sl = document.getElementById("sl");
const tpd = document.getElementById("tpd");
const sld = document.getElementById("sld");
const commissionLabel = document.getElementById("commission");


const tpSell = document.getElementById("tpSell");
const slSell = document.getElementById("slSell");
// ===== SPREAD OUTPUT =====
const btcValueLabel = document.getElementById("btcValue");

// ===== AFTER SPREAD FEE OUTPUT =====
const tpAfterFee = document.getElementById("tpAfterFee");
const slAfterFee = document.getElementById("slAfterFee");

// ===== COMMISSION =====
function getBaseCommission() {
  let acc = account.value;
  let pr = pair.value;

  if (pr === "Gold") {
    if (acc === "Raw Spread") return 7;
    if (acc === "Zero") return 11;
    return 0;
  }

  if (pr === "BTC") {
    if (acc === "Raw Spread") return 4;
    if (acc === "Zero") return 16;
    return 0;
  }

  return 0;
}

// ===== MAIN ENGINE =====
function calculate() {

  let bal = parseFloat(balance.value) || 0;
  let en = parseFloat(entry.value) || 0;
  let prof = parseFloat(profit.value) || 0;
  let lotSize = parseFloat(lot.value) || 0;

  let spreadFee = 0;

  // ======================
  // 🟠 SPREAD FEE (BTC ONLY)
  // ======================
  if (pair.value === "BTC") {

  let acc = account.value;

  if (acc === "Standard") spreadFee = 14;
  else if (acc === "Pro") spreadFee = 9.6;
  else if (acc === "Raw Spread") spreadFee = 8;
  else if (acc === "Zero") spreadFee = 0;

  btcValueLabel.innerText = spreadFee;

} 

else if (pair.value === "Gold") {

  let acc = account.value;

  if (acc === "Standard") spreadFee = 0.32;
  else if (acc === "Pro") spreadFee = 0.22;
  else if (acc === "Raw Spread") spreadFee = 0.05;
  else if (acc === "Zero") spreadFee = 0;

  btcValueLabel.innerText = spreadFee;

} 

else {
  btcValueLabel.innerText = "-";
  spreadFee = 0;
  }
  
  // ===== STOP IF NO LOT =====
  if (lotSize === 0) return;

  // ======================
  // 💰 COMMISSION
  // ======================
  let baseCommission = getBaseCommission();
  let commission = baseCommission * lotSize * 2;

  commissionLabel.innerText = commission.toFixed(2);

  let takeProfit = 0;
  let stopOut = 0;

  // ======================
  // 🟡 GOLD MODEL
  // ======================
  if (pair.value === "Gold") {

    let contractSize = 100;

    takeProfit = en + (prof / (contractSize * lotSize));
    stopOut = en - (bal / (contractSize * lotSize));
  }

  // ======================
  // 🟠 BTC MODEL
  // ======================
  else if (pair.value === "BTC") {

    let equity = bal;
    let priceMove = equity / lotSize;

    takeProfit = en + (prof / lotSize);
    stopOut = en - priceMove;
  }
/*for sale*/
let takeProfitSell = 0;
let stopOutSell = 0;

if (pair.value === "Gold") {

  let contractSize = 100;

  takeProfitSell = en - (prof / (contractSize * lotSize));
  stopOutSell = en + (bal / (contractSize * lotSize));

}

else if (pair.value === "BTC") {

  let equity = bal;
  let priceMove = equity / lotSize;

  takeProfitSell = en - (prof / lotSize);
  stopOutSell = en + priceMove;
}

  // ======================
  // 📏 BASE DISTANCES
  // ======================
  let tpDistance = takeProfit - en;
  let slDistance = en - stopOut;

  // ======================
  // OUTPUT (BASE)
  // ======================
  tp.innerText = takeProfit.toFixed(2);
  sl.innerText = stopOut.toFixed(2);

  tpd.innerText = tpDistance.toFixed(2);
  sld.innerText = slDistance.toFixed(2);
  tpSell.innerText = takeProfitSell.toFixed(2);
  slSell.innerText = stopOutSell.toFixed(2);
  
  const entryShow = document.getElementById("entryShow");
  entryShow.innerText = en.toFixed(2);

  // ======================
  // 📊 AFTER SPREAD FEE
  // ======================
  let tpAfter = tpDistance;
let slAfter = slDistance;

// ======================
// APPLY SPREAD FEE EFFECT
// ======================
if (pair.value === "BTC" || pair.value === "Gold") {
  tpAfter = tpDistance + spreadFee;
  slAfter = slDistance - spreadFee;

  if (slAfter < 0) slAfter = 0;
}

  tpAfterFee.innerText = tpAfter.toFixed(2);
  slAfterFee.innerText = slAfter.toFixed(2);
}

// ===== EVENTS =====
document.querySelectorAll("input, select").forEach(el => {
  el.addEventListener("input", calculate);
});

// ===== AUTO INIT =====
window.addEventListener("load", calculate);