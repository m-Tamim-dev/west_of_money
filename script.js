document.getElementById('year').textContent = new Date().getFullYear();

/* ============ LOADING SEQUENCE ============ */
const ash = document.getElementById('ash');
const ember = document.getElementById('ember');
const pct = document.getElementById('pct');
const sub = document.getElementById('loaderSub');
const loader = document.getElementById('loader');
const main = document.getElementById('main');

const messages = [
  "জ্বলছে...",
  "টান দিচ্ছি...",
  "প্রায় শেষ...",
  "ছাই হয়ে যাচ্ছে...",
  "শেষ টান..."
];

let progress = 0;
const duration = 3200;
const start = performance.now();

function frame(now){
  const elapsed = now - start;
  progress = Math.min(100, (elapsed / duration) * 100);

  const burnPct = progress + '%';
  ash.style.setProperty('--burn', burnPct);
  ember.style.setProperty('--burn', burnPct);
  document.querySelector('.smoke-plume').style.setProperty('--burnpx', (progress/100 * 340) + 'px');

  if(progress > 82){
    const fade = Math.max(0, 1 - (progress - 82) / 18);
    ember.style.opacity = fade;
    ember.style.transform = `translateX(-50%) scale(${0.5 + fade * 0.6})`;
  } else {
    ember.style.opacity = 1;
    ember.style.transform = '';
  }

  pct.innerHTML = Math.floor(progress) + '<span>%</span>';
  const msgIndex = Math.min(messages.length - 1, Math.floor((progress/100) * messages.length));
  sub.textContent = messages[msgIndex];

  if(progress < 100){
    requestAnimationFrame(frame);
  } else {
    sub.textContent = "নিভে গেলো...";
    setTimeout(() => {
      loader.classList.add('done');
      main.classList.add('show');
      setTimeout(() => { loader.style.display = 'none'; }, 1000);
    }, 500);
  }
}
requestAnimationFrame(frame);

/* ============ AMBIENT SITE-WIDE SMOKE + ASH PARTICLES ============ */
const ambientLayer = document.getElementById('ambientLayer');
const AMBIENT_COUNT = 22;

function spawnAmbientParticle(initial){
  const el = document.createElement('div');
  const isEmber = Math.random() < 0.25;
  el.className = 'ambient-particle' + (isEmber ? ' ember-fleck' : '');

  const size = isEmber ? (2 + Math.random() * 3) : (6 + Math.random() * 16);
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.style.left = Math.random() * 100 + 'vw';

  const duration = 10 + Math.random() * 14;
  const delay = initial ? Math.random() * duration : 0;
  el.style.animationDuration = duration + 's';
  el.style.animationDelay = '-' + delay + 's';
  el.style.setProperty('--ax', (Math.random() * 160 - 80) + 'px');

  ambientLayer.appendChild(el);
}

for(let i = 0; i < AMBIENT_COUNT; i++){
  spawnAmbientParticle(true);
}

/* ============ PROFILE CARD SCROLL-IN ANIMATION ============ */
const profileCards = document.querySelectorAll('.profile-card');
profileCards.forEach((card, i) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(30px)';
  card.style.transition = `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`;
});

const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

profileCards.forEach(card => cardObserver.observe(card));

/* ============ SMOKE SESSION TIMER (CALCULATOR) ============ */
const cigCountInput = document.getElementById('cigCount');
const cigMinutesInput = document.getElementById('cigMinutes');
const totalTimeEl = document.getElementById('totalTime');
const percentHourEl = document.getElementById('percentHour');
const calcBurnt = document.getElementById('calcBurnt');
const calcNote = document.getElementById('calcNote');

document.getElementById('incCig').addEventListener('click', () => {
  cigCountInput.value = Math.min(60, parseInt(cigCountInput.value || 0) + 1);
  updateCalc();
});
document.getElementById('decCig').addEventListener('click', () => {
  cigCountInput.value = Math.max(1, parseInt(cigCountInput.value || 0) - 1);
  updateCalc();
});
document.getElementById('incMin').addEventListener('click', () => {
  cigMinutesInput.value = Math.min(30, parseInt(cigMinutesInput.value || 0) + 1);
  updateCalc();
});
document.getElementById('decMin').addEventListener('click', () => {
  cigMinutesInput.value = Math.max(1, parseInt(cigMinutesInput.value || 0) - 1);
  updateCalc();
});
cigCountInput.addEventListener('input', updateCalc);
cigMinutesInput.addEventListener('input', updateCalc);

