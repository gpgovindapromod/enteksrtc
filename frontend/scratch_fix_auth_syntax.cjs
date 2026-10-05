const fs = require('fs');
const files = [
  'src/components/desktop/DesktopAuthModal.jsx',
  'src/components/mobile/MobileLoginModal.jsx'
];

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');

  // We have a syntax error around here:
  // {fieldErrors.signup_otp && <span className="auth-error-text">{fieldErrors.signup_otp}</span>}
  //                           )}
  //                         </>
  //                       ) : (

  // Let's replace the mangled block with the correct one.
  const target = `{fieldErrors.signup_otp && <span className="auth-error-text">{fieldErrors.signup_otp}</span>}
                          )}
                        </>
                      ) : (`;

  const target2 = `{fieldErrors.signup_otp && <span className="auth-error-text">{fieldErrors.signup_otp}</span>}\r\n                          )}\r\n                        </>\r\n                      ) : (`;
  
  const replacement = `{fieldErrors.signup_otp && <span className="auth-error-text">{fieldErrors.signup_otp}</span>}
                          </>)}
                      ) : (`;

  if (c.includes(target)) {
     c = c.replace(target, replacement);
  } else {
     c = c.replace(target.replace(/\n/g, '\r\n'), replacement.replace(/\n/g, '\r\n'));
  }
  
  // also fix if it's already partly mangled
  const target3 = `{fieldErrors.signup_otp && <span className="auth-error-text">{fieldErrors.signup_otp}</span>}\n                          )}\n                        </>\n                      ) : (`;
  c = c.replace(target3, replacement);
  
  // What if it is:
  // {fieldErrors.signup_otp && <span className="auth-error-text">{fieldErrors.signup_otp}</span>}
  //                           )}
  //                         </>
  //                       ) : (
  c = c.replace(/\{fieldErrors\.signup_otp && <span className="auth-error-text">\{fieldErrors\.signup_otp\}<\/span>\}\r?\n\s*\)\}\r?\n\s*<\/>\r?\n\s*\) : \(/g, 
  `{fieldErrors.signup_otp && <span className="auth-error-text">{fieldErrors.signup_otp}</span>}
                          </>)}
                      ) : (`);

  fs.writeFileSync(file, c);
}
