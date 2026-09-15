import React, { useEffect } from 'react';

const PhoneEmailSignIn = ({ onSuccess }) => {
    useEffect(() => {
        // Load the external script
        const script = document.createElement('script');
        script.src = "https://www.phone.email/sign_in_button_v1.js";
        script.async = true;
        const container = document.querySelector('.pe_signin_button');
        if (container && !container.hasChildNodes()) {
            container.appendChild(script);
        }

        // Define the listener function
        window.phoneEmailListener = function(userObj) {
            const user_json_url = userObj.user_json_url;
            if (onSuccess) {
                onSuccess(user_json_url);
            }
        };

        return () => {
            window.phoneEmailListener = null;
        };
    }, [onSuccess]);

    return (
        <div
            className="pe_signin_button"
            data-client-id="15695407177920574360"
            data-button-text="Verify your number"
        ></div>
    );
};

export default PhoneEmailSignIn;

