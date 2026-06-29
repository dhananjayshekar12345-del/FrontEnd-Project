// Initialize PDFJS Global Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// DOM Elements - Auth Wall
const authWall = document.getElementById('authWall');
const workspaceWrapper = document.getElementById('workspaceWrapper');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const signOutBtn = document.getElementById('signOutBtn');

// DOM Elements - General Workspace
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const loadingState = document.getElementById('loadingState');
const dashboard = document.getElementById('analyzerDashboard');
const themeToggle = document.getElementById('themeToggle');
const darkIcon = document.querySelector('.dark-icon');
const lightIcon = document.querySelector('.light-icon');

// Score Elements
const scoreCircle = document.getElementById('scoreCircle');
const scoreValue = document.getElementById('scoreValue');
const atsScoreValue = document.getElementById('atsScoreValue');
const sectionsScoreValue = document.getElementById('sectionsScoreValue');

// Metric Elements
const metricWordCount = document.getElementById('metricWordCount');
const metricPageCount = document.getElementById('metricPageCount');
const metricReadingTime = document.getElementById('metricReadingTime');

// Keyword & Word List Containers
const keywordsList = document.getElementById('keywordsList');
const actionVerbsCount = document.getElementById('actionVerbsCount');
const actionVerbsContainer = document.getElementById('actionVerbsContainer');
const weakWordsCount = document.getElementById('weakWordsCount');
const weakWordsContainer = document.getElementById('weakWordsContainer');
const suggestionsContainer = document.getElementById('suggestionsContainer');

// Buttons
const copySuggestionsBtn = document.getElementById('copySuggestionsBtn');
const downloadReportBtn = document.getElementById('downloadReportBtn');

// State Variables
let currentAnalysis = null;

// ==========================================
// 1. Authentication Flow Handlers
// ==========================================

// Check Auth State on Page Load
window.addEventListener('DOMContentLoaded', () => {
  // Theme load
  const savedTheme = localStorage.getItem('resume-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    darkIcon.style.display = 'none';
    lightIcon.style.display = 'block';
  } else {
    document.body.classList.remove('light-theme');
    darkIcon.style.display = 'block';
    lightIcon.style.display = 'none';
  }

  // Auth check
  const isAuthenticated = sessionStorage.getItem('resucheck_auth') === 'true';
  if (isAuthenticated) {
    showWorkspace();
  } else {
    showAuthWall();
  }
});

// Submit Login Form
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  const btnText = loginForm.querySelector('.btn-text');
  const authSpinner = loginForm.querySelector('.auth-spinner');
  
  if (!validateEmail(email)) {
    showToast('Please enter a valid email address.', true);
    return;
  }
  
  if (password.length < 6) {
    showToast('Password must be at least 6 characters.', true);
    return;
  }

  // Mock logging in state
  btnText.style.display = 'none';
  authSpinner.classList.remove('hidden');
  
  setTimeout(() => {
    sessionStorage.setItem('resucheck_auth', 'true');
    showWorkspace();
    showToast('Signed in successfully!');
    
    // Reset login inputs
    loginEmail.value = '';
    loginPassword.value = '';
    btnText.style.display = 'inline';
    authSpinner.classList.add('hidden');
  }, 1200);
});

// Logout Session Click
signOutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('resucheck_auth');
  currentAnalysis = null;
  
  // Clean uploader file list and dashboard layout
  fileInput.value = '';
  dashboard.style.display = 'none';
  dropzone.style.display = 'block';
  
  showAuthWall();
  showToast('Logged out of session.');
});

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showWorkspace() {
  authWall.classList.add('hidden');
  workspaceWrapper.classList.remove('hidden');
  signOutBtn.classList.remove('hidden');
}

function showAuthWall() {
  authWall.classList.remove('hidden');
  workspaceWrapper.classList.add('hidden');
  signOutBtn.classList.add('hidden');
}

// ==========================================
// 2. Core Dictionaries & Lists
// ==========================================

const ACTION_VERBS = [
  'achieved', 'acquired', 'adapted', 'administered', 'allocated', 'analyzed', 
  'approved', 'assembled', 'assessed', 'automated', 'budgeted', 'built', 
  'calculated', 'chaired', 'clarified', 'collaborated', 'communicated', 
  'conceptualized', 'coordinated', 'created', 'designed', 'developed', 
  'directed', 'distributed', 'documented', 'engineered', 'established', 
  'evaluated', 'executed', 'facilitated', 'forecasted', 'formulated', 
  'generated', 'guided', 'implemented', 'improved', 'initiated', 'inspected', 
  'integrated', 'invented', 'launched', 'led', 'managed', 'marketed', 
  'maximized', 'mediated', 'mentored', 'negotiated', 'obtained', 'operated', 
  'optimized', 'organized', 'oversaw', 'performed', 'planned', 'presented', 
  'produced', 'programmed', 'projected', 'promoted', 'publicized', 'recommended', 
  'reconciled', 'redirected', 'reduced', 'reorganized', 'represented', 
  'researched', 'resolved', 'restructured', 'retrieved', 'reviewed', 'scheduled', 
  'screened', 'selected', 'solved', 'spearheaded', 'stimulated', 'streamlined', 
  'strengthened', 'supervised', 'surveyed', 'taught', 'trained', 'translated', 
  'upgraded', 'validated', 'wrote'
];

