import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';

import { AuthField, AuthLink, AuthScreen } from '@/components/auth-screen';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { firebaseErrorMessage } from '@/lib/firebase-errors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const resetPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes('@')) {
      setError('Enter the email you use for Roundhouse.');
      return;
    }
    if (!isFirebaseConfigured || !auth) {
      setError('Firebase needs to be connected before password recovery can run.');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      setNotice('Check your email for the password reset link.');
    } catch (nextError) {
      setError(firebaseErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title="Reset your password"
      description="We’ll send a reset link to your Roundhouse email."
      submitLabel="Send reset link"
      loading={loading}
      error={error}
      notice={notice}
      onSubmit={resetPassword}
      footer={<AuthLink href="/sign-in">Back to sign in</AuthLink>}>
      <AuthField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" returnKeyType="done" onSubmitEditing={resetPassword} />
    </AuthScreen>
  );
}
