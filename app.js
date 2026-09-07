// =========================================================
// Bilingual General Aptitude Testing System - Logic Engine
// Features: Dual-language switching, 10 Sets x 50 Questions (500 Total),
// Interactive Practice Stopwatch & Test Countdown Timers,
// Interactive Scratchpad, Formula Sheet, and Scoring Engine.
// Note: All numbers strictly formatted in English digits (0-9). No flags.
// =========================================================

// Aptitude Formula Cheat Sheet Data (Bilingual - English Numbers Only)
const formulaSheetData = [
  {
    topic: { en: "Time & Work", bn: "সময় ও কার্য" },
    formulas: [
      {
        name: { en: "Combined Work (2 persons)", bn: "দুই জনের যৌথ কাজ" },
        formula: "Time = (A × B) / (A + B)",
        desc: { en: "When A takes A days and B takes B days individually.", bn: "যখন A নেয় A দিন এবং B নেয় B দিন।" }
      },
      {
        name: { en: "Work-Men-Days Formula", bn: "শ্রমিক-দিন-ঘন্টা সূত্র" },
        formula: "(M1 × D1 × H1) / W1 = (M2 × D2 × H2) / W2",
        desc: { en: "Relates Men, Days, Hours per day and Work units.", bn: "লোকসংখ্যা, দিন, দৈনিক ঘন্টা এবং মোট কাজের অনুপাত।" }
      }
    ]
  },
  {
    topic: { en: "Speed, Time & Distance", bn: "গতিবেগ, সময় ও দূরত্ব" },
    formulas: [
      {
        name: { en: "Unit Conversion (km/h to m/s)", bn: "একক রূপান্তর (কিমি/ঘণ্টা থেকে মি/সেকেন্ড)" },
        formula: "1 km/h = 5/18 m/s | 1 m/s = 18/5 km/h",
        desc: { en: "Multiply by 5/18 or 18/5 for instant unit swap.", bn: "5/18 বা 18/5 দ্বারা গুণ করে দ্রুত রূপান্তর করুন।" }
      },
      {
        name: { en: "Average Speed (Equal Distances)", bn: "গড় গতিবেগ (সমান দূরত্বের জন্য)" },
        formula: "Avg Speed = (2 × x × y) / (x + y)",
        desc: { en: "When traveling same distance at speed x and returning at speed y.", bn: "একই দূরত্ব x এবং y গতিবেগে যাতায়াত করলে।" }
      }
    ]
  },
  {
    topic: { en: "Percentage & Profit/Loss", bn: "শতকরা এবং লাভ-ক্ষতি" },
    formulas: [
      {
        name: { en: "Profit & Loss %", bn: "লাভ ও ক্ষতির শতকরা হার" },
        formula: "Profit % = (Profit / CP) × 100 | Loss % = (Loss / CP) × 100",
        desc: { en: "Profit/Loss is always computed on Cost Price (CP).", bn: "লাভ বা ক্ষতি সর্বদা ক্রয়মূল্যের (CP) ওপর হিসাব হয়।" }
      },
      {
        name: { en: "Selling Price from CP & Profit%", bn: "ক্রয়মূল্য ও লাভ% থেকে বিক্রয়মূল্য" },
        formula: "SP = CP × (100 + P%) / 100",
        desc: { en: "Direct multiplier for sale value.", bn: "সরাসরি বিক্রয়মূল্য নির্ধারণের সূত্র।" }
      }
    ]
  },
  {
    topic: { en: "Simple & Compound Interest", bn: "সরল ও চক্রবৃদ্ধি সুদ" },
    formulas: [
      {
        name: { en: "Simple Interest", bn: "সরল সুদ" },
        formula: "SI = (P × R × T) / 100",
        desc: { en: "P = Principal, R = Rate % p.a., T = Time in years.", bn: "P = আসল, R = বার্ষিক সুদের হার, T = বছর।" }
      },
      {
        name: { en: "Compound Interest Amount", bn: "চক্রবৃদ্ধি সুদে-আসল" },
        formula: "A = P × (1 + R/100)^T | CI = A - P",
        desc: { en: "For annual compounding.", bn: "বার্ষিক চক্রবৃদ্ধি সুদের ক্ষেত্রে।" }
      }
    ]
  },
  {
    topic: { en: "Clocks & Angles", bn: "ঘড়ি ও কাঁটার মধ্যবর্তী কোণ" },
    formulas: [
      {
        name: { en: "Angle between Clock Hands", bn: "ঘড়ির কাঁটাদ্বয়ের মধ্যকার কোণ" },
        formula: "θ = | 30 × H - (11/2) × M |",
        desc: { en: "H = Hours (1 to 12), M = Minutes (0 to 59).", bn: "H = ঘন্টা (1 থেকে 12), M = মিনিট (0 থেকে 59)।" }
      }
    ]
  }
];

