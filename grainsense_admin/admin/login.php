<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width, initial-scale=1.0">

<title>GrainSense Admin Login</title>

<link rel="stylesheet"
href="../css/login.css">

</head>

<body>

<div class="login-box">

<img src="../img/grain-sense-logo.png" alt="GrainSense" class="brand-logo">

<h1>GrainSense</h1>
<h3>Admin Login</h3>

<p class="error-text" id="loginError"></p>

<form id="loginForm">

<input
type="text"
id="username"
name="username"
placeholder="Username"
required>

<input
type="password"
id="password"
name="password"
placeholder="Password"
required>

<a href="forgot-password.php" class="forgot-link">Forgot password?</a>

<button type="submit">

LOGIN

</button>

</form>

</div>

<!-- Loading Modal (transparent, no card background — auto-redirects) -->
<div class="modal-overlay" id="successModal">
  <div class="modal-card transparent">
    <div class="modal-loading-row">
      <span class="spinner dark"></span> Logging you in...
    </div>
  </div>
</div>

<script>
const form         = document.getElementById('loginForm');
const successModal = document.getElementById('successModal');
const errorText    = document.getElementById('loginError');
const loginBtn     = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  errorText.style.display = 'none';

  loginBtn.disabled = true;
  successModal.classList.add('active');

  try {
    const res = await fetch('../api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value,
      }),
    });
    const data = await res.json();

    if (data.success) {
      // small delay so the loading state doesn't feel instant/jarring
      setTimeout(function () { window.location.href = 'dashboard.php'; }, 1800);
    } else {
      successModal.classList.remove('active');
      loginBtn.disabled = false;
      errorText.textContent = data.message || 'Invalid username or password.';
      errorText.style.display = 'block';
    }
  } catch (err) {
    successModal.classList.remove('active');
    loginBtn.disabled = false;
    errorText.textContent = 'Could not reach the server. Please try again.';
    errorText.style.display = 'block';
  }
});
</script>

</body>

</html>