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