// Application State
const state = {
  language: 'both', // 'both', 'en', 'bn'
  mode: 'practice', // 'practice', 'test', 'bookmarks'
  selectedSet: 'all', // 'all', '1', '2', ..., '10'
  category: 'all',
  difficulty: 'all',
  searchQuery: '',
  theme: localStorage.getItem('aptitude_theme') || 'dark',
  bookmarks: JSON.parse(localStorage.getItem('aptitude_bookmarks') || '[]'),
  soundEnabled: true,
  
  // Practice Stopwatch State
  stopwatchSeconds: 0,
  stopwatchRunning: false,
  stopwatchInterval: null,

  // Test Mode State
  testActive: false,
  timerSeconds: 45 * 60, // 45 minutes for 50 questions
  timerInterval: null,
  testAnswers: {}, // { [questionId]: selectedOptionIndex }
  testFlags: new Set(), // Set of question IDs flagged for review
  currentTestIndex: 0
};

// DOM Element Selectors
const elements = {
  questionsContainer: document.getElementById('questionsContainer'),
  totalQuestionsCount: document.getElementById('totalQuestionsCount'),
  practiceCount: document.getElementById('practiceCount'),
  bookmarkCount: document.getElementById('bookmarkCount'),
  
  // Stopwatch elements
  practiceStopwatchDisplay: document.getElementById('practiceStopwatchDisplay'),
  btnToggleStopwatch: document.getElementById('btnToggleStopwatch'),
  btnResetStopwatch: document.getElementById('btnResetStopwatch'),
  
  // Filters & Search
  searchInput: document.getElementById('searchInput'),
  setFilter: document.getElementById('setFilter'),
  categoryFilter: document.getElementById('categoryFilter'),
  difficultyFilter: document.getElementById('difficultyFilter'),
  setPillsList: document.getElementById('setPillsList'),
  
  // Test HUD
  testHud: document.getElementById('testHud'),
  testTimerDisplay: document.getElementById('testTimerDisplay'),
  testProgressText: document.getElementById('testProgressText'),
  testProgressBar: document.getElementById('testProgressBar'),
  testPalette: document.getElementById('testPalette'),
  btnSubmitTest: document.getElementById('btnSubmitTest'),
  
  // Modals
  scratchpadModal: document.getElementById('scratchpadModal'),
  formulaModal: document.getElementById('formulaModal'),
  resultsModal: document.getElementById('resultsModal'),
  formulaContainer: document.getElementById('formulaContainer'),
  
  // Scratchpad Canvas
  scratchpadCanvas: document.getElementById('scratchpadCanvas'),
  toastContainer: document.getElementById('toastContainer')
};

// Web Audio API Sound Generator for Feedback
class SoundFX {
  constructor() {
    this.ctx = null;
  }
  
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playCorrect() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playWrong() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(164.81, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }
}

const sfx = new SoundFX();

// Initialize Application
function initApp() {
  applyTheme(state.theme);
  setupEventListeners();
  setupStopwatch();
  renderFormulaSheet();
  initScratchpad();
  updateStats();
  renderQuestions();
}

