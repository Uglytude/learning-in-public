// ===== Section Navigation =====
function showSection(id) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-card').forEach(c => c.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelector(`[data-section="${id}"]`).classList.add('active');
  document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== Git vs GitHub Toggle =====
function toggleGitGithub(type) {
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('git-display').classList.toggle('hidden', type !== 'git');
  document.getElementById('github-display').classList.toggle('hidden', type !== 'github');
}

// ===== Commit Playground =====
let codeLines = ['<h1>Hello World</h1>'];
let commitCount = 0;
const codeSnippets = [
  '<p>Welcome to my site</p>',
  '<img src="logo.png" />',
  '<button>Click me!</button>',
  '<footer>© 2024</footer>',
  '<nav>Home | About</nav>',
  '<div class="card">...</div>',
  '<script src="app.js"><\/script>',
];

function addCodeLine() {
  if (codeLines.length > 7) return;
  const snippet = codeSnippets[codeLines.length - 1] || '<div>more code</div>';
  codeLines.push(snippet);
  const body = document.getElementById('editor-body');
  const line = document.createElement('div');
  line.className = 'code-line';
  line.innerHTML = `<span class="line-num">${codeLines.length}</span><span class="code-text"><span class="new">+ ${snippet}</span></span>`;
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}

function makeCommit() {
  if (codeLines.length <= commitCount + 1 && commitCount > 0) return;
  commitCount++;
  const timeline = document.getElementById('commit-timeline');
  const node = document.createElement('div');
  node.className = 'commit-node';
  node.textContent = `C${commitCount}`;
  node.title = `Commit #${commitCount}: ${codeLines.length} lines`;
  timeline.appendChild(node);
  const body = document.getElementById('editor-body');
  body.style.boxShadow = 'inset 0 0 20px rgba(0,0,0,.08)';
  setTimeout(() => body.style.boxShadow = '', 500);
  body.querySelectorAll('.new').forEach(el => { el.className = ''; });
}

// ===== Branch Visualization =====
let branchData = { main: [], feature: [], hasFeature: false };
const colors = { main: '#000000', feature: '#86868b' };

function resetBranches() {
  branchData = { main: [{ x: 80, label: 'C1' }], feature: [], hasFeature: false };
  document.getElementById('feature-commit-btn').disabled = true;
  drawBranches();
}

function createBranch() {
  if (branchData.hasFeature) return;
  branchData.hasFeature = true;
  if (branchData.main.length === 0) branchData.main.push({ x: 80, label: 'C1' });
  const lastMain = branchData.main[branchData.main.length - 1];
  branchData.feature.push({ x: lastMain.x, label: lastMain.label, isFork: true });
  document.getElementById('feature-commit-btn').disabled = false;
  drawBranches();
}

function addBranchCommit(branch) {
  const arr = branchData[branch];
  if (!arr) return;
  if (branch === 'feature' && !branchData.hasFeature) return;
  const lastX = arr.length > 0 ? arr[arr.length - 1].x : 40;
  const totalCommits = branchData.main.length + branchData.feature.filter(c => !c.isFork).length;
  const label = `C${totalCommits + 1}`;
  arr.push({ x: lastX + 90, label });
  drawBranches();
}

