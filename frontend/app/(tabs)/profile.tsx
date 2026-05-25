import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {useTheme} from '../../services/theme';

export default function Profile() {
    const { colors } = useTheme();

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    onPress: () => {},
                    style: "cancel",
                },
                {
                    text: "Logout",
                    onPress: () => {
                        router.replace("/(auth)/login");
                    },
                    style: "destructive",
                },
            ]
        );
    };

  return (
    <ScrollView 
      style={{ backgroundColor: colors.background || "#000" }}
      className="flex-1 px-6 pt-16"
    >
      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        style={{ backgroundColor: colors.error || "#EF4444" }}
        className="flex-row items-center justify-center p-4 rounded-lg mt-8"
      >
        <MaterialCommunityIcons 
          name="logout" 
          size={20} 
          color="#FFF"
          style={{ marginRight: 8 }}
        />
        <Text className="text-white font-bold text-base">
          Logout
        </Text>
      </TouchableOpacity>

      <View className="h-8" />
    </ScrollView>
  );
}