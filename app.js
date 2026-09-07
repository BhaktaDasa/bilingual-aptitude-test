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
  authToken: localStorage.getItem('aptitude_token') || null, // JWT for API calls
  bookmarks: JSON.parse(localStorage.getItem('aptitude_bookmarks') || '[]'),
  mistakesVault: JSON.parse(localStorage.getItem('aptitude_mistakes') || '[]'),
  testHistory: JSON.parse(localStorage.getItem('aptitude_test_history') || '[]'),
  practiceAttempts: JSON.parse(localStorage.getItem('aptitude_practice_attempts') || '{}'),
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
  adminDashboard: document.getElementById('adminDashboard'),
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
  themeModal: document.getElementById('themeModal'),
  adminStudentModal: document.getElementById('adminStudentModal'),
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
  setupMobileDrawer();
  setupBottomNav();
  setupOnboarding();
  setupStopwatch();
  renderFormulaSheet();
  initScratchpad();
  updateStats();
  renderQuestions();
  updateStreakDisplay();

  // If user has saved auth token, silently verify session & sync latest data from Neon DB
  if (state.authToken) {
    apiCall('/api/auth/me').then(res => {
      if (res.ok && res.data.user) {
        state.currentStudent = res.data.user;
        localStorage.setItem('aptitude_current_student', JSON.stringify(res.data.user));
        updateStudentUI();
        loadUserDataFromAPI();
      } else if (res.status === 401) {
        // Token expired or invalid
        setAuthToken(null);
        state.currentStudent = null;
        localStorage.removeItem('aptitude_current_student');
        updateStudentUI();
      }
    }).catch(() => {
      // Offline fallback: already loaded from local cache
    });
  }

  // Check onboarding flag
  if (!localStorage.getItem('aptitude_onboarded') && !state.currentStudent) {
    // Show onboarding after small delay for first-time visitors
    setTimeout(() => showOnboarding(), 800);
  }
}

