// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loading...');
    checkLogin();
    loadBusinessInfo();
    loadJobs();
    loadApplicants();
    updateStats();
    loadNotifications();
});

// Check if user is logged in
function checkLogin() {
    const isLoggedIn = localStorage.getItem('ajeer_user_logged_in');
    if (!isLoggedIn) {
        alert('يجب تسجيل الدخول أولاً');
        window.location.href = 'login.html';
    }
}

// Load business information
function loadBusinessInfo() {
    // Get all possible sources of business data
    const profile = JSON.parse(localStorage.getItem('ajeer_business_profile') || '{}');
    const userName = localStorage.getItem('ajeer_user_name') || '';
    const businessName = localStorage.getItem('ajeer_business_name') || '';
    const userEmail = localStorage.getItem('ajeer_user_email') || '';
    
    console.log('Loading business info:', {profile, userName, businessName});
    
    // Determine the actual business name
    const actualName = profile.name || businessName || userName || 'صاحب العمل';
    const actualType = profile.type || 'منشأة';
    
    // Update navbar
    const nameNav = document.getElementById('businessNameNav');
    const typeNav = document.getElementById('businessTypeNav');
    const nameWelcome = document.getElementById('businessNameWelcome');
    
    if (nameNav) nameNav.textContent = actualName;
    if (typeNav) typeNav.textContent = actualType;
    if (nameWelcome) nameWelcome.textContent = actualName;
    
    // Update avatar
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(actualName)}&background=3498db&color=fff&bold=true`;
    const avatarEl = document.getElementById('businessAvatar');
    if (avatarEl) avatarEl.src = avatarUrl;
    
    // Load profile modal
    loadProfileModal(actualName, actualType, profile, userEmail);
}

// Load profile modal content
function loadProfileModal(name, type, profile, email) {
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3498db&color=fff&bold=true&size=128`;
    const profileModalBody = document.getElementById('profileModalBody');
    
    if (profileModalBody) {
        profileModalBody.innerHTML = `
            <div class="text-center mb-4">
                <img src="${avatarUrl}" alt="Avatar" class="rounded-circle mb-3" width="100" height="100">
                <h5 class="mb-1">${name}</h5>
                <p class="text-muted small">${type}</p>
            </div>
            <hr>
            <div class="row g-3">
                <div class="col-12">
                    <div class="d-flex align-items-start gap-3">
                        <i class="bi bi-building text-primary fs-5"></i>
                        <div class="flex-fill">
                            <label class="form-label fw-bold text-muted small mb-1">اسم المنشأة</label>
                            <p class="mb-0">${name}</p>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="d-flex align-items-start gap-3">
                        <i class="bi bi-briefcase text-primary fs-5"></i>
                        <div class="flex-fill">
                            <label class="form-label fw-bold text-muted small mb-1">نوع النشاط</label>
                            <p class="mb-0">${type}</p>
                        </div>
                    </div>
                </div>
                ${email ? `
                <div class="col-12">
                    <div class="d-flex align-items-start gap-3">
                        <i class="bi bi-envelope text-primary fs-5"></i>
                        <div class="flex-fill">
                            <label class="form-label fw-bold text-muted small mb-1">البريد الإلكتروني</label>
                            <p class="mb-0">${email}</p>
                        </div>
                    </div>
                </div>
                ` : ''}
                ${profile.phone ? `
                <div class="col-12">
                    <div class="d-flex align-items-start gap-3">
                        <i class="bi bi-phone text-primary fs-5"></i>
                        <div class="flex-fill">
                            <label class="form-label fw-bold text-muted small mb-1">رقم التواصل</label>
                            <p class="mb-0 dir-ltr text-start">${profile.phone}</p>
                        </div>
                    </div>
                </div>
                ` : ''}
                ${profile.location ? `
                <div class="col-12">
                    <div class="d-flex align-items-start gap-3">
                        <i class="bi bi-geo-alt text-primary fs-5"></i>
                        <div class="flex-fill">
                            <label class="form-label fw-bold text-muted small mb-1">الموقع</label>
                            <p class="mb-0">${profile.location}</p>
                        </div>
                    </div>
                </div>
                ` : ''}
                ${profile.description ? `
                <div class="col-12">
                    <div class="d-flex align-items-start gap-3">
                        <i class="bi bi-card-text text-primary fs-5"></i>
                        <div class="flex-fill">
                            <label class="form-label fw-bold text-muted small mb-1">نبذة عن المنشأة</label>
                            <p class="mb-0 text-muted small">${profile.description}</p>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
            <hr>
            <a href="business-profile.html" class="btn btn-primary w-100">
                <i class="bi bi-pencil me-2"></i>
                تعديل المعلومات
            </a>
        `;
    }
}

// Load jobs
function loadJobs() {
    const jobs = JSON.parse(localStorage.getItem('ajeer_jobs') || '[]');
    const container = document.getElementById('jobsContainer');
    const countEl = document.getElementById('jobsCount');
    
    if (countEl) countEl.textContent = jobs.length;
    
    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-inbox display-1 text-muted"></i>
                <h5 class="mt-3">لا توجد وظائف منشورة بعد</h5>
                <p class="text-muted">ابدأ بنشر أول وظيفة لك</p>
                <a href="post_job_final.html" class="btn btn-primary mt-3">
                    <i class="bi bi-plus-lg me-2"></i>
                    إنشاء وظيفة
                </a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = jobs.map(job => `
        <div class="job-card" data-job-id="${job.id}">
            <div class="job-header">
                <div>
                    <h6 class="job-title">${job.title}</h6>
                    <span class="status-badge ${job.status === 'active' ? 'status-new' : 'status-rejected'}">
                        ${job.status === 'active' ? 'نشط' : 'منتهي'}
                    </span>
                </div>
                <div class="dropdown">
                    <button class="btn btn-sm btn-light" data-bs-toggle="dropdown">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="post_job_final.html?edit=${job.id}">
                            <i class="bi bi-pencil me-2"></i>تعديل
                        </a></li>
                        <li><a class="dropdown-item text-danger" href="#" onclick="deleteJob(${job.id}); return false;">
                            <i class="bi bi-trash me-2"></i>حذف
                        </a></li>
                    </ul>
                </div>
            </div>
            
            <div class="job-meta">
                <span class="job-meta-item">
                    <i class="bi bi-briefcase"></i>
                    ${job.type || 'دوام جزئي'}
                </span>
                <span class="job-meta-item">
                    <i class="bi bi-cash"></i>
                    ${job.salary} ${job.salaryType || 'دينار/ساعة'}
                </span>
                ${job.location ? `
                <span class="job-meta-item">
                    <i class="bi bi-geo-alt"></i>
                    ${job.location}
                </span>
                ` : ''}
                <span class="job-meta-item">
                    <i class="bi bi-calendar"></i>
                    ${job.postedAt || new Date().toLocaleDateString('ar')}
                </span>
            </div>
            
            ${job.description ? `<p class="text-muted mb-3">${job.description.substring(0, 150)}${job.description.length > 150 ? '...' : ''}</p>` : ''}
            
            ${job.skills && job.skills.length > 0 ? `
            <div class="job-skills">
                ${job.skills.slice(0, 5).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                ${job.skills.length > 5 ? `<span class="skill-tag">+${job.skills.length - 5}</span>` : ''}
            </div>
            ` : ''}
            
            <div class="job-actions">
                <button class="btn btn-primary btn-sm flex-fill" onclick="viewJobApplicants(${job.id})">
                    <i class="bi bi-people me-2"></i>
                    عرض المتقدمين (${getJobApplicantsCount(job.id)})
                </button>
                <a href="post_job_final.html?edit=${job.id}" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-pencil"></i>
                </a>
            </div>
        </div>
    `).join('');
}

// Load applicants
function loadApplicants() {
    const applicants = JSON.parse(localStorage.getItem('ajeer_applicants') || '[]');
    const container = document.getElementById('applicantsContainer');
    const badge = document.getElementById('applicantsBadge');
    
    console.log('Total applicants in system:', applicants.length);
    
    const newApplicants = applicants.filter(a => a.status === 'new');
    
    if (badge) {
        badge.textContent = newApplicants.length;
        badge.style.display = newApplicants.length > 0 ? 'inline' : 'none';
    }
    
    if (applicants.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-person-x display-1 text-muted"></i>
                <h5 class="mt-3">لا يوجد متقدمون حالياً</h5>
                <p class="text-muted">عندما يتقدم أحد للوظائف، ستظهر طلباته هنا</p>
                <p class="text-muted small">
                    <i class="bi bi-info-circle me-1"></i>
                    تأكد من أن لديك وظائف منشورة ونشطة
                </p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = applicants.map(applicant => `
        <div class="applicant-card">
            <div class="applicant-header">
                <img src="${applicant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(applicant.name)}&background=random`}" 
                     alt="${applicant.name}" 
                     class="applicant-avatar">
                <div class="applicant-info flex-fill">
                    <h6>${applicant.name}</h6>
                    <p class="applicant-job">تقدم لوظيفة: ${getJobTitle(applicant.jobId)}</p>
                    <span class="status-badge ${applicant.status === 'new' ? 'status-new' : applicant.status === 'accepted' ? 'status-accepted' : 'status-rejected'}">
                        ${applicant.status === 'new' ? 'جديد' : applicant.status === 'accepted' ? 'مقبول' : 'مرفوض'}
                    </span>
                </div>
                <small class="text-muted">${applicant.appliedAt || 'اليوم'}</small>
            </div>
            
            ${applicant.skills && applicant.skills.length > 0 ? `
            <div class="applicant-skills">
                ${applicant.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            ` : ''}
            
            ${applicant.status === 'new' ? `
            <div class="d-flex gap-2 mt-3">
                <button class="btn btn-success btn-sm flex-fill" onclick="acceptApplicant(${applicant.id})">
                    <i class="bi bi-check-lg me-2"></i>قبول
                </button>
                <button class="btn btn-danger btn-sm flex-fill" onclick="rejectApplicant(${applicant.id})">
                    <i class="bi bi-x-lg me-2"></i>رفض
                </button>
            </div>
            ` : ''}
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    const jobs = JSON.parse(localStorage.getItem('ajeer_jobs') || '[]');
    const applicants = JSON.parse(localStorage.getItem('ajeer_applicants') || '[]');
    
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const newApplicants = applicants.filter(a => a.status === 'new').length;
    const pendingApplicants = applicants.filter(a => a.status === 'pending').length;
    const acceptedApplicants = applicants.filter(a => a.status === 'accepted').length;
    
    document.getElementById('activeJobsCount').textContent = activeJobs;
    document.getElementById('newApplicantsCount').textContent = newApplicants;
    document.getElementById('pendingCount').textContent = pendingApplicants;
    document.getElementById('acceptedCount').textContent = acceptedApplicants;
}

