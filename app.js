// =========================================================
// Bilingual General Aptitude Testing System - Logic Engine
// Features: Dual-language switching, 10 Sets x 50 Questions (500 Total),
// Student Login & Profile System, 1-by-1 Single Question Focus Mode,
// Interactive Practice Stopwatch & Test Countdown Timers,
// Mistakes Vault, Performance Analytics & Skill Diagnostics,
// Interactive Scratchpad, Formula Sheet, and Scoring Engine.
// Note: All numbers strictly formatted in English digits (0-9). No flags.
// =========================================================

// Service Worker Registration for PWA / Offline Use
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

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
  mode: 'practice', // 'practice', 'test', 'mistakes', 'bookmarks', 'analytics'
  viewMode: 'single', // 'single' (1-by-1 Focus Mode), 'list' (Scrolling List)
  singleCurrentIndex: 0, // 0-based index in the current filtered list
  selectedSet: 'all', // 'all', '1', '2', ..., '10'
  category: 'all',
  difficulty: 'all',
  searchQuery: '',
  theme: localStorage.getItem('aptitude_theme') || 'dark',
  currentStudent: JSON.parse(localStorage.getItem('aptitude_current_student') || 'null'),
  bookmarks: JSON.parse(localStorage.getItem('aptitude_bookmarks') || '[]'),
  mistakesVault: JSON.parse(localStorage.getItem('aptitude_mistakes') || '[]'),
  testHistory: JSON.parse(localStorage.getItem('aptitude_test_history') || '[]'),
  practiceAttempts: JSON.parse(localStorage.getItem('aptitude_practice_attempts') || '{}'), // { [qId]: { correct: bool } }
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
  testFlags: new Set() // Set of question IDs flagged for review
};

// DOM Element Selectors
const elements = {
  questionsContainer: document.getElementById('questionsContainer'),
  analyticsDashboard: document.getElementById('analyticsDashboard'),
  mainToolbar: document.getElementById('mainToolbar'),
  setPillsContainer: document.getElementById('setPillsContainer'),
  totalQuestionsCount: document.getElementById('totalQuestionsCount'),
  practiceCount: document.getElementById('practiceCount'),
  bookmarkCount: document.getElementById('bookmarkCount'),
  bookmarkModeCount: document.getElementById('bookmarkModeCount'),
  mistakesCount: document.getElementById('mistakesCount'),
  studentNavName: document.getElementById('studentNavName'),
  btnStudentProfile: document.getElementById('btnStudentProfile'),
  btnViewToggle: document.getElementById('btnViewToggle'),
  viewToggleText: document.getElementById('viewToggleText'),
  
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
  studentModal: document.getElementById('studentModal'),
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
  updateStudentUI();
  setupEventListeners();
  setupStopwatch();
  renderFormulaSheet();
  initScratchpad();
  updateStats();
  renderQuestions();
}

// Student Registration, Authentication & Profile System
function getRegisteredStudents() {
  try {
    return JSON.parse(localStorage.getItem('aptitude_registered_students') || '{}');
  } catch (e) {
    return {};
  }
}

function saveRegisteredStudents(students) {
  localStorage.setItem('aptitude_registered_students', JSON.stringify(students));
}

function persistCurrentUserData() {
  localStorage.setItem('aptitude_bookmarks', JSON.stringify(state.bookmarks));
  localStorage.setItem('aptitude_mistakes', JSON.stringify(state.mistakesVault));
  localStorage.setItem('aptitude_test_history', JSON.stringify(state.testHistory));
  localStorage.setItem('aptitude_practice_attempts', JSON.stringify(state.practiceAttempts));

  if (state.currentStudent && state.currentStudent.identifier) {
    const students = getRegisteredStudents();
    if (students[state.currentStudent.identifier]) {
      students[state.currentStudent.identifier].data = {
        bookmarks: state.bookmarks,
        mistakesVault: state.mistakesVault,
        testHistory: state.testHistory,
        practiceAttempts: state.practiceAttempts
      };
      saveRegisteredStudents(students);
    }
  }
}

