// ========================================
// VULNERABLE LOGIN SYSTEM - EDUCATIONAL PURPOSE ONLY
// ========================================

// VULNERABILITY #1: Hardcoded "Database" in Client-Side Code
const DATABASE = {
    users: [
        {
            id: 1,
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            email: 'admin@company.com',
            ssn: '123-45-6789',
            salary: '$150,000',
            secretData: 'Admin secret: Server password is SuperSecret123!'
        },
        {
            id: 2,
            username: 'john',
            password: 'password',
            role: 'user',
            email: 'john@company.com',
            ssn: '987-65-4321',
            salary: '$75,000',
            secretData: 'John\'s secret: I\'m looking for a new job'
        },
        {
            id: 3,
            username: 'alice',
            password: 'alice2024',
            role: 'user',
            email: 'alice@company.com',
            ssn: '555-12-3456',
            salary: '$85,000',
            secretData: 'Alice\'s secret: I have access to the finance database'
        }
    ]
};

// ========================================
// LOGIN FUNCTIONALITY
// ========================================

// Check if on login page
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // VULNERABILITY #2: SQL Injection Simulation
        // If user enters: admin' OR '1'='1
        // This vulnerable query would become: SELECT * FROM users WHERE username='admin' OR '1'='1' AND password='...'
        
        if (username.includes("' OR '1'='1") || username.includes("' or '1'='1")) {
            // SQL Injection successful! Bypass authentication
            console.log('🔓 SQL Injection detected! Bypassing authentication...');
            const adminUser = DATABASE.users[0]; // Get admin user
            createSession(adminUser);
            window.location.href = 'dashboard.html?userId=' + adminUser.id;
            return;
        }
        
        // Normal authentication (still vulnerable)
        const user = DATABASE.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            createSession(user);
            // VULNERABILITY #3: Exposing user ID in URL parameter
            window.location.href = 'dashboard.html?userId=' + user.id;
        } else {
            showError('Invalid username or password!');
        }
    });
}

// ========================================
// SESSION MANAGEMENT
// ========================================

function createSession(user) {
    // VULNERABILITY #4: Storing sensitive data in localStorage (client-side)
    // Anyone can access and modify this!
    localStorage.setItem('sessionUserId', user.id);
    localStorage.setItem('sessionUsername', user.username);
    localStorage.setItem('sessionRole', user.role);
    localStorage.setItem('isLoggedIn', 'true');
    
    console.log('✅ Session created for user:', user.username);
    console.log('💡 Check Application > Local Storage in DevTools!');
}

function checkAuth() {
    // VULNERABILITY #5: Weak authentication check
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        alert('⛔ Please login first!');
        window.location.href = 'index.html';
    }
}

function logout() {
    localStorage.clear();
    alert('✅ Logged out successfully!');
    window.location.href = 'index.html';
}

// ========================================
// DASHBOARD FUNCTIONALITY
// ========================================

function loadDashboard() {
    // VULNERABILITY #6: Insecure Direct Object Reference (IDOR)
    // Get userId from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    let userId = urlParams.get('userId');
    
    // If no userId in URL, try to get from localStorage
    if (!userId) {
        userId = localStorage.getItem('sessionUserId');
    }
    
    // VULNERABILITY #7: No authorization check!
    // We just trust whatever userId is provided
    const user = DATABASE.users.find(u => u.id == userId);
    
    if (user) {
        displayUserInfo(user);
        displayAllUsers();
    } else {
        document.getElementById('userInfo').innerHTML = '<p style="color: red;">❌ User not found!</p>';
    }
}

function displayUserInfo(user) {
    const userInfoDiv = document.getElementById('userInfo');
    
    userInfoDiv.innerHTML = `
        <h2>Welcome, ${user.username}!</h2>
        <p><strong>User ID:</strong> ${user.id}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>SSN:</strong> ${user.ssn}</p>
        <p><strong>Salary:</strong> ${user.salary}</p>
        <p style="background: #ffe6e6; padding: 10px; border-radius: 5px; margin-top: 15px;">
            <strong>🔒 Confidential Data:</strong><br>
            ${user.secretData}
        </p>
    `;
}

function displayAllUsers() {
    const usersListDiv = document.getElementById('usersList');
    
    let html = '<p style="color: #d9534f; font-weight: bold;">⚠️ Vulnerable: All user IDs exposed!</p>';
    
    DATABASE.users.forEach(user => {
        html += `
            <div class="user-card" onclick="viewUserData(${user.id})">
                <strong>${user.username}</strong> (ID: ${user.id}) - ${user.role}
                <br><small>Click to view their data (IDOR vulnerability!)</small>
            </div>
        `;
    });
    
    usersListDiv.innerHTML = html;
}

function viewUserData(userId) {
    // VULNERABILITY #8: Direct object reference without authorization
    console.log('🔓 Attempting to access user ID:', userId);
    window.location.href = 'dashboard.html?userId=' + userId;
}

function viewProfile() {
    const sessionUserId = localStorage.getItem('sessionUserId');
    window.location.href = 'dashboard.html?userId=' + sessionUserId;
}

function editUserId() {
    // VULNERABILITY #9: Allowing users to modify their own session data
    const newUserId = prompt('Enter new User ID (Try entering 1 for admin access!):');
    
    if (newUserId) {
        localStorage.setItem('sessionUserId', newUserId);
        alert('✅ User ID changed! Reloading dashboard...');
        window.location.href = 'dashboard.html?userId=' + newUserId;
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    
    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 3000);
}

// ========================================
// DEBUGGING HELPERS
// ========================================

console.log('%c🔓 VULNERABLE APPLICATION LOADED', 'color: red; font-size: 20px; font-weight: bold;');
console.log('%cDatabase contents:', 'color: blue; font-size: 14px;');
console.log(DATABASE.users);
console.log('%cTry these exploits:', 'color: orange; font-size: 14px;');
console.log('1. SQL Injection: admin\' OR \'1\'=\'1');
console.log('2. IDOR: Change ?userId parameter in URL');
console.log('3. Session Tampering: Modify localStorage values');