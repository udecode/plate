let webAuth = null;

// Auth0 config will be available as global variable after script loads

// Initialize when Office is ready
Office.onReady(() => {
    initializeAuth0();
    setupEventListeners();
});

function initializeAuth0() {
    if (!window.auth0Config) {
        console.error('Auth0 config not loaded. Make sure auth0-config.js is loaded before this script.');
        return;
    }
    
    webAuth = new auth0.WebAuth({
        domain: window.auth0Config.domain,
        clientID: window.auth0Config.clientId,
        redirectUri: window.auth0Config.redirectUri,
        responseType: window.auth0Config.responseType,
        scope: window.auth0Config.scope
    });
}

function setupEventListeners() {
    document.getElementById('sendCode').addEventListener('click', sendVerificationCode);
    document.getElementById('verifyCode').addEventListener('click', verifyCodeAndLogin);
    
    // Allow Enter key to submit
    document.getElementById('email').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendVerificationCode();
        }
    });
    
    document.getElementById('code').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyCodeAndLogin();
        }
    });
}

function sendVerificationCode() {
    const email = document.getElementById('email').value.trim();
    if (!email) {
        showStatus('Please enter your email address', 'error');
        debugMessageParent({ step: 'validation_error', message: 'Email address required' });
        return;
    }

    const btn = document.getElementById('sendCode');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    showStatus('Sending verification code to ' + email + '...', 'info');
    debugMessageParent({ step: 'sending_code', email: email });

    // Send passwordless email with CODE
    webAuth.passwordlessStart({
        connection: 'email',
        send: 'code',
        email
    }, function(err, result) {
        btn.disabled = false;
        btn.textContent = 'Send Verification Code';

        if (err) {
            const errorMsg = err.description || err.error;
            showStatus('Error: ' + errorMsg, 'error');
            debugMessageParent({ step: 'send_code_error', error: errorMsg, details: err });
            return;
        }

        showStatus('✅ Verification code sent! Check your email and enter the 6-digit code below.', 'success');
        debugMessageParent({ step: 'code_sent_success', email, result });

        // Show code input section
        document.getElementById('codeSection').classList.remove('hidden');
        document.getElementById('code').focus();
    });
}

async function verifyCodeAndLogin() {
    const email = document.getElementById('email').value.trim();
    const code = document.getElementById('code').value.trim();
    
    if (!code) {
        showStatus('Please enter the verification code', 'error');
        debugMessageParent({ step: 'code_validation_error', message: 'Verification code required' });
        return;
    }

    const btn = document.getElementById('verifyCode');
    btn.disabled = true;
    btn.textContent = 'Verifying...';

    showStatus('Verifying code...');
    debugMessageParent({ step: 'verifying_code', email, code: code.substring(0,2) + '***' });

    try {
        // Use direct Auth0 API call instead of webAuth.passwordlessLogin (more reliable in dialogs)
        debugMessageParent({ step: 'calling_direct_auth0_api' });
        
        const authUrl = `https://${auth0Config.domain}/oauth/token`;
        const requestBody = {
            grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
            client_id: auth0Config.clientId,
            username: email,
            otp: code,
            realm: 'email',
            scope: auth0Config.scope
        };

        debugMessageParent({ step: 'making_token_request', url: authUrl, grantType: requestBody.grant_type });

        const response = await fetch(authUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody)
        });

        debugMessageParent({ step: 'token_api_response', status: response.status, ok: response.ok });

        const authResult = await response.json();
        debugMessageParent({ step: 'token_response_parsed', hasAccessToken: !!authResult.access_token, hasError: !!authResult.error });
        
        // Log the full JSON response for debugging
        debugMessageParent({ step: 'verification_response_json', responseJson: authResult });

        if (authResult.error) {
            throw new Error(authResult.error_description || authResult.error);
        }

        if (!authResult.access_token) {
            throw new Error('No access token in response');
        }

        // Map to correct keys
        const convertedResult = {
            accessToken: authResult.access_token,
            idToken: authResult.id_token,
            tokenType: authResult.token_type,
            expiresIn: authResult.expires_in
        };

        debugMessageParent({ step: 'direct_api_success', hasAccessToken: !!convertedResult.accessToken });

        if (convertedResult && convertedResult.accessToken) {
            showStatus('🎉 Authentication successful! Getting user profile...', 'success');
            debugMessageParent({ step: 'auth_success', accessToken: convertedResult.accessToken.substring(0,10) + '...' });
            
            // Get user profile
            debugMessageParent({ step: 'fetching_user_profile' });
            const userInfo = await getUserProfile(convertedResult.accessToken);
            debugMessageParent({ step: 'user_profile_retrieved', userEmail: userInfo.email });
            
            showStatus('✅ Authentication successful! Closing dialog...', 'success');
            
            // Send result back to parent window
            const result = {
                success: true,
                accessToken: convertedResult.accessToken,
                idToken: convertedResult.idToken,
                expiresIn: convertedResult.expiresIn,
                user: userInfo
            };
            
            debugMessageParent({ step: 'sending_final_result' });
            
            // Send message to parent window (the taskpane)
            Office.context.ui.messageParent(JSON.stringify(result));
            
            // Close dialog automatically after successful login
            setTimeout(() => {
                Office.context.ui.messageParent('close');
            }, 1000);
        } else {
            showStatus('❌ No access token received');
            debugMessageParent({ step: 'no_access_token', convertedResult });
            throw new Error('No access token received');
        }
        
    } catch (error) {
        btn.disabled = false;
        btn.textContent = 'Verify Code & Login';
        
        let errorMessage = 'Authentication failed';
        if (error.error) {
            errorMessage = error.error_description || error.error;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showStatus('❌ ' + errorMessage + ' (Dialog kept open for debugging)', 'error');
        debugMessageParent({ step: 'verification_error', error: errorMessage, details: error });
        
        const errorResult = {
            success: false,
            error: errorMessage
        };
        
        // Send error but don't close dialog for debugging
        Office.context.ui.messageParent(JSON.stringify(errorResult));
    }
}

async function getUserProfile(accessToken) {
    try {
        debugMessageParent({ step: 'fetching_userinfo_api', url: `https://${auth0Config.domain}/userinfo` });
        
        const response = await fetch(`https://${auth0Config.domain}/userinfo`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        debugMessageParent({ step: 'userinfo_api_response', status: response.status, ok: response.ok });
        const user = await response.json();

        debugMessageParent({ step: 'userinfo_parsed', hasSub: !!user.sub, email: user.email });
        
        if (user.sub) {
            return user;
        } else {
            throw new Error('Invalid user profile response');
        }
    } catch (error) {
        debugMessageParent({ step: 'userinfo_error', error: error.message });
        throw error;
    }
}

// Helper function to send debug messages to parent
function debugMessageParent(data) {
    try {
        const message = JSON.stringify({ debug: true, ...data, timestamp: new Date().toISOString() });
        Office.context.ui.messageParent(message);
    } catch (error) {
        console.error('Failed to send debug message:', error);
    }
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status ' + type;
    status.style.display = 'block';
}