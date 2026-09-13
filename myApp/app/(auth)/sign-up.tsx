import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useState } from 'react';

import { AuthField, AuthLink, AuthScreen } from '@/components/auth-screen';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { firebaseErrorMessage } from '@/lib/firebase-errors';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signUp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!name.trim() || !normalizedEmail.includes('@') || password.length < 6) {
      setError('Enter your name, a valid email, and a password of at least six characters.');
      return;
    }
    if (!isFirebaseConfigured || !auth) {
      setError('Firebase needs to be connected before account creation can run.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      await updateProfile(credential.user, { displayName: name.trim() });
    } catch (nextError) {
      setError(firebaseErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title="Start your Roundhouse"
      description="Create your sign-in. Your properties and businesses come next."
      submitLabel="Create sign-in"
      loading={loading}
      error={error}
      onSubmit={signUp}
      footer={<AuthLink href="/sign-in">Already have a sign-in?</AuthLink>}>
      <AuthField label="Your name" value={name} onChangeText={setName} autoComplete="name" returnKeyType="next" />
      <AuthField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" returnKeyType="next" />
      <AuthField label="Password" value={password} onChangeText={setPassword} autoCapitalize="none" autoComplete="new-password" secureTextEntry returnKeyType="done" onSubmitEditing={signUp} />
    </AuthScreen>
  );
}
