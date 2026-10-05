const fs = require('fs');

function injectErrors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // For email login
  if (!content.includes('fieldErrors.email &&')) {
    content = content.replace(
      /(<input[\s\S]*?className="bp-input"[\s\S]*?placeholder="Email Address"[\s\S]*?\/>)/,
      '$1\n                    {fieldErrors.email && <span className="auth-error-text">{fieldErrors.email}</span>}'
    );
  }
  
  // For password login
  if (!content.includes('fieldErrors.password &&')) {
    content = content.replace(
      /(<button[\s\S]*?setShowPassword[\s\S]*?<\/button>)/,
      '$1\n                    {fieldErrors.password && <span className="auth-error-text" style={{position: "absolute", bottom: "-20px"}}>{fieldErrors.password}</span>}'
    );
  }

  // For signup fields
  const signupFields = [
    { name: 'fullName', type: 'text', placeholder: 'NAME' },
    { name: 'age', type: 'number', placeholder: 'AGE' },
    { name: 'email', type: 'email', placeholder: 'EMAIL ID' },
    { name: 'phone', type: 'tel', placeholder: 'MOBILE NUMBER' },
    { name: 'otp', type: 'text', placeholder: 'ENTER OTP' },
    { name: 'password', type: 'text', placeholder: 'PASSWORD', isPass: true },
    { name: 'confirmPassword', type: 'text', placeholder: 'CONFIRM PASSWORD', isPass: true }
  ];

  for (const field of signupFields) {
    if (!content.includes(`fieldErrors.signup_${field.name} &&`)) {
      if (field.isPass) {
         const regex = new RegExp(`(<input[\\s\\S]*?placeholder="${field.placeholder}"[\\s\\S]*?\\/>\\s*<button[\\s\\S]*?<\\/button>)`);
         content = content.replace(regex, `$1\n                          {fieldErrors.signup_${field.name} && <span className="auth-error-text" style={{position: "absolute", bottom: "-20px"}}>{fieldErrors.signup_${field.name}}</span>}`);
      } else if (field.name === 'phone' || field.name === 'otp') {
         const regex = new RegExp(`(<input[\\s\\S]*?placeholder="${field.placeholder}"[\\s\\S]*?\\/>[\\s\\S]*?<\\/button>\\s*<\\/div>)`);
         content = content.replace(regex, `$1\n                          {fieldErrors.signup_${field.name} && <span className="auth-error-text">{fieldErrors.signup_${field.name}}</span>}`);
      } else {
         const regex = new RegExp(`(<input[\\s\\S]*?placeholder="${field.placeholder}"[\\s\\S]*?\\/>)`);
         content = content.replace(regex, `$1\n                          {fieldErrors.signup_${field.name} && <span className="auth-error-text">{fieldErrors.signup_${field.name}}</span>}`);
      }
    }
  }

  fs.writeFileSync(filePath, content);
}

injectErrors('src/components/mobile/MobileLoginModal.jsx');
console.log('Mobile Auth updated.');
