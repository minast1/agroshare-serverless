"use client"
import Image, { type ImageProps } from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { signIn, signUp, confirmSignUp, signInWithRedirect, fetchAuthSession, fetchUserAttributes, confirmSignIn } from 'aws-amplify/auth';
import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

// 1. BASE AMPLIFY CONFIGURATION FOR MINISTACK LOCAL TESTING
const baseConfig = {
  Auth: {
    Cognito: {
      userPoolEndpoint: 'http://localhost:4566', // Points directly to local Ministack container
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
     
      loginWith: {
       email: true
      }
    }
  }
};

// RUNTIME SINGLETON MUTATOR FOR DYNAMIC USER-ROLE SWITCHING
function configureAmplifyForRole(role: 'basic' | 'superadmin') {
  const clientId = role === 'superadmin'
    ? process.env.NEXT_PUBLIC_SUPERADMIN_CLIENT_ID!
    : process.env.NEXT_PUBLIC_BASIC_USER_CLIENT_ID!;

  Amplify.configure({
    ...baseConfig,
    Auth: {
      Cognito: {
        ...baseConfig.Auth.Cognito,
        userPoolClientId: clientId
      }
    }
  }, { ssr: true });
}


export default function Home() {
   // Navigation & View States
  const [activeForm, setActiveForm] = useState<'superadmin' | 'admin'>('admin');
  const [adminSubFlow, setAdminSubFlow] = useState<'google' | 'otp_signup' | 'otp_signin'>('google');
  
  // Input fields
  const [tenantId, setTenantId] = useState('company-alpha');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // Feedback states
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [challengeActive, setChallengeActive] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
   console.log(sessionData)
   // 2. LISTEN FOR OAUTH REDIRECTS (Capturing Google return packets)
  useEffect(() => {
    // Default to initializing standard client profiles on load
    configureAmplifyForRole('basic');

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'customOAuthState') {
        setInfoMessage(`Returned via Google redirection! Passed State: ${payload.data}`);
        checkActiveSession();
      }
    });
    return () => unsubscribe();
  }, []);

  // Utility to query active tokens post-login
  const checkActiveSession = async () => {
    try {
      const session = await fetchAuthSession();
      console.log({session})
      //const attributes = await fetchUserAttributes();
        const claims = session.tokens?.idToken?.payload;
       const tenantId = claims?.['custom:tenant_id'] || claims?.['custom:tenantId'];
       const tenantType = claims?.['custom:tenant_type'] || claims?.['custom:tenantType'];
       const role = claims?.['custom:role'] || claims?.['custom:role'];
      setSessionData({
        idTokenClaims: session.tokens?.idToken?.payload,
        customTenant: tenantId,
        customRole: role,
        customTenantType: tenantType,
      });
      
      setErrorMessage(null);
    } catch (err: any) {
      setSessionData(null);
    }
  };

  const clearMessages = () => {
    setErrorMessage(null);
    setInfoMessage(null);
  };

  // =========================================================================
  // AUTH FLOW EXECUTION HANDLERS
  // =========================================================================

  // FLOW A: Super-admin Email & Password Authentication
  const handleSuperAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    configureAmplifyForRole('superadmin'); // Pivot singleton to Super-admin credentials
    console.log('Configured Amplify for superadmin')

    try {
      const { isSignedIn } = await signIn({ username: email, password });
      if (isSignedIn) {
        setInfoMessage('Super-admin Authenticated Successfully!');
        await checkActiveSession();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Super-admin validation failed.');
    }
  };

  // FLOW B: Admin Social Authentication via Google
  const handleGoogleSocialAuth = async () => {
    clearMessages();
    configureAmplifyForRole('basic'); // Pivot singleton to standard Client App ID

    try {
      await signInWithRedirect({
        provider: 'Google',
        customState : JSON.stringify({ tenant_id: tenantId, tenant_type: 'vendor', role: 'admin' }) ,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'OAuth Redirection Blocked.');
    }
  };

  // FLOW C: Admin Native Sign-Up (Triggers Custom Pre-Signup/Post-Confirmation)
  const handleAdminOtpSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    configureAmplifyForRole('basic');

    try {
      const { nextStep } = await signUp({
        username: email,
        password: 'PasswordBypass123!', // Placeholder because flow expects OTP later
        options: {
          userAttributes: { email },
          // Passed directly for direct non-redirect API calls
          clientMetadata: { tenantId, role: 'admin', tenantType: 'vendor' } 
        }
      });

      setInfoMessage(`Registration initiated! Stage: ${nextStep.signUpStep}. Check your Ministack terminal for the confirmation code.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failure.');
    }
  };

  // FLOW D: Admin OTP Verification (Submitting the code to finalize user account)
  const handleAdminVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    configureAmplifyForRole('basic');

    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: otpCode,
        options: {
          // Carry context forward to the Post-Confirmation execution lambda
          clientMetadata: { tenantId, role: 'admin' }
        }
      });

      if (isSignUpComplete) {
        setInfoMessage('Account Confirmed! Your custom tenant attributes have been permanently saved. You can now use the email OTP flow.');
        setAdminSubFlow('otp_signin');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Validation code rejection.');
    }
  };

  const handleSubmitLoginOtp = async (e: React.FormEvent) => {
     e.preventDefault();
    clearMessages();
    configureAmplifyForRole('basic');
     if (!otpCode || otpCode.trim().length !== 6) {
    setErrorMessage('Please enter a valid 6-digit confirmation PIN.');
    return;
  }
    try {
      const { isSignedIn, nextStep } = await confirmSignIn({challengeResponse : otpCode.trim()})
         if (isSignedIn) {
        setInfoMessage('Admin Custom OTP Authenticated Successfully!');
        setChallengeActive(false); // Reset the UI form challenge visibility toggle
        setOtpCode('');
         await checkActiveSession();
      } else {
        setInfoMessage(`Additional authentication step required: ${nextStep.signInStep}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Admin validation failed.');
    }
  };

  // FLOW E: Direct Email OTP Passwordless Sign-In
  const handleAdminOtpSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    configureAmplifyForRole('basic');

    try {
      const { nextStep } = await signIn({
        username: email,
        options: {
          authFlowType: 'CUSTOM_WITHOUT_SRP',
          clientMetadata: { tenantId, role: 'admin' }
        }
      });
      if(nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {
        setInfoMessage(`Challenge created: ${nextStep.signInStep}. Pull code from Ministack logs.`);
        setChallengeActive(true);
        setOtpCode('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP Challenge initiation failed.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>🔐 Ministack Multitenant Auth Panel</h1>

      {/* GLOBAL NOTIFICATION BLOCKS */}
      {errorMessage && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: '4px', margin: '15px 0' }}>⚠️ {errorMessage}</div>}
      {infoMessage && <div style={{ background: '#DBEAFE', color: '#1E40AF', padding: '12px', borderRadius: '4px', margin: '15px 0' }}>ℹ️ {infoMessage}</div>}

      {/* CORE CONFIGURATION CONTROLS */}
      <div style={{ background: '#F3F4F6', padding: '15px', borderRadius: '6px', marginBottom: '25px' }}>
        <h3>🏗️ System Simulation Variables</h3>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <strong>Target Tenant Context Identifier:</strong>
          <input type="text" value={tenantId} onChange={(e) => setTenantId(e.target.value)} style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }} />
        </label>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button onClick={() => { setActiveForm('admin'); clearMessages(); }} style={{ flex: 1, padding: '10px', background: activeForm === 'admin' ? '#2563EB' : '#E5E7EB', color: activeForm === 'admin' ? '#fff' : '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Admin Portal (Social / OTP)</button>
          <button onClick={() => { setActiveForm('superadmin'); clearMessages(); }} style={{ flex: 1, padding: '10px', background: activeForm === 'superadmin' ? '#2563EB' : '#E5E7EB', color: activeForm === 'superadmin' ? '#fff' : '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Super-admin Portal (Password)</button>
        </div>
      </div>

      {/* VIEW PANEL A: SUPERADMIN LOGIN FORM */}
      {activeForm === 'superadmin' && (
        <form onSubmit={handleSuperAdminSignIn} style={{ border: '1px solid #E5E7EB', padding: '20px', borderRadius: '6px' }}>
          <h2>⚡ Super-admin Portal Access</h2>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Expects pre-populated Cognito database profile credentials.</p>
          <input type="email" placeholder="Super-admin Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }} />
          <input type="password" placeholder="Account Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '15px' }} />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Authenticate via Password</button>
        </form>
      )}

      {/* VIEW PANEL B: ADMIN MULTI-FLOW OPTIONS */}
      {activeForm === 'admin' && (
        <div style={{ border: '1px solid #E5E7EB', padding: '20px', borderRadius: '6px' }}>
          <h2>💼 Administrator Access</h2>
          
          <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', fontSize: '12px' }}>
            <button onClick={() => setAdminSubFlow('google')} style={{ background: adminSubFlow === 'google' ? '#4B5563' : '#F3F4F6', color: adminSubFlow === 'google' ? '#fff' : '#000', padding: '6px 12px', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>1. Google Redirect</button>
            <button onClick={() => setAdminSubFlow('otp_signup')} style={{ background: adminSubFlow === 'otp_signup' ? '#4B5563' : '#F3F4F6', color: adminSubFlow === 'otp_signup' ? '#fff' : '#000', padding: '6px 12px', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>2. Initial OTP Sign-Up</button>
            <button onClick={() => setAdminSubFlow('otp_signin')} style={{ background: adminSubFlow === 'otp_signin' ? '#4B5563' : '#F3F4F6', color: adminSubFlow === 'otp_signin' ? '#fff' : '#000', padding: '6px 12px', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>3. Regular OTP Login</button>
          </div>

          {adminSubFlow === 'google' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ marginBottom: '15px' }}>Will transmit <strong>{tenantId}</strong> to Cognito via customState parameters.</p>
              <button onClick={handleGoogleSocialAuth} style={{ padding: '12px 24px', background: '#EA4335', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Continue with Google OAuth</button>
            </div>
          )}

          {adminSubFlow === 'otp_signup' && (
            <div>
              <form onSubmit={handleAdminOtpSignUp} style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '10px' }}>Step A: Register Email ID</h3>
                <input type="email" placeholder="Admin Corporate Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }} />
                <button type="submit" style={{ padding: '10px 20px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Send Registration Packet</button>
              </form>
              <form onSubmit={handleAdminVerifyOtp} style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '10px' }}>Step B: Verify Accounts (Fires Post-Confirmation)</h3>
                <input type="text" placeholder="6-digit Confirmation Code" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }} />
                <button type="submit" style={{ padding: '10px 20px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Submit Code</button>
              </form>
            </div>
          )}

          {adminSubFlow === 'otp_signin' && (
            <>
            <form onSubmit={handleAdminOtpSignIn}>
              <h3 style={{ marginBottom: '10px' }}>Request Verification Challenge Link</h3>
              <input type="email" placeholder="Enter Registered Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }} />
              <button type="submit" style={{ padding: '12px 20px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Request Secure OTP Pin</button>
            </form>
            {adminSubFlow === 'otp_signin' && challengeActive && (
              <form onSubmit={handleSubmitLoginOtp}>
                <h3 style={{ marginBottom: '10px' }}>Step B: Verify Account (Fires Post-Confirmation)</h3>
                <input type="text" placeholder="6-digit Confirmation Code" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }} />
                <button type="submit" style={{ padding: '10px 20px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Submit Code</button>
              </form>
            )}
            </>
          )}

      {/* SESSION & JWT CLAIMS DEBUGGER COUCH */}
      {sessionData && (
        <div style={{ marginTop: '30px', padding: '15px', background: '#1E293B', color: '#38BDF8', borderRadius: '6px', fontFamily: 'monospace', overflowX: 'auto' }}>
          <h3 style={{ color: '#F1F5F9', marginTop: 0 }}>📊 Decoded Session Claims Token (Ministack Output Verification)</h3>
          <p style={{ marginBottom: '5px' }}>Resolved Profile Tenant ID: <span style={{ color: '#34D399' }}>{sessionData.customTenant || 'None'}</span></p>
          <p style={{ marginBottom: '15px' }}>Resolved Profile User Role: <span style={{ color: '#34D399' }}>{sessionData.customRole || 'None'}</span></p>
          <details>
            <summary style={{ cursor: 'pointer', color: '#94A3B8' }}>View Full Raw ID Token JWT Payload JSON</summary>
            <pre style={{ color: '#F8FAFC', marginTop: '10px' }}>{JSON.stringify(sessionData.idTokenClaims, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
)}
</div>
  )

}
  
