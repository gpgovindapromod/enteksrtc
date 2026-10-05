const fs = require('fs');

function applyValidation(filePath, isDesktop) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add destructuring
  if (!content.includes('validateLoginField')) {
    content = content.replace(
      'loginForm,',
      'fieldErrors,\n    validateLoginField,\n    validateSignupField,\n    loginForm,'
    );
  }

  // --- LOGIN EMAIL ---
  let emailSearch = /<input[^>]*type="email"[^>]*placeholder="Email Address"[^>]*\/>/;
  if (isDesktop) emailSearch = /<input[^>]*type="email"[^>]*placeholder="Email Address"[^>]*\/>/;
  
  let match = content.match(emailSearch);
  if (match) {
    let replaced = match[0].replace(
      /onChange=\{\(e\) => setLoginForm\(\(prev\) => \(\{ \.\.\.prev, email: e\.target\.value \}\)\)\}/,
      `onChange={(e) => {
                              setLoginForm((prev) => ({ ...prev, email: e.target.value }));
                              if (fieldErrors.email) validateLoginField('email', e.target.value);
                            }}
                            onBlur={(e) => validateLoginField('email', e.target.value)}`
    );
    replaced += `\n                    {fieldErrors.email && <span className="auth-error-text" style={{color: '#ef4444', fontSize: '11px'}}>{fieldErrors.email}</span>}`;
    content = content.replace(match[0], replaced);
  }

  // --- LOGIN PASSWORD ---
  const passSearch = /<input[^>]*placeholder="Password"[^>]*\/>/;
  match = content.match(passSearch);
  if (match) {
    let replaced = match[0].replace(
      /onChange=\{\(e\) => setLoginForm\(\(prev\) => \(\{ \.\.\.prev, password: e\.target\.value \}\)\)\}/,
      `onChange={(e) => {
                              setLoginForm((prev) => ({ ...prev, password: e.target.value }));
                              if (fieldErrors.password) validateLoginField('password', e.target.value);
                            }}
                            onBlur={(e) => validateLoginField('password', e.target.value)}`
    );
    // Since password has a button next to it, we can just inject after the button by finding the parent div closure, 
    // but the safest way is to replace the button as well.
  }
  
  // A much simpler and foolproof string replace method:
  content = content.replace(
    /onChange=\{\(e\) => setLoginForm\(\(prev\) => \(\{ \.\.\.prev, password: e\.target\.value \}\)\)\}\s*required\s*\/>\s*<button/g,
    `onChange={(e) => {
                              setLoginForm((prev) => ({ ...prev, password: e.target.value }));
                              if (fieldErrors.password) validateLoginField('password', e.target.value);
                            }}
                            onBlur={(e) => validateLoginField('password', e.target.value)}
                      required
                    />
                    {fieldErrors.password && <span className="auth-error-text" style={{color: '#ef4444', fontSize: '11px', position: 'absolute', bottom: '-18px'}}>{fieldErrors.password}</span>}
                    <button`
  );

  // --- SIGNUP FIELDS ---
  const signupFields = [
    { key: 'fullName', type: 'text', placeholder: 'NAME' },
    { key: 'age', type: 'number', placeholder: 'AGE' },
    { key: 'email', type: 'email', placeholder: 'EMAIL ID' },
    { key: 'phone', type: 'tel', placeholder: 'MOBILE NUMBER' },
    { key: 'otp', type: 'text', placeholder: 'ENTER OTP', orPlaceholder: 'ENTER OTP', isNumericMode: true },
    { key: 'password', type: 'password', placeholder: 'PASSWORD', isPassword: true },
    { key: 'confirmPassword', type: 'password', placeholder: 'CONFIRM PASSWORD', isPassword: true }
  ];

  for (const f of signupFields) {
    // We will match the entire onChange line to replace it, and then inject the error span just before the closing tag of the input group.
    
    // Replace onChange and add onBlur
    let rgxStr = `onChange=\\{\\(e\\) => setSignupForm\\(\\(prev\\) => \\(\\{ \\.\\.\\.prev, ${f.key}: (.*?)\\.target\\.value(.*?) \\}\\)\\)\\}`;
    let rgx = new RegExp(rgxStr, 'g');
    content = content.replace(rgx, `onChange={(e) => {
                              setSignupForm((prev) => ({ ...prev, ${f.key}: e.target.value$2 }));
                              if (fieldErrors.signup_${f.key}) validateSignupField('${f.key}', e.target.value$2, signupForm);
                            }}
                            onBlur={(e) => validateSignupField('${f.key}', e.target.value$2, signupForm)}`);
                            
    // Inject error span
    let inputRgx = new RegExp(`(<input[^>]*placeholder="${f.placeholder}"[^>]*\\/>)`, 'g');
    if (!content.match(inputRgx)) {
      inputRgx = new RegExp(`(<input[^>]*placeholder="${f.orPlaceholder}"[^>]*\\/>)`, 'g');
    }
    
    // Instead of replacing the input, which causes layout issues, let's inject after the input
    // If it's a password, there's a button.
    if (f.isPassword) {
      const pRgx = new RegExp(`(<input[^>]*placeholder="${f.placeholder}"[^>]*\\/>\\s*<button[^>]*>[\\s\\S]*?<\\/button>)`, 'g');
      content = content.replace(pRgx, `$1\n{fieldErrors.signup_${f.key} && <span style={{color: '#ef4444', fontSize: '11px', position: 'absolute', bottom: '-18px'}}>{fieldErrors.signup_${f.key}}</span>}`);
    } else {
      content = content.replace(inputRgx, `$1\n{fieldErrors.signup_${f.key} && <span style={{color: '#ef4444', fontSize: '11px', display: 'block'}}>{fieldErrors.signup_${f.key}}</span>}`);
    }
  }

  fs.writeFileSync(filePath, content);
}

applyValidation('src/components/desktop/DesktopAuthModal.jsx', true);
applyValidation('src/components/mobile/MobileLoginModal.jsx', false);
console.log('Safe validation injection applied to auth modals');
