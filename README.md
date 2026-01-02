# Vulnerable Web Application - Educational Security Lab

⚠️ **WARNING: This application is INTENTIONALLY VULNERABLE for educational purposes only!**

## How to Run

1. Open the `vulnerable-app` folder in VS Code
2. Install the "Live Server" extension in VS Code
3. Right-click on `index.html` and select "Open with Live Server"
4. Your browser will open with the application

## Application Architecture

### Components:
- **index.html**: Login page
- **dashboard.html**: User dashboard (after login)
- **app.js**: All application logic and "database"
- **styles.css**: Styling

### How It Works:

1. **Fake Database**: All user data is stored in a JavaScript object in `app.js`
2. **Session Management**: Uses browser's localStorage to track logged-in users
3. **Authentication**: Checks username/password against the fake database
4. **Dashboard**: Displays user information based on URL parameter

---

## 🔓 EXPLOITATION GUIDE

### VULNERABILITY #1: SQL Injection Bypass

**What it is**: SQL Injection allows attackers to manipulate database queries.

**How to exploit**:
1. Go to the login page
2. In the username field, enter: `admin' OR '1'='1`
3. Enter any password
4. Click Login

**What happens**: 
- The vulnerable code thinks this is a valid SQL query
- It bypasses password checking
- You get logged in as admin!

**The vulnerable code**:
```javascript
if (username.includes("' OR '1'='1")) {
    // Authentication bypassed!
    const adminUser = DATABASE.users[0];
    createSession(adminUser);
}
```

---

### VULNERABILITY #2: Insecure Direct Object Reference (IDOR)

**What it is**: Accessing other users' data by changing ID parameters.

**How to exploit**:
1. Login normally (use john / password)
2. Notice the URL: `dashboard.html?userId=2`
3. Change the URL to: `dashboard.html?userId=1`
4. Press Enter

**What happens**:
- You can now see admin's data!
- View their SSN, salary, and secret information
- Try userId=3 to see Alice's data

**Why it works**:
```javascript
// No authorization check!
const userId = urlParams.get('userId');
const user = DATABASE.users.find(u => u.id == userId);
```

---

### VULNERABILITY #3: Session/Parameter Tampering

**How to exploit**:

**Method 1 - Using the "Edit User ID" button**:
1. Login as any user
2. Click "Edit User ID (Vulnerable!)" button
3. Enter `1` (admin's ID)
4. You're now viewing admin data!

**Method 2 - Directly modify localStorage**:
1. Login as any user
2. Open Developer Tools (F12)
3. Go to: Application → Local Storage → your site
4. Change `sessionUserId` from `2` to `1`
5. Refresh the page
6. You now have admin session!

**Method 3 - Console manipulation**:
1. Open Developer Tools (F12)
2. Go to Console tab
3. Type: `localStorage.setItem('sessionUserId', '1')`
4. Type: `localStorage.setItem('sessionRole', 'admin')`
5. Refresh the page

---

## 🛡️ Security Lessons Learned

### Why These Vulnerabilities Exist:

1. **Client-Side Authentication**: Never trust the client! All security checks should be on the server.

2. **Exposed Database**: The entire database is visible in the JavaScript code.

3. **No Authorization**: The app checks IF you're logged in, but not WHO you are.

4. **URL Parameters**: User IDs in URLs can be easily manipulated.

5. **localStorage**: Storing session data in localStorage allows easy tampering.

### How to Fix (In Real Applications):

1. **Use Server-Side Authentication**: 
   - Keep database on server
   - Validate credentials on server
   - Use secure session tokens

2. **Implement Authorization**:
   - Check user permissions before showing data
   - Verify user owns the data they're requesting

3. **Use Prepared Statements**:
   - Prevent SQL injection with parameterized queries

4. **Secure Session Management**:
   - Use HTTP-only cookies
   - Implement CSRF tokens
   - Set proper session expiration

5. **Never Trust User Input**:
   - Validate all parameters
   - Sanitize all inputs
   - Use access control lists

---

## Practice Exercises

1. **SQL Injection**: Try different SQL injection payloads
2. **IDOR**: Access all 3 users' data by changing the userId
3. **Session Tampering**: Make yourself admin through localStorage
4. **Data Extraction**: Find all users' secret data
5. **Privilege Escalation**: Start as 'john', become 'admin'

---

## Additional Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Web Security Academy: https://portswigger.net/web-security
- SQL Injection Guide: https://owasp.org/www-community/attacks/SQL_Injection

---

**Remember**: NEVER deploy vulnerable code like this in production!