import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useHomeData } from "../hooks/useHomeData";
import { useTheme } from "../services/theme";

type Achievement = {
  id: string;
  icon: string;
  label: string;
  description: string;
  unlocked: boolean;
  color: string;
  category: "quests" | "streak" | "level" | "special" | "social" | "challenge";
};

function getAchievements(level: number, completed: number, streak: number): Achievement[] {
  return [
    // ==================== QUEST ACHIEVEMENTS ====================
    {
      id: "quest_1",
      icon: "sword",
      label: "First Blood",
      description: "Complete your first quest",
      unlocked: completed >= 1,
      color: "#4ade80",
      category: "quests",
    },
    {
      id: "quest_5",
      icon: "sword-cross",
      label: "Novice Adventurer",
      description: "Complete 5 quests",
      unlocked: completed >= 5,
      color: "#22c55e",
      category: "quests",
    },
    {
      id: "quest_10",
      icon: "shield",
      label: "Warrior",
      description: "Complete 10 quests",
      unlocked: completed >= 10,
      color: "#16a34a",
      category: "quests",
    },
    {
      id: "quest_25",
      icon: "shield-star",
      label: "Veteran",
      description: "Complete 25 quests",
      unlocked: completed >= 25,
      color: "#15803d",
      category: "quests",
    },
    {
      id: "quest_50",
      icon: "trophy",
      label: "Legendary Hero",
      description: "Complete 50 quests",
      unlocked: completed >= 50,
      color: "#facc15",
      category: "quests",
    },
    {
      id: "quest_100",
      icon: "crown",
      label: "Immortal",
      description: "Complete 100 quests",
      unlocked: completed >= 100,
      color: "#ef4444",
      category: "quests",
    },
    {
      id: "quest_200",
      icon: "crown-circle",
      label: "Godlike",
      description: "Complete 200 quests",
      unlocked: completed >= 200,
      color: "#8b5cf6",
      category: "quests",
    },

    // ==================== STREAK ACHIEVEMENTS ====================
    {
      id: "streak_3",
      icon: "fire",
      label: "On Fire",
      description: "3 day streak",
      unlocked: streak >= 3,
      color: "#f97316",
      category: "streak",
    },
    {
      id: "streak_7",
      icon: "fire",
      label: "Blazing",
      description: "7 day streak",
      unlocked: streak >= 7,
      color: "#ef4444",
      category: "streak",
    },
    {
      id: "streak_14",
      icon: "fire",
      label: "Wildfire",
      description: "14 day streak",
      unlocked: streak >= 14,
      color: "#dc2626",
      category: "streak",
    },
    {
      id: "streak_30",
      icon: "fire",
      label: "Unstoppable",
      description: "30 day streak",
      unlocked: streak >= 30,
      color: "#b91c1c",
      category: "streak",
    },
    {
      id: "streak_60",
      icon: "fire",
      label: "Eternal Flame",
      description: "60 day streak",
      unlocked: streak >= 60,
      color: "#7f1d1d",
      category: "streak",
    },

    // ==================== LEVEL ACHIEVEMENTS ====================
    {
      id: "level_5",
      icon: "star",
      label: "Rising Star",
      description: "Reach level 5",
      unlocked: level >= 5,
      color: "#a78bfa",
      category: "level",
    },
    {
      id: "level_10",
      icon: "star-circle",
      label: "Adept",
      description: "Reach level 10",
      unlocked: level >= 10,
      color: "#7c3aed",
      category: "level",
    },
    {
      id: "level_20",
      icon: "star-shooting",
      label: "Expert",
      description: "Reach level 20",
      unlocked: level >= 20,
      color: "#5b21b6",
      category: "level",
    },
    {
      id: "level_30",
      icon: "crown",
      label: "Grandmaster",
      description: "Reach level 30",
      unlocked: level >= 30,
      color: "#facc15",
      category: "level",
    },
    {
      id: "level_50",
      icon: "crown-circle",
      label: "Legendary",
      description: "Reach level 50",
      unlocked: level >= 50,
      color: "#ef4444",
      category: "level",
    },
    {
      id: "level_75",
      icon: "crown-circle",
      label: "Transcendent",
      description: "Reach level 75",
      unlocked: level >= 75,
      color: "#8b5cf6",
      category: "level",
    },
    {
      id: "level_100",
      icon: "crown-circle",
      label: "Ascended",
      description: "Reach level 100",
      unlocked: level >= 100,
      color: "#f472b6",
      category: "level",
    },

    // ==================== SPECIAL ACHIEVEMENTS ====================
    {
      id: "special_daily",
      icon: "calendar-star",
      label: "Daily Dedication",
      description: "Complete quests 7 days in a row",
      unlocked: streak >= 7,
      color: "#06b6d4",
      category: "special",
    },
    {
      id: "special_perfect",
      icon: "check-all",
      label: "Perfect Week",
      description: "Quest every day for a week",
      unlocked: streak >= 7,
      color: "#22c55e",
      category: "special",
    },
    {
      id: "special_collector",
      icon: "badge-account",
      label: "Collector",
      description: "Unlock 10 achievements",
      unlocked: false,
      color: "#14b8a6",
      category: "special",
    },
    {
      id: "special_master_collector",
      icon: "badge-account-horizontal",
      label: "Master Collector",
      description: "Unlock 25 achievements",
      unlocked: false,
      color: "#8b5cf6",
      category: "special",
    },
    {
      id: "special_legend",
      icon: "account-star",
      label: "Living Legend",
      description: "Level 50 + 100 quests",
      unlocked: level >= 50 && completed >= 100,
      color: "#ef4444",
      category: "special",
    },
    {
      id: "special_immortal",
      icon: "account-crown",
      label: "Immortal",
      description: "Level 75 + 200 quests",
      unlocked: level >= 75 && completed >= 200,
      color: "#8b5cf6",
      category: "special",
    },

    // // ==================== SOCIAL ACHIEVEMENTS ====================
    // {
    //   id: "social_share",
    //   icon: "share-variant",
    //   label: "Share Bear",
    //   description: "Share your first achievement",
    //   unlocked: false,
    //   color: "#ec4899",
    //   category: "social",
    // },
    // {
    //   id: "social_invite",
    //   icon: "account-plus",
    //   label: "Recruiter",
    //   description: "Invite a friend to join",
    //   unlocked: false,
    //   color: "#3b82f6",
    //   category: "social",
    // },
    // {
    //   id: "social_group",
    //   icon: "account-group",
    //   label: "Social Butterfly",
    //   description: "Complete a quest with a friend",
    //   unlocked: false,
    //   color: "#8b5cf6",
    //   category: "social",
    // },

    // ==================== CHALLENGE ACHIEVEMENTS ====================
    {
      id: "challenge_first",
      icon: "flag",
      label: "First Challenge",
      description: "Complete your first challenge",
      unlocked: false,
      color: "#f97316",
      category: "challenge",
    },
    {
      id: "challenge_5",
      icon: "flag-checkered",
      label: "Challenger",
      description: "Complete 5 challenges",
      unlocked: false,
      color: "#f59e0b",
      category: "challenge",
    },
    {
      id: "challenge_10",
      icon: "trophy",
      label: "Challenge Master",
      description: "Complete 10 challenges",
      unlocked: false,
      color: "#facc15",
      category: "challenge",
    },
  ];
}

