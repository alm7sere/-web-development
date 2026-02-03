// Global variables
let selectedSkills = [];
let currentStep = 1;
let editingJobId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check if editing
    const urlParams = new URLSearchParams(window.location.search);
    editingJobId = urlParams.get('edit');
    
    if (editingJobId) {
        loadJobForEdit(editingJobId);
    }
    
    // Character counter
    const descriptionField = document.getElementById('jobDescription');
    if (descriptionField) {
        descriptionField.addEventListener('input', function() {
            const count = this.value.length;
            document.getElementById('charCount').textContent = count;
            
            if (count > 500) {
                this.value = this.value.substring(0, 500);
                document.getElementById('charCount').textContent = 500;
            }
        });
    }
    
    // Skills selection
    const skillButtons = document.querySelectorAll('.skill-btn');
    skillButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const skill = this.dataset.skill;
            
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                selectedSkills = selectedSkills.filter(s => s !== skill);
            } else {
                this.classList.add('selected');
                selectedSkills.push(skill);
            }
            
            document.getElementById('selectedSkills').value = selectedSkills.join(',');
        });
    });
    
    // Auto-fill location from business profile
    const profile = JSON.parse(localStorage.getItem('ajeer_business_profile') || '{}');
    if (profile.location && !editingJobId) {
        document.getElementById('jobLocation').value = profile.location;
    }
});