// Stopwatch Controller for Practice Mode
function setupStopwatch() {
  if (!elements.btnToggleStopwatch) return;
  
  elements.btnToggleStopwatch.addEventListener('click', () => {
    if (state.stopwatchRunning) {
      clearInterval(state.stopwatchInterval);
      state.stopwatchRunning = false;
      elements.btnToggleStopwatch.innerHTML = '<i class="fas fa-play"></i>';
      showToast('Stopwatch Paused');
    } else {
      state.stopwatchRunning = true;
      elements.btnToggleStopwatch.innerHTML = '<i class="fas fa-pause"></i>';
      showToast('Stopwatch Started');
      state.stopwatchInterval = setInterval(() => {
        state.stopwatchSeconds++;
        const mins = Math.floor(state.stopwatchSeconds / 60);
        const secs = state.stopwatchSeconds % 60;
        if (elements.practiceStopwatchDisplay) {
          elements.practiceStopwatchDisplay.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
      }, 1000);
    }
  });

  if (elements.btnResetStopwatch) {
    elements.btnResetStopwatch.addEventListener('click', () => {
      clearInterval(state.stopwatchInterval);
      state.stopwatchRunning = false;
      state.stopwatchSeconds = 0;
      if (elements.btnToggleStopwatch) {
        elements.btnToggleStopwatch.innerHTML = '<i class="fas fa-play"></i>';
      }
      if (elements.practiceStopwatchDisplay) {
        elements.practiceStopwatchDisplay.innerText = '00:00';
      }
      showToast('Stopwatch Reset');
    });
  }
}

// Theme Switcher
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  state.theme = theme;
  localStorage.setItem('aptitude_theme', theme);
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.innerHTML = theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
  }
}

// Event Listeners Setup
function setupEventListeners() {
  // Theme toggle
  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    applyTheme(state.theme === 'light' ? 'dark' : 'light');
  });

  // Sound toggle
  const soundBtn = document.getElementById('soundToggleBtn');
  soundBtn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    soundBtn.innerHTML = state.soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
    showToast(state.soundEnabled ? 'Audio Feedback Enabled' : 'Audio Feedback Muted');
  });

  // Language switch buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      state.language = target.dataset.lang;
      renderQuestions();
      showToast(`Language: ${target.dataset.lang.toUpperCase()}`);
    });
  });

  // Mode switcher tabs
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      setMode(target.dataset.mode);
    });
  });

  // Quick Set Pills Click
  if (elements.setPillsList) {
    elements.setPillsList.querySelectorAll('.set-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        elements.setPillsList.querySelectorAll('.set-pill').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const setVal = e.currentTarget.dataset.set;
        state.selectedSet = setVal;
        if (elements.setFilter) elements.setFilter.value = setVal;
        if (state.mode === 'test') {
          renderTestPalette();
          updateTestProgress();
        }
        renderQuestions();
        showToast(setVal === 'all' ? 'All Sets (500 Questions)' : `Selected Set ${setVal} (50 Questions)`);
      });
    });
  }

  // Set filter dropdown change
  if (elements.setFilter) {
    elements.setFilter.addEventListener('change', (e) => {
      const setVal = e.target.value;
      state.selectedSet = setVal;
      if (elements.setPillsList) {
        elements.setPillsList.querySelectorAll('.set-pill').forEach(p => {
          p.classList.toggle('active', p.dataset.set === setVal);
        });
      }
      if (state.mode === 'test') {
        renderTestPalette();
        updateTestProgress();
      }
      renderQuestions();
      const setName = e.target.options[e.target.selectedIndex].text;
      showToast(`Selected: ${setName}`);
    });
  }

  // Search input
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    renderQuestions();
  });

  // Category filter
  elements.categoryFilter.addEventListener('change', (e) => {
    state.category = e.target.value;
    renderQuestions();
  });

  // Difficulty filter
  elements.difficultyFilter.addEventListener('change', (e) => {
    state.difficulty = e.target.value;
    renderQuestions();
  });

  // Scratchpad Modal openers/closers
  document.getElementById('btnOpenScratchpad').addEventListener('click', () => openModal(elements.scratchpadModal));
  document.getElementById('btnCloseScratchpad').addEventListener('click', () => closeModal(elements.scratchpadModal));

  // Formula Modal openers/closers
  document.getElementById('btnOpenFormulas').addEventListener('click', () => openModal(elements.formulaModal));
  document.getElementById('btnCloseFormulas').addEventListener('click', () => closeModal(elements.formulaModal));

  // Results Modal closers
  document.getElementById('btnCloseResults').addEventListener('click', () => closeModal(elements.resultsModal));
  document.getElementById('btnRetakeTest').addEventListener('click', () => {
    closeModal(elements.resultsModal);
    startTestMode();
  });

  // Submit test button
  elements.btnSubmitTest.addEventListener('click', () => {
    if (confirm('Are you sure you want to submit your test? / আপনি কি নিশ্চিত যে আপনি পরীক্ষা জমা দিতে চান?')) {
      finishTestMode();
    }
  });

  // Print button
  document.getElementById('btnPrintPage').addEventListener('click', () => {
    window.print();
  });

  // Close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });
}

