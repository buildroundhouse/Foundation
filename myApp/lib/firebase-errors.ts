export function firebaseErrorMessage(error: unknown): string {
  const code = (error as { code?: string }).code;

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'That email or password is not correct.';
    case 'auth/email-already-in-use':
      return 'An account already exists for that email.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Use a stronger password with at least six characters.';
    case 'auth/network-request-failed':
      return 'Roundhouse could not reach the network. Check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