function switchAuthTab(tab) {
  const tabSignInBtn = document.getElementById('tabSignInBtn');
  const tabSignUpBtn = document.getElementById('tabSignUpBtn');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');

  if (!tabSignInBtn || !tabSignUpBtn || !signInForm || !signUpForm) return;

  if (tab === 'signup') {
    tabSignUpBtn.style.background = 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))';
    tabSignUpBtn.style.color = '#fff';
    tabSignInBtn.style.background = 'transparent';
    tabSignInBtn.style.color = 'var(--text-secondary)';
    signInForm.style.display = 'none';
    signUpForm.style.display = 'block';
  } else {
    tabSignInBtn.style.background = 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))';
    tabSignInBtn.style.color = '#fff';
    tabSignUpBtn.style.background = 'transparent';
    tabSignUpBtn.style.color = 'var(--text-secondary)';
    signInForm.style.display = 'block';
    signUpForm.style.display = 'none';
  }
}

function handleStudentSignUp(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('regName')?.value.trim();
  const identifier = document.getElementById('regIdentifier')?.value.trim().toLowerCase();
  const password = document.getElementById('regPassword')?.value;
  const confirmPassword = document.getElementById('regConfirmPassword')?.value;
  const targetExam = document.getElementById('regTargetExam')?.value || 'General Preparation';
  const dailyGoal = document.getElementById('regDailyGoal')?.value || '20';

  if (!name || !identifier || !password) {
    showToast('Please fill in all required fields');
    return;
  }

  if (password.length < 4) {
    showToast('Password must be at least 4 characters');
    return;
  }

  if (password !== confirmPassword) {
    showToast('Passwords do not match. Please re-enter.');
    return;
  }

  const students = getRegisteredStudents();
  if (students[identifier]) {
    showToast('An account with this email/username already exists. Please Sign In.');
    switchAuthTab('signin');
    const loginIdInput = document.getElementById('loginIdentifier');
    if (loginIdInput) loginIdInput.value = identifier;
    return;
  }

  // Create new student account
  const newAccount = {
    name,
    identifier,
    password,
    targetExam,
    dailyGoal,
    registeredAt: new Date().toLocaleDateString('en-GB'),
    data: {
      bookmarks: [...state.bookmarks],
      mistakesVault: [...state.mistakesVault],
      testHistory: [...state.testHistory],
      practiceAttempts: { ...state.practiceAttempts }
    }
  };

  students[identifier] = newAccount;
  saveRegisteredStudents(students);

  // Set active session
  state.currentStudent = {
    name: newAccount.name,
    identifier: newAccount.identifier,
    targetExam: newAccount.targetExam,
    dailyGoal: newAccount.dailyGoal,
    registeredAt: newAccount.registeredAt
  };
  localStorage.setItem('aptitude_current_student', JSON.stringify(state.currentStudent));

  updateStudentUI();
  closeModal(elements.studentModal);
  showToast(`Welcome, ${name}! Account created successfully 🎉`);
  
  if (document.getElementById('signUpForm')) {
    document.getElementById('signUpForm').reset();
  }
}

function handleStudentSignIn(e) {
  if (e) e.preventDefault();
  const identifier = document.getElementById('loginIdentifier')?.value.trim().toLowerCase();
  const password = document.getElementById('loginPassword')?.value;

  if (!identifier || !password) {
    showToast('Please enter your email/username and password');
    return;
  }

  const students = getRegisteredStudents();
  const student = students[identifier];

  if (!student || student.password !== password) {
    showToast('Invalid username or password. Please try again.');
    return;
  }

  // Restore student data
  state.currentStudent = {
    name: student.name,
    identifier: student.identifier,
    targetExam: student.targetExam,
    dailyGoal: student.dailyGoal,
    registeredAt: student.registeredAt
  };
  localStorage.setItem('aptitude_current_student', JSON.stringify(state.currentStudent));

  if (student.data) {
    state.bookmarks = student.data.bookmarks || [];
    state.mistakesVault = student.data.mistakesVault || [];
    state.testHistory = student.data.testHistory || [];
    state.practiceAttempts = student.data.practiceAttempts || {};
    persistCurrentUserData();
  }

  updateStudentUI();
  updateStats();
  renderQuestions();
  closeModal(elements.studentModal);
  showToast(`Welcome back, ${student.name}! 👋`);

  if (document.getElementById('signInForm')) {
    document.getElementById('signInForm').reset();
  }
}