// Load job for editing
function loadJobForEdit(jobId) {
    const jobs = JSON.parse(localStorage.getItem('ajeer_jobs') || '[]');
    const job = jobs.find(j => j.id == jobId);
    
    if (!job) {
        alert('لم يتم العثور على الوظيفة');
        window.location.href = 'dashboard_fixed.html';
        return;
    }
    
    // Fill form fields
    document.getElementById('jobTitle').value = job.title || '';
    document.getElementById('jobType').value = job.type || '';
    document.getElementById('jobCategory').value = job.category || '';
    document.getElementById('jobDescription').value = job.description || '';
    document.getElementById('jobLocation').value = job.location || '';
    document.getElementById('jobPositions').value = job.positions || 1;
    document.getElementById('jobSalary').value = job.salary || '';
    document.getElementById('salaryType').value = job.salaryType || 'ساعة';
    document.getElementById('jobDuration').value = job.duration || '';
    document.getElementById('workTimeFrom').value = job.workTimeFrom || '09:00';
    document.getElementById('workTimeTo').value = job.workTimeTo || '17:00';
    document.getElementById('additionalRequirements').value = job.additionalRequirements || '';
    
    // Select skills
    if (job.skills && job.skills.length > 0) {
        selectedSkills = job.skills;
        job.skills.forEach(skill => {
            const btn = document.querySelector(`[data-skill="${skill}"]`);
            if (btn) btn.classList.add('selected');
        });
    }
    
    // Select days
    if (job.workDays && job.workDays.length > 0) {
        job.workDays.forEach(day => {
            const checkbox = document.querySelector(`.day-checkbox[value="${day}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Update character count
    document.getElementById('charCount').textContent = job.description?.length || 0;
}

// Navigation
function nextStep(step) {
    // Validate current step
    if (!validateStep(currentStep)) {
        return;
    }
    
    // Update steps
    document.querySelector(`#step${currentStep}`).classList.remove('active');
    document.querySelector(`[data-step="${currentStep}"]`).classList.add('completed');
    document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
    
    currentStep = step;
    
    document.querySelector(`#step${step}`).classList.add('active');
    document.querySelector(`[data-step="${step}"]`).classList.add('active');
    
    // If step 3, show review
    if (step === 3) {
        showReview();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(step) {
    // Update steps
    document.querySelector(`#step${currentStep}`).classList.remove('active');
    document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
    
    currentStep = step;
    
    document.querySelector(`#step${step}`).classList.add('active');
    document.querySelector(`[data-step="${step}"]`).classList.add('active');
    document.querySelector(`[data-step="${step}"]`).classList.remove('completed');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validation
function validateStep(step) {
    if (step === 1) {
        const title = document.getElementById('jobTitle').value.trim();
        const type = document.getElementById('jobType').value;
        const category = document.getElementById('jobCategory').value;
        const description = document.getElementById('jobDescription').value.trim();
        const location = document.getElementById('jobLocation').value.trim();
        
        if (!title) {
            alert('الرجاء إدخال عنوان الوظيفة');
            return false;
        }
        if (!type) {
            alert('الرجاء اختيار نوع الوظيفة');
            return false;
        }
        if (!category) {
            alert('الرجاء اختيار فئة الوظيفة');
            return false;
        }
        if (!description) {
            alert('الرجاء إدخال وصف الوظيفة');
            return false;
        }
        if (!location) {
            alert('الرجاء إدخال موقع الوظيفة');
            return false;
        }
    }
    
    if (step === 2) {
        if (selectedSkills.length === 0) {
            alert('الرجاء اختيار مهارة واحدة على الأقل');
            return false;
        }
        
        const salary = document.getElementById('jobSalary').value;
        if (!salary || salary <= 0) {
            alert('الرجاء إدخال الأجر');
            return false;
        }
        
        const selectedDays = document.querySelectorAll('.day-checkbox:checked');
        if (selectedDays.length === 0) {
            alert('الرجاء اختيار يوم عمل واحد على الأقل');
            return false;
        }
    }
    
    return true;
}

// Show review
function showReview() {
    const reviewDiv = document.getElementById('jobReview');
    
    const title = document.getElementById('jobTitle').value;
    const type = document.getElementById('jobType').value;
    const category = document.getElementById('jobCategory').value;
    const description = document.getElementById('jobDescription').value;
    const location = document.getElementById('jobLocation').value;
    const positions = document.getElementById('jobPositions').value;
    const salary = document.getElementById('jobSalary').value;
    const salaryType = document.getElementById('salaryType').value;
    const duration = document.getElementById('jobDuration').value;
    const timeFrom = document.getElementById('workTimeFrom').value;
    const timeTo = document.getElementById('workTimeTo').value;
    const additional = document.getElementById('additionalRequirements').value;
    
    const selectedDays = Array.from(document.querySelectorAll('.day-checkbox:checked')).map(cb => cb.value);
    
    reviewDiv.innerHTML = `
        <div class="review-item">
            <div class="review-label">عنوان الوظيفة</div>
            <div class="review-value">${title}</div>
        </div>
        <div class="review-item">
            <div class="review-label">النوع والفئة</div>
            <div class="review-value">${type} - ${category}</div>
        </div>
        <div class="review-item">
            <div class="review-label">الوصف</div>
            <div class="review-value text-muted">${description.substring(0, 150)}${description.length > 150 ? '...' : ''}</div>
        </div>
        <div class="review-item">
            <div class="review-label">الموقع</div>
            <div class="review-value"><i class="bi bi-geo-alt me-2"></i>${location}</div>
        </div>
        <div class="review-item">
            <div class="review-label">عدد الوظائف</div>
            <div class="review-value">${positions} ${positions == 1 ? 'وظيفة' : 'وظائف'}</div>
        </div>
        <div class="review-item">
            <div class="review-label">المهارات المطلوبة</div>
            <div class="review-skills">
                ${selectedSkills.map(skill => `<span class="review-skill-tag">${skill}</span>`).join('')}
            </div>
        </div>
        <div class="review-item">
            <div class="review-label">الأجر</div>
            <div class="review-value">${salary} دينار/${salaryType}</div>
        </div>
        <div class="review-item">
            <div class="review-label">المدة المتوقعة</div>
            <div class="review-value">${duration}</div>
        </div>
        <div class="review-item">
            <div class="review-label">ساعات وأيام العمل</div>
            <div class="review-value">
                من ${timeFrom} إلى ${timeTo}<br>
                ${selectedDays.join(', ')}
            </div>
        </div>
        ${additional ? `
        <div class="review-item">
            <div class="review-label">متطلبات إضافية</div>
            <div class="review-value text-muted">${additional}</div>
        </div>
        ` : ''}
    `;
}

// Form submission
document.getElementById('jobForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>جاري النشر...';
    
    // Collect data
    const selectedDays = Array.from(document.querySelectorAll('.day-checkbox:checked')).map(cb => cb.value);
    
    const jobData = {
        id: editingJobId || Date.now(),
        title: document.getElementById('jobTitle').value.trim(),
        type: document.getElementById('jobType').value,
        category: document.getElementById('jobCategory').value,
        description: document.getElementById('jobDescription').value.trim(),
        location: document.getElementById('jobLocation').value.trim(),
        positions: parseInt(document.getElementById('jobPositions').value),
        skills: selectedSkills,
        salary: parseFloat(document.getElementById('jobSalary').value),
        salaryType: document.getElementById('salaryType').value,
        duration: document.getElementById('jobDuration').value,
        workTimeFrom: document.getElementById('workTimeFrom').value,
        workTimeTo: document.getElementById('workTimeTo').value,
        workDays: selectedDays,
        additionalRequirements: document.getElementById('additionalRequirements').value.trim(),
        status: 'active',
        postedAt: editingJobId ? undefined : new Date().toLocaleDateString('ar'),
        updatedAt: editingJobId ? new Date().toLocaleDateString('ar') : undefined
    };
    
    // Save to localStorage
    let jobs = JSON.parse(localStorage.getItem('ajeer_jobs') || '[]');
    
    if (editingJobId) {
        // Update existing job
        const index = jobs.findIndex(j => j.id == editingJobId);
        if (index !== -1) {
            jobs[index] = { ...jobs[index], ...jobData };
        }
    } else {
        // Add new job
        jobs.push(jobData);
    }
    
    localStorage.setItem('ajeer_jobs', JSON.stringify(jobs));
    
    // Add notification
    const notifications = JSON.parse(localStorage.getItem('ajeer_notifications') || '[]');
    notifications.unshift({
        id: Date.now(),
        title: editingJobId ? 'تم تحديث الوظيفة' : 'تم نشر وظيفة جديدة',
        message: `وظيفة "${jobData.title}" ${editingJobId ? 'تم تحديثها' : 'تم نشرها'} بنجاح`,
        icon: 'bi-check-circle',
        time: 'الآن',
        read: false
    });
    localStorage.setItem('ajeer_notifications', JSON.stringify(notifications));
    
    // Simulate API call delay
    setTimeout(() => {
        submitBtn.innerHTML = '<i class="bi bi-check-lg me-2"></i>تم بنجاح!';
        
        setTimeout(() => {
            window.location.href = 'dashboard_fixed.html';
        }, 1000);
    }, 1500);
});