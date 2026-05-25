import {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image} from 'react-native';
import {router} from 'expo-router';
import {api} from '../../services/api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {username, email, password});
      Alert.alert('Success', 'Registration successful! Please log in.');
      router.push('/login');
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
    };
    
  return (
    <View className="flex-1 items-center justify-center bg-white px-4">
      <Image
        source={require('../../assets/logo.jpg')}
        className="w-60 h-60 mb-4 rounded-2xl"
        resizeMode="contain"
        />
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
      />
      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading}
        className="w-full bg-black rounded-lg py-3 items-center"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold">Register</Text>
        )}
      </TouchableOpacity>
       <View className="flex-row mt-4">
        <Text className="text-gray-700">
            Already have an account?{' '}
        </Text>

        <TouchableOpacity onPress={() => router.push('/login')}>
            <Text className="text-blue-500 font-semibold">
            Login
            </Text>
        </TouchableOpacity>
        </View>
    </View>
  );
}