// Load notifications
function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem('ajeer_notifications') || '[]');
    const badge = document.getElementById('notificationBadge');
    const list = document.getElementById('notificationsList');
    
    if (!badge || !list) return;
    
    const unread = notifications.filter(n => !n.read);
    badge.textContent = unread.length;
    badge.style.display = unread.length > 0 ? 'inline' : 'none';
    
    if (notifications.length === 0) {
        list.innerHTML = '<a class="dropdown-item text-muted text-center py-3">لا توجد إشعارات جديدة</a>';
        return;
    }
    
    list.innerHTML = notifications.slice(0, 5).map(notif => `
        <li>
            <a class="dropdown-item ${!notif.read ? 'bg-light' : ''}" href="#" onclick="markAsRead(${notif.id}); return false;">
                <div class="d-flex align-items-start gap-2">
                    <i class="bi ${notif.icon || 'bi-bell'} text-primary mt-1"></i>
                    <div class="flex-fill">
                        <div class="small fw-semibold">${notif.title}</div>
                        <div class="small text-muted">${notif.message}</div>
                        <div class="small text-muted">${notif.time}</div>
                    </div>
                </div>
            </a>
        </li>
    `).join('');
}

// Helper functions
function getJobApplicantsCount(jobId) {
    const applicants = JSON.parse(localStorage.getItem('ajeer_applicants') || '[]');
    return applicants.filter(a => a.jobId == jobId).length;
}