const funNotes = [
  "এক কাপ চা ঠান্ডা হওয়ার আগেই তুমি এতগুলা টান শেষ করবা।",
  "এই সময়ে তুমি একটা ছোট গান শুনে ফেলতে পারতা।",
  "এতক্ষণে একটা এপিসোডের অর্ধেক দেখে ফেলা যায়।",
  "এই সময়টা আড্ডা দিলেও চলে যেত, তাই না?",
  "হিসাব করে দেখো, মাসে এটা কতবার হয়..."
];

function updateCalc(){
  let count = parseInt(cigCountInput.value) || 1;
  let mins = parseInt(cigMinutesInput.value) || 1;
  count = Math.max(1, Math.min(60, count));
  mins = Math.max(1, Math.min(30, mins));

  const totalMinutes = count * mins;
  let timeText;
  if(totalMinutes < 60){
    timeText = totalMinutes + ' মিনিট';
  } else {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    timeText = h + ' ঘণ্টা' + (m > 0 ? ' ' + m + ' মিনিট' : '');
  }
  totalTimeEl.textContent = timeText;

  const percentOfHour = Math.min(999, Math.round((totalMinutes / 60) * 100));
  percentHourEl.textContent = percentOfHour + '%';

  const burnWidth = Math.min(100, (totalMinutes / 180) * 100);
  calcBurnt.style.width = burnWidth + '%';

  const noteIndex = Math.min(funNotes.length - 1, Math.floor(count / 4));
  calcNote.textContent = funNotes[noteIndex];
}
updateCalc();

/* ============ RANDOM SMOKE PICKER ============ */
const pickerNames = [
  "Tamim londe", "Tushar Tute", "Midul laure",
  "Irfan muthmare", "Mahim", "Iftekhar"
];

const pickerDisplay = document.getElementById('pickerDisplay');
const pickerBtn = document.getElementById('pickerBtn');
const pickerList = document.getElementById('pickerList');

pickerNames.forEach(name => {
  const chip = document.createElement('span');
  chip.className = 'picker-chip';
  chip.textContent = name;
  chip.dataset.name = name;
  pickerList.appendChild(chip);
});

let pickerRolling = false;

pickerBtn.addEventListener('click', () => {
  if(pickerRolling) return;
  pickerRolling = true;
  pickerBtn.disabled = true;
  pickerDisplay.classList.remove('picked');
  pickerDisplay.classList.add('rolling');

  document.querySelectorAll('.picker-chip').forEach(c => c.classList.remove('active'));

  let rolls = 0;
  const maxRolls = 16 + Math.floor(Math.random() * 8);

  const rollInterval = setInterval(() => {
    const randomName = pickerNames[Math.floor(Math.random() * pickerNames.length)];
    pickerDisplay.textContent = randomName;
    rolls++;

    if(rolls >= maxRolls){
      clearInterval(rollInterval);
      const finalName = pickerNames[Math.floor(Math.random() * pickerNames.length)];
      pickerDisplay.textContent = finalName;
      pickerDisplay.classList.remove('rolling');
      pickerDisplay.classList.add('picked');

      document.querySelectorAll('.picker-chip').forEach(c => {
        if(c.dataset.name === finalName) c.classList.add('active');
      });

      pickerRolling = false;
      pickerBtn.disabled = false;
    }
  }, 90);
});

