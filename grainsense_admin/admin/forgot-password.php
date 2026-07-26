<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width, initial-scale=1.0">

<title>GrainSense - Forgot Password</title>

<link rel="stylesheet"
href="../css/login.css">

</head>

<body>

<div class="login-box">

<img src="../img/grain-sense-logo.png" alt="GrainSense" class="brand-logo">

<h1>GrainSense</h1>
<h3 id="stepTitle">Forgot Password</h3>
<p class="step-sub" id="stepSub">Enter your email to receive a reset code</p>

<p class="error-text" id="fpError"></p>

<!-- Step 1: Email -->
<div class="step active" id="step-email">
  <input type="email" id="email" placeholder="e.g. juan@email.com" required>
  <button type="button" id="sendCodeBtn">SEND CODE</button>
</div>

<!-- Step 2: Code -->
<div class="step" id="step-code">
  <input type="text" id="code" class="code-input" maxlength="4" placeholder="0000" required>
  <button type="button" id="verifyCodeBtn">VERIFY CODE</button>
  <a href="#" class="forgot-link" id="resendLink" style="text-align:center; margin-top:14px;">Didn't get a code? Resend</a>
</div>

<!-- Step 3: New Password -->
<div class="step" id="step-newpass">
  <input type="password" id="newPassword" placeholder="New Password" required>
  <input type="password" id="confirmPassword" placeholder="Confirm New Password" required>
  <button type="button" id="resetPasswordBtn">RESET PASSWORD</button>
</div>

<a href="login.php" class="forgot-link" style="text-align:center; margin-top:12px;">Back to Login</a>

</div>

<!-- Confirm Reset Modal (kept) -->
<div class="modal-overlay" id="confirmResetModal">
  <div class="modal-card">
    <div class="modal-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    </div>
    <div class="modal-title">Change Password?</div>
    <div class="modal-msg">Are you sure you want to change your password?</div>
    <div class="modal-btn-row">
      <button type="button" class="modal-btn cancel" id="cancelResetBtn">Cancel</button>
      <button type="button" class="modal-btn confirm" id="confirmResetBtn">Yes, Change</button>
    </div>
  </div>
</div>

<!-- Success Modal (transparent, loading only, auto-redirects to login) -->
<div class="modal-overlay" id="successResetModal">
  <div class="modal-card transparent">
    <div class="modal-loading-row">
      <span class="spinner dark"></span> Taking you to the login page...
    </div>
  </div>
</div>

<script>
const API_BASE = '../api';

let email = '';
let code  = '';

function showStep(id) {
  document.querySelectorAll('.step').forEach(function (el) { el.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
}
function showError(msg) {
  const el = document.getElementById('fpError');
  el.textContent = msg;
  el.style.display = 'block';
}
function clearError() {
  document.getElementById('fpError').style.display = 'none';
}

// ── Step 1: request a code ──
document.getElementById('sendCodeBtn').addEventListener('click', async function () {
  clearError();
  email = document.getElementById('email').value.trim();
  if (!email) { showError('Please enter your email.'); return; }

  const btn = this;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Sending...';
  try {
    const res = await fetch(`${API_BASE}/forgot_password_request.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('stepTitle').textContent = 'Check Your Email';
      document.getElementById('stepSub').textContent = `Enter the 4-digit code we sent to ${email}`;
      showStep('step-code');
    } else {
      showError(data.message || 'Something went wrong.');
    }
  } catch (err) {
    showError('Could not reach the server. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'SEND CODE';
  }
});

// ── Step 2: verify the code ──
document.getElementById('verifyCodeBtn').addEventListener('click', async function () {
  clearError();
  code = document.getElementById('code').value.trim();
  if (code.length !== 4) { showError('Please enter the 4-digit code.'); return; }

  const btn = this;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Verifying...';
  try {
    const res = await fetch(`${API_BASE}/forgot_password_verify.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('stepTitle').textContent = 'Set New Password';
      document.getElementById('stepSub').textContent = 'Choose a new password for your account';
      showStep('step-newpass');
    } else {
      showError(data.message || 'Invalid or expired code.');
    }
  } catch (err) {
    showError('Could not reach the server. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'VERIFY CODE';
  }
});

document.getElementById('resendLink').addEventListener('click', function (e) {
  e.preventDefault();
  document.getElementById('sendCodeBtn').click();
});

// ── Step 3: set the new password (confirm modal kept, then transparent loading) ──
document.getElementById('resetPasswordBtn').addEventListener('click', function () {
  clearError();
  const newPassword     = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword.length < 6) { showError('Password must be at least 6 characters.'); return; }
  if (newPassword !== confirmPassword) { showError('Passwords do not match.'); return; }

  document.getElementById('confirmResetModal').classList.add('active');
});

document.getElementById('cancelResetBtn').addEventListener('click', function () {
  document.getElementById('confirmResetModal').classList.remove('active');
});

document.getElementById('confirmResetBtn').addEventListener('click', async function () {
  const btn = this;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving...';
  const newPassword = document.getElementById('newPassword').value;

  try {
    const res = await fetch(`${API_BASE}/forgot_password_reset.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const data = await res.json();

    document.getElementById('confirmResetModal').classList.remove('active');

    if (data.success) {
      // Transparent loading-only success state, then off to the login page.
      document.getElementById('successResetModal').classList.add('active');
      setTimeout(function () { window.location.href = 'login.php'; }, 1800);
    } else {
      showError(data.message || 'Something went wrong.');
    }
  } catch (err) {
    document.getElementById('confirmResetModal').classList.remove('active');
    showError('Could not reach the server. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Yes, Change';
  }
});
</script>

</body>

</html>