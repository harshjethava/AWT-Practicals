
const EventEmitter = require('events');
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

class UserEventEmitter extends EventEmitter {}

const userEvents = new UserEventEmitter();
const registeredUsers = []; // Store registered users
const userSessions = {}; // Track logged-in users
const eventLogs = []; // Store all events

const eventCounts = {
  'user-register': 0,
  'user-login': 0,
  'user-logout': 0,
  'user-purchase': 0,
  'profile-update': 0
};

// Event listeners
userEvents.on('user-register', (username) => {
  eventCounts['user-register']++;
  eventLogs.push({ event: 'user-register', username, timestamp: new Date().toLocaleString() });
  console.log(`${username} registered.`);
});

userEvents.on('user-login', (username) => {
  eventCounts['user-login']++;
  eventLogs.push({ event: 'user-login', username, timestamp: new Date().toLocaleString() });
  console.log(`${username} logged in.`);
});

userEvents.on('user-logout', (username) => {
  eventCounts['user-logout']++;
  eventLogs.push({ event: 'user-logout', username, timestamp: new Date().toLocaleString() });
  console.log(`${username} logged out.`);
});

userEvents.on('user-purchase', (username, productName, quantity, price) => {
  eventCounts['user-purchase']++;
  const totalPrice = quantity * price;
  eventLogs.push({ 
    event: 'user-purchase', 
    username, 
    productName,
    quantity,
    price,
    totalPrice,
    timestamp: new Date().toLocaleString() 
  });
  console.log(`${username} purchased ${quantity}x ${productName} at $${price} each. Total: $${totalPrice}`);
});

userEvents.on('profile-update', (username) => {
  eventCounts['profile-update']++;
  eventLogs.push({ event: 'profile-update', username, timestamp: new Date().toLocaleString() });
  console.log(`${username} updated their profile.`);
});

userEvents.on('summary', () => {
  console.log("Event Summary:");
  for (const [event, count] of Object.entries(eventCounts)) {
    console.log(`${event}: ${count}`);
  }
});

// Simulate event emissions using GUI
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  if (pathname === '/' && req.method === 'GET') {
    // Serve main HTML page
    res.setHeader('Content-Type', 'text/html');
    res.statusCode = 200;
    res.end(getMainHTML());
  }
  else if (pathname === '/style.css' && req.method === 'GET') {
    // Serve CSS file
    const cssPath = path.join(__dirname, 'style.css');
    fs.readFile(cssPath, 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('CSS file not found');
      } else {
        res.setHeader('Content-Type', 'text/css');
        res.statusCode = 200;
        res.end(data);
      }
    });
  } 
  else if (pathname === '/register' && req.method === 'POST') {
    // Handle registration
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const data = querystring.parse(body);
      const username = data.reg_username;
      const password = data.reg_password;

      // Check if user already exists
      const userExists = registeredUsers.some(u => u.username === username);
      if (userExists) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 400;
        res.end(JSON.stringify({ success: false, message: "User already exists!" }));
      } else {
        registeredUsers.push({ username, password });
        userEvents.emit('user-register', username);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, message: "Registration successful!" }));
      }
    });
  } 
  else if (pathname === '/login' && req.method === 'POST') {
    // Handle login
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const data = querystring.parse(body);
      const username = data.login_username;
      const password = data.login_password;

      const user = registeredUsers.find(u => u.username === username && u.password === password);
      if (user) {
        userSessions[username] = true;
        userEvents.emit('user-login', username);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, message: "Login successful!", username }));
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 401;
        res.end(JSON.stringify({ success: false, message: "Invalid credentials!" }));
      }
    });
  }
  else if (pathname === '/purchase' && req.method === 'POST') {
    // Handle purchase
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const data = querystring.parse(body);
      const username = data.username;
      const productName = data.productName;
      const quantity = parseInt(data.quantity);
      const price = parseFloat(data.price);
      
      userEvents.emit('user-purchase', username, productName, quantity, price);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, message: "Purchase successful!" }));
    });
  }
  else if (pathname === '/update-profile' && req.method === 'POST') {
    // Handle profile update
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const data = querystring.parse(body);
      const username = data.username;
      const oldPassword = data.oldPassword;
      const newPassword = data.newPassword;

      const user = registeredUsers.find(u => u.username === username && u.password === oldPassword);
      if (user) {
        user.password = newPassword;
        userEvents.emit('profile-update', username);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, message: "Password updated successfully!" }));
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 401;
        res.end(JSON.stringify({ success: false, message: "Invalid old password!" }));
      }
    });
  }
  else if (pathname === '/logout' && req.method === 'POST') {
    // Handle logout
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const data = querystring.parse(body);
      const username = data.username;
      delete userSessions[username];
      userEvents.emit('user-logout', username);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, message: "Logout successful!" }));
    });
  }
  else if (pathname === '/dashboard' && req.method === 'GET') {
    // Serve dashboard
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ 
      eventCounts, 
      eventLogs,
      registeredUsers: registeredUsers.map(u => ({ username: u.username }))
    }));
  }
  else {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Route Not Found" }));
  }
});

function getMainHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Event Management System</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <div class="navbar">
      <h1>🎯 User Event Management System</h1>
      <div class="nav-buttons">
        <button class="nav-btn active" data-tab="register">Register</button>
        <button class="nav-btn" data-tab="login">Login</button>
        <button class="nav-btn" data-tab="dashboard">Dashboard</button>
      </div>
    </div>

    <div class="content">
      <!-- Register Section -->
      <div class="card active" id="register-card">
        <h2>📝 Register</h2>
        <form id="register-form">
          <div class="form-group">
            <label for="reg_username">Username:</label>
            <input type="text" id="reg_username" name="reg_username" required>
          </div>
          <div class="form-group">
            <label for="reg_password">Password:</label>
            <input type="password" id="reg_password" name="reg_password" required>
          </div>
          <button type="submit" class="btn">Register</button>
          <div id="register-message" class="message"></div>
        </form>
      </div>

      <!-- Login Section -->
      <div class="card" id="login-card">
        <h2>🔐 Login</h2>
        <form id="login-form">
          <div class="form-group">
            <label for="login_username">Username:</label>
            <input type="text" id="login_username" name="login_username" required>
          </div>
          <div class="form-group">
            <label for="login_password">Password:</label>
            <input type="password" id="login_password" name="login_password" required>
          </div>
          <button type="submit" class="btn">Login</button>
          <div id="login-message" class="message"></div>
        </form>

        <div id="user-info" class="hidden">
          <div class="user-info">
            <p><strong>Welcome, <span id="current-username"></span>!</strong></p>
            <p>You are logged in. Use the buttons below to perform actions.</p>
          </div>
          <button class="btn purchase" onclick="handlePurchase()">🛍️ Purchase</button>
          <button class="btn" style="background-color: #f39c12; margin-top: 10px;" onclick="handleUpdateProfile()">🔐 Update Profile</button>
          <button class="btn logout" onclick="handleLogout()">🚪 Logout</button>
        </div>
      </div>
    </div>

    <!-- Dashboard Section -->
    <div class="dashboard" id="dashboard-card">
      <h2>📊 Dashboard</h2>
      
      <div class="dashboard-section">
        <h3>📈 Event Statistics</h3>
        <table>
          <thead>
            <tr>
              <th>Event Type</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody id="event-counts-table">
            <tr><td colspan="2" style="text-align: center; color: #999;">No events yet</td></tr>
          </tbody>
        </table>
      </div>

      <div class="dashboard-section">
        <h3>👥 Registered Users</h3>
        <table>
          <thead>
            <tr>
              <th>Username</th>
            </tr>
          </thead>
          <tbody id="registered-users-table">
            <tr><td style="text-align: center; color: #999;">No users registered</td></tr>
          </tbody>
        </table>
      </div>

      <div class="dashboard-section">
        <h3>📋 Event Logs</h3>
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Username</th>
              <th>Details</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody id="event-logs-table">
            <tr><td colspan="4" style="text-align: center; color: #999;">No events logged</td></tr>
          </tbody>
        </table>
      </div>

      <button class="btn" onclick="refreshDashboard()" style="margin-top: 20px;">🔄 Refresh</button>
    </div>
  </div>

  <!-- Purchase Modal -->
  <div id="purchase-modal" class="modal">
    <div class="modal-content" style="max-width: 500px;">
      <h3>🛍️ Purchase Product</h3>
      <form id="purchase-form">
        <div class="form-group">
          <label for="product_name">Product Name:</label>
          <input type="text" id="product_name" name="product_name" required>
        </div>
        <div class="form-group">
          <label for="quantity">Quantity:</label>
          <input type="number" id="quantity" name="quantity" min="1" required>
        </div>
        <div class="form-group">
          <label for="price">Price (per unit):</label>
          <input type="number" id="price" name="price" min="0.01" step="0.01" required>
        </div>
        <button type="submit" class="btn" style="background-color: #27ae60;">Complete Purchase</button>
        <button type="button" class="btn" style="background-color: #e74c3c; margin-top: 10px;" onclick="closePurchaseModal()">Cancel</button>
      </form>
    </div>
  </div>

  <!-- Update Profile Modal -->
  <div id="update-profile-modal" class="modal">
    <div class="modal-content" style="max-width: 500px;">
      <h3>🔐 Update Profile</h3>
      <form id="update-profile-form">
        <div class="form-group">
          <label for="up_old_password">Old Password:</label>
          <input type="password" id="up_old_password" name="up_old_password" required>
        </div>
        <div class="form-group">
          <label for="up_new_password">New Password:</label>
          <input type="password" id="up_new_password" name="up_new_password" required>
        </div>
        <button type="submit" class="btn" style="background-color: #f39c12;">Update Password</button>
        <button type="button" class="btn" style="background-color: #e74c3c; margin-top: 10px;" onclick="closeUpdateProfileModal()">Cancel</button>
      </form>
    </div>
  </div>

  <script>
    let currentUser = null;

    // Tab switching
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const tab = this.dataset.tab;
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.card, .dashboard').forEach(c => c.classList.remove('active'));
        
        this.classList.add('active');
        if (tab === 'dashboard') {
          document.getElementById('dashboard-card').classList.add('active');
          refreshDashboard();
        } else {
          document.getElementById(tab + '-card').classList.add('active');
        }
      });
    });

    // Register form submission
    document.getElementById('register-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('reg_username').value;
      const password = document.getElementById('reg_password').value;

      fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'reg_username=' + encodeURIComponent(username) + '&reg_password=' + encodeURIComponent(password)
      })
      .then(res => res.json())
      .then(data => {
        const msgDiv = document.getElementById('register-message');
        if (data.success) {
          msgDiv.className = 'message success';
          msgDiv.textContent = data.message;
          document.getElementById('register-form').reset();
        } else {
          msgDiv.className = 'message error';
          msgDiv.textContent = data.message;
        }
      });
    });

    // Login form submission
    document.getElementById('login-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('login_username').value;
      const password = document.getElementById('login_password').value;

      fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'login_username=' + encodeURIComponent(username) + '&login_password=' + encodeURIComponent(password)
      })
      .then(res => res.json())
      .then(data => {
        const msgDiv = document.getElementById('login-message');
        if (data.success) {
          currentUser = data.username;
          msgDiv.className = 'message success';
          msgDiv.textContent = data.message;
          document.getElementById('current-username').textContent = data.username;
          document.getElementById('user-info').classList.remove('hidden');
          document.getElementById('login-form').style.display = 'none';
        } else {
          msgDiv.className = 'message error';
          msgDiv.textContent = data.message;
        }
      });
    });

    // Handle Update Profile Modal
    function handleUpdateProfile() {
      if (!currentUser) {
        alert('Please login first');
        return;
      }
      document.getElementById('update-profile-form').reset();
      document.getElementById('update-profile-modal').classList.add('active');
    }

    // Purchase function
    function handlePurchase() {
      if (!currentUser) {
        alert('Please login first');
        return;
      }
      document.getElementById('purchase-form').reset();
      document.getElementById('purchase-modal').classList.add('active');
    }

    // Handle purchase form submission
    document.getElementById('purchase-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const productName = document.getElementById('product_name').value;
      const quantity = document.getElementById('quantity').value;
      const price = document.getElementById('price').value;

      fetch('/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'username=' + encodeURIComponent(currentUser) + '&productName=' + encodeURIComponent(productName) + '&quantity=' + encodeURIComponent(quantity) + '&price=' + encodeURIComponent(price)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showPurchaseSuccess(productName, quantity, (quantity * price).toFixed(2));
        }
      });
    });

    function showPurchaseSuccess(productName, quantity, total) {
      document.getElementById('purchase-form').style.display = 'none';
      const content = document.querySelector('#purchase-modal .modal-content');
      const successDiv = document.createElement('div');
      successDiv.id = 'purchase-success';
      successDiv.innerHTML = \`
        <h3>✅ Success!</h3>
        <p>Purchase completed successfully!</p>
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: left;">
          <p><strong>Product:</strong> \${productName}</p>
          <p><strong>Quantity:</strong> \${quantity}</p>
          <p><strong>Total Price:</strong> $\${total}</p>
        </div>
        <button onclick="closePurchaseModal()" class="btn">Close</button>
      \`;
      content.appendChild(successDiv);
    }

    // Close purchase modal
    function closePurchaseModal() {
      document.getElementById('purchase-modal').classList.remove('active');
      document.getElementById('purchase-form').style.display = 'block';
      const successDiv = document.getElementById('purchase-success');
      if (successDiv) {
        successDiv.remove();
      }
      document.getElementById('purchase-form').reset();
    }

    // Update Profile form submission
    document.getElementById('update-profile-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const oldPassword = document.getElementById('up_old_password').value;
      const newPassword = document.getElementById('up_new_password').value;

      fetch('/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'username=' + encodeURIComponent(currentUser) + '&oldPassword=' + encodeURIComponent(oldPassword) + '&newPassword=' + encodeURIComponent(newPassword)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showUpdateProfileSuccess();
        } else {
          alert(data.message);
        }
      });
    });

    function showUpdateProfileSuccess() {
      document.getElementById('update-profile-form').style.display = 'none';
      const content = document.querySelector('#update-profile-modal .modal-content');
      const successDiv = document.createElement('div');
      successDiv.id = 'update-profile-success';
      successDiv.innerHTML = \`
        <h3>✅ Success!</h3>
        <p>Password updated successfully!</p>
        <p style="color: #666; font-size: 14px; margin-top: 15px;">Your profile has been updated. Please login again with your new password.</p>
        <button onclick="closeUpdateProfileModal()" class="btn">Close</button>
      \`;
      content.appendChild(successDiv);
    }

    // Close update profile modal
    function closeUpdateProfileModal() {
      document.getElementById('update-profile-modal').classList.remove('active');
      document.getElementById('update-profile-form').style.display = 'block';
      const successDiv = document.getElementById('update-profile-success');
      if (successDiv) {
        successDiv.remove();
      }
      document.getElementById('update-profile-form').reset();
    }

    // Logout function
    function handleLogout() {
      if (!currentUser) return;

      fetch('/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'username=' + encodeURIComponent(currentUser)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          currentUser = null;
          document.getElementById('login-form').style.display = 'block';
          document.getElementById('user-info').classList.add('hidden');
          document.getElementById('login-form').reset();
          alert('Logged out successfully!');
        }
      });
    }

    // Refresh dashboard
    function refreshDashboard() {
      fetch('/dashboard')
      .then(res => res.json())
      .then(data => {
        // Update event counts
        const countsTable = document.getElementById('event-counts-table');
        if (Object.keys(data.eventCounts).length > 0) {
          countsTable.innerHTML = Object.entries(data.eventCounts)
            .map(([event, count]) => \`<tr><td>\${event}</td><td>\${count}</td></tr>\`)
            .join('');
        }

        // Update registered users
        const usersTable = document.getElementById('registered-users-table');
        if (data.registeredUsers.length > 0) {
          usersTable.innerHTML = data.registeredUsers
            .map(user => \`<tr><td>\${user.username}</td></tr>\`)
            .join('');
        }

        // Update event logs
        const logsTable = document.getElementById('event-logs-table');
        if (data.eventLogs.length > 0) {
          logsTable.innerHTML = data.eventLogs
            .map(log => {
              let details = '-';
              if (log.event === 'user-purchase') {
                details = \`\${log.productName} (Qty: \${log.quantity}, Price: $\${log.price}, Total: $\${log.totalPrice})\`;
              } else if (log.event === 'profile-update') {
                details = 'Password Changed';
              }
              return \`<tr><td>\${log.event}</td><td>\${log.username}</td><td>\${details}</td><td>\${log.timestamp}</td></tr>\`;
            })
            .join('');
        }
      });
    }
  </script>
</body>
</html>
  `;
}

server.listen(8080, () => {
  console.log("Server running at http://localhost:8080");
});

