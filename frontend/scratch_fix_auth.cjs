const fs = require('fs');
const file = 'src/components/desktop/DesktopAuthModal.jsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  '{otpSent && (',
  '{otpSent && (<>'
);
c = c.replace(
  '{fieldErrors.signup_otp && <span className="auth-error-text">{fieldErrors.signup_otp}</span>}\n                          )}',
  '{fieldErrors.signup_otp && <span className="auth-error-text">{fieldErrors.signup_otp}</span>}\n                          </>)}'
);

fs.writeFileSync(file, c);
