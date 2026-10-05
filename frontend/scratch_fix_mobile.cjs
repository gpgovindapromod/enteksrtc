const fs = require('fs');
const file = 'src/components/mobile/MobileLoginModal.jsx';
let c = fs.readFileSync(file, 'utf8');

const target = `{fieldErrors.signup_otp && <span className="auth-error-text">{fieldErrors.signup_otp}</span>}
                          )}
                        </>`;
const replacement = `{fieldErrors.signup_otp && <span className="auth-error-text">{fieldErrors.signup_otp}</span>}
                          </>)}
                        </>`;

c = c.replace(target, replacement);
// Also replacing with \r\n just in case
c = c.replace(target.replace(/\n/g, '\r\n'), replacement.replace(/\n/g, '\r\n'));

fs.writeFileSync(file, c);
