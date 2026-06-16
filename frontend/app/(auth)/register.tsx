import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../services/api';

export default function Register() {
  const [username, setUsername] = useState('');
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

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', { username, email, password });
      Alert.alert('Success', 'Registration successful! Please log in.');
      router.push('/login');
    } catch {
      Alert.alert('Error', 'Registration failed. Please try again.');
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
        placeholder="Username"
        placeholderTextColor={c.placeholder}
        value={username}
        onChangeText={setUsername}
        style={{
          width: '100%', borderWidth: 1, borderColor: c.inputBorder,
          backgroundColor: c.input, borderRadius: 10, paddingHorizontal: 16,
          paddingVertical: 12, marginBottom: 12, color: c.textPrimary, fontSize: 15,
        }}
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
        onPress={handleRegister}
        disabled={loading}
        style={{
          width: '100%', backgroundColor: c.btnBg, borderRadius: 10,
          paddingVertical: 14, alignItems: 'center',
        }}
      >
        {loading
          ? <ActivityIndicator color={c.btnText} />
          : <Text style={{ color: c.btnText, fontWeight: '700', fontSize: 15 }}>Register</Text>
        }
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <Text style={{ color: c.textMuted }}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={{ color: c.linkText, fontWeight: '600' }}>Login</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}