const WEAK_WORDS = [
  'responsible for', 'assisted', 'helped', 'duties included', 'worked on', 
  'participated in', 'passionate', 'hardworking', 'team player', 'self-motivated', 
  'results-oriented', 'detail-oriented', 'go-getter', 'synergy', 'go-to person', 
  'think outside the box', 'utilize'
];

const INDUSTRY_KEYWORDS = [
  // Tech Core
  'react', 'javascript', 'html', 'css', 'python', 'java', 'sql', 'c++', 'c#', 
  'typescript', 'node.js', 'git', 'aws', 'docker', 'kubernetes', 'angular', 
  'vue', 'mongodb', 'postgresql', 'django', 'flask', 'spring', 'agile', 'scrum', 
  'ci/cd', 'machine learning', 'data science', 'cloud', 'linux', 'api', 'graphql',
  'restful', 'nosql', 'redis', 'devops', 'firebase', 'swift', 'kotlin', 'flutter',
  
  // Business / Marketing
  'seo', 'marketing', 'sales', 'social media', 'analytics', 'strategy', 
  'branding', 'content', 'growth', 'advertising', 'leads', 'roi', 'campaign', 
  'funnel', 'customer acquisition', 'market research', 'product management',
  
  // Management & Operations
  'leadership', 'management', 'budgeting', 'planning', 'operations', 'risk assessment', 
  'stakeholder', 'collaboration', 'negotiation', 'problem solving', 'communication',
  'project management', 'crm', 'erp'
];

// ==========================================
// 3. Drag & Drop + File Loading Events
// ==========================================

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropzone.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop zone when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
  dropzone.addEventListener(eventName, () => dropzone.classList.add('drag-over'), false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropzone.addEventListener(eventName, () => dropzone.classList.remove('drag-over'), false);
});

// Handle dropped files
dropzone.addEventListener('drop', handleDrop, false);

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  if (files.length) {
    processFile(files[0]);
  }
}

fileInput.addEventListener('change', function(e) {
  if (this.files.length) {
    processFile(this.files[0]);
  }
});

// ==========================================
// 4. Document Parsing Engines
// ==========================================

function processFile(file) {
  const fileType = file.name.split('.').pop().toLowerCase();
  
  if (fileType !== 'pdf' && fileType !== 'docx') {
    showToast('Invalid file format! Please upload a PDF or DOCX file.', true);
    return;
  }

  // Toggle Loading UI
  dropzone.style.display = 'none';
  loadingState.style.display = 'flex';
  dashboard.style.display = 'none';

  const reader = new FileReader();
  
  reader.onload = async function(e) {
    const arrayBuffer = e.target.result;
    try {
      let resultText = '';
      let pageCount = 1;
      
      if (fileType === 'pdf') {
        const parsed = await extractTextFromPDF(arrayBuffer);
        resultText = parsed.text;
        pageCount = parsed.pageCount;
      } else if (fileType === 'docx') {
        const parsed = await extractTextFromDOCX(arrayBuffer);
        resultText = parsed.text;
        pageCount = parsed.pageCount;
      }

      // Analyze Content
      analyzeResumeText(resultText, pageCount);
      
    } catch (err) {
      console.error(err);
      showToast('Error parsing file content. Please try another file.', true);
      resetUI();
    }
  };

  reader.readAsArrayBuffer(file);
}

// PDF Text Extraction using PDF.js
async function extractTextFromPDF(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  const pageCount = pdf.numPages;
  
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(" ");
    fullText += pageText + "\n";
  }
  
  return { text: fullText, pageCount };
}

// DOCX Text Extraction using Mammoth.js
async function extractTextFromDOCX(arrayBuffer) {
  const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
  const text = result.value;
  // Estimate page count for docx (standard is ~400 words per page)
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const pageCount = Math.max(1, Math.ceil(words.length / 400));
  
  return { text, pageCount };
}

// Reset view on parsing error
function resetUI() {
  dropzone.style.display = 'block';
  loadingState.style.display = 'none';
  dashboard.style.display = 'none';
}

// ==========================================
// 5. Scoring & Analysis Algorithm
// ==========================================

