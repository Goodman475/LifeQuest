import {View, Image, ActivityIndicator} from 'react-native';
import {useEffect} from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const checkOnboardingStatus = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem('onboarding_completed');
    return value === 'true';
  } catch (error) {
    console.warn('AsyncStorage not available in development, showing onboarding', error);
    return false;
  }
};

export default function Landing() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    
    const initNavigation = async () => {
      try {
        const hasSeenOnboarding = await checkOnboardingStatus();
        const destination = hasSeenOnboarding ? '/(auth)/login' : '/onboarding';
        
        timer = setTimeout(() => {
          router.replace(destination);
        }, 2000);
      } catch (error) {
        console.error('Navigation error:', error);
        timer = setTimeout(() => {
          router.replace('/onboarding');
        }, 2000);
      }
    };

    initNavigation();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-black px-4">
      <Image
        source={require('../assets/logo.jpg')}
        className="w-60 h-60 mb-8 rounded-2xl"
        resizeMode="contain"
      />
    </View>
  );
}