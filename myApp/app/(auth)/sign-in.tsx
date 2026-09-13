import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';

import { AuthField, AuthLink, AuthScreen } from '@/components/auth-screen';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { firebaseErrorMessage } from '@/lib/firebase-errors';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signIn = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes('@') || !password) {
      setError('Enter your email and password.');
      return;
    }
    if (!isFirebaseConfigured || !auth) {
      setError('Firebase needs to be connected before sign-in can run.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, normalizedEmail, password);
    } catch (nextError) {
      setError(firebaseErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title="Welcome back"
      description="Sign in to open your Roundhouse Command Center."
      submitLabel="Sign in"
      loading={loading}
      error={error}
      onSubmit={signIn}
      footer={(
        <>
          <AuthLink href="/forgot-password">Forgot your password?</AuthLink>
          <AuthLink href="/sign-up">Create a Roundhouse sign-in</AuthLink>
        </>
      )}>
      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        keyboardType="email-address"
        returnKeyType="next"
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoComplete="current-password"
        secureTextEntry
        returnKeyType="done"
        onSubmitEditing={signIn}
      />
    </AuthScreen>
  );
}
