const fs = require('fs');

let content = fs.readFileSync('src/components/desktop/DesktopAuthModal.jsx', 'utf8');

// We need to destructure fieldErrors, validateLoginField, validateSignupField from useAuthForm.
if (!content.includes('fieldErrors')) {
  content = content.replace(
    'loginForm,',
    'fieldErrors,\n    validateLoginField,\n    validateSignupField,\n    loginForm,'
  );
}

// Add CSS for error-text
if (!content.includes('auth-error-text')) {
  const css = `
.auth-error-text {
  color: #d1483c;
  font-size: 11px;
  margin-top: 4px;
  display: block;
}
`;
  fs.appendFileSync('src/components/desktop/DesktopAuthModal.css', css);
}

// Helper to inject onBlur and Error spans
function injectValidation(html, fieldName, isLogin) {
  const validator = isLogin ? 'validateLoginField' : 'validateSignupField';
  const valParam = isLogin ? 'e.target.value' : `e.target.value, signupForm`;
  const errorKey = isLogin ? fieldName : `signup_${fieldName}`;
  
  // Find the input element (could be input or select)
  // We need to inject `onBlur={() => ${validator}('${fieldName}', ${valParam})}`
  // and `{fieldErrors.${errorKey} && <span className="auth-error-text">{fieldErrors.${errorKey}}</span>}`
  
  // This is tricky with simple regex because HTML is nested. Let's do simple replaces.
}

// Actually, let's use string replacements manually for DesktopAuthModal.jsx

// Login Form
content = content.replace(
  /onChange=\{\(e\) => setLoginForm\(\(prev\) => \(\{ \.\.\.prev, email: e\.target\.value \}\)\)\}/,
  `onChange={(e) => {
                              setLoginForm((prev) => ({ ...prev, email: e.target.value }));
                              if (fieldErrors.email) validateLoginField('email', e.target.value);
                            }}
                            onBlur={(e) => validateLoginField('email', e.target.value)}`
);

content = content.replace(
  /onChange=\{\(e\) => setLoginForm\(\(prev\) => \(\{ \.\.\.prev, password: e\.target\.value \}\)\)\}/,
  `onChange={(e) => {
                              setLoginForm((prev) => ({ ...prev, password: e.target.value }));
                              if (fieldErrors.password) validateLoginField('password', e.target.value);
                            }}
                            onBlur={(e) => validateLoginField('password', e.target.value)}`
);

// Add error displays for Login
content = content.replace(
  /(\s*)(<\/div>)\s*(<div className="bp-input-group" style=\{\{ position: 'relative' \}\}>)/,
  `$1  {fieldErrors.email && <span className="auth-error-text">{fieldErrors.email}</span>}\n$1$2$1$3`
);
content = content.replace(
  /(\s*)(<\/div>)\s*(<button type="submit" className="bp-submit">)/,
  `$1  {fieldErrors.password && <span className="auth-error-text">{fieldErrors.password}</span>}\n$1$2$1$3`
);

// Signup Form 
const signupFields = ['fullName', 'age', 'email', 'phone', 'otp', 'password', 'confirmPassword'];
for (const field of signupFields) {
  const regex = new RegExp(`onChange=\\{\\(e\\) => setSignupForm\\(\\(prev\\) => \\(\\{ \\.\\.\\.prev, ${field}: (.*?)\\.target\\.value(.*?) \\}\\)\\)\\}`);
  const match = content.match(regex);
  if (match) {
    const replacement = `onChange={(e) => {
                              setSignupForm((prev) => ({ ...prev, ${field}: e.target.value${match[2]} }));
                              if (fieldErrors.signup_${field}) validateSignupField('${field}', e.target.value${match[2]}, signupForm);
                            }}
                            onBlur={(e) => validateSignupField('${field}', e.target.value${match[2]}, signupForm)}`;
    content = content.replace(regex, replacement);
    
    // Add error span right after the input. Find the closing `/>` or `</select>` and append.
    // It's safer to just inject it at the end of the bp-input-group
  }
}

// Let's inject errors before the closing </div> of each bp-input-group
// Actually, it's safer to do this with string replacement on the exact chunks or just rewrite the component manually...

fs.writeFileSync('src/components/desktop/DesktopAuthModal.jsx', content);

