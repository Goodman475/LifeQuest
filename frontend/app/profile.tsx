import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, Alert, ScrollView,
  ActivityIndicator, TextInput, Modal, RefreshControl,
  Image,
} from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useHomeData } from "../hooks/useHomeData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";
import { useTheme } from "../services/theme";

function getRank(level: number) {
  if (level >= 60) return "WIZARD";
  if (level >= 50) return "LEGEND";
  if (level >= 40) return "CHAMPION";
  if (level >= 30) return "ELITE";
  if (level >= 20) return "APPRENTICE";
  if (level >= 10) return "NOVICE";
  if (level >= 5) return "BEGINNER";
  return "NOOB";
}

// Predefined avatar options (simplified)
const AVATAR_OPTIONS = [
  { id: "default", icon: "person", color: "#6b7280" },
  { id: "warrior", icon: "sword", color: "#ef4444" },
  { id: "mage", icon: "wand", color: "#8b5cf6" },
  { id: "rogue", icon: "knife", color: "#f59e0b" },
  { id: "archer", icon: "bow-arrow", color: "#10b981" },
  { id: "paladin", icon: "shield", color: "#3b82f6" },
];

const AVATAR_COLORS = [
  "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6b7280", "#22c55e",
];

export default function Profile() {
  const { data, loading, error, refresh } = useHomeData();
  const { isDark, toggleTheme } = useTheme();
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("default");
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);

  // Theme classes
  const bgClass = isDark ? "bg-zinc-950" : "bg-gray-50";
  const cardClass = isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100";
  const textPrimaryClass = isDark ? "text-zinc-100" : "text-gray-900";
  const textMutedClass = isDark ? "text-zinc-500" : "text-gray-400";
  const textLabelClass = isDark ? "text-zinc-600" : "text-gray-400";
  const inputClass = isDark ? "bg-zinc-950 border-zinc-800 text-zinc-100" : "bg-gray-50 border-gray-200 text-gray-900";
  const menuItemClass = isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100";
  const menuItemSubtleClass = isDark ? "bg-zinc-950 border-zinc-800" : "bg-gray-50 border-gray-100";
  const iconBorderClass = isDark ? "border-zinc-700" : "border-gray-200";
  const iconBgClass = isDark ? "bg-zinc-800" : "bg-gray-100";
  const xpBarClass = isDark ? "bg-zinc-800" : "bg-gray-100";
  const versionClass = isDark ? "text-zinc-800" : "text-gray-300";

  // Load saved avatar preference
  React.useEffect(() => {
    const loadAvatar = async () => {
      try {
        const saved = await AsyncStorage.getItem("avatar");
        if (saved) setSelectedAvatar(saved);
        const savedColor = await AsyncStorage.getItem("avatar_color");
        if (savedColor) setAvatarColor(savedColor);
      } catch (error) {
        console.error("Error loading avatar:", error);
      }
    };
    loadAvatar();
  }, []);

  const handleSelectAvatar = async (avatarId: string, color: string) => {
    setSelectedAvatar(avatarId);
    setAvatarColor(color);
    await AsyncStorage.setItem("avatar", avatarId);
    await AsyncStorage.setItem("avatar_color", color);
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (userId) {
        await api.patch(`/users/${userId}/avatar`, { avatar: avatarId, color: color });
      }
    } catch (error) {
      console.error("Error saving avatar:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["token", "user_id"]);
          router.replace("/landing");
        },
      },
    ]);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert("Empty feedback", "Please write something before submitting.");
      return;
    }
    if (feedbackRating === 0) {
      Alert.alert("No rating", "Please select a star rating.");
      return;
    }
    try {
      setSubmittingFeedback(true);
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) throw new Error("Not logged in");
      await api.post("/feedback/", {
        user_id: Number(userId),
        rating: feedbackRating,
        message: feedbackText.trim(),
      });
      setFeedbackText("");
      setFeedbackRating(0);
      setFeedbackVisible(false);
      Alert.alert("Thanks!", "Your feedback has been submitted.");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail || "Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <View className={`flex-1 ${bgClass} items-center justify-center`}>
        <ActivityIndicator color={isDark ? "#ffffff" : "#16a34a"} size="large" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className={`flex-1 ${bgClass} items-center justify-center px-6`}>
        <MaterialCommunityIcons name="alert-circle-outline" size={44} color="#f87171" />
        <Text className={`mb-3 text-center mt-3 ${textMutedClass}`}>
          {error || "Unable to load profile."}
        </Text>
        <TouchableOpacity onPress={refresh} className="px-6 py-3 rounded-2xl bg-green-600">
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const xpPercent = data.character.xp_max > 0
    ? Math.min((data.character.xp_current / data.character.xp_max) * 100, 100)
    : 0;

  const rank = getRank(data.character.level);
  const currentAvatar = AVATAR_OPTIONS.find(a => a.id === selectedAvatar) || AVATAR_OPTIONS[0];

  return (
    <>
      <ScrollView
        className={`flex-1 ${bgClass}`}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={isDark ? "#ffffff" : "#16a34a"}
          />
        }
      >
        {/* HEADER CARD */}
        <View
          className={`mx-4 mt-20 rounded-3xl px-5 pt-6 pb-6 border ${cardClass}`}
          style={{
            shadowColor: "#000",
            shadowOpacity: isDark ? 0.5 : 0.06,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 6 },
            elevation: 5,
          }}
        >
          <View className="items-center mb-4">
            {/* Profile Avatar */}
            <View className="relative">
              <View 
                className={`w-20 h-20 rounded-full border items-center justify-center ${iconBorderClass}`}
              >
                <Ionicons name="person" size={30} color={isDark ? "#fff" : "#374151"} />
              </View>
            </View>

            <Text className={`text-xl font-extrabold ${textPrimaryClass}`}>
              {data.user_name}
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              <View className={`${iconBgClass} border ${iconBorderClass} px-2.5 py-0.5 rounded-full`}>
                <Text className={`text-xs font-bold ${textMutedClass}`}>{rank}</Text>
              </View>
              <Text className={`text-xs font-semibold ${textMutedClass}`}>
                Level {data.character.level}
              </Text>
            </View>
          </View>

          {/* XP BAR */}
          <View>
            <View className="flex-row justify-between mb-1.5">
              <Text className={`text-xs font-bold tracking-widest uppercase ${textLabelClass}`}>XP</Text>
              <Text className={`text-xs font-extrabold ${textPrimaryClass}`}>
                {data.character.xp_current} / {data.character.xp_max}
              </Text>
            </View>
            <View className={`h-1.5 rounded-full overflow-hidden ${xpBarClass}`}>
              <View className="h-full rounded-full" style={{ width: `${xpPercent}%`, backgroundColor: isDark ? "#ffffff" : "#000000" }} />
            </View>
            <Text className={`text-xs mt-1.5 text-right ${textLabelClass}`}>
              {data.character.xp_max - data.character.xp_current} XP to next level
            </Text>
          </View>
        </View>

        <View className="px-4 pt-5 gap-4">
          {/* STATS */}
          <Text className={`text-xs font-bold tracking-widest uppercase ${textLabelClass}`}>
            Character Stats
          </Text>
          <View className="flex-row gap-3">
            <StatCard icon="fire" value={String(data.stats.streak)} label="Streak" color="#f97316" isDark={isDark} />
            <StatCard icon="check-circle" value={String(data.stats.completed)} label="Completed" color="#4ade80" isDark={isDark} />
            <TouchableOpacity
              onPress={() => router.push("/leaderboard")}
              activeOpacity={0.75}
              className={`rounded-2xl flex-1 p-4 items-center border ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100"}`}
            >
              <MaterialCommunityIcons name="trophy" size={24} color="#facc15" />
              <Text className={`text-lg font-extrabold mt-2 ${isDark ? "text-zinc-100" : "text-gray-900"}`}>
                #{data.stats.rank}
              </Text>
              <Text className={`text-xs ${isDark ? "text-zinc-600" : "text-gray-400"}`}>Rank</Text>
            </TouchableOpacity>
          </View>

          {/* ACHIEVEMENTS */}
          <TouchableOpacity
            onPress={() => router.push("/achievements")}
            activeOpacity={0.7}
            className={`flex-row items-center p-4 rounded-2xl border ${menuItemClass}`}
          >
            <View className={`w-10 h-10 rounded-full items-center justify-center ${iconBgClass}`}>
              <MaterialCommunityIcons name="trophy-award" size={20} color={isDark ? "#ffffff" : "#000000"} />
            </View>
            <View className="flex-1 ml-3">
              <Text className={`font-semibold text-base ${textPrimaryClass}`}>Achievements</Text>
              <Text className={`text-xs ${textMutedClass}`}>View all your achievements</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={isDark ? "#3f3f46" : "#d1d5db"} />
          </TouchableOpacity>

          {/* ACCOUNT */}
          <Text className={`text-xs font-bold tracking-widest uppercase ${textLabelClass} mt-4`}>
            Account
          </Text>

          <TouchableOpacity
            onPress={toggleTheme}
            activeOpacity={0.7}
            className={`flex-row items-center p-4 rounded-2xl border ${menuItemClass}`}
          >
            <MaterialCommunityIcons
              name={isDark ? "weather-sunny" : "weather-night"}
              size={22}
              color={isDark ? "#ffffff" : "#000000"}
            />
            <Text className={`flex-1 ml-3 font-semibold text-base ${textPrimaryClass}`}>
              {isDark ? "Light Mode" : "Dark Mode"}
            </Text>
            <View className={`w-12 h-6 rounded-full flex-row items-center px-1 ${isDark ? "bg-zinc-700 justify-end" : "bg-gray-200 justify-start"}`}>
              <View className={`w-4 h-4 rounded-full ${isDark ? "bg-white" : "bg-white shadow"}`} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFeedbackVisible(true)}
            activeOpacity={0.7}
            className={`flex-row items-center p-4 rounded-2xl border ${menuItemClass}`}
          >
            <MaterialCommunityIcons name="message-text-outline" size={22} color="#71717a" />
            <Text className={`flex-1 ml-3 font-semibold text-base ${textPrimaryClass}`}>Send Feedback</Text>
            <Ionicons name="chevron-forward" size={16} color={isDark ? "#3f3f46" : "#d1d5db"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            className={`flex-row items-center p-4 rounded-2xl border ${menuItemClass}`}
          >
            <MaterialCommunityIcons name="logout" size={22} color="#ef4444" />
            <Text className="flex-1 ml-3 font-semibold text-base text-red-400">Logout</Text>
            <Ionicons name="chevron-forward" size={16} color={isDark ? "#3f3f46" : "#d1d5db"} />
          </TouchableOpacity>

          <View className="items-center mt-6">
            <Text className={`text-xs ${versionClass}`}>LifeQuest v1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      {/* FEEDBACK MODAL */}
      <Modal
        visible={feedbackVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFeedbackVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className={`rounded-t-3xl px-6 pt-6 pb-10 border-t ${cardClass}`}>
            <View className={`w-10 h-1 rounded-full self-center mb-5 ${isDark ? "bg-zinc-700" : "bg-gray-200"}`} />
            <Text className={`text-xl font-extrabold mb-1 ${textPrimaryClass}`}>Share Feedback</Text>
            <Text className={`text-sm mb-6 ${textMutedClass}`}>Help us make LifeQuest better for you.</Text>

            <Text className={`text-xs font-bold tracking-widest uppercase mb-3 ${textLabelClass}`}>Rating</Text>
            <View className="flex-row gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setFeedbackRating(star)} activeOpacity={0.7}>
                  <MaterialCommunityIcons
                    name={star <= feedbackRating ? "star" : "star-outline"}
                    size={36}
                    color={star <= feedbackRating ? "#f59e0b" : (isDark ? "#3f3f46" : "#d1d5db")}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text className={`text-xs font-bold tracking-widest uppercase mb-2 ${textLabelClass}`}>Message</Text>
            <TextInput
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="What's on your mind?"
              placeholderTextColor={isDark ? "#3f3f46" : "#9ca3af"}
              multiline
              numberOfLines={4}
              className={`border rounded-2xl px-4 py-3 text-sm h-28 mb-5 ${inputClass}`}
              style={{ textAlignVertical: "top" }}
            />

            <TouchableOpacity
              onPress={handleSubmitFeedback}
              disabled={submittingFeedback}
              className={`rounded-2xl py-4 items-center mb-3 ${
                submittingFeedback
                  ? isDark ? "bg-zinc-800" : "bg-gray-100"
                  : isDark ? "bg-white" : "bg-gray-900"
              }`}
            >
              <Text className={`font-bold text-base ${
                submittingFeedback
                  ? isDark ? "text-zinc-600" : "text-gray-400"
                  : isDark ? "text-black" : "text-white"
              }`}>
                {submittingFeedback ? "Submitting..." : "Submit Feedback"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setFeedbackVisible(false)} className="py-3 items-center">
              <Text className={`font-semibold ${isDark ? "text-zinc-600" : "text-gray-400"}`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function StatCard({ icon, value, label, color, isDark }: {
  icon: any;
  value: string;
  label: string;
  color: string;
  isDark: boolean;
}) {
  return (
    <View className={`rounded-2xl flex-1 p-4 items-center border ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100"}`}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text className={`text-lg font-extrabold mt-2 ${isDark ? "text-zinc-100" : "text-gray-900"}`}>{value}</Text>
      <Text className={`text-xs ${isDark ? "text-zinc-600" : "text-gray-400"}`}>{label}</Text>
    </View>
  );
}