function getJobTitle(jobId) {
    const jobs = JSON.parse(localStorage.getItem('ajeer_jobs') || '[]');
    const job = jobs.find(j => j.id == jobId);
    return job ? job.title : 'غير محدد';
}

function deleteJob(jobId) {
    if (!confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) return;
    
    let jobs = JSON.parse(localStorage.getItem('ajeer_jobs') || '[]');
    jobs = jobs.filter(j => j.id != jobId);
    localStorage.setItem('ajeer_jobs', JSON.stringify(jobs));
    
    loadJobs();
    updateStats();
    addNotification('تم الحذف', 'تم حذف الوظيفة بنجاح', 'bi-trash');
}

function viewJobApplicants(jobId) {
    const tab = new bootstrap.Tab(document.getElementById('applicants-tab'));
    tab.show();
    loadApplicants();
}

function acceptApplicant(applicantId) {
    const applicants = JSON.parse(localStorage.getItem('ajeer_applicants') || '[]');
    const index = applicants.findIndex(a => a.id == applicantId);
    
    if (index !== -1) {
        applicants[index].status = 'accepted';
        localStorage.setItem('ajeer_applicants', JSON.stringify(applicants));
        loadApplicants();
        updateStats();
        addNotification('تم القبول', `تم قبول ${applicants[index].name}`, 'bi-check-circle');
    }
}

function rejectApplicant(applicantId) {
    if (!confirm('هل أنت متأكد من رفض هذا المتقدم؟')) return;
    
    const applicants = JSON.parse(localStorage.getItem('ajeer_applicants') || '[]');
    const index = applicants.findIndex(a => a.id == applicantId);
    
    if (index !== -1) {
        applicants[index].status = 'rejected';
        localStorage.setItem('ajeer_applicants', JSON.stringify(applicants));
        loadApplicants();
        updateStats();
        addNotification('تم الرفض', `تم رفض ${applicants[index].name}`, 'bi-x-circle');
    }
}

function showApplicantsTab() {
    const tab = new bootstrap.Tab(document.getElementById('applicants-tab'));
    tab.show();
}

function addNotification(title, message, icon = 'bi-bell') {
    const notifications = JSON.parse(localStorage.getItem('ajeer_notifications') || '[]');
    
    const newNotif = {
        id: Date.now(),
        title: title,
        message: message,
        icon: icon,
        time: 'الآن',
        read: false
    };
    
    notifications.unshift(newNotif);
    localStorage.setItem('ajeer_notifications', JSON.stringify(notifications));
    loadNotifications();
}

function markAsRead(notifId) {
    const notifications = JSON.parse(localStorage.getItem('ajeer_notifications') || '[]');
    const index = notifications.findIndex(n => n.id == notifId);
    
    if (index !== -1) {
        notifications[index].read = true;
        localStorage.setItem('ajeer_notifications', JSON.stringify(notifications));
        loadNotifications();
    }
}