function drawBranches() {
  const canvas = document.getElementById('branchCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.scale(dpr, dpr);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  const mainY = 100, featureY = 220, r = 18;
  if (branchData.main.length > 0) {
    ctx.strokeStyle = colors.main; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(20, mainY);
    branchData.main.forEach(c => ctx.lineTo(c.x, mainY)); ctx.stroke();
    ctx.fillStyle = colors.main; ctx.font = '600 14px Inter'; ctx.fillText('main', 10, mainY - 30);
  }
  if (branchData.hasFeature && branchData.feature.length > 0) {
    ctx.strokeStyle = colors.feature; ctx.lineWidth = 3;
    const fork = branchData.feature[0];
    ctx.beginPath(); ctx.moveTo(fork.x, mainY); ctx.lineTo(fork.x + 45, featureY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fork.x + 45, featureY);
    branchData.feature.forEach((c, i) => { if (i > 0) ctx.lineTo(c.x, featureY); });
    if (branchData.feature.length > 1) ctx.stroke();
    ctx.fillStyle = colors.feature; ctx.font = '600 14px Inter'; ctx.fillText('feature', 10, featureY - 30);
  }
  branchData.main.forEach(c => {
    ctx.beginPath(); ctx.arc(c.x, mainY, r, 0, Math.PI * 2);
    ctx.fillStyle = colors.main; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '700 11px Inter'; ctx.textAlign = 'center';
    ctx.fillText(c.label, c.x, mainY + 4); ctx.textAlign = 'start';
  });
  branchData.feature.forEach((c, i) => {
    if (c.isFork) return;
    ctx.beginPath(); ctx.arc(c.x, featureY, r, 0, Math.PI * 2);
    ctx.fillStyle = colors.feature; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '700 11px Inter'; ctx.textAlign = 'center';
    ctx.fillText(c.label, c.x, featureY + 4); ctx.textAlign = 'start';
  });
}
setTimeout(() => { branchData.main.push({ x: 80, label: 'C1' }); drawBranches(); }, 100);

// ===== Merge Animation =====
let mergeStep_ = 0;
const mergeSteps = [
  { narration: 'Step 1: 你有一个 main 分支，正在稳定运行', draw: 'step1' },
  { narration: 'Step 2: 你创建了 feature 分支并做了几次提交', draw: 'step2' },
  { narration: 'Step 3: 功能完成！把 feature 合并回 main', draw: 'step3' },
  { narration: 'Step 4: 合并成功！main 包含了所有新功能', draw: 'step4' },
];
function resetMerge() { mergeStep_ = 0; drawMerge('init'); document.getElementById('merge-narration').textContent = '点击"下一步"开始演示'; }
function mergeStep() {
  if (mergeStep_ >= mergeSteps.length) { resetMerge(); return; }
  const step = mergeSteps[mergeStep_];
  document.getElementById('merge-narration').textContent = step.narration;
  drawMerge(step.draw); mergeStep_++;
  document.getElementById('merge-step-btn').textContent = mergeStep_ >= mergeSteps.length ? '重新开始' : '下一步';
}
function drawMerge(step) {
  const canvas = document.getElementById('mergeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr;
  ctx.scale(dpr, dpr);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  const mainY = 100, featY = 220, r = 18;
  const mainC = '#000000', featC = '#86868b', mergeC = '#1d1d1f';
  function circle(x, y, color, label) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '700 11px Inter'; ctx.textAlign = 'center';
    ctx.fillText(label, x, y + 4); ctx.textAlign = 'start';
  }
  function line(x1, y1, x2, y2, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  ctx.fillStyle = mainC; ctx.font = '600 14px Inter'; ctx.fillText('main', 10, mainY - 30);
  if (step === 'init') { line(20, mainY, 200, mainY, mainC); circle(80, mainY, mainC, 'C1'); circle(170, mainY, mainC, 'C2'); return; }
  if (step === 'step1') { line(20, mainY, 290, mainY, mainC); circle(80, mainY, mainC, 'C1'); circle(170, mainY, mainC, 'C2'); circle(260, mainY, mainC, 'C3'); }
  if (step === 'step2' || step === 'step3' || step === 'step4') {
    line(20, mainY, 290, mainY, mainC); circle(80, mainY, mainC, 'C1'); circle(170, mainY, mainC, 'C2'); circle(260, mainY, mainC, 'C3');
    ctx.fillStyle = featC; ctx.font = '600 14px Inter'; ctx.fillText('feature', 10, featY - 30);
    line(260, mainY, 310, featY, featC); line(310, featY, 490, featY, featC);
    circle(350, featY, featC, 'C4'); circle(440, featY, featC, 'C5');
  }
  if (step === 'step3') {
    ctx.setLineDash([6, 4]); line(440, featY, 530, mainY, mergeC); ctx.setLineDash([]);
    ctx.fillStyle = mergeC; ctx.font = '600 13px Inter'; ctx.fillText('合并中...', 460, (mainY + featY) / 2);
  }
  if (step === 'step4') {
    line(290, mainY, 560, mainY, mainC); line(440, featY, 530, mainY, mergeC);
    circle(530, mainY, mergeC, 'M');
    ctx.globalAlpha = 0.3; ctx.fillStyle = featC; ctx.font = '600 14px Inter';
    ctx.fillText('feature (已合并)', 10, featY - 30); ctx.globalAlpha = 1;
    ctx.fillStyle = mergeC; ctx.font = '600 13px Inter'; ctx.fillText('✅ 合并完成！', 540, mainY + 30);
  }
}
setTimeout(() => drawMerge('init'), 200);

// ===== PR Simulator =====
function prNext(step) {
  document.querySelectorAll('.pr-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`pr-step-${step}`).classList.add('active');
}
function prReset() { prNext(1); }

window.addEventListener('resize', () => { drawBranches(); drawMerge(mergeStep_ > 0 ? mergeSteps[mergeStep_ - 1]?.draw || 'init' : 'init'); });