function updateStudentUI() {
  const authTabs = document.getElementById('authTabs');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const loggedInProfileView = document.getElementById('loggedInProfileView');
  const studentModalTitle = document.getElementById('studentModalTitle');

  if (state.currentStudent && state.currentStudent.name) {
    if (elements.studentNavName) {
      elements.studentNavName.innerText = `${state.currentStudent.name}`;
    }
    if (authTabs) authTabs.style.display = 'none';
    if (signInForm) signInForm.style.display = 'none';
    if (signUpForm) signUpForm.style.display = 'none';
    if (loggedInProfileView) loggedInProfileView.style.display = 'block';
    if (studentModalTitle) studentModalTitle.innerText = 'Student Profile / প্রোফাইল';

    const pName = document.getElementById('profileViewName');
    const pExam = document.getElementById('profileViewExam');
    const pEmail = document.getElementById('profileViewEmail');
    if (pName) pName.innerText = state.currentStudent.name;
    if (pExam) pExam.innerText = `Target: ${state.currentStudent.targetExam || 'General Preparation'}`;
    if (pEmail) pEmail.innerText = state.currentStudent.identifier || 'Signed In';
  } else {
    if (elements.studentNavName) {
      elements.studentNavName.innerText = 'Student Login';
    }
    if (authTabs) authTabs.style.display = 'flex';
    if (loggedInProfileView) loggedInProfileView.style.display = 'none';
    if (studentModalTitle) studentModalTitle.innerText = 'Student Account / ছাত্র অ্যাকাউন্ট';
    switchAuthTab('signin');
  }
}

function logoutStudent() {
  if (confirm('Do you want to log out? Your progress is saved to your account.')) {
    persistCurrentUserData();
    state.currentStudent = null;
    localStorage.removeItem('aptitude_current_student');
    updateStudentUI();
    closeModal(elements.studentModal);
    showToast('Logged out successfully. You are in guest mode.');
  }
}

window.switchAuthTab = switchAuthTab;
window.handleStudentSignIn = handleStudentSignIn;
window.handleStudentSignUp = handleStudentSignUp;
window.logoutStudent = logoutStudent;