/* ============ SPIN WHEEL ============ */
const brands = [
  "মার্লবোরো গোল্ড",
  "শেখ",
  "গোল্ডলিফ সুইচ",
  "ক্যামেল লাল",
  "বেনসন",
  "মন্ড স্ট্রোব্রেরি",
  "লাকি স্ট্রাইক সাদা",
  "রয়্যাল",
  "মার্লবোরো রেড এডভান্স",
  "নেভি",
  "গোল্ডলিফ",
  "এলডি",
  "ক্যামেল",
  "মন্ড অ্যাপল",
  "বেনসন সুইচ",
  "হলিউড",
  "মার্লবোরো এডভান্স",
  "লাকি স্ট্রাইক লাল",
  "গোল্ডলিফ লাইট",
  "বেনসন লাইট"
];

const wheelColors = [
  "#d4622f","#f7a561","#8a5a15","#e8b355",
  "#b5471f","#c98a2e","#a9721c","#7a4f10",
  "#e0813f","#c4720a","#9c6a2e","#6b4310",
  "#d98a4a","#b56a1f","#8f5220","#e6a35c",
  "#a5601f","#7a4a15","#c98850","#5f3f10"
];

const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spinBtn');
const spinResult = document.getElementById('spinResult');

function buildWheel(){
  const n = brands.length;
  const slice = 360 / n;
  let gradientParts = [];
  brands.forEach((b, i) => {
    const startA = i * slice;
    const endA = startA + slice;
    gradientParts.push(`${wheelColors[i % wheelColors.length]} ${startA}deg ${endA}deg`);
  });
  wheel.style.background = `conic-gradient(${gradientParts.join(",")})`;

  brands.forEach((b, i) => {
    const angle = i * slice + slice / 2;
    const label = document.createElement('span');
    label.className = 'segment-label';
    label.textContent = b;
    label.style.transform = `rotate(${angle}deg) translate(95px, -6px)`;
    wheel.appendChild(label);
  });
}
buildWheel();

let currentRotation = 0;
let spinning = false;

spinBtn.addEventListener('click', () => {
  if (spinning) return;

  spinning = true;
  spinBtn.disabled = true;
  spinResult.textContent = "";

  const n = brands.length;
  const slice = 360 / n;

  // Random brand
  const randomIndex = Math.floor(Math.random() * n);

  // Pointer is at 12 o'clock
  const targetAngle = 360 - (randomIndex * slice + slice / 2);

  const extraSpins = 5 * 360;

  currentRotation += extraSpins + targetAngle - (currentRotation % 360);

  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    spinResult.textContent = "🚬 " + brands[randomIndex];
    spinning = false;
    spinBtn.disabled = false;
  }, 4600);
});
/* =====================================
   CALCULATOR
===================================== */

const display = document.getElementById("display");

function appendValue(value) {
    display.value += value;
}

function clearDisplay() {
    display.value = "";
}

function deleteLast() {
    display.value = display.value.slice(0, -1);
}

function calculate() {
    try {
        let expression = display.value.replace(/%/g, "/100");
        let result = eval(expression);

        if (result === undefined) {
            display.value = "";
        } else {
            display.value = result;
        }
    } catch (error) {
        display.value = "Error";

        setTimeout(() => {
            display.value = "";
        }, 1000);
    }
}

/* Keyboard Support */

document.addEventListener("keydown", function (e) {

    const key = e.key;

    if (
        (key >= "0" && key <= "9") ||
        key === "+" ||
        key === "-" ||
        key === "*" ||
        key === "/" ||
        key === "." ||
        key === "%"
    ) {
        appendValue(key);
    }

    else if (key === "Enter") {
        e.preventDefault();
        calculate();
    }

    else if (key === "Backspace") {
        deleteLast();
    }

    else if (key === "Escape") {
        clearDisplay();
    }

});
/* ============ CREW SESSION CALCULATOR ============ */
let ccItems = [];
let ccPayers = [];
let ccLastTotal = 0;

const ccItemList = document.getElementById('ccItemList');
const ccPayerList = document.getElementById('ccPayerList');
const ccResult = document.getElementById('ccResult');
const ccSettleResult = document.getElementById('ccSettleResult');
const ccHistoryList = document.getElementById('ccHistoryList');

