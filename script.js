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
/* ============ SMOKE RING STREAK COUNTER ============ */
const ringStage = document.getElementById('ringStage');
const ringBtn = document.getElementById('ringBtn');
const streakNumber = document.getElementById('streakNumber');
const streakSub = document.getElementById('streakSub');

// ---- রিং বানানোর অ্যানিমেশন ----
ringBtn.addEventListener('click', () => {
  const ring = document.createElement('div');
  ring.className = 'smoke-ring';
  ring.style.setProperty('--ring-dx', (Math.random() * 40 - 20) + 'px');
  ringStage.appendChild(ring);

  setTimeout(() => ring.remove(), 2300);
});

// ---- Streak হিসাব (localStorage দিয়ে) ----
function todayStr(){
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function daysBetween(d1, d2){
  const a = new Date(d1);
  const b = new Date(d2);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function updateStreak(){
  const today = todayStr();
  const lastVisit = localStorage.getItem('smokecircle_lastVisit');
  let streak = parseInt(localStorage.getItem('smokecircle_streak')) || 0;

  if(lastVisit === today){
    // আজকে আগেই ভিজিট হয়েছে, কিছু বদলাবে না
  } else if(lastVisit && daysBetween(lastVisit, today) === 1){
    // ঠিক গতকালও ভিজিট হয়েছিল — streak বাড়বে
    streak += 1;
  } else {
    // গ্যাপ পড়ে গেছে বা প্রথমবার — streak রিসেট
    streak = 1;
  }

  localStorage.setItem('smokecircle_lastVisit', today);
  localStorage.setItem('smokecircle_streak', streak);

  streakNumber.textContent = streak;

  if(streak === 1){
    streakSub.textContent = "নতুন করে শুরু — আজকে থেকে গোনা শুরু 🔥";
  } else if(streak < 5){
    streakSub.textContent = "স্ট্রিক বাড়তেছে, চালিয়ে যাও 💨";
  } else {
    streakSub.textContent = `${streak} দিন ধরে টানা! গ্রুপ সিরিয়াসলি অ্যাক্টিভ 🔥`;
  }
}
updateStreak();
/* ============ BIRTHDAY TRACKER ============ */
// তোমার বন্ধুদের জন্মদিন এখানে বসাও — month হচ্ছে 1=জানুয়ারি, 12=ডিসেম্বর
const birthdays = [
  { name: "Tamim londe", day: 14, month: 3 },
  { name: "Tushar Tute", day: 22, month: 7 },
  { name: "Midul laure", day: 5, month: 9 },
  { name: "Irfan muthmare", day: 30, month: 11 },
  { name: "Mahim", day: 18, month: 1 },
  { name: "Iftekhar", day: 9, month: 6 }
];

function daysUntilBirthday(day, month){
  const today = new Date();
  today.setHours(0,0,0,0);

  let next = new Date(today.getFullYear(), month - 1, day);
  if(next < today){
    next = new Date(today.getFullYear() + 1, month - 1, day);
  }

  const diffMs = next - today;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

const monthNamesBn = [
  "জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন",
  "জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"
];

function renderBirthdays(){
  const withCountdown = birthdays.map(b => ({
    ...b,
    daysLeft: daysUntilBirthday(b.day, b.month)
  })).sort((a, b) => a.daysLeft - b.daysLeft);

  // ---- সবচেয়ে কাছেরটা হাইলাইট ----
  const next = withCountdown[0];
  const highlightEl = document.getElementById('bdayNextHighlight');

  if(next.daysLeft === 0){
    highlightEl.innerHTML = `
      <div class="bh-label">🎉 আজকে জন্মদিন</div>
      <div class="bh-name">${next.name}</div>
      <div class="bh-days">🎂</div>
      <div class="bh-sub">সবাই মিলে উইশ করো!</div>
    `;
  } else {
    highlightEl.innerHTML = `
      <div class="bh-label">পরবর্তী জন্মদিন</div>
      <div class="bh-name">${next.name}</div>
      <div class="bh-days">${next.daysLeft}</div>
      <div class="bh-sub">দিন বাকি</div>
    `;
  }

  // ---- সবার কার্ড ----
  const grid = document.getElementById('bdayGrid');
  grid.innerHTML = '';

  withCountdown.forEach(b => {
    const card = document.createElement('div');
    card.className = 'bday-card';
    if(b.daysLeft === 0) card.classList.add('today');
    else if(b.daysLeft <= 7) card.classList.add('soon');

    let countdownText;
    if(b.daysLeft === 0) countdownText = '🎉 আজকেই!';
    else if(b.daysLeft === 1) countdownText = 'আগামীকাল';
    else countdownText = `আর ${b.daysLeft} দিন বাকি`;

    card.innerHTML = `
      <div class="bc-name">${b.name}</div>
      <div class="bc-date">${b.day} ${monthNamesBn[b.month - 1]}</div>
      <div class="bc-countdown">${countdownText}</div>
    `;
    grid.appendChild(card);
  });
}
renderBirthdays();
/* ============ LIGHTER FLICK CHALLENGE ============ */
const lighterBtn = document.getElementById('lighterBtn');
const flame = document.getElementById('flame');
const sparkWrap = document.getElementById('sparkWrap');
const lighterTime = document.getElementById('lighterTime');
const lighterClicks = document.getElementById('lighterClicks');
const lighterResult = document.getElementById('lighterResult');
const lbList = document.getElementById('lbList');

let gameActive = false;
let startTime = 0;
let clickCount = 0;
let requiredClicks = 0;
let timerInterval = null;

function startNewAttempt(){
  gameActive = true;
  clickCount = 0;
  startTime = performance.now();
  requiredClicks = 3 + Math.floor(Math.random() * 5); // ৩ থেকে ৭ ক্লিক লাগবে
  flame.classList.remove('lit');
  lighterResult.textContent = '';
  lighterResult.classList.remove('win');
  lighterClicks.textContent = '0';
  lighterTime.textContent = '0.00s';

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const elapsed = (performance.now() - startTime) / 1000;
    lighterTime.textContent = elapsed.toFixed(2) + 's';
  }, 40);
}

function spawnSpark(){
  for(let i = 0; i < 5; i++){
    const s = document.createElement('div');
    s.className = 'spark';
    s.style.setProperty('--sx', (Math.random() * 24 - 12) + 'px');
    s.style.setProperty('--sy', (-10 - Math.random() * 20) + 'px');
    sparkWrap.appendChild(s);
    setTimeout(() => s.remove(), 400);
  }
}

lighterBtn.addEventListener('click', () => {
  if(!gameActive){
    startNewAttempt();
    return;
  }

  clickCount++;
  lighterClicks.textContent = clickCount;

  if(clickCount >= requiredClicks){
    // সফলভাবে জ্বলে গেলো
    gameActive = false;
    clearInterval(timerInterval);
    const finalTime = (performance.now() - startTime) / 1000;
    lighterTime.textContent = finalTime.toFixed(2) + 's';
    flame.classList.add('lit');
    lighterResult.textContent = `🔥 জ্বলে গেলো! ${clickCount} ক্লিকে, ${finalTime.toFixed(2)} সেকেন্ডে।`;
    lighterResult.classList.add('win');

    saveLighterScore(finalTime, clickCount);
    lighterBtn.textContent = '🔁 আবার চেষ্টা করো';
  } else {
    // মিস — স্পার্ক দেখাবে
    spawnSpark();
    lighterBtn.textContent = '🔥 Flick করো';
  }
});

function saveLighterScore(time, clicks){
  const raw = localStorage.getItem('smokecircle_lighterScores');
  const scores = raw ? JSON.parse(raw) : [];
  scores.push({ time: time, clicks: clicks, date: new Date().toLocaleDateString('bn-BD') });
  scores.sort((a, b) => a.time - b.time);
  const top5 = scores.slice(0, 5);
  localStorage.setItem('smokecircle_lighterScores', JSON.stringify(top5));
  renderLeaderboard();
}

function renderLeaderboard(){
  const raw = localStorage.getItem('smokecircle_lighterScores');
  const scores = raw ? JSON.parse(raw) : [];

  if(scores.length === 0){
    lbList.innerHTML = '<div class="lb-empty">এখনো কেউ চেষ্টা করেনি — প্রথম হও!</div>';
    return;
  }

  lbList.innerHTML = scores.map((s, i) => `
    <div class="lb-row">
      <span class="lb-rank">#${i + 1}</span>
      <span class="lb-time">${s.time.toFixed(2)}s</span>
      <span class="lb-clicks">${s.clicks} ক্লিক</span>
    </div>
  `).join('');
}
renderLeaderboard();
/* ============ TODAY'S PAYER POLL ============ */
const pollCandidates = [
  "Tamim londe", "Tushar Tute", "Midul laure",
  "Irfan muthmare", "Mahim", "Iftekhar"
];

const pollOptionsEl = document.getElementById('pollOptions');
const pollWinnerEl = document.getElementById('pollWinner');
const pollResetBtn = document.getElementById('pollResetBtn');

function pollTodayKey(){
  const d = new Date();
  return `smokecircle_poll_${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function loadPollVotes(){
  const raw = localStorage.getItem(pollTodayKey());
  if(raw) return JSON.parse(raw);
  const fresh = {};
  pollCandidates.forEach(name => fresh[name] = 0);
  return fresh;
}

function saveMyVote(name){
  localStorage.setItem('smokecircle_poll_myvote_' + pollTodayKey(), name);
}
function getMyVote(){
  return localStorage.getItem('smokecircle_poll_myvote_' + pollTodayKey());
}

function renderPoll(){
  const votes = loadPollVotes();
  const myVote = getMyVote();
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  pollOptionsEl.innerHTML = '';

  pollCandidates.forEach(name => {
    const count = votes[name] || 0;
    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

    const opt = document.createElement('div');
    opt.className = 'poll-option';
    if(myVote === name) opt.classList.add('voted-for');
    if(myVote) opt.classList.add('disabled');

    opt.innerHTML = `
      <div class="poll-option-fill" style="width:${pct}%"></div>
      <div class="poll-option-content">
        <span class="poll-option-name">${myVote === name ? '✅ ' : ''}${name}</span>
        <span class="poll-option-stats">
          <span class="poll-option-count">${count} ভোট</span>
          <span class="poll-option-pct">${pct}%</span>
        </span>
      </div>
    `;

    if(!myVote){
      opt.addEventListener('click', () => {
        votes[name] = (votes[name] || 0) + 1;
        localStorage.setItem(pollTodayKey(), JSON.stringify(votes));
        saveMyVote(name);
        renderPoll();
      });
    }

    pollOptionsEl.appendChild(opt);
  });

  // ---- সবচেয়ে বেশি ভোট পাওয়া জন হাইলাইট ----
  if(totalVotes > 0){
    let winner = pollCandidates[0];
    let maxVotes = -1;
    pollCandidates.forEach(name => {
      if((votes[name] || 0) > maxVotes){
        maxVotes = votes[name] || 0;
        winner = name;
      }
    });
    pollWinnerEl.innerHTML = `
      <div class="pw-label">এগিয়ে আছে</div>
      <div class="pw-name">🎯 ${winner}</div>
    `;
    pollWinnerEl.classList.add('show');
  } else {
    pollWinnerEl.classList.remove('show');
  }
}

pollResetBtn.addEventListener('click', () => {
  if(!confirm('নতুন করে পোল শুরু করলে আজকের সব ভোট মুছে যাবে। নিশ্চিত?')) return;
  const fresh = {};
  pollCandidates.forEach(name => fresh[name] = 0);
  localStorage.setItem(pollTodayKey(), JSON.stringify(fresh));
  localStorage.removeItem('smokecircle_poll_myvote_' + pollTodayKey());
  renderPoll();
});

renderPoll();
/* ============ ASH CATCH GAME ============ */
const gameSetup = document.getElementById('gameSetup');
const gameHud = document.getElementById('gameHud');
const gameStage = document.getElementById('gameStage');
const gameOverEl = document.getElementById('gameOver');
const gameScoreEl = document.getElementById('gameScore');
const gameTimerEl = document.getElementById('gameTimer');
const goScoreEl = document.getElementById('goScore');
const gameLbList = document.getElementById('gameLbList');
const gameDiscountNote = document.getElementById('gameDiscountNote');

let gameScore = 0;
let gameTimeLeft = 30;
let gameCountdownInterval = null;
let gameSpawnInterval = null;
let gamePlayerName = '';
let gameRunning = false;

document.getElementById('gameStartBtn').addEventListener('click', () => {
  gamePlayerName = document.getElementById('gamePlayerSelect').value;
  startGame();
});
document.getElementById('gamePlayAgainBtn').addEventListener('click', () => {
  gameOverEl.style.display = 'none';
  startGame();
});

function startGame(){
  gameScore = 0;
  gameTimeLeft = 30;
  gameRunning = true;
  gameScoreEl.textContent = '0';
  gameTimerEl.textContent = '30';
  gameSetup.style.display = 'none';
  gameOverEl.style.display = 'none';
  gameHud.style.display = 'flex';
  gameStage.innerHTML = '';

  gameCountdownInterval = setInterval(() => {
    gameTimeLeft--;
    gameTimerEl.textContent = gameTimeLeft;
    if(gameTimeLeft <= 0) endGame();
  }, 1000);

  gameSpawnInterval = setInterval(spawnAshTarget, 550);
}

function spawnAshTarget(){
  if(!gameRunning) return;
  const target = document.createElement('div');
  target.className = 'ash-target';

  const stageWidth = gameStage.clientWidth;
  const size = 26;
  target.style.left = Math.random() * (stageWidth - size) + 'px';

  const fallDuration = 1.6 + Math.random() * 1.2;
  target.style.animationDuration = fallDuration + 's';

  target.addEventListener('click', (e) => {
    e.stopPropagation();
    if(target.classList.contains('popped')) return;
    target.classList.add('popped');
    gameScore++;
    gameScoreEl.textContent = gameScore;
    setTimeout(() => target.remove(), 260);
  });

  target.addEventListener('animationend', () => {
    if(!target.classList.contains('popped')) target.remove();
  });

  gameStage.appendChild(target);
}

function endGame(){
  gameRunning = false;
  clearInterval(gameCountdownInterval);
  clearInterval(gameSpawnInterval);
  gameStage.innerHTML = '';
  gameHud.style.display = 'none';
  goScoreEl.textContent = `${gamePlayerName} — স্কোর: ${gameScore}`;
  gameOverEl.style.display = 'block';

  saveGameScore(gamePlayerName, gameScore);
}

function saveGameScore(name, score){
  const raw = localStorage.getItem('smokecircle_ashGameScores');
  const scores = raw ? JSON.parse(raw) : {};

  // প্রতিজনের সবচেয়ে ভালো স্কোরটাই রাখা হবে
  if(!scores[name] || score > scores[name]){
    scores[name] = score;
  }
  localStorage.setItem('smokecircle_ashGameScores', JSON.stringify(scores));
  renderGameLeaderboard();
}

function renderGameLeaderboard(){
  const raw = localStorage.getItem('smokecircle_ashGameScores');
  const scores = raw ? JSON.parse(raw) : {};

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  if(sorted.length === 0){
    gameLbList.innerHTML = '<div class="game-lb-empty">এখনো কেউ খেলেনি — প্রথম হও!</div>';
    gameDiscountNote.textContent = '';
    return;
  }

  gameLbList.innerHTML = sorted.map(([name, score], i) => `
    <div class="game-lb-row ${i === 0 ? 'top' : ''}">
      <span class="game-lb-rank">#${i + 1}</span>
      <span class="game-lb-name">${name}</span>
      <span class="game-lb-score">${score} পয়েন্ট</span>
    </div>
  `).join('');

  const topName = sorted[0][0];
  gameDiscountNote.innerHTML = `🏆 <b>${topName}</b> সবচেয়ে বেশি স্কোর করছে — Crew Calculator-এ ওর জন্য একটু কম শেয়ার বসায় দিও 😄`;
}
renderGameLeaderboard();
/* ============ SKY RUSH PLANE GAME ============ */
(function(){
  const canvas = document.getElementById('pgCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const pgSetup = document.getElementById('pgSetup');
  const pgHud = document.getElementById('pgHud');
  const pgScoreDisplay = document.getElementById('pgScoreDisplay');
  const pgBestDisplay = document.getElementById('pgBestDisplay');
  const pgOverlay = document.getElementById('pgOverlay');
  const pgOverlayScore = document.getElementById('pgOverlayScore');
  const pgHint = document.getElementById('pgHint');

  let playerName = '';
  let running = false;
  let animId = null;

  const plane = { x: 70, y: H/2, vy: 0, w: 36, h: 20, angle: 0 };
  const GRAVITY = 0.32;
  const FLAP = -6.2;

  let obstacles = [];
  let clouds = [];
  let trail = [];
  let score = 0;
  let frame = 0;
  const GAP = 150;
  const OBST_W = 60;
  const SPEED = 2.6;

  function resetGame(){
    plane.y = H/2; plane.vy = 0; plane.angle = 0;
    obstacles = [];
    trail = [];
    score = 0; frame = 0;
    for(let i=0;i<4;i++){
      clouds.push({ x: Math.random()*W, y: 40+Math.random()*180, s: 20+Math.random()*20, sp: 0.3+Math.random()*0.4 });
    }
  }

  function spawnObstacle(){
    const gapY = 70 + Math.random() * (H - 140 - GAP);
    obstacles.push({ x: W + 20, gapY: gapY, passed: false });
  }

  function flap(){
    if(!running) return;
    plane.vy = FLAP;
    for(let i=0;i<4;i++){
      trail.push({ x: plane.x - 10, y: plane.y + (Math.random()*10-5), life: 1 });
    }
  }

  canvas.addEventListener('click', flap);
  canvas.addEventListener('touchstart', (e)=>{ e.preventDefault(); flap(); }, {passive:false});
  window.addEventListener('keydown', (e)=>{
    if(e.code === 'Space' && running){ e.preventDefault(); flap(); }
  });

  function drawPlane(){
    ctx.save();
    ctx.translate(plane.x, plane.y);
    const targetAngle = Math.max(-25, Math.min(50, plane.vy * 4));
    plane.angle += (targetAngle - plane.angle) * 0.15;
    ctx.rotate(plane.angle * Math.PI/180);

    // body
    ctx.fillStyle = '#e84c3d';
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.quadraticCurveTo(0, -8, 18, -2);
    ctx.quadraticCurveTo(22, 0, 18, 2);
    ctx.quadraticCurveTo(0, 8, -16, 0);
    ctx.fill();

    // wing
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(-4, 2);
    ctx.lineTo(-14, 14);
    ctx.lineTo(2, 4);
    ctx.closePath();
    ctx.fill();

    // tail
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(-14, -2);
    ctx.lineTo(-22, -12);
    ctx.lineTo(-10, -3);
    ctx.closePath();
    ctx.fill();

    // cockpit
    ctx.fillStyle = '#eaf7ff';
    ctx.beginPath();
    ctx.ellipse(6, -1, 4, 3, 0, 0, Math.PI*2);
    ctx.fill();

    // propeller (spinning)
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.save();
    ctx.translate(19, 0);
    ctx.rotate(frame * 0.9);
    ctx.beginPath();
    ctx.moveTo(0,-7); ctx.lineTo(0,7);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  function drawTrail(){
    trail.forEach(p => {
      ctx.globalAlpha = p.life * 0.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4 * p.life, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
      p.x -= 1.5; p.life -= 0.04;
    });
    trail = trail.filter(p => p.life > 0);
  }

  function drawCloudShape(x, y, s){
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(x, y, s*0.6, 0, Math.PI*2);
    ctx.arc(x+s*0.5, y+4, s*0.5, 0, Math.PI*2);
    ctx.arc(x-s*0.5, y+4, s*0.45, 0, Math.PI*2);
    ctx.fill();
  }

  function drawBackgroundClouds(){
    clouds.forEach(c => {
      drawCloudShape(c.x, c.y, c.s);
      c.x -= c.sp;
      if(c.x < -40) c.x = W + 40;
    });
  }

  function drawObstacle(o){
    // উপরের বাধা (মেঘের স্তম্ভ)
    ctx.fillStyle = '#8bb8d8';
    ctx.fillRect(o.x, 0, OBST_W, o.gapY);
    ctx.fillStyle = '#a9cbe4';
    for(let i=0;i<3;i++){
      drawCloudShape(o.x + OBST_W/2, o.gapY - 14 - i*16, 26);
    }
    // নিচের বাধা
    ctx.fillStyle = '#8bb8d8';
    ctx.fillRect(o.x, o.gapY + GAP, OBST_W, H - (o.gapY + GAP));
    ctx.fillStyle = '#a9cbe4';
    for(let i=0;i<3;i++){
      drawCloudShape(o.x + OBST_W/2, o.gapY + GAP + 14 + i*16, 26);
    }
  }

  function checkCollision(o){
    const px = plane.x, py = plane.y, pr = 12;
    if(px + pr > o.x && px - pr < o.x + OBST_W){
      if(py - pr < o.gapY || py + pr > o.gapY + GAP){
        return true;
      }
    }
    return false;
  }

  function loop(){
    if(!running) return;
    frame++;
    ctx.clearRect(0,0,W,H);

    // gradient sky
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0, '#bfe3f7');
    g.addColorStop(0.6, '#eaf7ff');
    g.addColorStop(1, '#ffffff');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);

    drawBackgroundClouds();

    // physics
    plane.vy += GRAVITY;
    plane.y += plane.vy;

    if(frame % 100 === 0) spawnObstacle();

    let crashed = false;
    obstacles.forEach(o => {
      o.x -= SPEED;
      drawObstacle(o);
      if(!o.passed && o.x + OBST_W < plane.x){
        o.passed = true;
        score++;
        pgScoreDisplay.textContent = 'স্কোর: ' + score;
      }
      if(checkCollision(o)) crashed = true;
    });
    obstacles = obstacles.filter(o => o.x > -OBST_W);

    if(plane.y - 12 < 0 || plane.y + 12 > H) crashed = true;

    drawTrail();
    drawPlane();

    if(crashed){
      endGame();
      return;
    }

    animId = requestAnimationFrame(loop);
  }

  function startGame(){
    playerName = document.getElementById('pgNameInput').value.trim() || 'Unknown';
    resetGame();
    running = true;
    pgSetup.style.display = 'none';
    pgHud.style.display = 'flex';
    pgOverlay.style.display = 'none';
    pgHint.style.display = 'block';
    pgScoreDisplay.textContent = 'স্কোর: 0';

    const best = getBestScore(playerName);
    pgBestDisplay.textContent = best ? `সেরা: ${best}` : '';

    animId = requestAnimationFrame(loop);
  }

  function endGame(){
    running = false;
    cancelAnimationFrame(animId);
    pgOverlayScore.textContent = `${playerName} — স্কোর: ${score}`;
    pgOverlay.style.display = 'flex';
    saveScore(playerName, score);
  }

  document.getElementById('pgStartBtn').addEventListener('click', startGame);
  document.getElementById('pgRetryBtn').addEventListener('click', startGame);

  function getScores(){
    const raw = localStorage.getItem('smokecircle_planeScores');
    return raw ? JSON.parse(raw) : {};
  }
  function getBestScore(name){
    const scores = getScores();
    return scores[name] || 0;
  }
  function saveScore(name, sc){
    const scores = getScores();
    if(!scores[name] || sc > scores[name]) scores[name] = sc;
    localStorage.setItem('smokecircle_planeScores', JSON.stringify(scores));
    renderPgLeaderboard();
  }

  function renderPgLeaderboard(){
    const scores = getScores();
    const sorted = Object.entries(scores).sort((a,b) => b[1]-a[1]);
    const list = document.getElementById('pgLbList');
    const note = document.getElementById('pgDiscountNote');

    if(sorted.length === 0){
      list.innerHTML = '<div class="pg-lb-empty">এখনো কেউ খেলেনি — প্রথম হও!</div>';
      note.textContent = '';
      return;
    }

    list.innerHTML = sorted.map(([name, sc], i) => `
      <div class="pg-lb-row ${i===0 ? 'top' : ''}">
        <span class="pg-lb-rank">#${i+1}</span>
        <span class="pg-lb-name">${name}</span>
        <span class="pg-lb-score">${sc} পয়েন্ট</span>
      </div>
    `).join('');

    note.innerHTML = `🏆 <b>${sorted[0][0]}</b> সবচেয়ে বেশি স্কোর করছে — Crew Calculator-এ ওর শেয়ার একটু কম বসায় দিও 😄`;
  }

  // প্রথমবার ক্যানভাসে idle preview দেখানো
  ctx.fillStyle = '#eaf7ff';
  ctx.fillRect(0,0,W,H);
  drawPlane();

  renderPgLeaderboard();
})();