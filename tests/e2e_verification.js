const http = require('http');

const PORT = 5000;
const baseUrl = `http://127.0.0.1:${PORT}`;

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
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, raw: data });
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

async function verifyEndToEnd() {
  console.log('===========================================================');
  console.log('🚀 RUNNING END-TO-END VERIFICATION ON RUNNING SERVER (PORT 5000)');
  console.log('===========================================================');

  try {
    // 1. Static Assets & SPA Entry
    console.log('\n[Phase 1] Static Asset Delivery & HTML5 SPA Entry');
    const htmlRes = await request('GET', '/');
    assert(htmlRes.status === 200, 'index.html served with 200 OK');
    assert(htmlRes.raw.includes('VitalPulse'), 'index.html contains VitalPulse brand title');
    assert(htmlRes.raw.includes('BMI Calculator'), 'index.html contains BMI Calculator section');
    assert(htmlRes.raw.includes('Admin Portal'), 'index.html contains Admin Portal section');
    assert(htmlRes.raw.includes('Privacy Policy'), 'index.html contains Privacy Policy section');

    const cssRes = await request('GET', '/css/style.css');
    assert(cssRes.status === 200, 'style.css served with 200 OK');
    assert(cssRes.raw.includes('--bg-primary'), 'style.css contains design system variables');

    const jsModules = ['api.js', 'bmi.js', 'notifications.js', 'admin.js', 'app.js'];
    for (const mod of jsModules) {
      const modRes = await request('GET', `/js/${mod}`);
      assert(modRes.status === 200, `js/${mod} served with 200 OK`);
    }

    // 2. FR-1: Registration with all 7 required fields
    console.log('\n[Phase 2] FR-1: Registration with Full Name, Email, Phone, Age, Height, Weight, Gender');
    const emilyEmail = `emily.watson_${Date.now()}@testfit.com`;
    const emilyPhone = `+1555${Math.floor(2000000 + Math.random() * 7000000)}`;
    const regRes = await request('POST', '/api/auth/register', {
      full_name: 'Emily Watson',
      email: emilyEmail,
      phone: emilyPhone,
      age: 27,
      height: 168,
      weight: 64.5,
      gender: 'Female',
      username: `emily_${Date.now().toString().slice(-4)}`,
      password: 'Password123!'
    });
    assert(regRes.status === 201, 'Emily Watson registered successfully (201 Created)');
    assert(regRes.body.user.full_name === 'Emily Watson', 'User object full_name matches');
    assert(regRes.body.user.gender === 'Female', 'User object gender matches');
    assert(regRes.body.user.age === 27, 'User object age matches');
    assert(regRes.body.token !== undefined, 'Auth token received upon registration');
    const emilyToken = regRes.body.token;

    // 3. FR-2: Login with Email, Username, Phone & 3-Way Forgot Password Flow
    console.log('\n[Phase 3] FR-2: Multi-Identifier Authentication & Forgot Password Recovery');
    const loginRes = await request('POST', '/api/auth/login', {
      identifier: emilyEmail,
      password: 'Password123!'
    });
    assert(loginRes.status === 200, 'Login via Email succeeded');

    const phoneLoginRes = await request('POST', '/api/auth/login', {
      identifier: emilyPhone,
      password: 'Password123!'
    });
    assert(phoneLoginRes.status === 200, 'Login via Phone Number succeeded');

    // Forgot Password Flow: Step 1 Request
    const forgotReq = await request('POST', '/api/auth/forgot-password/request', {
      identifier: emilyEmail
    });
    assert(forgotReq.status === 200, 'Password recovery initiated');
    const otp = forgotReq.body.recovery_preview.demo_otp;
    assert(otp && otp.length === 6, '6-Digit OTP received');

    // Forgot Password Flow: Step 2 Verify & Reset
    const resetRes = await request('POST', '/api/auth/forgot-password/verify-and-reset', {
      identifier: emilyEmail,
      otp_code: otp,
      new_password: 'NewEmilyPassword2026!'
    });
    assert(resetRes.status === 200, 'Password successfully verified and reset');

    const newPassLogin = await request('POST', '/api/auth/login', {
      identifier: emilyEmail,
      password: 'NewEmilyPassword2026!'
    });
    assert(newPassLogin.status === 200, 'Login with new password succeeded');

    // 4. FR-3: Fitness Check (BMI Calculator)
    console.log('\n[Phase 4] FR-3: Fitness Check & BMI Calculation Categories');
    const calcNormal = await request('POST', '/api/bmi/calculate', { height: 168, weight: 64.5 });
    assert(calcNormal.body.data.bmi === 22.9, 'BMI for 168cm / 64.5kg is 22.9');
    assert(calcNormal.body.data.category === 'Normal', 'Category is Normal');
    assert(calcNormal.body.data.idealWeightRange.min === 52.2, 'Ideal min weight is 52.2 kg');
    assert(calcNormal.body.data.idealWeightRange.max === 70.3, 'Ideal max weight is 70.3 kg');

    const calcUnder = await request('POST', '/api/bmi/calculate', { height: 175, weight: 50 });
    assert(calcUnder.body.data.category === 'Underweight', 'Underweight category detected correctly');

    const calcOver = await request('POST', '/api/bmi/calculate', { height: 175, weight: 85 });
    assert(calcOver.body.data.category === 'Overweight', 'Overweight category detected correctly');

    const calcObese = await request('POST', '/api/bmi/calculate', { height: 175, weight: 110 });
    assert(calcObese.body.data.category === 'Obese', 'Obese category detected correctly');

    // Save BMI Checkup to history
    const saveBmi = await request('POST', '/api/bmi/save', {
      height: 168,
      weight: 63.8,
      notes: 'Morning test calculation after workout',
      sync_profile: true
    }, { Authorization: `Bearer ${emilyToken}` });
    assert(saveBmi.status === 201, 'BMI checkup saved to user history');

    const historyRes = await request('GET', '/api/bmi/history', null, {
      Authorization: `Bearer ${emilyToken}`
    });
    assert(historyRes.status === 200, 'BMI history fetched');
    assert(historyRes.body.logs.length >= 2, 'History contains baseline and new checkup');

    // 5. FR-4: Notifications System
    console.log('\n[Phase 5] FR-4: Notifications, Reminders, and Alerts');
    const notifs = await request('GET', '/api/notifications', null, {
      Authorization: `Bearer ${emilyToken}`
    });
    assert(notifs.status === 200, 'Notifications retrieved');
    assert(notifs.body.notifications.length > 0, 'User has notifications');

    const notifId = notifs.body.notifications[0].id;
    const markReadRes = await request('POST', `/api/notifications/read/${notifId}`, null, {
      Authorization: `Bearer ${emilyToken}`
    });
    assert(markReadRes.status === 200, 'Notification marked as read');

    const hydrationRem = await request('POST', '/api/notifications/trigger-reminder', {
      type: 'hydration'
    }, { Authorization: `Bearer ${emilyToken}` });
    assert(hydrationRem.status === 201, 'Hydration reminder triggered');

    // 6. FR-5: Admin Portal & System Oversight
    console.log('\n[Phase 6] FR-5: Admin Portal Oversight, Moderation & Broadcasts');
    const adminAuth = await request('POST', '/api/auth/login', {
      identifier: 'admin@healthapp.com',
      password: 'Admin@12345'
    });
    assert(adminAuth.status === 200, 'Admin authenticated');
    const adminToken = adminAuth.body.token;

    const overview = await request('GET', '/api/admin/overview', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(overview.status === 200, 'Admin overview metrics fetched');
    assert(overview.body.stats.totalUsers >= 2, 'Total users count >= 2');
    assert(overview.body.stats.categoryCounts.Normal >= 1, 'BMI distribution counts active');

    const broadcast = await request('POST', '/api/admin/broadcast', {
      title: 'Fitness Sprint 2026',
      message: 'Weekly community hydration challenge begins today!',
      target: 'all'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(broadcast.status === 201, 'System broadcast dispatched to all users');

    const audit = await request('GET', '/api/admin/audit-logs', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(audit.status === 200, 'Audit log stream retrieved');

    // 7. FR-6: Privacy Policy & GDPR Data Rights
    console.log('\n[Phase 7] FR-6: Privacy Policy, Data Portability & Rights');
    const privacyPolicy = await request('GET', '/api/privacy');
    assert(privacyPolicy.status === 200, 'Privacy policy retrieved');
    assert(privacyPolicy.body.policy.sections.length === 4, 'All 4 privacy policy sections present');

    const exportData = await request('POST', '/api/privacy/export-my-data', null, {
      Authorization: `Bearer ${emilyToken}`
    });
    assert(exportData.status === 200, 'Personal health archive exported (GDPR Article 20)');
    assert(exportData.body.fitness_records.length > 0, 'Exported payload contains fitness records');

    console.log('\n===========================================================');
    console.log('🎉 ALL END-TO-END SYSTEM FUNCTIONALITY VERIFIED 100%!');
    console.log('===========================================================\n');
  } catch (err) {
    console.error('\n❌ E2E VERIFICATION ERROR:', err);
    process.exitCode = 1;
  }
}

verifyEndToEnd();