// ---- আইটেম যোগ ----
document.getElementById('ccAddItemBtn').addEventListener('click', () => {
  const name = document.getElementById('ccItemName').value.trim();
  const price = parseFloat(document.getElementById('ccItemPrice').value);
  const qty = parseInt(document.getElementById('ccItemQty').value) || 1;

  if(!name || isNaN(price) || price <= 0){
    alert('নাম আর সঠিক দাম দাও।');
    return;
  }

  ccItems.push({ id: Date.now(), name, price, qty });
  document.getElementById('ccItemName').value = '';
  document.getElementById('ccItemPrice').value = '';
  document.getElementById('ccItemQty').value = '1';
  renderCcItems();
});

function renderCcItems(){
  ccItemList.innerHTML = '';
  ccItems.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cc-item-row';
    row.innerHTML = `
      <span class="cc-item-info">${item.name} <span class="cc-item-sub">× ${item.qty}</span></span>
      <span class="cc-item-total">৳${item.price * item.qty}</span>
      <button class="cc-remove-btn" data-id="${item.id}">✕</button>
    `;
    row.querySelector('.cc-remove-btn').addEventListener('click', () => {
      ccItems = ccItems.filter(i => i.id !== item.id);
      renderCcItems();
    });
    ccItemList.appendChild(row);
  });
}

// ---- পেয়ার (কে কত দিলো) যোগ ----
document.getElementById('ccAddPayerBtn').addEventListener('click', () => {
  const name = document.getElementById('ccPayerName').value.trim();
  const amount = parseFloat(document.getElementById('ccPayerAmount').value);

  if(!name || isNaN(amount) || amount < 0){
    alert('নাম আর সঠিক টাকার পরিমাণ দাও।');
    return;
  }

  ccPayers.push({ id: Date.now(), name, amount });
  document.getElementById('ccPayerName').value = '';
  document.getElementById('ccPayerAmount').value = '';
  renderCcPayers();
});

function renderCcPayers(){
  ccPayerList.innerHTML = '';
  ccPayers.forEach(p => {
    const row = document.createElement('div');
    row.className = 'cc-payer-row';
    row.innerHTML = `
      <span>${p.name}</span>
      <span class="cc-payer-amount">৳${p.amount}</span>
      <button class="cc-remove-btn" data-id="${p.id}">✕</button>
    `;
    row.querySelector('.cc-remove-btn').addEventListener('click', () => {
      ccPayers = ccPayers.filter(x => x.id !== p.id);
      renderCcPayers();
    });
    ccPayerList.appendChild(row);
  });
}

// ---- Calculate Session ----
document.getElementById('ccCalcBtn').addEventListener('click', () => {
  if(ccItems.length === 0){
    alert('আগে অন্তত একটা আইটেম যোগ করো।');
    return;
  }
  const total = ccItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const members = Math.max(1, parseInt(document.getElementById('ccMembers').value) || 1);
  const perPerson = (total / members).toFixed(2);
  ccLastTotal = total;

  let rowsHtml = ccItems.map(i =>
    `<div class="cc-result-row"><span>${i.name} (× ${i.qty})</span><span>৳${i.price * i.qty}</span></div>`
  ).join('');

  ccResult.innerHTML = `
    ${rowsHtml}
    <div class="cc-result-divider"></div>
    <div class="cc-result-total">
      <span class="cc-total-label">💰 Total</span>
      <span class="cc-total-value">৳${total}</span>
    </div>
    <div class="cc-result-perperson">👥 ${members} জন — মাথাপিছু <b>৳${perPerson}</b></div>
  `;
  ccResult.classList.add('show');
});

// ---- Settle Up (কে কার কাছে কত পাবে) ----
document.getElementById('ccSettleBtn').addEventListener('click', () => {
  if(ccLastTotal === 0){
    alert('আগে "Calculate Session" চাপো।');
    return;
  }
  if(ccPayers.length === 0){
    alert('আগে কে কত টাকা দিছে সেটা যোগ করো।');
    return;
  }

  const members = Math.max(1, parseInt(document.getElementById('ccMembers').value) || 1);
  const fairShare = ccLastTotal / members;

  ccSettleResult.innerHTML = ccPayers.map(p => {
    const diff = p.amount - fairShare;
    let cls = 'zero', text = '৳0';
    if(diff > 0.5){ cls = 'plus'; text = `+৳${diff.toFixed(2)} পাবে`; }
    else if(diff < -0.5){ cls = 'minus'; text = `−৳${Math.abs(diff).toFixed(2)} দিবে`; }
    return `<div class="cc-settle-row"><span>${p.name}</span><span class="${cls}">${text}</span></div>`;
  }).join('');
});

