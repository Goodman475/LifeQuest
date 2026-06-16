import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useHomeData } from "../hooks/useHomeData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";

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

export default function Profile() {
  const { data, loading, error, refresh } = useHomeData();
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

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

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Are you sure?",
              "Your level, quests, and progress will be lost forever.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, delete my account",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      const userId = await AsyncStorage.getItem("user_id");
                      if (!userId) throw new Error("Not logged in");
                      await api.delete(`/auth/delete/${userId}`);
                      await AsyncStorage.multiRemove(["token", "user_id"]);
                      router.replace("/landing");
                    } catch (e: any) {
                      Alert.alert("Error", e?.response?.data?.detail || "Failed to delete account.");
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
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
      Alert.alert("Error", e?.response?.data?.detail || "Failed to submit feedback. Try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator color="#ffffff" size="large" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center px-6">
        <MaterialCommunityIcons name="alert-circle-outline" size={44} color="#f87171" />
        <Text className="text-zinc-400 mb-3 text-center mt-3">
          {error || "Unable to load profile."}
        </Text>
        <TouchableOpacity onPress={refresh} className="px-6 py-3 rounded-2xl bg-white">
          <Text className="text-black font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const xpPercent =
    data.character.xp_max > 0
      ? Math.min((data.character.xp_current / data.character.xp_max) * 100, 100)
      : 0;

  const rank = getRank(data.character.level);

  return (
    <>
      <ScrollView
        className="flex-1 bg-zinc-950"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#ffffff" />
        }
      >
        {/* HEADER */}
        <View
          className="bg-zinc-900 mx-4 mt-20 rounded-3xl px-5 pt-6 pb-6 border border-zinc-800"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.5,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 6 },
            elevation: 5,
          }}
        >
          {/* AVATAR */}
          <View className="items-center mb-4">
            <View className="w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700 items-center justify-center mb-3">
              <Ionicons name="person" size={38} color="#fff" />
            </View>
            <Text className="text-xl font-extrabold text-zinc-100">
              {data.user_name}
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              <View className="bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 rounded-full">
                <Text className="text-xs font-bold text-zinc-400">
                  {rank}
                </Text>
              </View>
              <Text className="text-xs text-zinc-600">•</Text>
              <Text className="text-xs text-zinc-500 font-semibold">
                Level {data.character.level}
              </Text>
            </View>
          </View>

          {/* XP BAR */}
          <View>
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs font-bold text-zinc-600 tracking-widest uppercase">
                XP
              </Text>
              <Text className="text-xs font-extrabold text-zinc-100">
                {data.character.xp_current} / {data.character.xp_max}
              </Text>
            </View>
            <View className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full bg-white"
                style={{ width: `${xpPercent}%` }}
              />
            </View>
            <Text className="text-xs text-zinc-700 mt-1.5 text-right">
              {data.character.xp_max - data.character.xp_current} XP to next level
            </Text>
          </View>
        </View>

        <View className="px-4 pt-5 gap-4">

          {/* STATS */}
          <Text className="text-xs font-bold tracking-widest uppercase text-zinc-600">
            Character Stats
          </Text>

          <View className="flex-row gap-3">
            <StatCard
              icon="fire"
              value={String(data.stats.streak)}
              label="Streak"
              color="#f97316"
            />
            <StatCard
              icon="check-circle"
              value={String(data.stats.completed)}
              label="Completed"
              color="#4ade80"
            />
            <StatCard
              icon="trophy"
              value={`#${data.stats.rank}`}
              label="Rank"
              color="#facc15"
            />
          </View>

          {/* ACCOUNT */}
          <Text className="text-xs font-bold tracking-widest uppercase text-zinc-600 mt-2">
            Account
          </Text>

          <MenuItem
            icon="message-text-outline"
            label="Send Feedback"
            onPress={() => setFeedbackVisible(true)}
            labelClass="text-zinc-100"
            iconColor="#71717a"
          />
          <MenuItem
            icon="logout"
            label="Logout"
            onPress={handleLogout}
            labelClass="text-red-400"
            iconColor="#ef4444"
          />
          <MenuItem
            icon="delete-outline"
            label="Delete Account"
            onPress={handleDeleteAccount}
            labelClass="text-red-500"
            iconColor="#f87171"
            subtle
          />

          <View className="items-center mt-6">
            <Text className="text-zinc-800 text-xs">LifeQuest v1.0.0</Text>
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
          <View className="bg-zinc-900 rounded-t-3xl px-6 pt-6 pb-10 border-t border-zinc-800">

            {/* HANDLE */}
            <View className="w-10 h-1 bg-zinc-700 rounded-full self-center mb-5" />

            <Text className="text-xl font-extrabold text-zinc-100 mb-1">
              Share Feedback
            </Text>
            <Text className="text-sm text-zinc-500 mb-6">
              Help us make LifeQuest better for you.
            </Text>

            {/* STAR RATING */}
            <Text className="text-xs font-bold tracking-widest uppercase text-zinc-600 mb-3">
              Rating
            </Text>
            <View className="flex-row gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setFeedbackRating(star)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={star <= feedbackRating ? "star" : "star-outline"}
                    size={36}
                    color={star <= feedbackRating ? "#f59e0b" : "#3f3f46"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* MESSAGE */}
            <Text className="text-xs font-bold tracking-widest uppercase text-zinc-600 mb-2">
              Message
            </Text>
            <TextInput
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="What's on your mind?"
              placeholderTextColor="#3f3f46"
              multiline
              numberOfLines={4}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-zinc-100 text-sm h-28 mb-5"
              style={{ textAlignVertical: "top" }}
            />

            {/* SUBMIT */}
            <TouchableOpacity
              onPress={handleSubmitFeedback}
              disabled={submittingFeedback}
              className={`rounded-2xl py-4 items-center mb-3 ${
                submittingFeedback ? "bg-zinc-800" : "bg-white"
              }`}
            >
              <Text className={`font-bold text-base ${
                submittingFeedback ? "text-zinc-600" : "text-black"
              }`}>
                {submittingFeedback ? "Submitting..." : "Submit Feedback"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFeedbackVisible(false)}
              className="py-3 items-center"
            >
              <Text className="text-zinc-600 font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: any;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View className="bg-zinc-900 rounded-2xl flex-1 p-4 items-center border border-zinc-800">
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text className="text-lg font-extrabold text-zinc-100 mt-2">{value}</Text>
      <Text className="text-xs text-zinc-600">{label}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  labelClass,
  iconColor,
  subtle,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  labelClass: string;
  iconColor: string;
  subtle?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center p-4 rounded-2xl border border-zinc-800 ${
        subtle ? "bg-zinc-950" : "bg-zinc-900"
      }`}
    >
      <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      <Text className={`flex-1 ml-3 font-semibold text-base ${labelClass}`}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color="#3f3f46" />
    </TouchableOpacity>
  );
}