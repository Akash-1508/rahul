import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/auth/authService';

/**
 * Forgot Password Screen
 * Step 1: Enter email/mobile to receive OTP
 * Step 2: Enter OTP and new password
 */
export default function ForgotPasswordScreen({ onNavigate }) {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async () => {
    if (!mobile.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    // Validate mobile format - must be exactly 10 digits
    if (!/^[0-9]{10}$/.test(mobile.trim())) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword(mobile.trim());
      
      // OTP is sent via SMS, not displayed in app
      Alert.alert(
        'OTP Sent',
        'OTP has been sent to your mobile number. Please check your SMS.',
        [{ text: 'OK', onPress: () => setStep(2) }]
      );
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (otp.trim().length !== 4) {
      Alert.alert('Error', 'OTP must be 4 digits');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(mobile.trim(), otp.trim(), newPassword);
      
      Alert.alert(
        'Success',
        'Password reset successful! Please login with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and go back to login
              setStep(1);
              setMobile('');
              setOtp('');
              setNewPassword('');
              setConfirmPassword('');
              onNavigate('Login');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      onNavigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dairy Farm Management</Text>
        <Text style={styles.headerSubtitle}>Forgot Password</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>
          {step === 1 ? 'Request OTP' : 'Reset Password'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 1
            ? 'Enter your mobile number to receive OTP'
            : 'Enter the OTP sent to your mobile and set a new password'}
        </Text>

        {step === 1 ? (
          <>
            <Input
              placeholder="Mobile Number (10 digits)"
              autoCapitalize="none"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={setMobile}
              style={styles.input}
            />
            <Button
              title={loading ? 'Sending OTP...' : 'Send OTP'}
              onPress={handleRequestOTP}
              disabled={loading}
            />
          </>
        ) : (
          <>
            <Input
              placeholder="Mobile Number"
              autoCapitalize="none"
              keyboardType="phone-pad"
              value={mobile}
              editable={false}
              style={[styles.input, styles.disabledInput]}
            />
            <Input
              placeholder="Enter 4-digit OTP"
              keyboardType="number-pad"
              maxLength={4}
              value={otp}
              onChangeText={setOtp}
              style={styles.input}
            />
            <Input
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
            />
            <Input
              placeholder="Confirm New Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />
            <Button
              title={loading ? 'Resetting Password...' : 'Reset Password'}
              onPress={handleResetPassword}
              disabled={loading}
            />
          </>
        )}

        <View style={styles.footer}>
          <TouchableOpacity onPress={goBack}>
            <Text style={styles.backLink}>
              {step === 1 ? '← Back to Login' : '← Back'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E8F5E9',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
  },
  disabledInput: {
    backgroundColor: '#e0e0e0',
    opacity: 0.7,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  backLink: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
});

