import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function AuthScreen() {
  const [currentView, setCurrentView] = useState('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const router = useRouter();

  // Fun CrinzPing messages for different states
  const getFunMessage = () => {
    const messages = {
      signIn: [
        "Ready for your daily dose of friendly roasts?",
        "Your friends are waiting to ping you!",
        "Three crinz a day keeps boredom away!",
        "Get ready to laugh at yourself (and others)!"
      ],
      signUp: [
        "Join the roast party! We promise it's fun",
        "Ready to send and receive hilarious pings?",
        "Your future embarrassing moments await!",
        "Don't worry, we roast everyone equally!"
      ],
      forgotPassword: [
        "Forgot your password? Don't worry, we won't roast you for it!",
        "Let's get you back to the roasting action!",
        "Even the best get locked out sometimes!",
        "Reset and get back to the fun!"
      ]
    };

    const currentMessages =
      currentView === 'sign-in' ? messages.signIn :
      currentView === 'sign-up' ? messages.signUp :
      messages.forgotPassword;

    return currentMessages[Math.floor(Math.random() * currentMessages.length)];
  };

  const onSignIn = async () => {
    setIsLoading(true);
    const result = await login({ email, password });
    setIsLoading(false);

    if (!result.success) {
      Alert.alert("Oops!", "That combo didn't work. Try again?");
    }
  };

  const onSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Hold up!", "Your passwords are having a disagreement!");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Too Short!", "Make it at least 6 characters - we believe in you!");
      return;
    }

    setIsLoading(true);
    const result = await signup({ email, password, name: email.split('@')[0] });
    setIsLoading(false);

    if (!result.success) {
      Alert.alert("Darn!", result.error || "Something went sideways. Try again?");
    }
  };

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert("Wait!", "We need your email to send the magic code!");
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setCurrentView('enter-code');
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      Alert.alert("Hmm...", "That code looks suspicious. 6 digits please!");
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setCurrentView('reset-password');
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      Alert.alert("Missing!", "New password required - make it a good one!");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Whoops!", "Your passwords need to be BFFs - make them match!");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Shorty!", "Give us at least 6 characters to work with!");
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setCurrentView('reset-success');
  };

  const handleResetComplete = () => {
    setCurrentView('sign-in');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setCode('');
  };

  // Render Header with Logo and Title
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoTitleContainer}>
        <View style={styles.logoCircle}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.appName}>CrinzPing</Text>
          <Text style={styles.tagline}>Get Roasted. Have Fun. Repeat.</Text>
        </View>
      </View>
    </View>
  );

  // Render Sign In Form
  const renderSignIn = () => (
    <>
      {renderHeader()}
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>{getFunMessage()}</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Your secret sauce"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#94a3b8"
            />
          </View>

          <Pressable
            style={styles.forgotPassword}
            onPress={() => setCurrentView('forgot-password')}
          >
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </Pressable>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={onSignIn}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Signing In...' : 'Let Me In!'}
            </Text>
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>New to the roast? </Text>
            <Pressable onPress={() => setCurrentView('sign-up')}>
              <Text style={styles.switchLink}>Join the Fun!</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );

  // Render Sign Up Form
  const renderSignUp = () => (
    <>
      {renderHeader()}
      <View style={styles.content}>
        <Text style={styles.title}>Join the Party!</Text>
        <Text style={styles.subtitle}>{getFunMessage()}</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Make it spicy"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Same spice level please"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholderTextColor="#94a3b8"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={onSignUp}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating Account...' : 'Start Roasting!'}
            </Text>
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Already one of us? </Text>
            <Pressable onPress={() => setCurrentView('sign-in')}>
              <Text style={styles.switchLink}>Sign In Here!</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );

  // Render Forgot Password Flow
  const renderForgotPassword = () => {
    if (currentView === 'forgot-password') {
      return (
        <>
          {renderHeader()}
          <View style={styles.content}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>{getFunMessage()}</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSendCode}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Sending Code...' : 'Send Reset Code!'}
                </Text>
              </TouchableOpacity>

              <Pressable
                style={styles.backLink}
                onPress={() => setCurrentView('sign-in')}
              >
                <Text style={styles.backLinkText}>← Back to Sign In</Text>
              </Pressable>
            </View>
          </View>
        </>
      );
    }

    if (currentView === 'enter-code') {
      return (
        <>
          {renderHeader()}
          <View style={styles.content}>
            <Text style={styles.title}>Enter Code</Text>
            <Text style={styles.subtitle}>Check your email for the magic numbers!</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Verification Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000000"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Verifying...' : 'Verify Code!'}
                </Text>
              </TouchableOpacity>

              <Pressable
                style={styles.backLink}
                onPress={() => setCurrentView('forgot-password')}
              >
                <Text style={styles.backLinkText}>← Back to Email</Text>
              </Pressable>
            </View>
          </View>
        </>
      );
    }

    if (currentView === 'reset-password') {
      return (
        <>
          {renderHeader()}
          <View style={styles.content}>
            <Text style={styles.title}>New Password</Text>
            <Text style={styles.subtitle}>Make it memorable (but not too memorable)!</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Shhh... it's a secret"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Same secret, please"
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  secureTextEntry
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Resetting...' : 'Reset Password!'}
                </Text>
              </TouchableOpacity>

              <Pressable
                style={styles.backLink}
                onPress={() => setCurrentView('enter-code')}
              >
                <Text style={styles.backLinkText}>← Back to Code</Text>
              </Pressable>
            </View>
          </View>
        </>
      );
    }

    if (currentView === 'reset-success') {
      return (
        <>
          {renderHeader()}
          <View style={styles.content}>
            <Text style={styles.title}>Success!</Text>
            <Text style={styles.subtitle}>You're back in the game!</Text>

            <View style={styles.form}>
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successMessage}>
                  Password reset successful!
                </Text>
                <Text style={styles.successSubMessage}>
                  Ready to get roasted again? Your friends miss you!
                </Text>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleResetComplete}
              >
                <Text style={styles.buttonText}>Back to Sign In!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.scrollContainer}>
          {currentView === 'sign-in' && renderSignIn()}
          {currentView === 'sign-up' && renderSignUp()}
          {(currentView === 'forgot-password' || currentView === 'enter-code' || currentView === 'reset-password' || currentView === 'reset-success') && renderForgotPassword()}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 40,
    paddingTop: 10,
  },
  logoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleContainer: {
    flex: 1,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
    marginTop: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  button: {
    height: 56,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#A5B4FC',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  switchText: {
    color: '#64748B',
    fontSize: 14,
  },
  switchLink: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backLink: {
    alignSelf: 'center',
    marginTop: 24,
  },
  backLinkText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  successIcon: {
    fontSize: 64,
    color: '#10B981',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  successSubMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});