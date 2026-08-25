const http = require('http');
const app = require('../server/server');

let server;
const PORT = 5055;
let baseUrl = `http://127.0.0.1:${PORT}`;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error('ASSERTION FAILED: ' + message);
  }
  console.log('  ✅ ' + message);
}

async function runTests() {
  console.log('--- Starting Health Monitoring System Test Suite ---');
  server = app.listen(PORT);

  try {
    // 1. Health Check
    console.log('\n[1] Health Check');
    const health = await request('GET', '/api/health');
    assert(health.status === 200, 'Health check returns 200');
    assert(health.body.status === 'healthy', 'Health check reports healthy');

    // 2. Auth Registration & Validation
    console.log('\n[2] Auth Registration');
    const invalidReg = await request('POST', '/api/auth/register', {
      full_name: 'Incomplete User'
    });
    assert(invalidReg.status === 400, 'Registration rejects missing fields');

    const testEmail = `testuser_${Date.now()}@testfitness.com`;
    const testPhone = `+1555${Math.floor(1000000 + Math.random() * 9000000)}`;
    const validReg = await request('POST', '/api/auth/register', {
      full_name: 'Jessica Fitness',
      email: testEmail,
      phone: testPhone,
      age: 26,
      height: 168,
      weight: 62.5,
      gender: 'Female',
      username: `jessica_${Date.now().toString().slice(-4)}`,
      password: 'SecurePassword123!'
    });
    assert(validReg.status === 201, 'Registration succeeds with 201 Created');
    assert(validReg.body.success === true, 'Response body success is true');
    assert(validReg.body.token !== undefined, 'Registration returns JWT token');
    const userToken = validReg.body.token;

    // 3. Login with Email, Username, Phone
    console.log('\n[3] Multi-Identifier Login');
    const emailLogin = await request('POST', '/api/auth/login', {
      identifier: testEmail,
      password: 'SecurePassword123!'
    });
    assert(emailLogin.status === 200, 'Login via Email works');

    const phoneLogin = await request('POST', '/api/auth/login', {
      identifier: testPhone,
      password: 'SecurePassword123!'
    });
    assert(phoneLogin.status === 200, 'Login via Phone Number works');

    // Admin Login
    const adminLogin = await request('POST', '/api/auth/login', {
      identifier: 'admin@healthapp.com',
      password: 'Admin@12345'
    });
    assert(adminLogin.status === 200, 'Admin login works');
    const adminToken = adminLogin.body.token;

    // 4. Forgot Password Flow
    console.log('\n[4] Forgot Password Flow (3-way recovery)');
    const forgotReq = await request('POST', '/api/auth/forgot-password/request', {
      identifier: testEmail
    });
    assert(forgotReq.status === 200, 'Forgot password request succeeds');
    const otp = forgotReq.body.recovery_preview.demo_otp;
    assert(otp && otp.length === 6, 'Generated 6-digit OTP code');

    const resetReq = await request('POST', '/api/auth/forgot-password/verify-and-reset', {
      identifier: testEmail,
      otp_code: otp,
      new_password: 'NewChangedPassword456!'
    });
    assert(resetReq.status === 200, 'Password reset with OTP succeeds');

    const newLogin = await request('POST', '/api/auth/login', {
      identifier: testEmail,
      password: 'NewChangedPassword456!'
    });
    assert(newLogin.status === 200, 'Login with new password succeeds');

    // 5. BMI Calculator & History
    console.log('\n[5] BMI Calculator & Tracking');
    const bmiCalc = await request('POST', '/api/bmi/calculate', {
      height: 175,
      weight: 70
    });
    assert(bmiCalc.status === 200, 'BMI calculation returns 200');
    assert(bmiCalc.body.data.bmi === 22.9, 'BMI calculated correctly (22.9)');
    assert(bmiCalc.body.data.category === 'Normal', 'BMI category is Normal');

    const bmiSave = await request('POST', '/api/bmi/save', {
      height: 175,
      weight: 68.5,
      notes: 'Post-morning run weight check',
      sync_profile: true
    }, { Authorization: `Bearer ${userToken}` });
    assert(bmiSave.status === 201, 'BMI record saved to user history');

    const bmiHistory = await request('GET', '/api/bmi/history', null, {
      Authorization: `Bearer ${userToken}`
    });
    assert(bmiHistory.status === 200, 'BMI history fetched');
    assert(bmiHistory.body.logs.length >= 2, 'BMI logs list contains initial and new record');

    // 6. Notifications System
    console.log('\n[6] Notifications System');
    const notifs = await request('GET', '/api/notifications', null, {
      Authorization: `Bearer ${userToken}`
    });
    assert(notifs.status === 200, 'Notifications fetched successfully');
    assert(notifs.body.notifications.length > 0, 'User has notifications');

    const notifId = notifs.body.notifications[0].id;
    const readNotif = await request('POST', `/api/notifications/read/${notifId}`, null, {
      Authorization: `Bearer ${userToken}`
    });
    assert(readNotif.status === 200, 'Notification marked as read');

    const triggerRem = await request('POST', '/api/notifications/trigger-reminder', {
      type: 'hydration'
    }, { Authorization: `Bearer ${userToken}` });
    assert(triggerRem.status === 201, 'Hydration reminder triggered');

    // 7. Admin Portal Functionality
    console.log('\n[7] Admin Portal');
    const adminOverview = await request('GET', '/api/admin/overview', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(adminOverview.status === 200, 'Admin overview KPI fetched');
    assert(adminOverview.body.stats.totalUsers >= 2, 'Total users count accurate');

    const adminUsers = await request('GET', '/api/admin/users', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(adminUsers.status === 200, 'Admin users list fetched');

    const broadcast = await request('POST', '/api/admin/broadcast', {
      title: 'Healthy Heart Week!',
      message: 'Join our daily steps challenge starting Monday.',
      target: 'all'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(broadcast.status === 201, 'Admin broadcast message dispatched');

    const auditLogs = await request('GET', '/api/admin/audit-logs', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(auditLogs.status === 200, 'Audit logs retrieved');

    // 8. Privacy & Data Portability
    console.log('\n[8] Privacy Policy & GDPR Export');
    const privacy = await request('GET', '/api/privacy');
    assert(privacy.status === 200, 'Privacy policy retrieved');
    assert(privacy.body.policy.sections.length >= 4, 'Privacy policy contains all required sections');

    const exportData = await request('POST', '/api/privacy/export-my-data', null, {
      Authorization: `Bearer ${userToken}`
    });
    assert(exportData.status === 200, 'Personal health data export succeeds');
    assert(exportData.body.user_profile.email === testEmail, 'Exported data matches user profile');

    // 9. Calorie & Activity Tracking ("Calories to Burn" & "Burnt Calories Till Now")
    console.log('\n[9] Calorie Burn & Energy Tracking');
    const calCalc = await request('POST', '/api/calories/calculate', {
      height: 175,
      weight: 70,
      age: 28,
      gender: 'Male'
    });
    assert(calCalc.status === 200, 'Calorie calculation returns 200');
    assert(calCalc.body.data.bmr > 1500, 'BMR calculated properly');
    assert(calCalc.body.data.tdee > calCalc.body.data.bmr, 'TDEE is greater than resting BMR');
    assert(calCalc.body.data.daily_target_burn > 0, 'Daily target calories to burn returned');

    const logCal = await request('POST', '/api/calories/log', {
      activity: 'Running 🏃',
      duration_mins: 35,
      calories_burned: 320,
      notes: 'Morning park run'
    }, { Authorization: `Bearer ${userToken}` });
    assert(logCal.status === 201, 'Calorie burn activity logged with 201 Created');
    assert(logCal.body.log.calories_burned === 320, 'Logged calories match input (320 kcal)');
    const createdCalLogId = logCal.body.log.id;

    const calSummary = await request('GET', '/api/calories/summary', null, {
      Authorization: `Bearer ${userToken}`
    });
    assert(calSummary.status === 200, 'Calorie summary fetched successfully');
    assert(calSummary.body.data.today_burnt >= 320, 'Today\'s burnt calories reflect logged workout');
    assert(calSummary.body.data.total_burnt_till_now >= 320, 'Total burnt calories till now computed');
    assert(calSummary.body.data.daily_target_burn > 0, 'Target daily calories to burn provided');

    const calLogs = await request('GET', '/api/calories/logs', null, {
      Authorization: `Bearer ${userToken}`
    });
    assert(calLogs.status === 200, 'User activity logs fetched');
    assert(calLogs.body.logs.some(l => l.id === createdCalLogId), 'Logs contain created activity');

    const deleteCal = await request('DELETE', `/api/calories/log/${createdCalLogId}`, null, {
      Authorization: `Bearer ${userToken}`
    });
    assert(deleteCal.status === 200, 'Calorie log deleted successfully');

    console.log('\n=========================================');
    console.log('🎉 ALL BACKEND API & LOGIC TESTS PASSED!');
    console.log('=========================================\n');
  } catch (err) {
    console.error('\n❌ TEST FAILURE:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
