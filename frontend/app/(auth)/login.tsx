import {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image} from 'react-native';
import {router} from 'expo-router';
import {api} from '../../services/api';


export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
          await api.post('/auth/login', {email, password});
            Alert.alert('Success', 'Login successful!');
            router.push('/home');
        } catch (error) {
            Alert.alert('Error', 'Login failed. Please check your credentials and try again.');
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
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
      />
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className="w-full bg-black rounded-lg py-3 items-center p-0"
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white font-bold">Login</Text>
        )}
      </TouchableOpacity>
             <View className="flex-row mt-4">
        <Text className="text-gray-700">
            Don't have an account?{' '}
        </Text>

        <TouchableOpacity onPress={() => router.push('/register')}>
            <Text className="text-blue-500 font-semibold">
            Register
            </Text>
        </TouchableOpacity>
        </View>
       {/* <View className="flex-row mt-4">
         <Text className="text-gray-500">Forgot your password?</Text>
         <TouchableOpacity onPress={() => Alert.alert('Feature not implemented')}>
           <Text className="text-blue-500 ml-1">Reset it</Text>
         </TouchableOpacity>
       </View> */}
    </View>
  );
}