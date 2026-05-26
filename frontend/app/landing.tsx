import {View, Image, ActivityIndicator} from 'react-native';
import {useEffect} from 'react';
import { router } from 'expo-router';

export default function Landing() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white px-4">
      <Image
        source={require('../assets/logo.jpg')}
        className="w-60 h-60 mb-8 rounded-2xl"
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}