function analyzeResumeText(text, pageCount) {
  const cleanText = text.toLowerCase();
  
  // 1. Contact & Socials Check
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s(]*)?\(?\d{3}\)?[-.\s)]*\d{3}[-.\s]*\d{4}/g;
  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9-_]+/gi;
  const githubRegex = /github\.com\/[a-zA-Z0-9-_]+/gi;

  const hasEmail = emailRegex.test(text);
  const hasPhone = phoneRegex.test(text);
  const hasLinkedIn = linkedinRegex.test(text);
  const hasGitHub = githubRegex.test(text);

  // 2. Sections presence
  const sections = {
    experience: /(experience|employment history|work history|professional background|career history)/i.test(text),
    education: /(education|academic|university|degree|college)/i.test(text),
    skills: /(skills|technologies|technical competencies|expertise|skills summary)/i.test(text),
    projects: /(projects|personal projects|portfolio|selected projects)/i.test(text),
    certifications: /(certifications|certificates|courses|credentials|accreditations)/i.test(text)
  };

  // 3. Stats
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  // 4. Verbs & Weak Words
  const actionVerbsFound = {};
  const weakWordsFound = {};
  let totalActionVerbs = 0;
  let totalWeakWords = 0;

  // Regex tokenization for match counts
  const tokens = cleanText.split(/[^a-zA-Z0-9'-]+/);
  
  tokens.forEach(token => {
    if (ACTION_VERBS.includes(token)) {
      actionVerbsFound[token] = (actionVerbsFound[token] || 0) + 1;
      totalActionVerbs++;
    }
  });

  // Multitoken matching for weak words (since they can be phrases)
  WEAK_WORDS.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    const matches = cleanText.match(regex);
    if (matches) {
      weakWordsFound[phrase] = matches.length;
      totalWeakWords += matches.length;
    }
  });

  // 5. Keyword Density
  const keywordCounts = {};
  INDUSTRY_KEYWORDS.forEach(keyword => {
    // Escape keywords that contain dots (like node.js) for regex matching
    const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
    const matches = cleanText.match(regex);
    if (matches) {
      keywordCounts[keyword] = matches.length;
    }
  });

  // Sort keywords by frequency
  const sortedKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // 6. SCORING FORMULA
  let score = 0;
  
  // Section Checklist: 5 points each (Max 25)
  let sectionScore = 0;
  Object.values(sections).forEach(present => {
    if (present) sectionScore += 5;
  });
  score += sectionScore;

  // Contact Info & Profiles: 5 points each (Max 20)
  let contactScore = 0;
  if (hasEmail) contactScore += 5;
  if (hasPhone) contactScore += 5;
  if (hasLinkedIn) contactScore += 5;
  if (hasGitHub) contactScore += 5;
  score += contactScore;

  // Word Count and page limits (Max 15)
  let lengthScore = 0;
  if (wordCount >= 350 && wordCount <= 900) {
    lengthScore += 10;
  } else if (wordCount > 150) {
    lengthScore += 5;
  }
  if (pageCount >= 1 && pageCount <= 2) {
    lengthScore += 5;
  } else {
    lengthScore += 2;
  }
  score += lengthScore;

  // Action Verbs (Max 20)
  let verbScore = 0;
  if (totalActionVerbs >= 9) {
    verbScore += 20;
  } else if (totalActionVerbs >= 5) {
    verbScore += 12;
  } else if (totalActionVerbs >= 1) {
    verbScore += 6;
  }
  score += verbScore;

  // Weak/Fluff Words (Max 10)
  // Starts at 10, deducts 2 for each phrase occurrence, floor at 0
  let weakScore = Math.max(0, 10 - (totalWeakWords * 2));
  score += weakScore;

  // Keyword Density (Max 10)
  let kwScore = 0;
  const totalKeywordsFound = Object.keys(keywordCounts).length;
  if (totalKeywordsFound >= 5) {
    kwScore += 10;
  } else if (totalKeywordsFound >= 2) {
    kwScore += 5;
  }
  score += kwScore;

  // Ensure bounds
  score = Math.min(100, Math.max(0, Math.round(score)));

  // ATS Match Score computation:
  // Focuses strictly on structure, page format, contact availability, and formatting.
  let atsScore = 0;
  if (sections.experience) atsScore += 15;
  if (sections.education) atsScore += 15;
  if (sections.skills) atsScore += 15;
  if (hasEmail && hasPhone) atsScore += 20;
  else if (hasEmail || hasPhone) atsScore += 10;
  
  // Word count and structure check
  if (wordCount >= 300 && wordCount <= 850) atsScore += 15;
  // File compatibility check
  atsScore += 20; // Automatically gains 20 for standard formats (since it successfully read it)

  atsScore = Math.min(100, Math.max(0, atsScore));

  // Assemble current analysis state
  currentAnalysis = {
    score,
    atsScore,
    sectionsCount: Object.values(sections).filter(Boolean).length,
    wordCount,
    pageCount,
    readingTime,
    hasEmail,
    hasPhone,
    hasLinkedIn,
    hasGitHub,
    sections,
    actionVerbs: actionVerbsFound,
    totalActionVerbs,
    weakWords: weakWordsFound,
    totalWeakWords,
    keywords: sortedKeywords,
    suggestions: generateSuggestions(sections, hasEmail, hasPhone, hasLinkedIn, hasGitHub, wordCount, pageCount, totalActionVerbs, totalWeakWords, totalKeywordsFound)
  };

  // Render Dashboard details
  renderAnalysisDashboard();
}

