const fs = require('fs');

function updatePassengerForms(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Inject validatePassengerField BEFORE calculateDynamicFare
  if (!content.includes('const validatePassengerField')) {
    const validator = `
  const [fieldErrors, setFieldErrors] = useState({});

  const validatePassengerField = (seat, field, value) => {
    let error = '';
    if (field === 'name') {
      if (!value || value.trim().length < 2) error = 'Please enter passenger name.';
    }
    if (field === 'age') {
      const ageNum = parseInt(value, 10);
      if (!value || isNaN(ageNum) || ageNum < 1 || ageNum > 120) error = 'Please enter a valid age.';
      // We don't have selectedSeats here locally because it's managed via props, but we know if it's the only seat we can check object keys.
    }
    setFieldErrors(prev => ({ ...prev, [\`\${seat}_\${field}\`]: error }));
  };
`;
    content = content.replace(
      /const calculateDynamicFare = /,
      validator + '\n  const calculateDynamicFare = '
    );
  }

  // Inject validation into inputs
  // For Name
  if (!content.includes('onBlur={e => validatePassengerField(seat, \'name\'')) {
    content = content.replace(
      /(<input[\s\S]*?placeholder="Name"[\s\S]*?onChange=\{e => setPassengerDetails\(\{\.\.\.passengerDetails, \[seat\]: \{\.\.\.passengerDetails\?\.\[seat\], name: e\.target\.value\}\}\)\}[\s\S]*?\/>)/g,
      `$1\n                          {fieldErrors[\`\${seat}_name\`] && <span className="text-red-500 text-xs mt-1 block">{fieldErrors[\`\${seat}_name\`]}</span>}`
    );
    // Add onBlur and onChange validation
    content = content.replace(
      /onChange=\{e => setPassengerDetails\(\{\.\.\.passengerDetails, \[seat\]: \{\.\.\.passengerDetails\?\.\[seat\], name: e\.target\.value\}\}\)\}/g,
      `onChange={e => {
                              setPassengerDetails({...passengerDetails, [seat]: {...passengerDetails?.[seat], name: e.target.value}});
                              if (fieldErrors[\`\${seat}_name\`]) validatePassengerField(seat, 'name', e.target.value);
                            }}
                            onBlur={e => validatePassengerField(seat, 'name', e.target.value)}`
    );
  }

  // For Age
  if (!content.includes('onBlur={e => validatePassengerField(seat, \'age\'')) {
    // Inject the error span below the flex container for Age and Gender
    const flexEnd = `                            </select>\n                          </div>`;
    content = content.replace(
      new RegExp(flexEnd.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'g'),
      `${flexEnd}\n                          {fieldErrors[\`\${seat}_age\`] && <span className="text-red-500 text-xs mt-1 block">{fieldErrors[\`\${seat}_age\`]}</span>}`
    );

    content = content.replace(
      /onChange=\{e => setPassengerDetails\(\{\.\.\.passengerDetails, \[seat\]: \{\.\.\.passengerDetails\?\.\[seat\], age: e\.target\.value\}\}\)\}/g,
      `onChange={e => {
                              setPassengerDetails({...passengerDetails, [seat]: {...passengerDetails?.[seat], age: e.target.value}});
                              if (fieldErrors[\`\${seat}_age\`]) validatePassengerField(seat, 'age', e.target.value);
                            }}
                            onBlur={e => validatePassengerField(seat, 'age', e.target.value)}`
    );
  }

  fs.writeFileSync(filePath, content);
}

updatePassengerForms('src/components/desktop/DesktopSearchResults.jsx');
updatePassengerForms('src/components/mobile/MobileSearchResults.jsx');
console.log('Search Results forms updated.');
