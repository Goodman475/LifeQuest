import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import {useTheme} from '../../services/theme';

export default function Quests() {
    const { colors } = useTheme();

  return (
    <View className="flex-1 px-6 pt-16">
        <Text className="text-3xl text-center font-bold mb-4">Welcome to Quests!</Text>   
    </View>
  );
}