// Suggestions Generator
function generateSuggestions(sections, hasEmail, hasPhone, hasLinkedIn, hasGitHub, wordCount, pageCount, verbCount, weakCount, kwCount) {
  const list = [];

  // Critical items
  if (!hasEmail) {
    list.push({
      type: 'critical',
      title: 'Email Address Missing',
      text: 'Recruiters cannot contact you. Ensure your primary professional email is listed clearly in the header.'
    });
  }
  if (!hasPhone) {
    list.push({
      type: 'critical',
      title: 'Phone Number Missing',
      text: 'An essential contact medium is missing. Provide a valid phone number with country/area code.'
    });
  }
  if (!sections.experience) {
    list.push({
      type: 'critical',
      title: 'Work Experience Section Not Found',
      text: 'Recruiters require an explicit timeline of your professional career. Create a clear "Work Experience" section.'
    });
  }
  if (!sections.skills) {
    list.push({
      type: 'critical',
      title: 'Skills Section Not Found',
      text: 'An ATS screens for matching technical or functional credentials. Add a dedicated "Skills" or "Core Competencies" section.'
    });
  }

  // Recommendations
  if (!hasLinkedIn) {
    list.push({
      type: 'recommendation',
      title: 'Missing LinkedIn Profile',
      text: 'Recruiters review online credentials regularly. Add your LinkedIn profile URL in your resume header.'
    });
  }
  if (!hasGitHub && kwCount > 5) {
    list.push({
      type: 'recommendation',
      title: 'Missing GitHub Portfolio',
      text: 'Since your resume contains technical keywords, hosting open-source codes boosts validation. Link your GitHub page.'
    });
  }
  if (!sections.projects) {
    list.push({
      type: 'recommendation',
      title: 'Missing Projects Section',
      text: 'Showcase hands-on applications of your skills using practical portfolio projects.'
    });
  }
  if (!sections.certifications) {
    list.push({
      type: 'recommendation',
      title: 'No Certifications Found',
      text: 'Adding specialized certificates from reputable providers reinforces qualification authority.'
    });
  }
  if (wordCount < 300) {
    list.push({
      type: 'recommendation',
      title: 'Resume is Too Short',
      text: 'Your document contains under 300 words. Elaborate on work metrics, tech stacks, and project objectives.'
    });
  } else if (wordCount > 1000) {
    list.push({
      type: 'recommendation',
      title: 'Resume is Too Long',
      text: 'Your word count exceeds 1000 words. Try to edit content down to focus strictly on major achievements.'
    });
  }
  if (pageCount > 2) {
    list.push({
      type: 'recommendation',
      title: 'Page Count Exceeds 2 Pages',
      text: 'Keep resumes to 1-2 pages maximum. Remove duplicate, outdated history details to keep it concise.'
    });
  }
  if (verbCount < 5) {
    list.push({
      type: 'recommendation',
      title: 'Low Action Verb Frequency',
      text: 'Use strong action verbs (e.g., spearheaded, designed, optimized) to represent achievements instead of listing generic tasks.'
    });
  }
  if (weakCount > 2) {
    list.push({
      type: 'recommendation',
      title: 'Too Many Fluff/Weak Phrases',
      text: 'Avoid passive statements like "responsible for" or general buzzwords ("team player", "hardworking"). Swap with measurable outcomes.'
    });
  }
  if (kwCount < 3) {
    list.push({
      type: 'recommendation',
      title: 'Low Industry Keyword Density',
      text: 'Integrate specific industry-relevant tools and stack terminology matching modern role specs.'
    });
  }

  // Good elements
  if (sections.experience && sections.skills && sections.education) {
    list.push({
      type: 'good',
      title: 'Strong Core Section Architecture',
      text: 'Your document includes standard headings that parse reliably in common applicant systems.'
    });
  }
  if (hasEmail && hasPhone) {
    list.push({
      type: 'good',
      title: 'Contact Channels Available',
      text: 'Direct contact pathways are cleanly structured in the text.'
    });
  }

  return list;
}

// ==========================================
// 6. UI Rendering & Animations
// ==========================================