// Mode Management
function setMode(mode) {
  state.mode = mode;
  
  if (mode === 'test') {
    startTestMode();
  } else {
    stopTestTimer();
    elements.testHud.classList.remove('visible');
    elements.testPalette.classList.remove('visible');
    renderQuestions();
  }
}

// Test Mode Handling
function startTestMode() {
  state.testActive = true;
  state.testAnswers = {};
  state.testFlags.clear();
  
  // Set default timer: 45 minutes for 50 questions
  state.timerSeconds = 45 * 60;
  
  elements.testHud.classList.add('visible');
  elements.testPalette.classList.add('visible');
  
  updateTimerDisplay();
  startTestTimer();
  renderQuestions();
  renderTestPalette();
  updateTestProgress();
  showToast('Test Started! Time: 45 Minutes');
}

function startTestTimer() {
  stopTestTimer();
  state.timerInterval = setInterval(() => {
    state.timerSeconds--;
    updateTimerDisplay();
    
    if (state.timerSeconds <= 60) {
      elements.testTimerDisplay.classList.add('urgent');
    }
    
    if (state.timerSeconds <= 0) {
      stopTestTimer();
      alert('Time is up! Submitting your test automatically.');
      finishTestMode();
    }
  }, 1000);
}

function stopTestTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function updateTimerDisplay() {
  const min = Math.floor(state.timerSeconds / 60);
  const sec = state.timerSeconds % 60;
  elements.testTimerDisplay.innerHTML = `<i class="fas fa-stopwatch"></i> ${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function renderTestPalette() {
  const filtered = getFilteredQuestions();
  elements.testPalette.innerHTML = filtered.map((q, idx) => {
    const isAnswered = state.testAnswers[q.id] !== undefined;
    const isFlagged = state.testFlags.has(q.id);
    let classes = 'palette-btn';
    if (isAnswered) classes += ' answered';
    if (isFlagged) classes += ' flagged';
    
    return `<button class="${classes}" onclick="scrollToQuestion(${q.id})">${idx + 1}</button>`;
  }).join('');
}

function updateTestProgress() {
  const filtered = getFilteredQuestions();
  const answeredCount = Object.keys(state.testAnswers).length;
  const total = filtered.length;
  const pct = total > 0 ? (answeredCount / total) * 100 : 0;
  
  elements.testProgressText.innerText = `Answered: ${answeredCount} / ${total}`;
  elements.testProgressBar.style.width = `${pct}%`;
  renderTestPalette();
}

function scrollToQuestion(id) {
  const card = document.getElementById(`qcard-${id}`);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.style.outline = '2px solid var(--accent-cyan)';
    setTimeout(() => card.style.outline = 'none', 1500);
  }
}

function finishTestMode() {
  stopTestTimer();
  state.testActive = false;
  
  const filtered = getFilteredQuestions();
  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;
  
  filtered.forEach(q => {
    const userChoice = state.testAnswers[q.id];
    if (userChoice === undefined) {
      unattemptedCount++;
    } else if (userChoice === q.correctIndex) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });
  
  const total = filtered.length;
  const scorePct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  
  // Render Test Results Modal
  document.getElementById('resultTotalQuestions').innerText = total;
  document.getElementById('resultCorrect').innerText = correctCount;
  document.getElementById('resultWrong').innerText = wrongCount;
  document.getElementById('resultUnattempted').innerText = unattemptedCount;
  document.getElementById('resultScorePercent').innerText = `${scorePct}%`;
  
  const scoreCircle = document.getElementById('resultScoreCircle');
  if (scoreCircle) {
    scoreCircle.style.setProperty('--score-pct', scorePct);
  }
  
  openModal(elements.resultsModal);
  
  // Switch to review mode (keep explanations visible)
  elements.testHud.classList.remove('visible');
  elements.testPalette.classList.remove('visible');
  state.mode = 'practice';
  renderQuestions(true); // render with test results review
}

// Question Filtering
function getFilteredQuestions() {
  return aptitudeQuestions.filter(q => {
    // Mode Bookmark filter
    if (state.mode === 'bookmarks' && !state.bookmarks.includes(q.id)) {
      return false;
    }

    // Set filter
    if (state.selectedSet !== 'all' && q.setId !== parseInt(state.selectedSet)) {
      return false;
    }
    
    // Category filter
    if (state.category !== 'all' && q.category !== state.category) {
      return false;
    }
    
    // Difficulty filter
    if (state.difficulty !== 'all' && q.difficulty !== state.difficulty) {
      return false;
    }
    
    // Search filter (English & Bengali)
    if (state.searchQuery) {
      const qEn = q.question.en.toLowerCase();
      const qBn = q.question.bn.toLowerCase();
      const topicEn = q.topic.en.toLowerCase();
      const topicBn = q.topic.bn.toLowerCase();
      const matches = qEn.includes(state.searchQuery) ||
                      qBn.includes(state.searchQuery) ||
                      topicEn.includes(state.searchQuery) ||
                      topicBn.includes(state.searchQuery);
      if (!matches) return false;
    }
    
    return true;
  });
}

// Render Questions List
function renderQuestions(reviewMode = false) {
  const filtered = getFilteredQuestions();
  if (elements.totalQuestionsCount) {
    elements.totalQuestionsCount.innerText = filtered.length;
  }
  
  if (filtered.length === 0) {
    elements.questionsContainer.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <i class="fas fa-search" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <h3>No questions found / কোনো প্রশ্ন পাওয়া যায়নি</h3>
        <p>Try resetting your filters or search keywords.</p>
        <button class="btn-primary" style="margin-top: 1rem;" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  elements.questionsContainer.innerHTML = filtered.map((q, idx) => {
    const isBookmarked = state.bookmarks.includes(q.id);
    const isFlagged = state.testFlags.has(q.id);
    const selectedAnswer = state.testAnswers[q.id];
    const isPractice = state.mode === 'practice' || reviewMode;

    // Badges
    const categoryClass = `badge-${q.category}`;
    const diffClass = `badge-${q.difficulty}`;
    
    // Options rendering
    const optionsHtml = q.options.en.map((optEn, optIdx) => {
      const optBn = q.options.bn[optIdx];
      let itemClass = 'option-item';
      
      if (isPractice && selectedAnswer !== undefined) {
        if (optIdx === q.correctIndex) {
          itemClass += ' correct';
        } else if (optIdx === selectedAnswer) {
          itemClass += ' wrong';
        }
      } else if (selectedAnswer === optIdx) {
        itemClass += ' selected';
      }

      return `
        <div class="${itemClass}" onclick="handleOptionSelect(${q.id}, ${optIdx}, ${reviewMode})" id="opt-${q.id}-${optIdx}">
          <div class="option-text-container">
            ${state.language !== 'bn' ? `<div class="option-text-en">${optEn}</div>` : ''}
            ${state.language !== 'en' ? `<div class="option-text-bn">${optBn}</div>` : ''}
          </div>
          <div class="option-indicator">
            ${String.fromCharCode(65 + optIdx)}
          </div>
        </div>
      `;
    }).join('');

    // Question statement
    const questionHtml = `
      <div class="question-text-wrapper">
        ${state.language !== 'bn' ? `<div class="question-text-en">${q.question.en}</div>` : ''}
        ${state.language !== 'en' ? `<div class="question-text-bn">${q.question.bn}</div>` : ''}
      </div>
    `;

    // Explanation Box (Rich Step-by-Step Descriptive Solution)
    const isExplanationVisible = (isPractice && selectedAnswer !== undefined) || reviewMode;
    const explanationHtml = `
      <div class="explanation-box ${isExplanationVisible ? 'visible' : ''}" id="exp-${q.id}">
        <div class="explanation-title">
          <i class="fas fa-lightbulb"></i>
          <span>${state.language === 'bn' ? 'ধাপে ধাপে বিস্তারিত সমাধান' : 'Step-by-Step Descriptive Solution'}</span>
        </div>
        <div class="explanation-content">
          ${state.language !== 'bn' ? `<div style="margin-bottom: 8px;">${q.explanation.en}</div>` : ''}
          ${state.language !== 'en' ? `<div class="lang-bn" style="color: #67e8f9;">${q.explanation.bn}</div>` : ''}
        </div>
        ${q.tips ? `
          <div class="explanation-tip">
            <strong><i class="fas fa-bolt"></i> Shortcut Trick / শর্টকাট কৌশল:</strong><br>
            ${state.language !== 'bn' ? `<div>${q.tips.en}</div>` : ''}
            ${state.language !== 'en' ? `<div class="lang-bn">${q.tips.bn}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;

    return `
      <div class="question-card" id="qcard-${q.id}">
        <div class="card-header">
          <div class="card-badges">
            <span class="badge badge-qnum">Set ${q.setId || 1} &bull; Q #${idx + 1}</span>
            <span class="badge ${categoryClass}">
              ${state.language === 'bn' ? q.categoryName.bn : q.categoryName.en}
            </span>
            <span class="badge" style="background: rgba(255,255,255,0.06); color: var(--text-secondary);">
              ${state.language === 'bn' ? q.topic.bn : q.topic.en}
            </span>
            <span class="badge ${diffClass}">
              ${state.language === 'bn' ? q.difficultyName.bn : q.difficultyName.en}
            </span>
          </div>
          <div class="card-actions">
            ${state.mode === 'test' ? `
              <button class="card-tool-btn ${isFlagged ? 'bookmarked' : ''}" title="Flag for review" onclick="toggleTestFlag(${q.id})">
                <i class="fas fa-flag"></i>
              </button>
            ` : ''}
            <button class="card-tool-btn ${isBookmarked ? 'bookmarked' : ''}" title="Bookmark Question" onclick="toggleBookmark(${q.id})">
              <i class="fas fa-bookmark"></i>
            </button>
          </div>
        </div>

        ${questionHtml}

        <div class="options-grid">
          ${optionsHtml}
        </div>

        ${explanationHtml}

        ${state.mode === 'practice' && !reviewMode ? `
          <div class="card-footer">
            <button class="btn-reveal-solution" onclick="toggleExplanation(${q.id})">
              <i class="fas fa-eye"></i> ${isExplanationVisible ? 'Hide Solution' : 'Show Solution / সমাধান দেখুন'}
            </button>
            <span style="font-size: 0.8rem; color: var(--text-muted);">
              Click any option to verify instantly
            </span>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Option Click Handler
function handleOptionSelect(questionId, optionIndex, isReview = false) {
  if (isReview) return;
  
  const question = aptitudeQuestions.find(q => q.id === questionId);
  if (!question) return;

  state.testAnswers[questionId] = optionIndex;

  if (state.mode === 'practice') {
    // Sound FX
    if (optionIndex === question.correctIndex) {
      sfx.playCorrect();
      showToast('Correct Answer! / সঠিক উত্তর! 🎉');
    } else {
      sfx.playWrong();
      showToast('Incorrect Answer / ভুল উত্তর ❌');
    }
    
    // Update card styling
    renderQuestions();
  } else if (state.mode === 'test') {
    updateTestProgress();
    renderQuestions();
  }
}

// Toggle Solution Box
function toggleExplanation(questionId) {
  const expBox = document.getElementById(`exp-${questionId}`);
  if (expBox) {
    expBox.classList.toggle('visible');
  }
}

// Flagging for review in Test Mode
function toggleTestFlag(questionId) {
  if (state.testFlags.has(questionId)) {
    state.testFlags.delete(questionId);
    showToast('Question unflagged');
  } else {
    state.testFlags.add(questionId);
    showToast('Question flagged for review 🚩');
  }
  renderQuestions();
  renderTestPalette();
}

// Bookmarking
function toggleBookmark(questionId) {
  const idx = state.bookmarks.indexOf(questionId);
  if (idx > -1) {
    state.bookmarks.splice(idx, 1);
    showToast('Removed from Bookmarks');
  } else {
    state.bookmarks.push(questionId);
    showToast('Saved to Bookmarks ⭐');
  }
  localStorage.setItem('aptitude_bookmarks', JSON.stringify(state.bookmarks));
  updateStats();
  renderQuestions();
}

function updateStats() {
  if (elements.practiceCount) {
    elements.practiceCount.innerText = aptitudeQuestions.length;
  }
  if (elements.bookmarkCount) {
    elements.bookmarkCount.innerText = state.bookmarks.length;
  }
}

function resetFilters() {
  state.selectedSet = 'all';
  state.category = 'all';
  state.difficulty = 'all';
  state.searchQuery = '';
  if (elements.setFilter) elements.setFilter.value = 'all';
  if (elements.setPillsList) {
    elements.setPillsList.querySelectorAll('.set-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.set === 'all');
    });
  }
  elements.categoryFilter.value = 'all';
  elements.difficultyFilter.value = 'all';
  elements.searchInput.value = '';
  renderQuestions();
}

// Modal Helpers
function openModal(modal) {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (modal === elements.scratchpadModal && window.resizeScratchpad) {
    setTimeout(window.resizeScratchpad, 50);
  }
}

function closeModal(modal) {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Toast Notifications
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-info-circle" style="color: var(--accent-cyan);"></i> <span>${message}</span>`;
  elements.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Render Formula Sheet
function renderFormulaSheet() {
  elements.formulaContainer.innerHTML = formulaSheetData.map(topic => {
    return `
      <div class="formula-topic-card">
        <div class="formula-topic-title">
          <i class="fas fa-square-root-alt"></i> ${topic.topic.en} / ${topic.topic.bn}
        </div>
        ${topic.formulas.map(f => `
          <div class="formula-row">
            <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 2px;">
              ${f.name.en} <span style="color: var(--text-secondary);">(${f.name.bn})</span>
            </div>
            <div class="formula-math">${f.formula}</div>
            <div style="font-size: 0.82rem; color: var(--text-secondary);">
              ${f.desc.en} | <span class="lang-bn">${f.desc.bn}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

// Scratchpad Canvas Engine
function initScratchpad() {
  const canvas = elements.scratchpadCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  function resizeCanvas() {
    const parentWidth = canvas.parentElement.clientWidth || window.innerWidth - 32;
    const parentHeight = window.innerWidth <= 768 ? window.innerHeight - 200 : 380;
    
    // Save image before resize
    let imgData;
    try {
      if (canvas.width > 0 && canvas.height > 0) {
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }
    } catch (e) {}

    canvas.width = parentWidth;
    canvas.height = parentHeight;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (imgData) {
      try { ctx.putImageData(imgData, 0, 0); } catch (e) {}
    }
  }
  
  window.resizeScratchpad = resizeCanvas;
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  let drawing = false;
  let currentColor = '#38bdf8';
  let lineWidth = 3;

  function startPosition(e) {
    drawing = true;
    draw(e);
  }

  function endPosition() {
    drawing = false;
    ctx.beginPath();
  }

  function draw(e) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  canvas.addEventListener('mousedown', startPosition);
  canvas.addEventListener('mouseup', endPosition);
  canvas.addEventListener('mousemove', draw);
  
  canvas.addEventListener('touchstart', (e) => {
    if (e.cancelable) e.preventDefault();
    startPosition(e);
  }, { passive: false });

  canvas.addEventListener('touchend', endPosition, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (e.cancelable) e.preventDefault();
    draw(e);
  }, { passive: false });

  document.getElementById('btnClearScratch').addEventListener('click', () => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  document.getElementById('colorYellow').addEventListener('click', () => { currentColor = '#facc15'; lineWidth = 3; });
  document.getElementById('colorCyan').addEventListener('click', () => { currentColor = '#38bdf8'; lineWidth = 3; });
  document.getElementById('colorWhite').addEventListener('click', () => { currentColor = '#ffffff'; lineWidth = 3; });
  document.getElementById('colorEraser').addEventListener('click', () => { currentColor = '#0f172a'; lineWidth = 18; });
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', initApp);
