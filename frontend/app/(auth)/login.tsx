import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from '../../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dark = useColorScheme() === 'dark';

  const c = {
    bg:          dark ? '#09090b' : '#ffffff',
    input:       dark ? '#18181b' : '#ffffff',
    inputBorder: dark ? '#3f3f46' : '#d1d5db',
    textPrimary: dark ? '#f4f4f5' : '#111827',
    textMuted:   dark ? '#71717a' : '#6b7280',
    placeholder: dark ? '#52525b' : '#9ca3af',
    btnBg:       dark ? '#4ade80' : '#000000',
    btnText:     dark ? '#000000' : '#ffffff',
    linkText:    dark ? '#4ade80' : '#3b82f6',
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user_id } = response.data;
      await AsyncStorage.setItem('token', access_token);
      await AsyncStorage.setItem('user_id', String(user_id));
      setAuthToken(access_token);
      router.replace('/home');
    } catch {
      Alert.alert('Error', 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg, paddingHorizontal: 16 }}>

      <Image
        source={require('../../assets/logo.jpg')}
        style={{ width: 240, height: 240, marginBottom: 16, borderRadius: 16 }}
        resizeMode="contain"
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor={c.placeholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{
          width: '100%', borderWidth: 1, borderColor: c.inputBorder,
          backgroundColor: c.input, borderRadius: 10, paddingHorizontal: 16,
          paddingVertical: 12, marginBottom: 12, color: c.textPrimary, fontSize: 15,
        }}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={c.placeholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          width: '100%', borderWidth: 1, borderColor: c.inputBorder,
          backgroundColor: c.input, borderRadius: 10, paddingHorizontal: 16,
          paddingVertical: 12, marginBottom: 16, color: c.textPrimary, fontSize: 15,
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          width: '100%', backgroundColor: c.btnBg, borderRadius: 10,
          paddingVertical: 14, alignItems: 'center',
        }}
      >
        {loading
          ? <ActivityIndicator color={c.btnText} />
          : <Text style={{ color: c.btnText, fontWeight: '700', fontSize: 15 }}>Login</Text>
        }
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <Text style={{ color: c.textMuted }}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={{ color: c.linkText, fontWeight: '600' }}>Register</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}