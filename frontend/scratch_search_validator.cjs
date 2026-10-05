const fs = require('fs');
const validator = `
  const validatePassengerField = (seat, field, value) => {
    let error = '';
    if (field === 'name') {
      if (!value || value.trim().length < 2) error = 'Please enter passenger name.';
    }
    if (field === 'age') {
      const ageNum = parseInt(value, 10);
      if (!value || isNaN(ageNum) || ageNum < 1 || ageNum > 120) error = 'Please enter a valid age.';
    }
    setFieldErrors(prev => ({ ...prev, [\`\${seat}_\${field}\`]: error }));
  };
`;

for (const f of ['src/components/desktop/DesktopSearchResults.jsx', 'src/components/mobile/MobileSearchResults.jsx']) {
  let c = fs.readFileSync(f, 'utf8');
  if (!c.includes('const validatePassengerField')) {
    c = c.replace(
      'const [searchParams, setSearchParams] = useSearchParams();',
      validator + '\n  const [searchParams, setSearchParams] = useSearchParams();'
    );
    fs.writeFileSync(f, c);
  }
}
