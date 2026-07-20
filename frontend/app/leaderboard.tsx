import {
  View, Text, ScrollView, ActivityIndicator,
  TouchableOpacity, RefreshControl,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchLeaderboard, LeaderboardEntry } from "../services/api";
import { useTheme } from "../services/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const MEDAL_COLORS = ["#facc15", "#94a3b8", "#f97316"];

export default function Leaderboard() {
  const { isDark } = useTheme();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const load = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const userId = await AsyncStorage.getItem("user_id");
      setCurrentUserId(userId ? Number(userId) : null);

      const data = await fetchLeaderboard();
      
      // Sort entries by level (highest first)
      const sortedData = [...data].sort((a, b) => b.level - a.level);
      setEntries(sortedData);
    } catch (e: any) {
      console.error("Error loading leaderboard:", e);
      setError(e.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  // Theme classes
  const bgClass = isDark ? "bg-zinc-950" : "bg-gray-50";
  const cardClass = isDark ? "bg-black" : "bg-white";
  const cardBorderClass = isDark ? "border-zinc-800" : "border-gray-100";
  const textPrimaryClass = isDark ? "text-zinc-100" : "text-gray-900";
  const textMutedClass = isDark ? "text-zinc-500" : "text-gray-500";
  const textLabelClass = isDark ? "text-zinc-600" : "text-gray-400";
  const highlightClass = isDark ? "bg-zinc-900" : "bg-zinc-200";
  const highlightBorderClass = isDark ? "border-zinc-800" : "border-zinc-800";

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${bgClass}`}>
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${bgClass}`}>
      {/* HEADER */}
      <View className={`${cardClass} pt-16 pb-4 px-5 border-b ${cardBorderClass}`}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-xl items-center justify-center mb-4"
          style={{ backgroundColor: isDark ? "#1f1f1f" : "#f3f4f6" }}
        >
          <Ionicons name="arrow-back" size={18} color={isDark ? "#f4f4f5" : "#111827"} />
        </TouchableOpacity>

        <Text className={`text-[11px] font-bold tracking-[2px] uppercase ${textLabelClass} mb-1`}>
          Global
        </Text>
        <Text className={`text-2xl font-extrabold ${textPrimaryClass}`}>
          Leaderboard
        </Text>
        <Text className={`text-sm ${textMutedClass} mt-0.5`}>
          Top {entries.length} adventurer{entries.length !== 1 ? 's' : ''} ranked by level
        </Text>
      </View>

      {error ? (
        <View className="flex-1 items-center justify-center p-6">
          <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#f87171" />
          <Text className={`text-sm text-center ${textMutedClass} mt-3`}>{error}</Text>
          <TouchableOpacity
            onPress={() => load()}
            className="mt-5 rounded-2xl px-8 py-3.5"
            style={{ backgroundColor: isDark ? "#fff" : "#000" }}
          >
            <Text className={`font-bold ${isDark ? "text-black" : "text-white"}`}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => load(true)} 
              tintColor={isDark ? "#fff" : "#000"} 
            />
          }
        >
          {/* TOP 3 PODIUM - Only show if we have at least 3 entries */}
          {entries.length >= 3 && (
            <View className="flex-row items-end justify-center gap-2 mb-6 mt-2">
              {/* 2nd */}
              <PodiumCard 
                entry={entries[1]} 
                position={2} 
                isDark={isDark} 
                isCurrentUser={entries[1].id === currentUserId} 
              />
              {/* 1st */}
              <PodiumCard 
                entry={entries[0]} 
                position={1} 
                isDark={isDark} 
                isCurrentUser={entries[0].id === currentUserId} 
              />
              {/* 3rd */}
              <PodiumCard 
                entry={entries[2]} 
                position={3} 
                isDark={isDark} 
                isCurrentUser={entries[2].id === currentUserId} 
              />
            </View>
          )}

          {/* Show all entries in list view */}
          {entries.map((entry, index) => {
            const position = index + 1;
            const isMe = entry.id === currentUserId;
            
            // Skip the first 3 if we have more than 3 entries (they're shown in podium)
            if (entries.length >= 3 && index < 3) return null;
            
            return (
              <View
                key={`leader-${entry.id}`}
                className={`flex-row items-center rounded-2xl border p-3.5 mb-2 ${
                  isMe 
                    ? `${highlightClass} ${highlightBorderClass}` 
                    : `${cardClass} ${cardBorderClass}`
                }`}
              >
                {/* POSITION */}
                <Text className={`w-7 text-[13px] font-extrabold text-center ${textLabelClass}`}>
                  {position}
                </Text>

                {/* AVATAR */}
                <View 
                  className="w-9 h-9 rounded-full items-center justify-center mx-2.5"
                  style={{ backgroundColor: isDark ? "#1f1f1f" : "#f3f4f6" }}
                >
                  <Ionicons name="person" size={18} color={isDark ? "#71717a" : "#6b7280"} />
                </View>

                {/* NAME + RANK */}
                <View className="flex-1">
                  <Text className={`text-sm font-bold ${textPrimaryClass}`}>
                    {entry.username}{isMe ? " (You)" : ""}
                  </Text>
                  <Text className={`text-[11px] ${textMutedClass} mt-0.5`}>
                    {getRank(entry.level)} • {entry.total_completed || 0} quests
                  </Text>
                </View>

                {/* LEVEL */}
                <View 
                  className="rounded-xl px-2.5 py-1"
                  style={{ backgroundColor: isDark ? "#1f1f1f" : "#f3f4f6" }}
                >
                  <Text className={`text-xs font-extrabold ${textPrimaryClass}`}>
                    Lv {entry.level}
                  </Text>
                </View>
              </View>
            );
          })}

          {entries.length === 0 && (
            <View className="items-center py-16 gap-3">
              <MaterialCommunityIcons name="sword-cross" size={44} color={isDark ? "#3f3f46" : "#d1d5db"} />
              <Text className={`text-sm ${textMutedClass}`}>No adventurers yet.</Text>
              <TouchableOpacity
                onPress={() => load()}
                className="mt-2.5 rounded-xl px-6 py-2.5"
                style={{ backgroundColor: isDark ? "#fff" : "#000" }}
              >
                <Text className={`font-semibold ${isDark ? "text-black" : "text-white"}`}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function PodiumCard({ 
  entry, 
  position, 
  isDark, 
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  position: number;
  isDark: boolean;
  isCurrentUser: boolean;
}) {
  const isFirst = position === 1;
  const medalColor = MEDAL_COLORS[position - 1] || "#94a3b8";
  
  const textPrimaryClass = isDark ? "text-zinc-100" : "text-gray-900";
  const textMutedClass = isDark ? "text-zinc-500" : "text-gray-500";
  const textLabelClass = isDark ? "text-zinc-600" : "text-gray-400";

  return (
    <View className={`items-center ${isFirst ? 'w-[120px]' : 'w-[100px]'} ${isFirst ? '' : 'mb-4'}`}>
      {isFirst && (
        <MaterialCommunityIcons name="crown" size={24} color="#facc15" className="mb-1" />
      )}

      <View 
        className={`${isFirst ? 'w-16 h-16' : 'w-[52px] h-[52px]'} rounded-full items-center justify-center mb-2 border-2`}
        style={{ 
          backgroundColor: isDark ? "#1f1f1f" : "#f3f4f6",
          borderColor: medalColor 
        }}
      >
        <Ionicons name="person" size={isFirst ? 28 : 22} color={isDark ? "#71717a" : "#6b7280"} />
      </View>

      <View 
        className="w-[22px] h-[22px] rounded-full items-center justify-center mb-1.5"
        style={{ backgroundColor: medalColor }}
      >
        <Text className="text-[11px] font-extrabold text-black">{position}</Text>
      </View>

      <Text
        className={`text-xs font-bold text-center ${isCurrentUser ? 'text-green-400' : textPrimaryClass}`}
        numberOfLines={1}
      >
        {entry.username || "Anonymous"}
      </Text>

      <Text className={`text-[11px] ${textMutedClass} mt-0.5`}>Lv {entry.level}</Text>

      <Text className={`text-[10px] ${textLabelClass} mt-0.5`}>
        {entry.total_completed || 0} quests
      </Text>

      <View 
        className={`${isFirst ? 'w-[100px]' : 'w-[84px]'} ${isFirst ? 'h-12' : 'h-8'} border-t-2 rounded-t-lg mt-2`}
        style={{ 
          backgroundColor: medalColor + "33",
          borderColor: medalColor + "66"
        }}
      />
    </View>
  );
}