// View Toggle (1-by-1 Focus vs Full List)
function toggleViewMode() {
  state.viewMode = (state.viewMode === 'single') ? 'list' : 'single';
  if (elements.viewToggleText) {
    elements.viewToggleText.innerText = (state.viewMode === 'single') ? '1-by-1 View' : 'List View';
  }
  showToast(state.viewMode === 'single' ? '1-by-1 Focus Mode' : 'All Questions List View');
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

  // Student Profile Button
  if (elements.btnStudentProfile) {
    elements.btnStudentProfile.addEventListener('click', () => {
      openModal(elements.studentModal);
    });
  }
  const closeStudentModalBtn = document.getElementById('btnCloseStudentModal');
  if (closeStudentModalBtn) {
    closeStudentModalBtn.addEventListener('click', () => closeModal(elements.studentModal));
  }

  // View Toggle Button
  if (elements.btnViewToggle) {
    elements.btnViewToggle.addEventListener('click', toggleViewMode);
  }

  // Language switch buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      state.language = target.dataset.lang;
      if (state.mode === 'analytics') {
        renderAnalyticsDashboard();
      } else {
        renderQuestions();
      }
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
        state.singleCurrentIndex = 0; // Reset to Q1 of selected set
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
      state.singleCurrentIndex = 0;
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
    state.singleCurrentIndex = 0;
    renderQuestions();
  });

  // Category filter
  elements.categoryFilter.addEventListener('change', (e) => {
    state.category = e.target.value;
    state.singleCurrentIndex = 0;
    renderQuestions();
  });

  // Difficulty filter
  elements.difficultyFilter.addEventListener('change', (e) => {
    state.difficulty = e.target.value;
    state.singleCurrentIndex = 0;
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
  state.singleCurrentIndex = 0;
  
  if (mode === 'test') {
    elements.questionsContainer.style.display = 'block';
    elements.analyticsDashboard.style.display = 'none';
    if (elements.mainToolbar) elements.mainToolbar.style.display = 'flex';
    if (elements.setPillsContainer) elements.setPillsContainer.style.display = 'flex';
    startTestMode();
  } else if (mode === 'analytics') {
    stopTestTimer();
    elements.testHud.classList.remove('visible');
    elements.testPalette.classList.remove('visible');
    elements.questionsContainer.style.display = 'none';
    elements.analyticsDashboard.style.display = 'block';
    if (elements.mainToolbar) elements.mainToolbar.style.display = 'none';
    if (elements.setPillsContainer) elements.setPillsContainer.style.display = 'none';
    renderAnalyticsDashboard();
  } else {
    stopTestTimer();
    elements.testHud.classList.remove('visible');
    elements.testPalette.classList.remove('visible');
    elements.questionsContainer.style.display = 'block';
    elements.analyticsDashboard.style.display = 'none';
    if (elements.mainToolbar) elements.mainToolbar.style.display = 'flex';
    if (elements.setPillsContainer) elements.setPillsContainer.style.display = 'flex';
    renderQuestions();
  }
}

// Test Mode Handling
function startTestMode() {
  state.testActive = true;
  state.testAnswers = {};
  state.testFlags.clear();
  state.singleCurrentIndex = 0;
  
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
    const isCurrent = (state.viewMode === 'single' && state.singleCurrentIndex === idx);
    let classes = 'palette-btn';
    if (isAnswered) classes += ' answered';
    if (isFlagged) classes += ' flagged';
    if (isCurrent) classes += ' current';
    
    return `<button class="${classes}" onclick="jumpToQuestion(${idx})">${idx + 1}</button>`;
  }).join('');
}

function jumpToQuestion(idx) {
  state.singleCurrentIndex = idx;
  if (state.viewMode === 'single') {
    renderQuestions();
  } else {
    const filtered = getFilteredQuestions();
    const targetQ = filtered[idx];
    if (targetQ) scrollToQuestion(targetQ.id);
  }
  renderTestPalette();
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
  const timeTaken = (45 * 60) - state.timerSeconds;
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
      state.practiceAttempts[q.id] = { correct: true };
    } else {
      wrongCount++;
      state.practiceAttempts[q.id] = { correct: false };
      // Auto-save to Mistakes Vault
      if (!state.mistakesVault.includes(q.id)) {
        state.mistakesVault.push(q.id);
      }
    }
  });

  const total = filtered.length;
  const scorePct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  
  // Save to test history log
  const attemptRecord = {
    date: new Date().toLocaleDateString('en-GB'),
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    setName: state.selectedSet === 'all' ? 'All Sets Mock' : `Set ${state.selectedSet}`,
    total: total,
    correct: correctCount,
    wrong: wrongCount,
    scorePct: scorePct,
    timeTakenSeconds: timeTaken
  };
  state.testHistory.unshift(attemptRecord);
  if (state.testHistory.length > 20) state.testHistory.pop();
  
  persistCurrentUserData();

  updateStats();

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
  state.viewMode = 'list'; // Switch to list view for easy review
  renderQuestions(true); // render with test results review
}