export default function Achievements() {
  const { data, loading, error, refresh } = useHomeData();
  const { isDark } = useTheme();

  // Theme classes
  const bgClass = isDark ? "bg-zinc-950" : "bg-gray-50";
  const cardClass = isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100";
  const textPrimaryClass = isDark ? "text-zinc-100" : "text-gray-900";
  const textMutedClass = isDark ? "text-zinc-500" : "text-gray-400";
  const textLabelClass = isDark ? "text-zinc-600" : "text-gray-400";
  const iconBgClass = isDark ? "bg-zinc-800" : "bg-gray-100";
  const iconBorderClass = isDark ? "border-zinc-700" : "border-gray-200";

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
          {error || "Unable to load achievements."}
        </Text>
        <TouchableOpacity onPress={refresh} className="px-6 py-3 rounded-2xl bg-green-600">
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const achievements = getAchievements(
    data.character.level,
    data.stats.completed,
    data.stats.streak,
  );
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) acc[achievement.category] = [];
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const categoryLabels: Record<string, string> = {
    quests: "Quest Mastery",
    streak: "Streak Champion",
    level: "Level Progression",
    special: "Special Achievements",
    // social: "Social Achievements",
    challenge: "Challenge Mastery",
  };

  const categoryIcons: Record<string, string> = {
    quests: "sword-cross",
    streak: "fire",
    level: "star-circle",
    special: "trophy-award",
    social: "account-group",
    challenge: "flag-checkered",
  };

  return (
    <View className={`flex-1 ${bgClass}`}>
      {/* HEADER */}
      <View
        className={`${cardClass} pt-16 pb-4 px-5 border-b`}
        style={{ borderBottomColor: isDark ? "#1f1f1f" : "#f3f4f6" }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-xl items-center justify-center mb-4"
          style={{ backgroundColor: isDark ? "#1f1f1f" : "#f3f4f6" }}
        >
          <Ionicons name="arrow-back" size={18} color={isDark ? "#f4f4f5" : "#111827"} />
        </TouchableOpacity>

        <Text className={`text-[11px] font-bold tracking-[2px] uppercase ${textLabelClass} mb-1`}>
          Progress
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className={`text-2xl font-extrabold ${textPrimaryClass}`}>
            Achievements
          </Text>
          <Text className={`text-sm font-bold ${textMutedClass}`}>
            {unlockedCount} / {achievements.length}
          </Text>
        </View>
        <Text className={`text-sm ${textMutedClass} mt-1`}>
          Track your progress and unlock rewards
        </Text>
      </View>

      <ScrollView
        className={`flex-1 ${bgClass}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={isDark ? "#ffffff" : "#16a34a"}
          />
        }
      >
        {/* ACHIEVEMENTS BY CATEGORY */}
        {Object.entries(groupedAchievements).map(([category, items]) => {
          const categoryUnlocked = items.filter(a => a.unlocked).length;
          return (
            <View key={category} className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialCommunityIcons 
                  name={categoryIcons[category] as any} 
                  size={20} 
                  color={isDark ? "#71717a" : "#6b7280"} 
                />
                <Text className={`text-sm font-bold uppercase tracking-wider ${textLabelClass}`}>
                  {categoryLabels[category] || category}
                </Text>
                <Text className={`text-xs ${textMutedClass}`}>
                  {categoryUnlocked}/{items.length}
                </Text>
              </View>

              <View className="flex-row flex-wrap gap-2.5">
                {items.map((a) => (
                  <View
                    key={a.id}
                    className="w-[30%] rounded-2xl border p-3 items-center"
                    style={{
                      backgroundColor: a.unlocked
                        ? isDark ? "#111111" : "#ffffff"
                        : isDark ? "#0a0a0a" : "#f9fafb",
                      borderColor: a.unlocked
                        ? isDark ? "#1f1f1f" : "#e5e7eb"
                        : isDark ? "#1a1a1a" : "#f3f4f6",
                      opacity: a.unlocked ? 1 : 0.45,
                    }}
                  >
                    <View 
                      className="w-12 h-12 rounded-full items-center justify-center mb-2"
                      style={{
                        backgroundColor: a.unlocked ? a.color + "22" : isDark ? "#1f1f1f" : "#f3f4f6",
                      }}
                    >
                      <MaterialCommunityIcons
                        name={a.icon as any}
                        size={24}
                        color={a.unlocked ? a.color : isDark ? "#3f3f46" : "#d1d5db"}
                      />
                    </View>
                    <Text 
                      className="text-xs font-bold text-center mb-1"
                      style={{
                        color: a.unlocked ? (isDark ? "#f4f4f5" : "#111827") : (isDark ? "#3f3f46" : "#d1d5db"),
                      }}
                    >
                      {a.label}
                    </Text>
                    <Text 
                      className="text-[10px] text-center leading-[13px]"
                      style={{ color: isDark ? "#52525b" : "#9ca3af" }}
                    >
                      {a.description}
                    </Text>
                    {a.unlocked && (
                      <View className="absolute top-1 right-1">
                        <MaterialCommunityIcons name="check-circle" size={16} color="#22c55e" />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}