function renderAnalysisDashboard() {
  const animTime = 1200; // Animations run for 1.2s

  // Reveal Dashboard container
  loadingState.style.display = 'none';
  dashboard.style.display = 'block';

  // 1. Animate Scores
  animateScoreCounter(currentAnalysis.score, scoreValue, animTime);
  animateScoreCircle(currentAnalysis.score);
  
  // Subscore labels
  document.getElementById('atsScoreValue').textContent = `${currentAnalysis.atsScore}%`;
  document.getElementById('sectionsScoreValue').textContent = `${currentAnalysis.sectionsCount}/5`;

  // 2. Setup Metrics
  metricWordCount.textContent = currentAnalysis.wordCount;
  metricPageCount.textContent = currentAnalysis.pageCount;
  metricReadingTime.textContent = `${currentAnalysis.readingTime} min`;

  // 3. Render Checklist status checkmarks
  updateChecklistItem('chkEmail', currentAnalysis.hasEmail);
  updateChecklistItem('chkPhone', currentAnalysis.hasPhone);
  updateChecklistItem('chkLinkedIn', currentAnalysis.hasLinkedIn);
  updateChecklistItem('chkGitHub', currentAnalysis.hasGitHub);
  updateChecklistItem('chkExperience', currentAnalysis.sections.experience);
  updateChecklistItem('chkEducation', currentAnalysis.sections.education);
  updateChecklistItem('chkSkills', currentAnalysis.sections.skills);
  updateChecklistItem('chkProjects', currentAnalysis.sections.projects);
  updateChecklistItem('chkCertifications', currentAnalysis.sections.certifications);

  // 4. Keyword Density Horizontal Charts
  keywordsList.innerHTML = '';
  if (currentAnalysis.keywords.length === 0) {
    keywordsList.innerHTML = `<div class="no-keywords-msg">No industry-related keywords identified. Update skills with standard tech stacks.</div>`;
  } else {
    // Get max keyword frequency to calculate scale ratio
    const maxVal = currentAnalysis.keywords[0][1];
    currentAnalysis.keywords.forEach(([name, count]) => {
      const percentage = (count / maxVal) * 100;
      
      const item = document.createElement('div');
      item.className = 'keyword-item';
      item.innerHTML = `
        <div class="keyword-header">
          <span class="keyword-name">${name.toUpperCase()}</span>
          <span class="keyword-count">${count} ${count === 1 ? 'match' : 'matches'}</span>
        </div>
        <div class="keyword-bar-container">
          <div class="keyword-bar" style="width: 0%"></div>
        </div>
      `;
      keywordsList.appendChild(item);
      
      // Delay slightly for animation entry
      setTimeout(() => {
        const bar = item.querySelector('.keyword-bar');
        if (bar) bar.style.width = `${percentage}%`;
      }, 50);
    });
  }

  // 5. Verbs and Weak words
  actionVerbsCount.textContent = currentAnalysis.totalActionVerbs;
  weakWordsCount.textContent = currentAnalysis.totalWeakWords;

  // Populate Action Verb Pills
  actionVerbsContainer.innerHTML = '';
  const sortedVerbs = Object.entries(currentAnalysis.actionVerbs).sort((a, b) => b[1] - a[1]);
  if (sortedVerbs.length === 0) {
    actionVerbsContainer.innerHTML = `<span class="checklist-item-text" style="font-style: italic;">No strong action verbs identified.</span>`;
  } else {
    sortedVerbs.forEach(([verb, count]) => {
      const pill = document.createElement('span');
      pill.className = 'word-pill positive';
      pill.innerHTML = `${verb} <span class="word-count-badge">${count}</span>`;
      actionVerbsContainer.appendChild(pill);
    });
  }

  // Populate Weak Words Pills
  weakWordsContainer.innerHTML = '';
  const sortedWeak = Object.entries(currentAnalysis.weakWords).sort((a, b) => b[1] - a[1]);
  if (sortedWeak.length === 0) {
    weakWordsContainer.innerHTML = `<span class="checklist-item-text" style="font-style: italic;">No weak/fluff words identified. Great!</span>`;
  } else {
    sortedWeak.forEach(([word, count]) => {
      const pill = document.createElement('span');
      pill.className = 'word-pill negative';
      pill.innerHTML = `${word} <span class="word-count-badge">${count}</span>`;
      weakWordsContainer.appendChild(pill);
    });
  }

  // 6. Suggestions
  suggestionsContainer.innerHTML = '';
  currentAnalysis.suggestions.forEach(s => {
    const card = document.createElement('div');
    card.className = `suggestion-card ${s.type}`;
    
    // Select Icon based on suggestion type
    let svgIcon = '';
    if (s.type === 'critical') {
      svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      `;
    } else if (s.type === 'recommendation') {
      svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `;
    } else {
      svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      `;
    }

    card.innerHTML = `
      <div class="suggestion-icon">
        ${svgIcon}
      </div>
      <div class="suggestion-content">
        <h4>${s.title}</h4>
        <p>${s.text}</p>
      </div>
    `;
    suggestionsContainer.appendChild(card);
  });
}

// Dynamic Counter Increment animation
function animateScoreCounter(target, element, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    element.textContent = Math.floor(progress * target);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = target;
    }
  };
  window.requestAnimationFrame(step);
}

// Circular stroke-dashoffset SVG animation
function animateScoreCircle(score) {
  const circumference = 2 * Math.PI * 72; // 452.4
  const offset = circumference - (score / 100) * circumference;
  
  // Set stroke color based on rating score range
  if (score >= 80) {
    scoreCircle.style.stroke = 'var(--success)';
  } else if (score >= 50) {
    scoreCircle.style.stroke = 'var(--warning)';
  } else {
    scoreCircle.style.stroke = 'var(--danger)';
  }
  
  scoreCircle.style.strokeDashoffset = offset;
}

// Checklist Item Status styling helper
function updateChecklistItem(itemId, isFound) {
  const el = document.getElementById(itemId);
  const badge = el.querySelector('.status-badge');
  
  el.className = `checklist-item ${isFound ? 'found' : 'missing'}`;
  
  if (isFound) {
    badge.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
      </svg>
    `;
  } else {
    badge.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
      </svg>
    `;
  }
}

// Toast notification helper
function showToast(message, isError = false) {
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  const icon = toast.querySelector('svg');
  
  toastMsg.textContent = message;
  
  if (isError) {
    toast.style.borderColor = 'var(--danger)';
    icon.style.stroke = 'var(--danger)';
    icon.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    `;
  } else {
    toast.style.borderColor = 'var(--primary)';
    icon.style.stroke = 'var(--success)';
    icon.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    `;
  }
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ==========================================
// 7. Action Button Handlers
// ==========================================

// Copy Suggestions to Clipboard
copySuggestionsBtn.addEventListener('click', () => {
  if (!currentAnalysis) return;
  
  let clipText = `Resume Analysis Report - Suggestions:\n`;
  clipText += `=======================================\n`;
  clipText += `Score: ${currentAnalysis.score}/100\n`;
  clipText += `ATS Compatibility: ${currentAnalysis.atsScore}%\n\n`;
  
  const critical = currentAnalysis.suggestions.filter(s => s.type === 'critical');
  const recommendations = currentAnalysis.suggestions.filter(s => s.type === 'recommendation');
  
  if (critical.length) {
    clipText += `CRITICAL ERRORS:\n`;
    critical.forEach(s => {
      clipText += `✗ ${s.title}: ${s.text}\n`;
    });
    clipText += `\n`;
  }
  
  if (recommendations.length) {
    clipText += `SUGGESTED RECOMMENDATIONS:\n`;
    recommendations.forEach(s => {
      clipText += `• ${s.title}: ${s.text}\n`;
    });
  }
  
  navigator.clipboard.writeText(clipText)
    .then(() => {
      showToast('Suggestions copied to clipboard successfully!');
    })
    .catch(err => {
      console.error(err);
      showToast('Failed to copy to clipboard.', true);
    });
});

// Download PDF Report - Opens clean print window
downloadReportBtn.addEventListener('click', () => {
  if (!currentAnalysis) return;

  const a = currentAnalysis;

  // Build checklist rows
  const checkRow = (label, found) =>
    `<div class="chk-item ${found ? 'found' : 'missing'}">
      <span class="chk-icon">${found ? '✓' : '✗'}</span>
      <span>${label}</span>
    </div>`;

  // Build keyword rows
  const maxKw = a.keywords.length ? a.keywords[0][1] : 1;
  const kwRows = a.keywords.length
    ? a.keywords.map(([k, c]) => `
      <div class="kw-row">
        <div class="kw-label"><span>${k.toUpperCase()}</span><span>${c} match${c !== 1 ? 'es' : ''}</span></div>
        <div class="kw-bar-bg"><div class="kw-bar" style="width:${Math.round((c/maxKw)*100)}%"></div></div>
      </div>`).join('')
    : '<p style="color:#64748b;font-style:italic">No industry keywords detected.</p>';

  // Build suggestion rows
  const suggRows = a.suggestions.map(s => {
    const color = s.type === 'critical' ? '#ef4444' : s.type === 'recommendation' ? '#f59e0b' : '#10b981';
    const icon = s.type === 'critical' ? '⚠' : s.type === 'recommendation' ? 'ℹ' : '✓';
    return `<div class="sugg-row" style="border-left-color:${color}">
      <span class="sugg-icon" style="color:${color}">${icon}</span>
      <div><strong>${s.title}</strong><p>${s.text}</p></div>
    </div>`;
  }).join('');

  // Build verb pills
  const verbPills = Object.entries(a.actionVerbs).sort((x,y)=>y[1]-x[1])
    .map(([v,c]) => `<span class="pill green">${v} <b>${c}</b></span>`).join('');
  const weakPills = Object.entries(a.weakWords).sort((x,y)=>y[1]-x[1])
    .map(([w,c]) => `<span class="pill red">${w} <b>${c}</b></span>`).join('');

  // Score circle SVG colour
  const circleColor = a.score >= 80 ? '#10b981' : a.score >= 50 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 72;
  const offset = circumference - (a.score / 100) * circumference;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ATS Resume Report – Score ${a.score}/100</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Plus Jakarta Sans',sans-serif;background:#f8fafc;color:#0f172a;padding:32px;font-size:14px}
  h1{font-size:22px;font-weight:800;margin-bottom:4px;color:#1e293b}
  .subtitle{color:#64748b;font-size:13px;margin-bottom:24px}
  .header-bar{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:18px;border-bottom:2px solid #e2e8f0}
  .logo{font-size:18px;font-weight:800;color:#6366f1}
  .meta{font-size:11px;color:#94a3b8;text-align:right}
  .top-grid{display:grid;grid-template-columns:220px 1fr;gap:20px;margin-bottom:20px}
  .score-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px}
  .score-card h3{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#64748b;margin-bottom:4px}
  .score-svg{width:150px;height:150px}
  .circle-bg{fill:none;stroke:#e2e8f0;stroke-width:12}
  .circle-prog{fill:none;stroke-width:12;stroke-linecap:round;stroke-dasharray:${circumference};stroke-dashoffset:${offset};transform:rotate(-90deg);transform-origin:50% 50%;stroke:${circleColor}}
  .score-inner{position:relative;width:150px;height:150px}
  .score-abs{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center}
  .score-num{font-size:36px;font-weight:800;color:${circleColor}}
  .score-sub{font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px}
  .pills-row{display:flex;gap:12px;width:100%}
  .pill-box{flex:1;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;padding:10px;text-align:center}
  .pill-box strong{display:block;font-size:18px;font-weight:800;color:#1e293b}
  .pill-box span{font-size:10px;color:#64748b;text-transform:uppercase;font-weight:600}
  .checklist-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:20px}
  .card-title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#64748b;margin-bottom:14px;border-bottom:1px solid #f1f5f9;padding-bottom:8px}
  .chk-group-label{font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;letter-spacing:.8px;margin:12px 0 8px}
  .chk-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .chk-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;border:1px solid transparent;font-size:13px;font-weight:500}
  .chk-item.found{border-color:rgba(16,185,129,.2);background:rgba(16,185,129,.05);color:#1e293b}
  .chk-item.missing{border-color:rgba(239,68,68,.2);background:rgba(239,68,68,.05);color:#64748b}
  .chk-icon{font-size:14px;font-weight:800;width:20px;text-align:center}
  .found .chk-icon{color:#10b981}
  .missing .chk-icon{color:#ef4444}
  .metrics-row{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px}
  .metric-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px;display:flex;align-items:center;gap:12px}
  .metric-icon{width:36px;height:36px;border-radius:8px;background:#eef2ff;display:flex;align-items:center;justify-content:center;font-size:18px}
  .metric-label{font-size:10px;text-transform:uppercase;font-weight:700;color:#94a3b8;letter-spacing:.5px}
  .metric-value{font-size:18px;font-weight:800;color:#1e293b;margin-top:2px}
  .row-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
  .section-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:20px}
  .kw-row{margin-bottom:10px}
  .kw-label{display:flex;justify-content:space-between;font-size:12px;font-weight:600;margin-bottom:4px;color:#334155}
  .kw-bar-bg{height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden}
  .kw-bar{height:100%;background:linear-gradient(135deg,#6366f1,#a855f7);border-radius:4px}
  .verb-split{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .pills{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
  .pill{font-size:11px;padding:4px 10px;border-radius:6px;font-weight:600;display:inline-flex;align-items:center;gap:4px}
  .pill.green{background:rgba(16,185,129,.1);color:#059669;border:1px solid rgba(16,185,129,.2)}
  .pill.red{background:rgba(239,68,68,.1);color:#dc2626;border:1px solid rgba(239,68,68,.2)}
  .pill b{font-weight:800}
  .sugg-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:20px;margin-bottom:20px}
  .sugg-row{display:flex;gap:12px;padding:12px;border-left:4px solid #e2e8f0;border-radius:0 8px 8px 0;background:#f8fafc;margin-bottom:8px;align-items:flex-start}
  .sugg-icon{font-size:16px;font-weight:700;flex-shrink:0;width:20px;text-align:center}
  .sugg-row strong{font-size:13px;font-weight:700;display:block;margin-bottom:3px;color:#1e293b}
  .sugg-row p{font-size:12px;color:#64748b;line-height:1.4}
  .footer-report{text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8}
  .footer-report strong{color:#6366f1}
  @media print{body{padding:16px}@page{margin:10mm}}
</style>
</head>
<body>
  <div class="header-bar">
    <div>
      <div class="logo">⚡ ResuCheck ATS</div>
      <p class="subtitle">Resume Analysis Report · Generated ${new Date().toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</p>
    </div>
    <div class="meta">
      <div>Mohammed Haseeb</div>
      <div>mohammedhaseeb.dev@gmail.com</div>
      <div style="margin-top:4px"><a href="https://digitalheroesco.com" style="color:#6366f1;text-decoration:none;font-weight:700">digitalheroesco.com</a></div>
    </div>
  </div>

  <div class="top-grid">
    <!-- Score Circle -->
    <div class="score-card">
      <div class="score-card">
        <h3>Overall Score</h3>
        <div class="score-inner">
          <svg class="score-svg" viewBox="0 0 170 170">
            <circle class="circle-bg" cx="85" cy="85" r="72"/>
            <circle class="circle-prog" cx="85" cy="85" r="72"/>
          </svg>
          <div class="score-abs">
            <div class="score-num">${a.score}</div>
            <div class="score-sub">/100</div>
          </div>
        </div>
        <div class="pills-row">
          <div class="pill-box"><strong>${a.atsScore}%</strong><span>ATS Match</span></div>
          <div class="pill-box"><strong>${a.sectionsCount}/5</strong><span>Sections</span></div>
        </div>
      </div>
    </div>

    <!-- Checklist -->
    <div class="checklist-card">
      <div class="card-title">Resume Checklist</div>
      <div class="chk-group-label">Contact &amp; Professional Links</div>
      <div class="chk-grid">
        ${checkRow('Email Address', a.hasEmail)}
        ${checkRow('Phone Number', a.hasPhone)}
        ${checkRow('LinkedIn Profile', a.hasLinkedIn)}
        ${checkRow('GitHub Link', a.hasGitHub)}
      </div>
      <div class="chk-group-label">Standard ATS Sections</div>
      <div class="chk-grid">
        ${checkRow('Work Experience', a.sections.experience)}
        ${checkRow('Education', a.sections.education)}
        ${checkRow('Skills Section', a.sections.skills)}
        ${checkRow('Projects', a.sections.projects)}
        ${checkRow('Certifications', a.sections.certifications)}
      </div>
    </div>
  </div>

  <!-- Metrics -->
  <div class="metrics-row">
    <div class="metric-card"><div class="metric-icon">📄</div><div><div class="metric-label">Word Count</div><div class="metric-value">${a.wordCount}</div></div></div>
    <div class="metric-card"><div class="metric-icon">📋</div><div><div class="metric-label">Page Count</div><div class="metric-value">${a.pageCount}</div></div></div>
    <div class="metric-card"><div class="metric-icon">⏱</div><div><div class="metric-label">Reading Time</div><div class="metric-value">${a.readingTime} min</div></div></div>
  </div>

  <!-- Keywords + Verbs -->
  <div class="row-2">
    <div class="section-card">
      <div class="card-title">Keyword Density</div>
      ${kwRows}
    </div>
    <div class="section-card">
      <div class="card-title">Action &amp; Tone Analysis</div>
      <div class="verb-split">
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#10b981;margin-bottom:6px">Action Verbs (${a.totalActionVerbs})</div>
          <div class="pills">${verbPills || '<span style="color:#94a3b8;font-style:italic;font-size:12px">None found</span>'}</div>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#ef4444;margin-bottom:6px">Weak Words (${a.totalWeakWords})</div>
          <div class="pills">${weakPills || '<span style="color:#94a3b8;font-style:italic;font-size:12px">None found — great!</span>'}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Suggestions -->
  <div class="sugg-card">
    <div class="card-title">Recommended Improvements</div>
    ${suggRows || '<p style="color:#64748b;font-style:italic">No suggestions — excellent resume!</p>'}
  </div>

  <div class="footer-report">
    Generated by <strong>ResuCheck ATS</strong> · <strong>Built for <a href="https://digitalheroesco.com" style="color:#6366f1">Digital Heroes</a></strong> · Mohammed Haseeb · mohammedhaseeb.dev@gmail.com
  </div>

  <script>window.onload=()=>{window.print()}<\/script>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  showToast('Report ready — use browser Print → Save as PDF!');
});

// ==========================================
// 8. Light/Dark Theme Switching
// ==========================================

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  
  if (isLight) {
    darkIcon.style.display = 'none';
    lightIcon.style.display = 'block';
    localStorage.setItem('resume-theme', 'light');
  } else {
    darkIcon.style.display = 'block';
    lightIcon.style.display = 'none';
    localStorage.setItem('resume-theme', 'dark');
  }
});