// Question Filtering
function getFilteredQuestions() {
  return aptitudeQuestions.filter(q => {
    // Mode Bookmark filter
    if (state.mode === 'bookmarks' && !state.bookmarks.includes(q.id)) {
      return false;
    }

    // Mode Mistakes Vault filter
    if (state.mode === 'mistakes' && !state.mistakesVault.includes(q.id)) {
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

// Render Analytics Dashboard
function renderAnalyticsDashboard() {
  const attempts = Object.values(state.practiceAttempts);
  const totalAttempted = attempts.length;
  const totalCorrect = attempts.filter(a => a.correct).length;
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  
  // Category Breakdown
  const categories = ['quant', 'logical', 'verbal', 'di'];
  const catNames = {
    quant: { en: 'Quantitative Aptitude', bn: 'পরিমাণগত গণিত' },
    logical: { en: 'Logical Reasoning', bn: 'যৌক্তিক যুক্তি' },
    verbal: { en: 'Verbal Ability', bn: 'ভাষাগত দক্ষতা' },
    di: { en: 'Data Interpretation', bn: 'তথ্য বিশ্লেষণ' }
  };
  
  const catStats = {};
  categories.forEach(c => {
    const qList = aptitudeQuestions.filter(q => q.category === c);
    let attempted = 0;
    let correct = 0;
    qList.forEach(q => {
      if (state.practiceAttempts[q.id]) {
        attempted++;
        if (state.practiceAttempts[q.id].correct) correct++;
      }
    });
    const acc = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    catStats[c] = { total: qList.length, attempted, correct, acc };
  });

  elements.analyticsDashboard.innerHTML = `
    <!-- Top Header Overview Card -->
    <div class="analytics-header-card">
      <div>
        <h2 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 4px;">
          ${state.currentStudent ? `${state.currentStudent.name}'s Preparation Analytics` : (state.language === 'bn' ? 'আপনার সামগ্রিক প্রস্তুতি ও অগ্রগতি' : 'Preparation & Performance Analytics')}
        </h2>
        <p style="font-size: 0.88rem; color: var(--text-secondary);">
          ${state.currentStudent ? `Target Exam: ${state.currentStudent.targetExam} &bull; Daily Goal: ${state.currentStudent.dailyGoal || 20} Qs` : (state.language === 'bn' ? 'প্রতিটি বিষয়ের পারদর্শিতা ও মক টেস্টের ফলাফল বিশদভাবে পর্যালোচনা করুন।' : 'Real-time skill diagnostics, accuracy tracking and historical mock test records.')}
        </p>
      </div>
      <div class="streak-chip">
        <i class="fas fa-fire"></i> Study Streak: Active
      </div>
    </div>

    <!-- Core Metrics 4-Grid -->
    <div class="analytics-grid">
      <div class="analytics-stat-card">
        <div class="analytics-stat-val" style="color: var(--accent-cyan);">${totalAttempted} / 500</div>
        <div class="analytics-stat-label">Questions Attempted / সম্পন্ন প্রশ্ন</div>
      </div>
      <div class="analytics-stat-card">
        <div class="analytics-stat-val" style="color: var(--accent-emerald);">${overallAccuracy}%</div>
        <div class="analytics-stat-label">Overall Accuracy / নির্ভুলতার হার</div>
      </div>
      <div class="analytics-stat-card">
        <div class="analytics-stat-val" style="color: #ef4444;">${state.mistakesVault.length}</div>
        <div class="analytics-stat-label">Mistakes in Vault / সংশোধনের প্রশ্ন</div>
      </div>
      <div class="analytics-stat-card">
        <div class="analytics-stat-val" style="color: var(--accent-amber);">${state.testHistory.length}</div>
        <div class="analytics-stat-label">Mock Tests Taken / প্রদত্ত মক টেস্ট</div>
      </div>
    </div>

    <!-- Subject Diagnostic Breakdown -->
    <div class="diagnostics-container">
      <div class="diagnostics-title">
        <i class="fas fa-brain" style="color: var(--accent-cyan);"></i>
        <span>Subject Mastery Diagnostics / বিষয়ভিত্তিক দক্ষতা বিশ্লেষণ</span>
      </div>

      ${categories.map(c => {
        const s = catStats[c];
        const name = state.language === 'bn' ? catNames[c].bn : catNames[c].en;
        let badgeColor = 'var(--accent-emerald)';
        let statusText = 'Strong / শক্তিশালী';
        if (s.acc < 50) {
          badgeColor = '#ef4444';
          statusText = 'Needs Focus / মনোযোগ প্রয়োজন';
        } else if (s.acc < 75) {
          badgeColor = 'var(--accent-amber)';
          statusText = 'Moderate / সন্তোষজনক';
        }
        if (s.attempted === 0) {
          badgeColor = 'var(--text-muted)';
          statusText = 'Not Attempted';
        }

        return `
          <div class="diagnostic-item">
            <div class="diagnostic-header">
              <span>${name} (${s.attempted}/${s.total} Solved)</span>
              <span style="color: ${badgeColor}; font-weight: 700;">${s.acc}% &bull; ${statusText}</span>
            </div>
            <div class="diagnostic-bar-track">
              <div class="diagnostic-bar-fill" style="width: ${s.acc}%; background: ${badgeColor};"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Historical Test Log Table -->
    <div class="history-container">
      <div class="diagnostics-title" style="justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-history" style="color: var(--accent-primary);"></i>
          <span>Recent Mock Test Records / সাম্প্রতিক পরীক্ষার ফলাফল</span>
        </div>
        ${state.testHistory.length > 0 ? `
          <button class="btn-secondary" style="padding: 4px 10px; font-size: 0.78rem;" onclick="clearTestHistory()">Clear History</button>
        ` : ''}
      </div>

      ${state.testHistory.length === 0 ? `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <i class="fas fa-clipboard-list" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.4;"></i>
          <p>No mock test attempts recorded yet. Take your first timed mock test!</p>
        </div>
      ` : `
        <div class="history-table-wrapper">
          <table class="history-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Test Set</th>
                <th>Questions</th>
                <th>Correct</th>
                <th>Score %</th>
                <th>Time Taken</th>
              </tr>
            </thead>
            <tbody>
              ${state.testHistory.map(h => `
                <tr>
                  <td>${h.date} ${h.time}</td>
                  <td><strong>${h.setName}</strong></td>
                  <td>${h.total}</td>
                  <td style="color: var(--accent-emerald); font-weight: 600;">${h.correct} / ${h.total}</td>
                  <td><span class="badge" style="background: ${h.scorePct >= 70 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color: ${h.scorePct >= 70 ? 'var(--accent-emerald)' : '#ef4444'}; font-weight: 700;">${h.scorePct}%</span></td>
                  <td>${Math.floor(h.timeTakenSeconds / 60)}m ${h.timeTakenSeconds % 60}s</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

function clearTestHistory() {
  if (confirm('Are you sure you want to clear your test history?')) {
    state.testHistory = [];
    localStorage.removeItem('aptitude_test_history');
    renderAnalyticsDashboard();
    showToast('Test history cleared');
  }
}

// 1-by-1 Focus Navigation Handlers
function navPrevQuestion() {
  if (state.singleCurrentIndex > 0) {
    state.singleCurrentIndex--;
    renderQuestions();
    if (state.mode === 'test') renderTestPalette();
  }
}

function navNextQuestion() {
  const filtered = getFilteredQuestions();
  if (state.singleCurrentIndex < filtered.length - 1) {
    state.singleCurrentIndex++;
    renderQuestions();
    if (state.mode === 'test') renderTestPalette();
  } else if (state.mode === 'test') {
    if (confirm('You have reached the last question. Do you want to submit your test?')) {
      finishTestMode();
    }
  } else {
    showToast('You have completed this question set! 🎉');
  }
}

function navSkipQuestion() {
  showToast('Question Skipped ⏭️');
  navNextQuestion();
}

// Render Questions List / 1-by-1 Single Focus View
function renderQuestions(reviewMode = false) {
  const filtered = getFilteredQuestions();
  if (elements.totalQuestionsCount) {
    elements.totalQuestionsCount.innerText = filtered.length;
  }
  
  if (filtered.length === 0) {
    if (state.mode === 'mistakes') {
      elements.questionsContainer.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-emerald);"></i>
          <h3>No Mistakes in Vault! / কোনো ভুলের রেকর্ড নেই! 🎉</h3>
          <p>You have mastered all your attempted questions or haven't made any mistakes yet.</p>
          <button class="btn-primary" style="margin-top: 1rem;" onclick="setMode('practice')">Back to Practice</button>
        </div>
      `;
    } else if (state.mode === 'bookmarks') {
      elements.questionsContainer.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <i class="fas fa-star" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-amber); opacity: 0.5;"></i>
          <h3>No Saved Questions / কোনো প্রশ্ন বুকমার্ক করা নেই</h3>
          <p>Click the bookmark icon on any question to save it for quick revision.</p>
          <button class="btn-primary" style="margin-top: 1rem;" onclick="setMode('practice')">Browse All Questions</button>
        </div>
      `;
    } else {
      elements.questionsContainer.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <i class="fas fa-search" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <h3>No questions found / কোনো প্রশ্ন পাওয়া যায়নি</h3>
          <p>Try resetting your filters or search keywords.</p>
          <button class="btn-primary" style="margin-top: 1rem;" onclick="resetFilters()">Reset All Filters</button>
        </div>
      `;
    }
    return;
  }

  // Ensure singleCurrentIndex is within bounds
  if (state.singleCurrentIndex >= filtered.length) {
    state.singleCurrentIndex = filtered.length - 1;
  }
  if (state.singleCurrentIndex < 0) {
    state.singleCurrentIndex = 0;
  }

  // ==========================================
  // VIEW MODE: SINGLE 1-BY-1 QUESTION FOCUS
  // ==========================================
  if (state.viewMode === 'single' && !reviewMode) {
    const q = filtered[state.singleCurrentIndex];
    const idx = state.singleCurrentIndex;
    const isBookmarked = state.bookmarks.includes(q.id);
    const isFlagged = state.testFlags.has(q.id);
    const selectedAnswer = state.testAnswers[q.id];
    const isPractice = state.mode !== 'test';
    const total = filtered.length;
    const progressPct = Math.round(((idx + 1) / total) * 100);

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

    // Explanation Box
    const isExplanationVisible = isPractice && selectedAnswer !== undefined;
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

    // Render Single Question Structure
    elements.questionsContainer.innerHTML = `
      <div class="single-q-wrapper">
        <!-- 1-by-1 Top Progress Track -->
        <div class="single-q-progress-bar-container">
          <div class="single-q-progress-info">
            <span><i class="fas fa-bullseye" style="color: var(--accent-cyan);"></i> Question ${idx + 1} of ${total} (${progressPct}%)</span>
            <span>Set ${q.setId || 1} &bull; ${state.language === 'bn' ? q.topic.bn : q.topic.en}</span>
          </div>
          <div class="single-q-progress-track">
            <div class="single-q-progress-fill" style="width: ${progressPct}%;"></div>
          </div>
        </div>

        <!-- Question Card -->
        <div class="question-card" id="qcard-${q.id}">
          <div class="card-header">
            <div class="card-badges">
              <span class="badge badge-qnum">Q #${idx + 1} / ${total}</span>
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
        </div>

        <!-- 1-by-1 Bottom Action Bar (Previous, Skip, Next/Submit) -->
        <div class="single-q-action-bar">
          <button class="btn-nav-action btn-nav-prev" onclick="navPrevQuestion()" ${idx === 0 ? 'disabled' : ''}>
            <i class="fas fa-arrow-left"></i> Previous
          </button>

          <button class="btn-nav-action btn-nav-skip" onclick="navSkipQuestion()">
            Skip <i class="fas fa-forward"></i>
          </button>

          <button class="btn-nav-action btn-nav-next" onclick="navNextQuestion()">
            ${idx === total - 1 ? (state.mode === 'test' ? '<i class="fas fa-paper-plane"></i> Submit Test' : 'Finish Set 🎉') : 'Next Question <i class="fas fa-arrow-right"></i>'}
          </button>
        </div>
      </div>
    `;
    return;
  }

  // ==========================================
  // VIEW MODE: SCROLLING LIST VIEW
  // ==========================================
  let mistakesBanner = '';
  if (state.mode === 'mistakes') {
    mistakesBanner = `
      <div class="mistakes-vault-banner">
        <div>
          <strong style="color: #ef4444;"><i class="fas fa-exclamation-triangle"></i> Mistakes Revision Vault:</strong>
          <span style="font-size: 0.9rem; margin-left: 6px;">You are practicing ${filtered.length} questions previously answered incorrectly. Re-answering correctly will master and remove them!</span>
        </div>
        <button class="btn-secondary" style="font-size: 0.8rem; padding: 5px 12px;" onclick="clearMistakesVault()">Clear Vault</button>
      </div>
    `;
  }

  elements.questionsContainer.innerHTML = mistakesBanner + filtered.map((q, idx) => {
    const isBookmarked = state.bookmarks.includes(q.id);
    const isFlagged = state.testFlags.has(q.id);
    const selectedAnswer = state.testAnswers[q.id];
    const isPractice = state.mode !== 'test' || reviewMode;

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

    // Explanation Box
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

        ${isPractice && !reviewMode ? `
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
  const isCorrect = (optionIndex === question.correctIndex);

  // Record practice attempt
  state.practiceAttempts[questionId] = { correct: isCorrect };
  localStorage.setItem('aptitude_practice_attempts', JSON.stringify(state.practiceAttempts));

  if (state.mode !== 'test') {
    if (isCorrect) {
      sfx.playCorrect();
      showToast('Correct Answer! / সঠিক উত্তর! 🎉');
      // If in mistakes mode, master and remove from vault
      if (state.mode === 'mistakes') {
        const mIdx = state.mistakesVault.indexOf(questionId);
        if (mIdx > -1) {
          state.mistakesVault.splice(mIdx, 1);
          persistCurrentUserData();
          showToast('Mastered! Removed from Mistakes Vault ⭐');
        }
      }
    } else {
      sfx.playWrong();
      showToast('Incorrect Answer / ভুল উত্তর ❌');
      // Auto-save to Mistakes Vault
      if (!state.mistakesVault.includes(questionId)) {
        state.mistakesVault.push(questionId);
        persistCurrentUserData();
      }
    }
    
    persistCurrentUserData();
    updateStats();
    renderQuestions();
  } else {
    updateTestProgress();
    renderQuestions();
  }
}

function clearMistakesVault() {
  if (confirm('Clear all questions from Mistakes Vault?')) {
    state.mistakesVault = [];
    persistCurrentUserData();
    updateStats();
    renderQuestions();
    showToast('Mistakes Vault Cleared');
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
  persistCurrentUserData();
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
  if (elements.bookmarkModeCount) {
    elements.bookmarkModeCount.innerText = state.bookmarks.length;
  }
  if (elements.mistakesCount) {
    elements.mistakesCount.innerText = state.mistakesVault.length;
  }
}

function resetFilters() {
  state.selectedSet = 'all';
  state.category = 'all';
  state.difficulty = 'all';
  state.searchQuery = '';
  state.singleCurrentIndex = 0;
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
