let allJobs = [];
let filteredJobs = [];
let currentJobId = null;
let seekerProfile = {};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadJobs();
    updateStats();
    setupFilters();
});

// Load user info
function loadUserInfo() {
    seekerProfile = JSON.parse(localStorage.getItem('ajeer_seeker_profile') || '{}');
    const userName = seekerProfile.firstName + ' ' + (seekerProfile.lastName || '');
    
    document.getElementById('userName').textContent = userName || 'المستخدم';
    
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2ecc71&color=fff`;
    document.getElementById('userAvatar').src = avatarUrl;
}

// Load jobs
function loadJobs() {
    // Get ALL jobs from localStorage (same source as employer)
    allJobs = JSON.parse(localStorage.getItem('ajeer_jobs') || '[]');
    
    console.log('Total jobs in system:', allJobs.length);
    
    // Filter only active jobs
    allJobs = allJobs.filter(job => job.status === 'active');
    
    console.log('Active jobs:', allJobs.length);
    
    filteredJobs = [...allJobs];
    displayJobs();
}

// Display jobs
function displayJobs() {
    const container = document.getElementById('jobsContainer');
    document.getElementById('displayedJobsCount').textContent = filteredJobs.length;
    document.getElementById('totalJobs').textContent = allJobs.length;
    
    if (filteredJobs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-search display-1 text-muted"></i>
                <h5 class="mt-3">لا توجد وظائف متاحة حالياً</h5>
                <p class="text-muted">جرب تغيير الفلاتر أو العودة لاحقاً</p>
            </div>
        `;
        return;
    }
    
    // Get user skills for matching
    const userSkills = seekerProfile.skills || [];
    
    container.innerHTML = filteredJobs.map(job => {
        // Check if already applied
        const applications = JSON.parse(localStorage.getItem('ajeer_applicants') || '[]');
        const hasApplied = applications.some(app => 
            app.jobId == job.id && app.seekerId == (seekerProfile.id || 'current')
        );
        
        // Calculate match score
        const matchedSkills = job.skills.filter(skill => userSkills.includes(skill));
        const matchScore = matchedSkills.length;
        const isMatched = matchScore > 0;
        
        // Get business profile
        const businessProfile = JSON.parse(localStorage.getItem('ajeer_business_profile') || '{}');
        
        return `
            <div class="job-card ${isMatched ? 'matched' : ''}" onclick="showJobDetails(${job.id})">
                <div class="job-header">
                    <div class="company-info">
                        <div class="company-logo">
                            <i class="bi bi-building-fill"></i>
                        </div>
                        <div>
                            <h6 class="job-title">${job.title}</h6>
                            <p class="company-name mb-0">${businessProfile.name || 'شركة'}</p>
                        </div>
                    </div>
                    ${isMatched ? `
                    <div class="match-badge">
                        <i class="bi bi-star-fill"></i>
                        ${matchScore} مهارة مطابقة
                    </div>
                    ` : ''}
                </div>
                
                <div class="job-meta">
                    <span class="job-meta-item">
                        <i class="bi bi-briefcase"></i>
                        ${job.type || 'دوام جزئي'}
                    </span>
                    <span class="job-meta-item">
                        <i class="bi bi-geo-alt"></i>
                        ${job.location || 'عمان'}
                    </span>
                    <span class="job-meta-item">
                        <i class="bi bi-calendar"></i>
                        ${job.postedAt || 'اليوم'}
                    </span>
                    <span class="job-meta-item">
                        <i class="bi bi-people"></i>
                        ${job.positions || 1} ${job.positions == 1 ? 'وظيفة' : 'وظائف'}
                    </span>
                </div>
                
                <p class="job-description">
                    ${job.description ? job.description.substring(0, 150) + (job.description.length > 150 ? '...' : '') : 'لا يوجد وصف'}
                </p>
                
                ${job.skills && job.skills.length > 0 ? `
                <div class="job-skills">
                    ${job.skills.slice(0, 5).map(skill => 
                        `<span class="skill-tag ${userSkills.includes(skill) ? 'matched-skill' : ''}">${skill}</span>`
                    ).join('')}
                    ${job.skills.length > 5 ? `<span class="skill-tag">+${job.skills.length - 5}</span>` : ''}
                </div>
                ` : ''}
                
                <div class="job-footer">
                    <div class="salary-info">
                        <i class="bi bi-cash"></i>
                        ${job.salary} دينار/${job.salaryType || 'ساعة'}
                    </div>
                    ${hasApplied ? 
                        '<span class="applied-badge"><i class="bi bi-check-lg me-2"></i>تم التقديم</span>' :
                        '<button class="apply-btn" onclick="event.stopPropagation(); quickApply(' + job.id + ')"><i class="bi bi-send me-2"></i>تقدم الآن</button>'
                    }
                </div>
            </div>
        `;
    }).join('');
}