// =========================================================
// API HELPER — All backend calls go through here
// =========================================================
async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.authToken) headers['Authorization'] = `Bearer ${state.authToken}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(endpoint, options);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error(`API ${method} ${endpoint} failed:`, err.message);
    return { ok: false, status: 0, data: { error: 'Network error — working offline' } };
  }
}

// Save JWT token to state + localStorage
function setAuthToken(token) {
  state.authToken = token;
  if (token) {
    localStorage.setItem('aptitude_token', token);
  } else {
    localStorage.removeItem('aptitude_token');
  }
}

// Load all user progress from API, cache to localStorage
async function loadUserDataFromAPI() {
  if (!state.authToken) return;

  // Fetch progress
  const progressRes = await apiCall('/api/progress');
  if (progressRes.ok && progressRes.data.data) {
    const d = progressRes.data.data;
    state.practiceAttempts = d.practiceAttempts || {};
    state.bookmarks = d.bookmarks || [];
    state.mistakesVault = d.mistakesVault || [];
    // Cache locally
    localStorage.setItem('aptitude_practice_attempts', JSON.stringify(state.practiceAttempts));
    localStorage.setItem('aptitude_bookmarks', JSON.stringify(state.bookmarks));
    localStorage.setItem('aptitude_mistakes', JSON.stringify(state.mistakesVault));
    // Streak
    if (d.streak) {
      localStorage.setItem('aptitude_streak', JSON.stringify({
        count: d.streak.count,
        lastDate: d.streak.lastDate,
        activityLog: d.streak.activityLog
      }));
    }
  }

  // Fetch test history
  const testsRes = await apiCall('/api/tests');
  if (testsRes.ok && testsRes.data.history) {
    state.testHistory = testsRes.data.history;
    localStorage.setItem('aptitude_test_history', JSON.stringify(state.testHistory));
  }

  updateStats();
  updateStreakDisplay();
  renderQuestions();
}

// =========================================================
// Student Registration, Authentication & Profile System
// (Now backed by Neon PostgreSQL via Vercel API routes)
// =========================================================

// Legacy localStorage helpers (used as offline cache fallback)
function getRegisteredStudents() {
  try { return JSON.parse(localStorage.getItem('aptitude_registered_students') || '{}'); } catch(e) { return {}; }
}
function saveRegisteredStudents(s) {
  localStorage.setItem('aptitude_registered_students', JSON.stringify(s));
}

// Local cache sync (still used for offline PWA fallback)
function persistCurrentUserData() {
  localStorage.setItem('aptitude_bookmarks', JSON.stringify(state.bookmarks));
  localStorage.setItem('aptitude_mistakes', JSON.stringify(state.mistakesVault));
  localStorage.setItem('aptitude_test_history', JSON.stringify(state.testHistory));
  localStorage.setItem('aptitude_practice_attempts', JSON.stringify(state.practiceAttempts));
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

async function handleStudentSignUp(e) {
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
  if (password.length < 6) {
    showToast('Password must be at least 6 characters');
    return;
  }
  if (password !== confirmPassword) {
    showToast('Passwords do not match. Please re-enter.');
    return;
  }

  // Show loading state
  const submitBtn = document.querySelector('#signUpForm button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...'; }

  try {
    const res = await apiCall('/api/auth/signup', 'POST', { name, identifier, password, targetExam, dailyGoal: parseInt(dailyGoal) });

    if (!res.ok) {
      showToast(res.data.error || 'Signup failed. Please try again.');
      return;
    }

    const { token, user } = res.data;
    setAuthToken(token);

    state.currentStudent = {
      id: user.id,
      name: user.name,
      identifier: user.identifier,
      targetExam: user.targetExam,
      dailyGoal: user.dailyGoal,
      registeredAt: user.createdAt,
    };
    localStorage.setItem('aptitude_current_student', JSON.stringify(state.currentStudent));

    updateStudentUI();
    updateStreakDisplay();
    closeModal(elements.studentModal);
    showToast(`Welcome, ${user.name}! Account created successfully!`);
    localStorage.setItem('aptitude_onboarded', '1');

    document.getElementById('signUpForm')?.reset();

  } catch(err) {
    showToast('Network error. Please check your connection.');
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account &amp; Start Learning'; }
  }
}

async function handleStudentSignIn(e) {
  if (e) e.preventDefault();
  const identifier = document.getElementById('loginIdentifier')?.value.trim().toLowerCase();
  const password = document.getElementById('loginPassword')?.value;

  if (!identifier || !password) {
    showToast('Please enter your email/username and password');
    return;
  }

  // Show loading state
  const submitBtn = document.querySelector('#signInForm button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...'; }

  try {
    const res = await apiCall('/api/auth/signin', 'POST', { identifier, password });

    if (!res.ok) {
      showToast(res.data.error || 'Sign in failed. Please check your credentials.');
      return;
    }

    const { token, user } = res.data;
    setAuthToken(token);

    state.currentStudent = {
      id: user.id,
      name: user.name,
      identifier: user.identifier,
      targetExam: user.targetExam,
      dailyGoal: user.dailyGoal,
      registeredAt: user.createdAt,
    };
    localStorage.setItem('aptitude_current_student', JSON.stringify(state.currentStudent));

    updateStudentUI();
    closeModal(elements.studentModal);
    showToast(`Welcome back, ${user.name}!`);
    localStorage.setItem('aptitude_onboarded', '1');

    // Load all user data from DB
    await loadUserDataFromAPI();

    document.getElementById('signInForm')?.reset();

  } catch(err) {
    showToast('Network error. Please check your connection.');
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In to Account'; }
  }
}

function updateStudentUI() {
  const authTabs = document.getElementById('authTabs');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const loggedInProfileView = document.getElementById('loggedInProfileView');
  const studentModalTitle = document.getElementById('studentModalTitle');

  const homeGuestAuthView = document.getElementById('homeGuestAuthView');
  const homeUserActiveView = document.getElementById('homeUserActiveView');
  const homeUserCardName = document.getElementById('homeUserCardName');
  const homeUserCardExam = document.getElementById('homeUserCardExam');

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

    // Update Home Auth card view
    if (homeGuestAuthView) homeGuestAuthView.style.display = 'none';
    if (homeUserActiveView) homeUserActiveView.style.display = 'block';
    if (homeUserCardName) homeUserCardName.innerText = state.currentStudent.name;
    if (homeUserCardExam) homeUserCardExam.innerText = `Target Exam: ${state.currentStudent.targetExam || 'General Preparation'}`;
  } else {
    if (elements.studentNavName) {
      elements.studentNavName.innerText = 'Student Login';
    }
    if (authTabs) authTabs.style.display = 'flex';
    if (loggedInProfileView) loggedInProfileView.style.display = 'none';
    if (studentModalTitle) studentModalTitle.innerText = 'Student Account / ছাত্র অ্যাকাউন্ট';
    switchAuthTab('signin');

    // Update Home Auth card view
    if (homeGuestAuthView) homeGuestAuthView.style.display = 'block';
    if (homeUserActiveView) homeUserActiveView.style.display = 'none';
  }
}

function logoutStudent() {
  if (confirm('Do you want to log out? Your progress is saved to your account.')) {
    persistCurrentUserData();
    state.currentStudent = null;
    setAuthToken(null);
    localStorage.removeItem('aptitude_current_student');
    updateStudentUI();
    closeModal(elements.studentModal);
    showToast('Logged out successfully. You are in guest mode.');
  }
}

function switchHomeAuthTab(tab) {
  const tabSignIn = document.getElementById('homeTabSignIn');
  const tabSignUp = document.getElementById('homeTabSignUp');
  const signInForm = document.getElementById('homeSignInForm');
  const signUpForm = document.getElementById('homeSignUpForm');

  if (!tabSignIn || !tabSignUp || !signInForm || !signUpForm) return;

  if (tab === 'signup') {
    tabSignUp.classList.add('active');
    tabSignIn.classList.remove('active');
    signInForm.style.display = 'none';
    signUpForm.style.display = 'block';
  } else {
    tabSignIn.classList.add('active');
    tabSignUp.classList.remove('active');
    signInForm.style.display = 'block';
    signUpForm.style.display = 'none';
  }
}

function handleHomeSignIn(e) {
  if (e) e.preventDefault();
  const idInput = document.getElementById('homeLoginId');
  const passInput = document.getElementById('homeLoginPass');
  const modalIdInput = document.getElementById('loginIdentifier');
  const modalPassInput = document.getElementById('loginPassword');

  if (modalIdInput && idInput) modalIdInput.value = idInput.value;
  if (modalPassInput && passInput) modalPassInput.value = passInput.value;

  handleStudentSignIn(e);
}

function handleHomeSignUp(e) {
  if (e) e.preventDefault();
  const regName = document.getElementById('homeRegName');
  const regId = document.getElementById('homeRegId');
  const regPass = document.getElementById('homeRegPass');
  const regConfirm = document.getElementById('homeRegConfirm');
  const regExam = document.getElementById('homeRegExam');

  if (document.getElementById('regName') && regName) document.getElementById('regName').value = regName.value;
  if (document.getElementById('regIdentifier') && regId) document.getElementById('regIdentifier').value = regId.value;
  if (document.getElementById('regPassword') && regPass) document.getElementById('regPassword').value = regPass.value;
  if (document.getElementById('regConfirmPassword') && regConfirm) document.getElementById('regConfirmPassword').value = regConfirm.value;
  if (document.getElementById('regTargetExam') && regExam) document.getElementById('regTargetExam').value = regExam.value;

  handleStudentSignUp(e);
}

function selectTopicCard(cat) {
  state.category = cat;
  state.singleCurrentIndex = 0;
  
  document.querySelectorAll('.study-topic-card').forEach(card => {
    card.classList.toggle('active', card.dataset.cat === cat);
  });

  if (elements.categoryFilter) {
    elements.categoryFilter.value = cat;
  }

  showToast(`Selected Topic: ${cat === 'all' ? 'All Topics' : cat.toUpperCase()}`);
  renderQuestions();
}

function syncHubSet(setVal) {
  state.selectedSet = setVal;
  state.singleCurrentIndex = 0;

  if (elements.setFilter) {
    elements.setFilter.value = setVal;
  }
  if (elements.setPillsList) {
    elements.setPillsList.querySelectorAll('.set-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.set === setVal);
    });
  }
  showToast(setVal === 'all' ? 'All Sets (500 Questions)' : `Selected Set ${setVal} (50 Questions)`);
  renderQuestions();
}

function scrollToStudyHub() {
  const hub = document.getElementById('studySetupHub');
  if (hub) {
    hub.scrollIntoView({ behavior: 'smooth' });
  }
}

function launchFocusSession() {
  state.viewMode = 'single';
  state.singleCurrentIndex = 0;
  if (elements.viewToggleText) {
    elements.viewToggleText.innerText = '1-by-1 View';
  }
  renderQuestions();

  const container = document.getElementById('questionsContainer');
  if (container) {
    container.scrollIntoView({ behavior: 'smooth' });
  }
  showToast('Starting 1-by-1 Questions! 🎯');
}

window.switchAuthTab = switchAuthTab;
window.handleStudentSignIn = handleStudentSignIn;
window.handleStudentSignUp = handleStudentSignUp;
window.logoutStudent = logoutStudent;
window.switchHomeAuthTab = switchHomeAuthTab;
window.handleHomeSignIn = handleHomeSignIn;
window.handleHomeSignUp = handleHomeSignUp;
window.selectTopicCard = selectTopicCard;
window.syncHubSet = syncHubSet;
window.scrollToStudyHub = scrollToStudyHub;
window.launchFocusSession = launchFocusSession;

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

// Theme Switcher & Appearance Settings
function applyTheme(theme) {
  let effectiveTheme = theme;
  if (theme === 'auto') {
    effectiveTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', effectiveTheme);
  state.theme = theme;
  localStorage.setItem('aptitude_theme', theme);
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.innerHTML = effectiveTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
  }

  // Update theme option cards
  ['Dark', 'Light', 'Auto'].forEach(t => {
    const el = document.getElementById(`themeCard${t}`);
    if (el) {
      el.classList.toggle('active', t.toLowerCase() === theme);
    }
  });
}

function selectThemeSetting(theme) {
  applyTheme(theme);
  showToast(`Theme updated: ${theme.toUpperCase()} MODE ✨`);
}

// Event Listeners Setup
function setupEventListeners() {
  // Theme Settings Modal opener
  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    openModal(elements.themeModal);
  });

  const closeThemeBtn = document.getElementById('btnCloseThemeModal');
  if (closeThemeBtn) {
    closeThemeBtn.addEventListener('click', () => closeModal(elements.themeModal));
  }

  const closeAdminStudentBtn = document.getElementById('btnCloseAdminStudentModal');
  if (closeAdminStudentBtn) {
    closeAdminStudentBtn.addEventListener('click', () => closeModal(elements.adminStudentModal));
  }

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
      } else if (state.mode === 'admin') {
        renderAdminDashboard();
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
    if (elements.adminDashboard) elements.adminDashboard.style.display = 'none';
    if (elements.mainToolbar) elements.mainToolbar.style.display = 'flex';
    if (elements.setPillsContainer) elements.setPillsContainer.style.display = 'flex';
    startTestMode();
  } else if (mode === 'analytics') {
    stopTestTimer();
    elements.testHud.classList.remove('visible');
    elements.testPalette.classList.remove('visible');
    elements.questionsContainer.style.display = 'none';
    elements.analyticsDashboard.style.display = 'block';
    if (elements.adminDashboard) elements.adminDashboard.style.display = 'none';
    if (elements.mainToolbar) elements.mainToolbar.style.display = 'none';
    if (elements.setPillsContainer) elements.setPillsContainer.style.display = 'none';
    renderAnalyticsDashboard();
  } else if (mode === 'admin') {
    stopTestTimer();
    elements.testHud.classList.remove('visible');
    elements.testPalette.classList.remove('visible');
    elements.questionsContainer.style.display = 'none';
    elements.analyticsDashboard.style.display = 'none';
    if (elements.adminDashboard) elements.adminDashboard.style.display = 'block';
    if (elements.mainToolbar) elements.mainToolbar.style.display = 'none';
    if (elements.setPillsContainer) elements.setPillsContainer.style.display = 'none';
    renderAdminDashboard();
  } else {
    stopTestTimer();
    elements.testHud.classList.remove('visible');
    elements.testPalette.classList.remove('visible');
    elements.questionsContainer.style.display = 'block';
    elements.analyticsDashboard.style.display = 'none';
    if (elements.adminDashboard) elements.adminDashboard.style.display = 'none';
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

  // Cloud sync to Neon DB
  if (state.authToken) {
    apiCall('/api/tests', 'POST', {
      setName: attemptRecord.setName,
      total: total,
      correct: correctCount,
      scorePct: scorePct,
      timeTakenSeconds: timeTaken
    }).catch(err => console.warn('Failed to sync test to cloud:', err));
  }

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
    persistCurrentUserData();
    renderAnalyticsDashboard();
    showToast('Test history cleared');
  }
}

// =========================================================
// Admin Dashboard & Student Management Engine
// =========================================================
function renderAdminDashboard() {
  if (!elements.adminDashboard) return;

  const studentsMap = getRegisteredStudents();
  const studentsList = Object.values(studentsMap);

  // Compute aggregate metrics
  const totalStudents = studentsList.length;
  let totalTestsTaken = 0;
  let totalCorrectSum = 0;
  let totalAttemptedSum = 0;
  let totalMistakesInVaults = 0;

  studentsList.forEach(s => {
    const data = s.data || {};
    const hist = data.testHistory || [];
    const mistakes = data.mistakesVault || [];
    totalTestsTaken += hist.length;
    totalMistakesInVaults += mistakes.length;
    hist.forEach(h => {
      totalCorrectSum += (h.correct || 0);
      totalAttemptedSum += (h.total || 0);
    });
  });

  // Factor in guest session if no registered students yet
  if (totalStudents === 0 && state.testHistory.length > 0) {
    totalTestsTaken += state.testHistory.length;
    totalMistakesInVaults += state.mistakesVault.length;
    state.testHistory.forEach(h => {
      totalCorrectSum += (h.correct || 0);
      totalAttemptedSum += (h.total || 0);
    });
  }

  const classAvgAccuracy = totalAttemptedSum > 0 ? Math.round((totalCorrectSum / totalAttemptedSum) * 100) : (totalTestsTaken > 0 ? 82 : 0);

  elements.adminDashboard.innerHTML = `
    <!-- Admin Top Header Card -->
    <div class="admin-header-card">
      <div>
        <h2 style="font-size: 1.45rem; font-weight: 800; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-user-shield" style="color: var(--accent-cyan);"></i>
          <span>Admin & Educator Portal / শিক্ষক ও প্রশাসক ড্যাশবোর্ড</span>
        </h2>
        <p style="font-size: 0.88rem; color: var(--text-secondary);">
          Monitor enrolled students, examine individual scorecard diagnostics, track batch progress, and export data.
        </p>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn-primary" style="padding: 8px 14px; font-size: 0.85rem;" onclick="exportStudentsCSV()">
          <i class="fas fa-file-csv"></i> Export CSV
        </button>
        <button class="btn-secondary" style="padding: 8px 14px; font-size: 0.85rem;" onclick="exportStudentsJSON()">
          <i class="fas fa-file-code"></i> Export JSON
        </button>
        <button class="btn-secondary" style="padding: 8px 14px; font-size: 0.85rem;" onclick="generateDemoStudents()">
          <i class="fas fa-user-plus"></i> Add Demo Students
        </button>
        <button class="btn-secondary" style="padding: 8px 14px; font-size: 0.85rem;" onclick="renderAdminDashboard()">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
    </div>

    <!-- Admin KPI Metric Grid -->
    <div class="admin-kpi-grid">
      <div class="admin-kpi-card">
        <div class="admin-kpi-icon" style="background: rgba(99, 102, 241, 0.15); color: var(--accent-primary);">
          <i class="fas fa-user-graduate"></i>
        </div>
        <div class="admin-kpi-data">
          <div class="admin-kpi-val" style="color: var(--accent-primary);">${totalStudents}</div>
          <div class="admin-kpi-label">Registered Students / নথিভুক্ত শিক্ষার্থী</div>
        </div>
      </div>

      <div class="admin-kpi-card">
        <div class="admin-kpi-icon" style="background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan);">
          <i class="fas fa-stopwatch"></i>
        </div>
        <div class="admin-kpi-data">
          <div class="admin-kpi-val" style="color: var(--accent-cyan);">${totalTestsTaken}</div>
          <div class="admin-kpi-label">Mock Tests Submitted / মোট মক টেস্ট</div>
        </div>
      </div>

      <div class="admin-kpi-card">
        <div class="admin-kpi-icon" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald);">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="admin-kpi-data">
          <div class="admin-kpi-val" style="color: var(--accent-emerald);">${classAvgAccuracy}%</div>
          <div class="admin-kpi-label">Class Avg. Accuracy / গড় নির্ভুলতা</div>
        </div>
      </div>

      <div class="admin-kpi-card">
        <div class="admin-kpi-icon" style="background: rgba(244, 63, 94, 0.15); color: var(--accent-rose);">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="admin-kpi-data">
          <div class="admin-kpi-val" style="color: var(--accent-rose);">${totalMistakesInVaults}</div>
          <div class="admin-kpi-label">Active Mistake Vault Items</div>
        </div>
      </div>
    </div>

    <!-- Student Management Table -->
    <div class="admin-table-card">
      <div class="admin-table-toolbar">
        <div style="font-size: 1.15rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-users-cog" style="color: var(--accent-cyan);"></i>
          <span>Enrolled Students Roster (${totalStudents})</span>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <input type="text" id="adminStudentSearch" placeholder="Search student name or email..." oninput="filterAdminStudentTable()" style="padding: 7px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-glass); background: var(--bg-primary); color: var(--text-primary); font-size: 0.85rem; min-width: 200px;">
          
          <select id="adminExamFilter" onchange="filterAdminStudentTable()" style="padding: 7px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-glass); background: var(--bg-primary); color: var(--text-primary); font-size: 0.85rem;">
            <option value="all">All Target Exams</option>
            <option value="WBCS">WBCS</option>
            <option value="SSC">SSC CGL / CHSL</option>
            <option value="Banking">Banking (IBPS/SBI)</option>
            <option value="UPSC">UPSC</option>
            <option value="Railways">Railways RRB</option>
            <option value="Campus">Campus Placements</option>
          </select>
        </div>
      </div>

      ${totalStudents === 0 ? `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <i class="fas fa-user-friends" style="font-size: 2.8rem; margin-bottom: 0.8rem; opacity: 0.4;"></i>
          <h3 style="font-size: 1.15rem; color: var(--text-secondary); margin-bottom: 6px;">No Registered Students Yet</h3>
          <p style="font-size: 0.88rem; max-width: 460px; margin: 0 auto 1.25rem;">
            Students who register via the <strong>Student Login</strong> button will appear here with live tracking of their test performance and accuracy.
          </p>
          <button class="btn-primary" onclick="generateDemoStudents()">
            <i class="fas fa-magic"></i> Generate Sample Class Demo Data
          </button>
        </div>
      ` : `
        <div class="admin-table-wrapper">
          <table class="admin-table" id="adminStudentsTable">
            <thead>
              <tr>
                <th>Student</th>
                <th>Target Exam</th>
                <th>Daily Goal</th>
                <th>Tests Taken</th>
                <th>Avg. Score</th>
                <th>Mistakes Vault</th>
                <th>Bookmarks</th>
                <th>Joined Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="adminStudentsTableBody">
              ${studentsList.map(s => {
                const data = s.data || {};
                const tests = data.testHistory || [];
                const mistakes = data.mistakesVault || [];
                const bookmarks = data.bookmarks || [];
                let avg = 0;
                if (tests.length > 0) {
                  avg = Math.round(tests.reduce((acc, t) => acc + (t.scorePct || 0), 0) / tests.length);
                }
                const initial = (s.name || 'S').charAt(0).toUpperCase();

                return `
                  <tr data-name="${(s.name || '').toLowerCase()}" data-email="${(s.identifier || '').toLowerCase()}" data-exam="${(s.targetExam || '').toLowerCase()}">
                    <td>
                      <div class="student-info-cell">
                        <div class="student-avatar">${initial}</div>
                        <div>
                          <div style="font-weight: 700;">${s.name}</div>
                          <div style="font-size: 0.78rem; color: var(--text-muted);">${s.identifier || 'Student'}</div>
                        </div>
                      </div>
                    </td>
                    <td><span class="badge-exam">${s.targetExam || 'General'}</span></td>
                    <td style="font-weight: 600;">${s.dailyGoal || 20} Qs/day</td>
                    <td style="font-weight: 700; color: var(--accent-cyan);">${tests.length}</td>
                    <td>
                      ${tests.length > 0 ? `
                        <span class="${avg >= 70 ? 'badge-score-high' : 'badge-score-low'}">${avg}%</span>
                      ` : '<span style="color: var(--text-muted); font-size: 0.8rem;">None yet</span>'}
                    </td>
                    <td style="color: var(--accent-rose); font-weight: 700;">${mistakes.length}</td>
                    <td style="color: var(--accent-amber); font-weight: 700;">${bookmarks.length}</td>
                    <td style="font-size: 0.82rem; color: var(--text-muted);">${s.registeredAt || 'Recent'}</td>
                    <td>
                      <button class="btn-secondary" style="padding: 5px 10px; font-size: 0.78rem;" onclick="inspectStudentDetails('${s.identifier}')">
                        <i class="fas fa-search-plus"></i> Inspect
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

function filterAdminStudentTable() {
  const search = (document.getElementById('adminStudentSearch')?.value || '').toLowerCase();
  const exam = (document.getElementById('adminExamFilter')?.value || '').toLowerCase();
  const rows = document.querySelectorAll('#adminStudentsTableBody tr');

  rows.forEach(row => {
    const name = row.getAttribute('data-name') || '';
    const email = row.getAttribute('data-email') || '';
    const rowExam = row.getAttribute('data-exam') || '';

    const matchesSearch = !search || name.includes(search) || email.includes(search);
    const matchesExam = exam === 'all' || rowExam.includes(exam);

    if (matchesSearch && matchesExam) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

function inspectStudentDetails(identifier) {
  const students = getRegisteredStudents();
  const student = students[identifier];
  if (!student) return;

  const modalBody = document.getElementById('adminStudentModalBody');
  const modalTitle = document.getElementById('adminStudentModalTitle');
  if (!modalBody) return;

  if (modalTitle) modalTitle.innerText = `${student.name}'s Performance File`;

  const data = student.data || {};
  const tests = data.testHistory || [];
  const mistakes = data.mistakesVault || [];
  const bookmarks = data.bookmarks || [];
  let avgScore = 0;
  if (tests.length > 0) {
    avgScore = Math.round(tests.reduce((acc, t) => acc + (t.scorePct || 0), 0) / tests.length);
  }

  modalBody.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-glass); margin-bottom: 1.25rem;">
      <div class="student-avatar" style="width: 52px; height: 52px; font-size: 1.4rem;">
        ${(student.name || 'S').charAt(0).toUpperCase()}
      </div>
      <div>
        <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 2px;">${student.name}</h3>
        <div style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 600;">Target: ${student.targetExam || 'General'}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${student.identifier} &bull; Joined: ${student.registeredAt || 'Recent'} &bull; Goal: ${student.dailyGoal || 20} Qs/day</div>
      </div>
    </div>

    <!-- Quick 4 Stats Grid -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 1.25rem;">
      <div style="background: var(--bg-primary); padding: 10px; border-radius: var(--radius-sm); text-align: center; border: 1px solid var(--border-glass);">
        <div style="font-size: 1.25rem; font-weight: 800; color: var(--accent-cyan);">${tests.length}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Tests Taken</div>
      </div>
      <div style="background: var(--bg-primary); padding: 10px; border-radius: var(--radius-sm); text-align: center; border: 1px solid var(--border-glass);">
        <div style="font-size: 1.25rem; font-weight: 800; color: ${avgScore >= 70 ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${avgScore}%</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Avg. Score</div>
      </div>
      <div style="background: var(--bg-primary); padding: 10px; border-radius: var(--radius-sm); text-align: center; border: 1px solid var(--border-glass);">
        <div style="font-size: 1.25rem; font-weight: 800; color: var(--accent-rose);">${mistakes.length}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Mistakes Vault</div>
      </div>
      <div style="background: var(--bg-primary); padding: 10px; border-radius: var(--radius-sm); text-align: center; border: 1px solid var(--border-glass);">
        <div style="font-size: 1.25rem; font-weight: 800; color: var(--accent-amber);">${bookmarks.length}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Bookmarks</div>
      </div>
    </div>

    <!-- Tests Breakdown Table -->
    <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
      <i class="fas fa-history" style="color: var(--accent-primary);"></i> Mock Test History Log
    </h4>

    ${tests.length === 0 ? `
      <p style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; padding: 1rem; background: var(--bg-primary); border-radius: var(--radius-sm); text-align: center;">No mock tests submitted by this student yet.</p>
    ` : `
      <div style="max-height: 220px; overflow-y: auto; border: 1px solid var(--border-glass); border-radius: var(--radius-sm); margin-bottom: 1.25rem;">
        <table class="history-table" style="width: 100%; font-size: 0.84rem;">
          <thead>
            <tr>
              <th>Date</th>
              <th>Test Set</th>
              <th>Score</th>
              <th>Accuracy</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${tests.map(t => `
              <tr>
                <td>${t.date} ${t.time || ''}</td>
                <td><strong>${t.setName}</strong></td>
                <td>${t.correct} / ${t.total}</td>
                <td><span class="badge ${t.scorePct >= 70 ? 'badge-score-high' : 'badge-score-low'}">${t.scorePct}%</span></td>
                <td>${Math.floor((t.timeTakenSeconds || 0) / 60)}m ${(t.timeTakenSeconds || 0) % 60}s</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `}

    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.5rem;">
      <button class="btn-primary" onclick="closeModal(document.getElementById('adminStudentModal'))">
        <i class="fas fa-check"></i> Close
      </button>
    </div>
  `;

  openModal(document.getElementById('adminStudentModal'));
}

function exportStudentsCSV() {
  const students = Object.values(getRegisteredStudents());
  if (students.length === 0) {
    showToast('No student data to export. Add or register students first.');
    return;
  }

  let csv = "Name,Identifier/Email,Target Exam,Daily Goal,Joined Date,Tests Taken,Avg Score %,Mistakes Vault Count,Bookmarks Count\n";
  students.forEach(s => {
    const data = s.data || {};
    const tests = data.testHistory || [];
    const mistakes = data.mistakesVault || [];
    const bookmarks = data.bookmarks || [];
    let avg = 0;
    if (tests.length > 0) {
      avg = Math.round(tests.reduce((acc, t) => acc + (t.scorePct || 0), 0) / tests.length);
    }
    csv += `"${s.name}","${s.identifier}","${s.targetExam || 'General'}","${s.dailyGoal || 20}","${s.registeredAt || ''}",${tests.length},${avg},${mistakes.length},${bookmarks.length}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `student_performance_report_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Student CSV Report exported! 📥');
}

function exportStudentsJSON() {
  const students = getRegisteredStudents();
  const jsonStr = JSON.stringify(students, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `students_data_backup_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Student JSON backup exported! 📥');
}

function generateDemoStudents() {
  const students = getRegisteredStudents();
  const sampleStudents = [
    {
      name: "Rahul Sharma",
      identifier: "rahul@wbcs.gov.in",
      password: "pass",
      targetExam: "WBCS (Executive & Allied)",
      dailyGoal: "50",
      registeredAt: "01/09/2026",
      data: {
        bookmarks: [1, 5, 22, 114],
        mistakesVault: [12, 45, 108],
        practiceAttempts: { 1: { correct: true }, 2: { correct: true }, 12: { correct: false } },
        testHistory: [
          { date: "06/09/2026", time: "14:20", setName: "Set 1", total: 50, correct: 44, wrong: 6, scorePct: 88, timeTakenSeconds: 2140 },
          { date: "05/09/2026", time: "10:15", setName: "Set 2", total: 50, correct: 41, wrong: 9, scorePct: 82, timeTakenSeconds: 2310 }
        ]
      }
    },
    {
      name: "Ananya Mukherjee",
      identifier: "ananya.ssc@gmail.com",
      password: "pass",
      targetExam: "SSC CGL / CHSL",
      dailyGoal: "30",
      registeredAt: "02/09/2026",
      data: {
        bookmarks: [18, 55, 99],
        mistakesVault: [7, 34],
        practiceAttempts: { 1: { correct: true }, 7: { correct: false } },
        testHistory: [
          { date: "06/09/2026", time: "16:45", setName: "Set 1", total: 50, correct: 47, wrong: 3, scorePct: 94, timeTakenSeconds: 1980 }
        ]
      }
    },
    {
      name: "Suman Kalyan Ghosh",
      identifier: "suman.banking@outlook.com",
      password: "pass",
      targetExam: "Banking (IBPS PO / Clerk / SBI)",
      dailyGoal: "20",
      registeredAt: "03/09/2026",
      data: {
        bookmarks: [3, 44],
        mistakesVault: [19, 52, 88, 120],
        practiceAttempts: { 19: { correct: false }, 3: { correct: true } },
        testHistory: [
          { date: "05/09/2026", time: "11:00", setName: "Set 3", total: 50, correct: 36, wrong: 14, scorePct: 72, timeTakenSeconds: 2450 }
        ]
      }
    },
    {
      name: "Priya Sengupta",
      identifier: "priya.tech@campus.in",
      password: "pass",
      targetExam: "Campus Placements & IT",
      dailyGoal: "20",
      registeredAt: "04/09/2026",
      data: {
        bookmarks: [12, 67, 102],
        mistakesVault: [29, 61],
        practiceAttempts: { 12: { correct: true } },
        testHistory: [
          { date: "06/09/2026", time: "09:30", setName: "Set 1", total: 50, correct: 46, wrong: 4, scorePct: 92, timeTakenSeconds: 1850 }
        ]
      }
    }
  ];

  sampleStudents.forEach(s => {
    students[s.identifier] = s;
  });

  saveRegisteredStudents(students);
  renderAdminDashboard();
  showToast('Sample Demo Students added successfully! 🎉');
}

window.exportStudentsCSV = exportStudentsCSV;
window.exportStudentsJSON = exportStudentsJSON;
window.generateDemoStudents = generateDemoStudents;
window.filterAdminStudentTable = filterAdminStudentTable;
window.inspectStudentDetails = inspectStudentDetails;
window.renderAdminDashboard = renderAdminDashboard;
window.selectThemeSetting = selectThemeSetting;

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
          if (state.authToken) {
            apiCall('/api/progress', 'POST', { type: 'mistake_remove', questionId }).catch(() => {});
          }
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
    
    // Cloud sync to Neon DB
    if (state.authToken) {
      apiCall('/api/progress', 'POST', {
        type: 'attempt',
        questionId: questionId,
        correct: isCorrect
      }).catch(err => console.warn('Progress cloud sync failed:', err));
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
  const isRemoving = (idx > -1);
  if (isRemoving) {
    state.bookmarks.splice(idx, 1);
    showToast('Removed from Bookmarks');
  } else {
    state.bookmarks.push(questionId);
    showToast('Saved to Bookmarks ⭐');
  }
  persistCurrentUserData();
  updateStats();
  renderQuestions();

  // Cloud sync to Neon DB
  if (state.authToken) {
    apiCall('/api/progress', 'POST', {
      type: isRemoving ? 'bookmark_remove' : 'bookmark_add',
      questionId: questionId
    }).catch(err => console.warn('Bookmark cloud sync failed:', err));
  }
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

// =========================================================
// PASSWORD VISIBILITY TOGGLE
// =========================================================
function togglePwdVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    input.type = 'password';
    btn.innerHTML = '<i class="fas fa-eye"></i>';
  }
}
window.togglePwdVisibility = togglePwdVisibility;

// =========================================================
// CHANGE PASSWORD
// =========================================================
async function handleChangePassword(e) {
  if (e) e.preventDefault();
  const currentPwd = document.getElementById('currentPassword')?.value;
  const newPwd = document.getElementById('newPassword')?.value;

  if (!state.currentStudent) { showToast('Please sign in first'); return; }
  if (!currentPwd || !newPwd) { showToast('Please fill both password fields'); return; }
  if (newPwd.length < 6) { showToast('New password must be at least 6 characters'); return; }

  // Cloud API route
  if (state.authToken) {
    const btn = e?.target?.querySelector('button[type="submit"]') || document.querySelector('#changePasswordForm button[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerText = 'Updating...'; }
    try {
      const res = await apiCall('/api/auth/change-password', 'POST', { currentPassword: currentPwd, newPassword: newPwd });
      if (res.ok) {
        showToast('Password updated successfully! / পাসওয়ার্ড সফলভাবে আপডেট হয়েছে 🎉');
        document.getElementById('changePasswordForm')?.reset();
      } else {
        showToast(res.data?.error || 'Failed to update password');
      }
    } catch (err) {
      showToast('Network error while updating password');
    } finally {
      if (btn) { btn.disabled = false; btn.innerText = 'Update Password'; }
    }
    return;
  }

  // Offline fallback
  const students = getRegisteredStudents();
  const student = students[state.currentStudent.identifier];
  if (!student) { showToast('Account not found'); return; }

  if (student.password !== currentPwd && student.passwordHash !== currentPwd) {
    showToast('Current password is incorrect');
    return;
  }

  student.password = newPwd;
  student.passwordHash = null;
  students[state.currentStudent.identifier] = student;
  saveRegisteredStudents(students);
  showToast('Password updated successfully!');

  const form = document.getElementById('changePasswordForm');
  if (form) form.reset();
}
window.handleChangePassword = handleChangePassword;

// =========================================================
// STREAK TRACKING
// =========================================================
function getStreakData() {
  try {
    return JSON.parse(localStorage.getItem('aptitude_streak') || '{"count":0,"lastDate":"","activityLog":{}}');
  } catch (e) {
    return { count: 0, lastDate: '', activityLog: {} };
  }
}

function saveStreakData(data) {
  localStorage.setItem('aptitude_streak', JSON.stringify(data));
}

function recordActivityToday(questionsAnswered = 1) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const streakData = getStreakData();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Update activity log
  streakData.activityLog[today] = (streakData.activityLog[today] || 0) + questionsAnswered;

  // Update streak
  if (streakData.lastDate === today) {
    // Already recorded today, no streak change
  } else if (streakData.lastDate === yesterday) {
    // Consecutive day — extend streak
    streakData.count = (streakData.count || 0) + 1;
    streakData.lastDate = today;
  } else {
    // Gap — reset streak
    streakData.count = 1;
    streakData.lastDate = today;
  }

  saveStreakData(streakData);
  state.streak = streakData.count;
  updateStreakDisplay();
}

function updateStreakDisplay() {
  const streakData = getStreakData();
  const count = streakData.count || 0;
  state.streak = count;

  const streakHeroRow = document.getElementById('streakHeroRow');
  const streakCount = document.getElementById('streakCount');
  const dailyGoalDisplay = document.getElementById('dailyGoalDisplay');

  if (count > 0 || state.currentStudent) {
    if (streakHeroRow) streakHeroRow.style.display = 'flex';
    if (streakCount) streakCount.innerText = count;
    if (dailyGoalDisplay && state.currentStudent) {
      dailyGoalDisplay.innerText = state.currentStudent.dailyGoal || 20;
    }
  } else {
    if (streakHeroRow) streakHeroRow.style.display = 'none';
  }

  // Update accuracy display in hero
  const attempts = Object.values(state.practiceAttempts);
  const totalAttempted = attempts.length;
  const correct = attempts.filter(a => a.correct).length;
  const acc = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : null;
  const accEl = document.getElementById('accuracyDisplay');
  if (accEl) accEl.innerText = acc !== null ? `${acc}%` : '—%';
}

// =========================================================
// LEADERBOARD SYSTEM (Local)
// =========================================================
function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem('aptitude_leaderboard') || '[]');
  } catch (e) {
    return [];
  }
}

function saveLeaderboard(data) {
  localStorage.setItem('aptitude_leaderboard', JSON.stringify(data));
}

function addToLeaderboard(name, scorePct, setName, total, correct) {
  const lb = getLeaderboard();
  lb.push({
    name: name || 'Guest',
    scorePct,
    setName,
    total,
    correct,
    date: new Date().toLocaleDateString('en-GB')
  });
  // Sort by score descending, keep top 20
  lb.sort((a, b) => b.scorePct - a.scorePct);
  saveLeaderboard(lb.slice(0, 20));
}

async function openLeaderboard() {
  const modal = document.getElementById('leaderboardModal');
  const body = document.getElementById('leaderboardBody');
  if (!modal || !body) return;

  openModal(modal);

  body.innerHTML = `
    <div style="text-align:center;padding:2.5rem 1rem;color:var(--text-muted);">
      <i class="fas fa-spinner fa-spin" style="font-size:2rem;color:var(--accent-primary);margin-bottom:0.8rem;"></i>
      <p style="font-size:0.9rem;">Fetching platform rankings from cloud...</p>
    </div>
  `;

  let lb = [];
  let isCloud = false;

  try {
    const res = await apiCall('/api/leaderboard');
    if (res.ok && res.data.leaderboard && res.data.leaderboard.length > 0) {
      lb = res.data.leaderboard;
      isCloud = true;
    }
  } catch (err) {
    console.warn('Could not fetch cloud leaderboard, falling back:', err);
  }

  // Fallback to local if cloud returned nothing
  if (!lb || lb.length === 0) {
    lb = getLeaderboard();
    isCloud = false;
  }

  if (!lb || lb.length === 0) {
    body.innerHTML = `
      <div style="text-align:center;padding:3rem 1rem;color:var(--text-muted);">
        <i class="fas fa-trophy" style="font-size:3rem;opacity:0.3;margin-bottom:1rem;"></i>
        <h3>No scores yet!</h3>
        <p>Complete a mock test to appear on the leaderboard.</p>
        <button class="btn-primary" style="margin-top:1rem;" onclick="closeModal(document.getElementById('leaderboardModal'));setMode('test');">
          <i class="fas fa-stopwatch"></i> Take a Mock Test
        </button>
      </div>
    `;
    return;
  }

  body.innerHTML = `
    <p style="color:var(--text-secondary);font-size:0.88rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;">
      <span>${isCloud ? '🏆 Top scores across all students (Neon DB)' : 'Top scores from this device (Local)'}</span>
      <span class="badge" style="background:rgba(99,102,241,0.15);color:var(--accent-primary);font-size:0.72rem;">${isCloud ? 'Live Cloud' : 'Local'}</span>
    </p>
    <div>
      ${lb.map((entry, i) => {
        const rankClass = i < 3 ? `rank-${i + 1}` : '';
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
        return `
          <div class="leaderboard-item ${rankClass}">
            <div class="rank-badge">${i < 3 ? medal : i + 1}</div>
            <div class="leaderboard-info">
              <div class="leaderboard-name">${entry.name}</div>
              <div class="leaderboard-meta">${entry.setName} &bull; ${entry.correct}/${entry.total} correct &bull; ${entry.date}</div>
            </div>
            <div class="leaderboard-score">${entry.scorePct}%</div>
          </div>
        `;
      }).join('')}
    </div>
    ${!isCloud ? `
      <div style="margin-top:1rem;text-align:center;">
        <button class="btn-secondary" style="font-size:0.82rem;" onclick="if(confirm('Clear leaderboard?')){localStorage.removeItem('aptitude_leaderboard');openLeaderboard();}">
          <i class="fas fa-trash-alt"></i> Clear Leaderboard
        </button>
      </div>
    ` : ''}
  `;
}
window.openLeaderboard = openLeaderboard;

// =========================================================
// PRACTICE HEATMAP (30-day activity grid)
// =========================================================
function renderHeatmap(container) {
  const streakData = getStreakData();
  const activityLog = streakData.activityLog || {};

  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().split('T')[0];
    days.push({ key, count: activityLog[key] || 0 });
  }

  const maxCount = Math.max(...days.map(d => d.count), 1);

  container.innerHTML = `
    <div class="diagnostics-title">
      <i class="fas fa-calendar-alt" style="color:var(--accent-primary);"></i>
      <span>30-Day Practice Activity Heatmap</span>
    </div>
    <div class="heatmap-grid">
      ${days.map(d => {
        let level = 0;
        if (d.count > 0) level = Math.min(4, Math.ceil((d.count / maxCount) * 4));
        const date = new Date(d.key + 'T12:00:00').toLocaleDateString('en-GB', {weekday:'short', day:'numeric', month:'short'});
        return `<div class="heatmap-cell level-${level}" title="${date}: ${d.count} questions"></div>`;
      }).join('')}
    </div>
    <div class="heatmap-legend">
      Less <div class="heatmap-cell" style="width:12px;height:12px;display:inline-block;"></div>
      <div class="heatmap-cell level-1" style="width:12px;height:12px;display:inline-block;"></div>
      <div class="heatmap-cell level-2" style="width:12px;height:12px;display:inline-block;"></div>
      <div class="heatmap-cell level-3" style="width:12px;height:12px;display:inline-block;"></div>
      <div class="heatmap-cell level-4" style="width:12px;height:12px;display:inline-block;"></div>
      More
    </div>
  `;
}

// =========================================================
// ONBOARDING TOUR
// =========================================================
let onboardCurrentSlide = 0;
const ONBOARD_TOTAL = 3;

function showOnboarding() {
  const modal = document.getElementById('onboardingModal');
  if (modal) openModal(modal);
}

function setupOnboarding() {
  const nextBtn = document.getElementById('btnOnboardNext');
  const prevBtn = document.getElementById('btnOnboardPrev');
  const skipBtn = document.getElementById('btnOnboardSkip');

  if (!nextBtn) return;

  nextBtn.addEventListener('click', () => {
    if (onboardCurrentSlide < ONBOARD_TOTAL - 1) {
      goToOnboardSlide(onboardCurrentSlide + 1);
    } else {
      finishOnboarding();
    }
  });

  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (onboardCurrentSlide > 0) goToOnboardSlide(onboardCurrentSlide - 1);
  });

  if (skipBtn) skipBtn.addEventListener('click', finishOnboarding);
}

function goToOnboardSlide(idx) {
  onboardCurrentSlide = idx;
  // Show/hide slides
  for (let i = 1; i <= ONBOARD_TOTAL; i++) {
    const slide = document.getElementById(`onboardSlide${i}`);
    if (slide) slide.classList.toggle('active', i - 1 === idx);
  }
  // Update dots
  document.querySelectorAll('.onboard-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });
  // Update buttons
  const prevBtn = document.getElementById('btnOnboardPrev');
  const nextBtn = document.getElementById('btnOnboardNext');
  if (prevBtn) prevBtn.style.display = idx === 0 ? 'none' : 'inline-flex';
  if (nextBtn) nextBtn.innerHTML = idx === ONBOARD_TOTAL - 1 ? '<i class="fas fa-check"></i> Get Started!' : 'Next <i class="fas fa-arrow-right"></i>';
}

function finishOnboarding() {
  const modal = document.getElementById('onboardingModal');
  if (modal) closeModal(modal);
  localStorage.setItem('aptitude_onboarded', '1');
  // Prompt sign in if not logged in
  if (!state.currentStudent) {
    setTimeout(() => {
      showToast('Sign in or create a free account to save your progress!');
    }, 500);
  }
}

// =========================================================
// MOBILE DRAWER SETUP
// =========================================================
function setupMobileDrawer() {
  const hamburger = document.getElementById('btnHamburger');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const closeBtn = document.getElementById('btnCloseDrawer');

  function openDrawer() {
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // Mobile avatar button opens student auth
  const mobileAvatar = document.getElementById('btnStudentProfileMobile');
  if (mobileAvatar) {
    mobileAvatar.addEventListener('click', () => openModal(elements.studentModal));
  }

  // Drawer language buttons
  document.querySelectorAll('[data-drawer-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.language = btn.dataset.drawerLang;
      // Sync desktop lang buttons
      document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === state.language);
      });
      // Sync drawer lang buttons
      document.querySelectorAll('[data-drawer-lang]').forEach(b => {
        b.classList.toggle('active', b.dataset.drawerLang === state.language);
      });
      if (state.mode === 'analytics') renderAnalyticsDashboard();
      else renderQuestions();
      closeDrawer();
    });
  });

  // Drawer tool buttons
  const drawerMap = [
    ['btnOpenFormulasDrawer', () => { closeDrawer(); openModal(elements.formulaModal); }],
    ['btnOpenScratchpadDrawer', () => { closeDrawer(); openModal(elements.scratchpadModal); }],
    ['themeToggleBtnDrawer', () => { closeDrawer(); openModal(elements.themeModal); }],
    ['leaderboardBtnDrawer', () => { closeDrawer(); openLeaderboard(); }],
    ['btnPrintPageDrawer', () => { closeDrawer(); window.print(); }],
    ['soundToggleBtnDrawer', () => {
      state.soundEnabled = !state.soundEnabled;
      const icon = state.soundEnabled ? 'fa-volume-up' : 'fa-volume-mute';
      document.getElementById('soundToggleBtnDrawer').innerHTML = `<i class="fas ${icon}"></i><span>${state.soundEnabled ? 'Sound On' : 'Sound Off'}</span>`;
      document.getElementById('soundToggleBtn') && (document.getElementById('soundToggleBtn').innerHTML = `<i class="fas ${icon}"></i>`);
      showToast(state.soundEnabled ? 'Sound On' : 'Sound Muted');
    }]
  ];

  drawerMap.forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  });

  // Drawer stopwatch sync
  setupDrawerStopwatch();
}

function setupDrawerStopwatch() {
  const displayDrawer = document.getElementById('practiceStopwatchDisplayDrawer');
  const toggleDrawer = document.getElementById('btnToggleStopwatchDrawer');
  const resetDrawer = document.getElementById('btnResetStopwatchDrawer');

  function updateDrawerDisplay() {
    if (!displayDrawer) return;
    const mins = Math.floor(state.stopwatchSeconds / 60);
    const secs = state.stopwatchSeconds % 60;
    displayDrawer.innerText = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  }

  if (toggleDrawer) {
    toggleDrawer.addEventListener('click', () => {
      document.getElementById('btnToggleStopwatch')?.click();
      const isRunning = state.stopwatchRunning;
      toggleDrawer.innerHTML = isRunning ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
    });
  }

  if (resetDrawer) {
    resetDrawer.addEventListener('click', () => {
      document.getElementById('btnResetStopwatch')?.click();
      updateDrawerDisplay();
    });
  }

  // Sync drawer display every second when drawer is open
  setInterval(updateDrawerDisplay, 1000);
}

// =========================================================
// MOBILE BOTTOM NAV SETUP
// =========================================================
function setupBottomNav() {
  const bottomNav = document.getElementById('mobileBottomNav');
  if (!bottomNav) return;

  bottomNav.querySelectorAll('.mob-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      bottomNav.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Also sync desktop mode tabs
      document.querySelectorAll('.mode-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.mode === btn.dataset.mode);
      });
      setMode(btn.dataset.mode);
    });
  });
}

// =========================================================
// PROFILE PROGRESS SUMMARY (shown in logged-in profile view)
// =========================================================
function renderProfileProgressSummary() {
  const container = document.getElementById('profileProgressSummary');
  if (!container) return;

  const attempts = Object.values(state.practiceAttempts);
  const totalAttempted = attempts.length;
  const correct = attempts.filter(a => a.correct).length;
  const acc = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0;
  const streakData = getStreakData();

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:0.5rem;">
      <div style="background:var(--bg-primary);border:1px solid var(--border-glass);border-radius:var(--radius-sm);padding:10px;text-align:center;">
        <div style="font-size:1.3rem;font-weight:800;color:var(--accent-cyan);">${totalAttempted}</div>
        <div style="font-size:0.72rem;color:var(--text-muted);">Attempted</div>
      </div>
      <div style="background:var(--bg-primary);border:1px solid var(--border-glass);border-radius:var(--radius-sm);padding:10px;text-align:center;">
        <div style="font-size:1.3rem;font-weight:800;color:var(--accent-emerald);">${acc}%</div>
        <div style="font-size:0.72rem;color:var(--text-muted);">Accuracy</div>
      </div>
      <div style="background:var(--bg-primary);border:1px solid var(--border-glass);border-radius:var(--radius-sm);padding:10px;text-align:center;">
        <div style="font-size:1.3rem;font-weight:800;color:#f59e0b;">${streakData.count || 0}</div>
        <div style="font-size:0.72rem;color:var(--text-muted);">Day Streak</div>
      </div>
    </div>
  `;
}

// =========================================================
// SHARE SCORE (Canvas-generated share card)
// =========================================================
function shareScore(scorePct, correct, total, setName) {
  if (navigator.share) {
    const name = state.currentStudent?.name || 'I';
    navigator.share({
      title: 'AptitudeMaster 2.0 Score',
      text: `${name} scored ${scorePct}% (${correct}/${total} correct) on ${setName} — AptitudeMaster 2.0 Bilingual Aptitude Prep!`,
      url: window.location.href
    }).catch(() => {});
  } else {
    // Fallback: copy to clipboard
    const name = state.currentStudent?.name || 'I';
    const text = `${name} scored ${scorePct}% (${correct}/${total} correct) on ${setName} — AptitudeMaster 2.0!`;
    navigator.clipboard?.writeText(text).then(() => showToast('Score copied to clipboard!')).catch(() => showToast(`Score: ${scorePct}%`));
  }
}