// ---- Session History (localStorage তে সেভ) ----
function loadCcHistory(){
  const raw = localStorage.getItem('smokecircle_sessions');
  return raw ? JSON.parse(raw) : [];
}

function renderCcHistory(){
  const history = loadCcHistory();
  ccHistoryList.innerHTML = '';

  if(history.length === 0){
    ccHistoryList.innerHTML = '<div class="cc-history-empty">এখনো কোনো সেশন সেভ করা হয়নি।</div>';
    return;
  }

  history.slice().reverse().forEach(session => {
    const card = document.createElement('div');
    card.className = 'cc-history-card';
    const chips = session.items.map(i => `<span class="cc-history-chip">${i.name} × ${i.qty}</span>`).join('');
    card.innerHTML = `
      <div class="cc-history-date">📅 ${session.date}</div>
      <div class="cc-history-items">${chips}</div>
      <div class="cc-history-total">
        <span>${session.members} জন সদস্য</span>
        <span>৳${session.total}</span>
      </div>
      <button class="cc-history-delete" data-id="${session.id}">মুছে ফেলো</button>
    `;
    card.querySelector('.cc-history-delete').addEventListener('click', () => {
      const updated = loadCcHistory().filter(s => s.id !== session.id);
      localStorage.setItem('smokecircle_sessions', JSON.stringify(updated));
      renderCcHistory();
    });
    ccHistoryList.appendChild(card);
  });
}

document.getElementById('ccSaveBtn').addEventListener('click', () => {
  if(ccItems.length === 0 || ccLastTotal === 0){
    alert('সেভ করার আগে অন্তত একটা আইটেম যোগ করে "Calculate Session" চাপো।');
    return;
  }
  const members = Math.max(1, parseInt(document.getElementById('ccMembers').value) || 1);
  const session = {
    id: Date.now(),
    date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
    items: ccItems,
    total: ccLastTotal,
    members: members
  };
  const history = loadCcHistory();
  history.push(session);
  localStorage.setItem('smokecircle_sessions', JSON.stringify(history));

  // রিসেট করে নতুন সেশনের জন্য প্রস্তুত করো
  ccItems = [];
  ccPayers = [];
  ccLastTotal = 0;
  renderCcItems();
  renderCcPayers();
  ccResult.classList.remove('show');
  ccSettleResult.innerHTML = '';
  document.getElementById('ccMembers').value = 1;

  renderCcHistory();
  alert('সেশন সেভ হয়ে গেছে! ✅');
});

renderCcHistory();
/* ============ FALLING CIGARETTES ANIMATION ============ */
const cigRainLayer = document.getElementById('cigRainLayer');
const CIG_RAIN_COUNT = 10;

function spawnFallingCig(initial){
  const cig = document.createElement('div');
  cig.className = 'falling-cig';

  const tip = document.createElement('div');
  tip.className = 'tip';
  cig.appendChild(tip);

  const startLeft = Math.random() * 100;
  cig.style.left = startLeft + 'vw';

  const fallDuration = 8 + Math.random() * 10;
  const delay = initial ? Math.random() * fallDuration : 0;
  cig.style.animationDuration = fallDuration + 's';
  cig.style.animationDelay = '-' + delay + 's';

  // পাশ থেকে দুলতে দুলতে পড়া (drift) + ঘোরা (rotation)
  cig.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
  cig.style.setProperty('--r0', (Math.random() * 60 - 30) + 'deg');
  cig.style.setProperty('--r1', (360 + Math.random() * 360) + 'deg');

  const scale = 0.6 + Math.random() * 0.8;
  cig.style.transform = `scale(${scale})`;

  cigRainLayer.appendChild(cig);
}

for(let i = 0; i < CIG_RAIN_COUNT; i++){
  spawnFallingCig(true);
}