// Show job details modal
function showJobDetails(jobId) {
    const job = allJobs.find(j => j.id == jobId);
    if (!job) return;
    
    currentJobId = jobId;
    
    const businessProfile = JSON.parse(localStorage.getItem('ajeer_business_profile') || '{}');
    const userSkills = seekerProfile.skills || [];
    const applications = JSON.parse(localStorage.getItem('ajeer_applicants') || '[]');
    const hasApplied = applications.some(app => 
        app.jobId == job.id && app.seekerId == (seekerProfile.id || 'current')
    );
    
    document.getElementById('modalJobTitle').textContent = job.title;
    
    document.getElementById('modalJobBody').innerHTML = `
        <div class="mb-4">
            <div class="d-flex align-items-center gap-3 mb-3">
                <div class="company-logo">
                    <i class="bi bi-building-fill"></i>
                </div>
                <div>
                    <h5 class="mb-1">${businessProfile.name || 'شركة'}</h5>
                    <p class="text-muted mb-0">${businessProfile.type || ''}</p>
                </div>
            </div>
        </div>
        
        <div class="row g-3 mb-4">
            <div class="col-6">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-briefcase text-primary"></i>
                    <div>
                        <small class="text-muted d-block">النوع</small>
                        <strong>${job.type || 'دوام جزئي'}</strong>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-tag text-primary"></i>
                    <div>
                        <small class="text-muted d-block">الفئة</small>
                        <strong>${job.category || '-'}</strong>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-geo-alt text-primary"></i>
                    <div>
                        <small class="text-muted d-block">الموقع</small>
                        <strong>${job.location || 'عمان'}</strong>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-cash text-primary"></i>
                    <div>
                        <small class="text-muted d-block">الأجر</small>
                        <strong>${job.salary} دينار/${job.salaryType || 'ساعة'}</strong>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-clock text-primary"></i>
                    <div>
                        <small class="text-muted d-block">ساعات العمل</small>
                        <strong>${job.workTimeFrom || '09:00'} - ${job.workTimeTo || '17:00'}</strong>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-calendar-check text-primary"></i>
                    <div>
                        <small class="text-muted d-block">المدة</small>
                        <strong>${job.duration || '-'}</strong>
                    </div>
                </div>
            </div>
        </div>
        
        ${job.workDays && job.workDays.length > 0 ? `
        <div class="mb-4">
            <h6 class="fw-bold mb-2">أيام العمل</h6>
            <div class="d-flex flex-wrap gap-2">
                ${job.workDays.map(day => `<span class="badge bg-primary">${day}</span>`).join('')}
            </div>
        </div>
        ` : ''}
        
        <div class="mb-4">
            <h6 class="fw-bold mb-2">الوصف</h6>
            <p class="text-muted">${job.description || 'لا يوجد وصف'}</p>
        </div>
        
        ${job.skills && job.skills.length > 0 ? `
        <div class="mb-4">
            <h6 class="fw-bold mb-2">المهارات المطلوبة</h6>
            <div class="d-flex flex-wrap gap-2">
                ${job.skills.map(skill => 
                    `<span class="skill-tag ${userSkills.includes(skill) ? 'matched-skill' : ''}">${skill}</span>`
                ).join('')}
            </div>
        </div>
        ` : ''}
        
        ${job.additionalRequirements ? `
        <div class="mb-4">
            <h6 class="fw-bold mb-2">متطلبات إضافية</h6>
            <p class="text-muted">${job.additionalRequirements}</p>
        </div>
        ` : ''}
        
        ${businessProfile.phone ? `
        <div class="mb-3">
            <h6 class="fw-bold mb-2">للتواصل</h6>
            <p class="text-muted mb-0">
                <i class="bi bi-phone me-2"></i>
                ${businessProfile.phone}
            </p>
        </div>
        ` : ''}
    `;
    
    const applyBtn = document.getElementById('applyBtn');
    if (hasApplied) {
        applyBtn.disabled = true;
        applyBtn.innerHTML = '<i class="bi bi-check-lg me-2"></i>تم التقديم مسبقاً';
    } else {
        applyBtn.disabled = false;
        applyBtn.innerHTML = '<i class="bi bi-send me-2"></i>تقدم للوظيفة';
    }
    
    const modal = new bootstrap.Modal(document.getElementById('jobModal'));
    modal.show();
}

