const API_BASE = 'https://schema-wuc7.onrender.com'; // آدرس Runflare خودتون

// بررسی لاگین بودن کاربر
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    if (!token || !user) {
        window.location.href = 'login.html';
        return null;
    }

    return { token, user: JSON.parse(user) };
}

// بارگذاری اولیه صفحه
document.addEventListener('DOMContentLoaded', function () {
    const auth = checkAuth();
    if (!auth) return;

    // نمایش اطلاعات کاربر
    displayUserInfo(auth.user);

    // بارگذاری تاریخچه کاربر
    loadUserHistory();
    loadUserStats();
});

// نمایش اطلاعات کاربر
function displayUserInfo(user) {
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();
}

// ارسال فرم تحلیل
document.getElementById('schemaForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const auth = checkAuth();
    if (!auth) return;

    // پنهان کردن پیام‌های قبلی
    hideMessages();

    // غیرفعال کردن دکمه ارسال
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('loading').style.display = 'block';
    document.getElementById('result').style.display = 'none';

    try {
        const formData = {
            situation: document.getElementById('situation').value.trim(),
            thoughts: document.getElementById('thoughts').value.trim(),
            emotions: document.getElementById('emotions').value.trim(),
            behavior: document.getElementById('behavior').value.trim()
        };

        const response = await fetch(`${API_BASE}/api/secure/analyze-schema`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            displayAnalysis(data.analysis);
            showSuccess('تحلیل با موفقیت انجام شد!');

            // بارگذاری مجدد تاریخچه
            loadUserHistory();
            loadUserStats();

            // خالی کردن فرم
            document.getElementById('schemaForm').reset();

        } else {
            showError(data.error || 'خطا در تحلیل فرم');
        }

    } catch (error) {
        showError('خطا در ارتباط با سرور');
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('submitBtn').disabled = false;
    }
});

// نمایش نتایج تحلیل
function displayAnalysis(analysis) {
    const analysisContent = document.getElementById('analysisContent');
    analysisContent.textContent = analysis;
    document.getElementById('result').style.display = 'block';
}

// بارگذاری تاریخچه کاربر
async function loadUserHistory() {
    const auth = checkAuth();
    if (!auth) return;

    try {
        const response = await fetch(`${API_BASE}/api/secure/user-history`, {
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            displayHistory(data.forms);
        }
    } catch (error) {
        console.log('خطا در دریافت تاریخچه');
    }
}

// نمایش تاریخچه
function displayHistory(forms) {
    const historyList = document.getElementById('historyList');

    if (forms.length === 0) {
        historyList.innerHTML = `
            <div style="text-align: center; color: #6c757d; padding: 20px;">
                هنوز فرمی ثبت نکرده‌اید
            </div>
        `;
        return;
    }

    historyList.innerHTML = forms.map((form, index) => `
        <div class="history-item" onclick="viewFormDetail(${form.id})">
            <div class="history-date">
                ${new Date(form.created_at).toLocaleDateString('fa-IR')}
            </div>
            <div class="history-preview">
                ${form.situation.substring(0, 60)}...
            </div>
        </div>
    `).join('');
}

// بارگذاری آمار کاربر
async function loadUserStats() {
    const auth = checkAuth();
    if (!auth) return;

    try {
        const response = await fetch(`${API_BASE}/api/secure/user-stats`, {
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('totalForms').textContent = data.stats.total_forms;
        }
    } catch (error) {
        console.log('خطا در دریافت آمار');
    }
}

// مشاهده جزئیات فرم
function viewFormDetail(formId) {
    // می‌تونید یک modal یا صفحه جداگانه برای این بخش بسازید
    alert(`مشاهده فرم شماره ${formId}\nاین قابلیت می‌تواند گسترش یابد.`);
}

// خروج از حساب
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// نمایش خطا
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// نمایش موفقیت
function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}

// پنهان کردن پیام‌ها
function hideMessages() {
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
}