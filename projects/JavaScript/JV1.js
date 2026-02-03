// Toggle between login and register
function showLogin() {
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('registerSection').style.display = 'none';
  document.getElementById('loginTab').classList.add('active');
  document.getElementById('registerTab').classList.remove('active');
  document.getElementById('loginInfo').style.display = 'block';
  document.getElementById('registerInfo').style.display = 'none';
  hideAlerts();
}

function showRegister() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('registerSection').style.display = 'block';
  document.getElementById('loginTab').classList.remove('active');
  document.getElementById('registerTab').classList.add('active');
  document.getElementById('loginInfo').style.display = 'none';
  document.getElementById('registerInfo').style.display = 'block';
  hideAlerts();
}

// Toggle password visibility
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector('i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('bi-eye');
    icon.classList.add('bi-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('bi-eye-slash');
    icon.classList.add('bi-eye');
  }
}

// Hide alerts
function hideAlerts() {
  document.getElementById('alertError').classList.add('d-none');
  document.getElementById('alertSuccess').classList.add('d-none');
}

// Show error alert
function showError(message) {
  const alert = document.getElementById('alertError');
  document.getElementById('errorMessage').textContent = message;
  alert.classList.remove('d-none');
  applyShake();
}

// Show success alert
function showSuccess(message) {
  const alert = document.getElementById('alertSuccess');
  document.getElementById('successMessage').textContent = message;
  alert.classList.remove('d-none');
}

// Shake animation
function applyShake() {
  const container = document.querySelector('.auth-form-side');
  container.classList.add('shake');
  setTimeout(() => {
    container.classList.remove('shake');
  }, 500);
}

// Password strength checker
document.getElementById('regPassword').addEventListener('input', function() {
  const password = this.value;
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');
  
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;
  
  const percentage = (strength / 5) * 100;
  strengthFill.style.width = percentage + '%';
  
  if (strength <= 2) {
    strengthFill.className = 'strength-fill weak';
    strengthText.textContent = 'ضعيفة';
    strengthText.className = 'text-danger';
  } else if (strength <= 3) {
    strengthFill.className = 'strength-fill medium';
    strengthText.textContent = 'متوسطة';
    strengthText.className = 'text-warning';
  } else {
    strengthFill.className = 'strength-fill strong';
    strengthText.textContent = 'قوية';
    strengthText.className = 'text-success';
  }
});

// Check password match
function checkPasswords() {
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;
  const matchFeedback = document.getElementById('passwordMatchFeedback');
  const successFeedback = document.getElementById('passwordMatchSuccess');

  if (confirmPassword.length === 0) {
    matchFeedback.style.display = 'none';
    successFeedback.style.display = 'none';
    return true;
  }

  if (password !== confirmPassword) {
    matchFeedback.style.display = 'block';
    successFeedback.style.display = 'none';
    return false;
  } else {
    matchFeedback.style.display = 'none';
    successFeedback.style.display = 'block';
    return true;
  }
}

document.getElementById('regConfirmPassword').addEventListener('input', checkPasswords);
document.getElementById('regPassword').addEventListener('input', function() {
  if (document.getElementById('regConfirmPassword').value) {
    checkPasswords();
  }
});

// Toggle user type fields
document.querySelectorAll('input[name="userType"]').forEach(radio => {
  radio.addEventListener('change', function() {
    if (this.value === 'employer') {
      document.getElementById('employerFields').style.display = 'block';
      document.getElementById('seekerFields').style.display = 'none';
      document.getElementById('businessName').required = true;
      document.getElementById('firstName').required = false;
      document.getElementById('lastName').required = false;
    } else {
      document.getElementById('employerFields').style.display = 'none';
      document.getElementById('seekerFields').style.display = 'block';
      document.getElementById('businessName').required = false;
      document.getElementById('firstName').required = true;
      document.getElementById('lastName').required = true;
    }
  });
});

// Clear storage on page load
if (localStorage.getItem('ajeer_user_logged_in') === 'true') {
  localStorage.removeItem('ajeer_jobs'); 
  localStorage.removeItem('ajeer_business_profile');
  localStorage.removeItem('ajeer_business_type');
  localStorage.removeItem('ajeer_business_name');
  localStorage.removeItem('ajeer_user_logged_in');
}

// Login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  const originalContent = btn.innerHTML;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>جاري تسجيل الدخول...';
  btn.disabled = true;
  hideAlerts();
  
  // Simulate API call
  setTimeout(() => {
    // Change isError to false for successful login
    const isError = false;
    
    if (isError) {
      showError('خطأ في البريد الإلكتروني أو كلمة المرور. يرجى المحاولة مرة أخرى.');
      btn.innerHTML = originalContent;
      btn.disabled = false;
    } else {
      localStorage.setItem('ajeer_user_logged_in', 'true');
      localStorage.setItem('ajeer_user_email', email);
      showSuccess('تم تسجيل الدخول بنجاح! جاري التحويل...');
      
      setTimeout(() => {
        const hasProfile = localStorage.getItem('ajeer_business_type');
        if (hasProfile) {
          window.location.href = 'dashboard_prototype.html';
        } else {
          window.location.href = 'business-profile.html';
        }
      }, 1000);
    }
  }, 1500);
});

// Register form submission
document.getElementById('registerForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  if (!checkPasswords()) {
    showError('كلمات المرور غير متطابقة. يرجى التأكد من كتابتها بشكل صحيح.');
    return;
  }

  const userType = document.querySelector('input[name="userType"]:checked').value;
  const email = document.getElementById('regEmail').value;
  const phone = document.getElementById('phone').value;
  
  let name;
  if (userType === 'employer') {
    name = document.getElementById('businessName').value;
  } else {
    name = document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value;
  }

  localStorage.setItem('ajeer_user_type', userType);
  localStorage.setItem('ajeer_user_name', name);
  localStorage.setItem('ajeer_user_email', email);
  localStorage.setItem('ajeer_user_phone', phone);
  localStorage.setItem('ajeer_user_logged_in', 'true');
  
  showSuccess('تم إنشاء الحساب بنجاح! جاري التحويل...');
  
  setTimeout(() => {
    if (userType === 'employer') {
      window.location.href = 'business-profile.html';
    } else {
      window.location.href = 'seeker-profile.html';
    }
  }, 1500);
});