// Quick apply
function quickApply(jobId) {
    currentJobId = jobId;
    applyForJob();
}

// Apply for job
function applyForJob() {
    if (!currentJobId) return;
    
    // Check if already applied
    const applications = JSON.parse(localStorage.getItem('ajeer_applicants') || '[]');
    const hasApplied = applications.some(app => 
        app.jobId == currentJobId && app.seekerId == (seekerProfile.id || 'current')
    );
    
    if (hasApplied) {
        alert('لقد تقدمت لهذه الوظيفة مسبقاً');
        return;
    }
    
    // Create application
    const application = {
        id: Date.now(),
        jobId: currentJobId,
        seekerId: seekerProfile.id || 'current',
        name: seekerProfile.firstName + ' ' + (seekerProfile.lastName || ''),
        phone: seekerProfile.phone,
        age: seekerProfile.age,
        city: seekerProfile.city,
        skills: seekerProfile.skills || [],
        experience: seekerProfile.experience || '',
        education: seekerProfile.education || '',
        status: 'new',
        appliedAt: new Date().toLocaleDateString('ar'),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(seekerProfile.firstName)}&background=random`
    };
    
    applications.push(application);
    localStorage.setItem('ajeer_applicants', JSON.stringify(applications));
    
    // Add notification for employer
    const notifications = JSON.parse(localStorage.getItem('ajeer_notifications') || '[]');
    const job = allJobs.find(j => j.id == currentJobId);
    notifications.unshift({
        id: Date.now(),
        title: 'متقدم جديد',
        message: `${application.name} تقدم لوظيفة "${job.title}"`,
        icon: 'bi-person-plus',
        time: 'الآن',
        read: false
    });
    localStorage.setItem('ajeer_notifications', JSON.stringify(notifications));
    
    // Show success
    alert('تم التقديم بنجاح! سيتم التواصل معك قريباً');
    
    // Close modal if open
    const modal = bootstrap.Modal.getInstance(document.getElementById('jobModal'));
    if (modal) modal.hide();
    
    // Reload jobs
    displayJobs();
    updateStats();
}

// Update stats
function updateStats() {
    const applications = JSON.parse(localStorage.getItem('ajeer_applicants') || '[]');
    const myApplications = applications.filter(app => app.seekerId == (seekerProfile.id || 'current'));
    
    document.getElementById('myApplications').textContent = myApplications.length;
    
    const count = document.getElementById('applicationsCount');
    if (myApplications.length > 0) {
        count.textContent = myApplications.length;
        count.style.display = 'inline';
    }
    
    // Calculate matching jobs
    const userSkills = seekerProfile.skills || [];
    const matching = allJobs.filter(job => 
        job.skills && job.skills.some(skill => userSkills.includes(skill))
    );
    document.getElementById('matchingJobs').textContent = matching.length;
}

// Setup filters
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const typeFilter = document.getElementById('typeFilter');
    
    searchInput.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    typeFilter.addEventListener('change', applyFilters);
    
    // Sort options
    document.querySelectorAll('input[name="sortBy"]').forEach(radio => {
        radio.addEventListener('change', function() {
            sortJobs(this.value);
        });
    });
}

// Apply filters
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const type = document.getElementById('typeFilter').value;
    
    filteredJobs = allJobs.filter(job => {
        const matchSearch = !searchTerm || 
            job.title.toLowerCase().includes(searchTerm) ||
            job.description?.toLowerCase().includes(searchTerm);
        const matchCategory = !category || job.category === category;
        const matchType = !type || job.type === type;
        
        return matchSearch && matchCategory && matchType;
    });
    
    // Apply current sort
    const currentSort = document.querySelector('input[name="sortBy"]:checked').value;
    sortJobs(currentSort);
}

// Sort jobs
function sortJobs(sortBy) {
    const userSkills = seekerProfile.skills || [];
    
    if (sortBy === 'newest') {
        filteredJobs.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'salary') {
        filteredJobs.sort((a, b) => b.salary - a.salary);
    } else if (sortBy === 'match') {
        filteredJobs.sort((a, b) => {
            const matchA = a.skills?.filter(s => userSkills.includes(s)).length || 0;
            const matchB = b.skills?.filter(s => userSkills.includes(s)).length || 0;
            return matchB - matchA;
        });
    }
    
    displayJobs();
}

// Clear filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('typeFilter').value = '';
    filteredJobs = [...allJobs];
    displayJobs();
}