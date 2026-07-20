import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Animated,
} from "react-native";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useHomeData } from "../../hooks/useHomeData";
import { useEffect, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../services/theme";

const RANK_ANIMATIONS: Record<string, any> = {
  noob: require("../../assets/animations/noob.json"),
  beginner: require("../../assets/animations/beginner.json"),
  novice: require("../../assets/animations/novice.json"),
  apprentice: require("../../assets/animations/apprentice.json"),
  elite: require("../../assets/animations/elite-knight.json"),
  champion: require("../../assets/animations/champion.json"),
  legend: require("../../assets/animations/legend.json"),
  wizard: require("../../assets/animations/wizard.json"),
};

const RANK_COLORS_DARK: Record<string, { text: string; border: string; pill: string }> = {
  noob:       { text: "text-zinc-400",   border: "border-zinc-700",   pill: "bg-zinc-800" },
  beginner:   { text: "text-green-400",  border: "border-green-900",  pill: "bg-green-950" },
  novice:     { text: "text-teal-400",   border: "border-teal-900",   pill: "bg-teal-950" },
  apprentice: { text: "text-blue-400",   border: "border-blue-900",   pill: "bg-blue-950" },
  elite:      { text: "text-indigo-400", border: "border-indigo-900", pill: "bg-indigo-950" },
  champion:   { text: "text-purple-400", border: "border-purple-900", pill: "bg-purple-950" },
  legend:     { text: "text-orange-400", border: "border-orange-900", pill: "bg-orange-950" },
  wizard:     { text: "text-yellow-400", border: "border-yellow-900", pill: "bg-yellow-950" },
};

const RANK_COLORS_LIGHT: Record<string, { text: string; border: string; pill: string }> = {
  noob:       { text: "text-zinc-500",   border: "border-zinc-200",   pill: "bg-zinc-100" },
  beginner:   { text: "text-green-700",  border: "border-green-200",  pill: "bg-green-100" },
  novice:     { text: "text-teal-700",   border: "border-teal-200",   pill: "bg-teal-100" },
  apprentice: { text: "text-blue-700",   border: "border-blue-200",   pill: "bg-blue-100" },
  elite:      { text: "text-indigo-700", border: "border-indigo-200", pill: "bg-indigo-100" },
  champion:   { text: "text-purple-700", border: "border-purple-200", pill: "bg-purple-100" },
  legend:     { text: "text-orange-600", border: "border-orange-200", pill: "bg-orange-100" },
  wizard:     { text: "text-yellow-700", border: "border-yellow-200", pill: "bg-yellow-100" },
};

function getRank(level: number) {
  if (level >= 60) return "wizard";
  if (level >= 50) return "legend";
  if (level >= 40) return "champion";
  if (level >= 30) return "elite";
  if (level >= 20) return "apprentice";
  if (level >= 10) return "novice";
  if (level >= 5) return "beginner";
  return "noob";
}

function getSecondsUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

function formatCountdown(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function useDailyCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(getSecondsUntilMidnight());
  useEffect(() => {
    const interval = setInterval(() => setSecondsLeft(getSecondsUntilMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);
  return secondsLeft;
}

type Quest = {
  id: number;
  title: string;
  description?: string;
  xp_reward: number;
  type?: string;
  done?: boolean;
};

function QuestCard({
  quest,
  onPress,
  accent,
  isDark,
}: {
  quest: Quest;
  onPress: () => void;
  accent: { icon: string; iconColor: string };
  isDark: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [completing, setCompleting] = useState(false);
  const [showLottie, setShowLottie] = useState(false);

  const handlePress = () => {
    if (completing) return;
    setCompleting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowLottie(true);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.04, duration: 120, useNativeDriver: true }),
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(scale, { toValue: 0.92, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setShowLottie(false);
      onPress();
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale }], opacity, marginBottom: 10 }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.75}
        className={`rounded-2xl border ${
          isDark
            ? "bg-zinc-900 border-zinc-800"
            : "bg-white border-gray-100"
        }`}
        style={{
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
      >
        <View className="flex-row items-center gap-3 px-4 py-3.5">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: accent.iconColor + "22" }}
          >
            <MaterialCommunityIcons name={accent.icon as any} size={20} color={accent.iconColor} />
          </View>
          <View className="flex-1">
            <Text className={`font-semibold text-sm leading-snug ${isDark ? "text-zinc-100" : "text-gray-900"}`}>
              {quest.title}
            </Text>
            {quest.description ? (
              <Text className={`text-xs mt-0.5 ${isDark ? "text-zinc-500" : "text-gray-400"}`} numberOfLines={1}>
                {quest.description}
              </Text>
            ) : null}
          </View>
          <View className="items-end gap-1">
            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: accent.iconColor + "22" }}>
              <Text className="text-xs font-extrabold" style={{ color: accent.iconColor }}>
                +{quest.xp_reward}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={13} color={isDark ? "#52525b" : "#d1d5db"} />
          </View>
        </View>
      </TouchableOpacity>

      {showLottie && (
        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
          <LottieView
            source={require("../../assets/animations/complete-quest.json")}
            autoPlay
            loop={false}
            style={{ width: 120, height: 120 }}
          />
        </View>
      )}
    </Animated.View>
  );
}

function SectionHeader({
  title, count, right, isDark,
}: {
  title: string; count: number; right?: React.ReactNode; isDark: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between mt-6 mb-3">
      <View className="flex-row items-center gap-2">
        <Text className={`text-sm font-extrabold tracking-tight ${isDark ? "text-zinc-200" : "text-gray-800"}`}>
          {title}
        </Text>
        {count > 0 && (
          <View className={`rounded-full w-5 h-5 items-center justify-center ${isDark ? "bg-zinc-800" : "bg-gray-100"}`}>
            <Text className={`text-xs font-bold ${isDark ? "text-zinc-400" : "text-gray-500"}`}>{count}</Text>
          </View>
        )}
      </View>
      {right}
    </View>
  );
}

function EmptySection({
  message, onAction, actionLabel, isDark,
}: {
  message: string; onAction?: () => void; actionLabel?: string; isDark: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onAction}
      disabled={!onAction}
      activeOpacity={onAction ? 0.7 : 1}
      className={`rounded-2xl px-4 py-4 mb-1 border flex-row items-center justify-between ${
        isDark ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-100"
      }`}
    >
      <Text className={`text-sm ${isDark ? "text-zinc-500" : "text-gray-400"}`}>{message}</Text>
      {onAction && actionLabel && (
        <View className="flex-row items-center gap-1">
          <Text className="text-xs font-bold text-green-500">{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={12} color="#22c55e" />
        </View>
      )}
    </TouchableOpacity>
  );
}

function LevelUpModal({ visible, level, onDismiss }: { visible: boolean; level: number; onDismiss: () => void }) {
  const rank = getRank(level);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
        <LottieView
          source={require("../../assets/animations/level-up.json")}
          autoPlay
          loop={false}
          style={{ width: 300, height: 300, position: "absolute" }}
        />
        <View className="items-center px-8">
          <Text className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-2">Level Up!</Text>
          <Text className="text-7xl font-extrabold text-white mb-1" style={{ letterSpacing: -2 }}>{level}</Text>
          <Text className="text-lg font-bold text-zinc-300 mb-1">{rank.toUpperCase()}</Text>
          <Text className="text-sm text-zinc-500 text-center mb-10">You've grown stronger. Keep pushing.</Text>
          <TouchableOpacity onPress={onDismiss} className="bg-white rounded-2xl px-10 py-4">
            <Text className="text-zinc-950 font-extrabold text-base">Let's Go 🔥</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function Home() {
  const { data, loading, error, refresh, toggleQuest } = useHomeData();
  const { isDark } = useTheme();
  const secondsLeft = useDailyCountdown();
  const [levelUpVisible, setLevelUpVisible] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const prevLevelRef = useRef<number | null>(null);

  useEffect(() => {
    if (!data) return;
    const currentLevel = data.character.level ?? 1;
    if (prevLevelRef.current !== null && currentLevel > prevLevelRef.current) {
      setNewLevel(currentLevel);
      setLevelUpVisible(true);
    }
    prevLevelRef.current = currentLevel;
  }, [data?.character.level]);

  const bg = isDark ? "bg-zinc-950" : "bg-gray-50";
  const cardBg = isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100";

  if (loading) {
    return (
      <View className={`flex-1 ${bg} items-center justify-center`}>
        <ActivityIndicator size="large" color={isDark ? "#4ade80" : "#16a34a"} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className={`flex-1 ${bg} items-center justify-center px-6`}>
        <MaterialCommunityIcons name="alert-circle-outline" size={44} color="#f87171" />
        <Text className={`text-sm text-center mt-3 mb-5 ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
          {error || "Failed to load"}
        </Text>
        <TouchableOpacity onPress={refresh} className="bg-green-600 px-8 py-3.5 rounded-2xl">
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { character, stats } = data;
  const quests = data.quests ?? [];
  const dailyQuests  = quests.filter((q) => q.type === "daily");
  const customQuests = quests.filter((q) => q.type === "custom");
  const chosenQuests = quests.filter((q) => q.type === "selected");
  const level = character.level ?? 1;
  const xpIntoLevel = character.xp_current ?? 0;
  const xpMax = character.xp_max ?? 100;
  const xpPercent = xpMax > 0 ? Math.min((xpIntoLevel / xpMax) * 100, 100) : 0;
  const rank = getRank(level);
  const rankColors = isDark ? RANK_COLORS_DARK[rank] : RANK_COLORS_LIGHT[rank];
  const rankAnimation = RANK_ANIMATIONS[rank] || require("../../assets/animations/wizard.json");
  const urgency = secondsLeft < 3600;
  const hasNoQuests = dailyQuests.length === 0 && customQuests.length === 0 && chosenQuests.length === 0;

  return (
    <>
      <ScrollView
        className={`flex-1 ${bg}`}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER CARD */}
        <View
          className={`mx-4 mt-18 rounded-3xl px-5 pt-5 pb-5 border ${cardBg}`}
          style={{
            shadowColor: "#000",
            shadowOpacity: isDark ? 0.5 : 0.08,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 6 },
            elevation: 5,
          }}
        >
          {/* TOP ROW */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.push("/profile")} className="flex-row items-center gap-2.5">
              <View className={`w-10 h-10 rounded-full items-center justify-center border ${isDark ? "border-zinc-600" : "border-gray-300"}`}>
                <Ionicons name="person" size={20} color={isDark ? "#fff" : "#374151"} />
              </View>
              <View>
                <Text className={`font-extrabold text-sm ${isDark ? "text-zinc-100" : "text-gray-900"}`}>
                  {data.user_name}
                </Text>
                <Text className={`text-xs ${isDark ? "text-zinc-500" : "text-gray-400"}`}>Level {level}</Text>
              </View>
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
              <View className={`px-2.5 py-1 rounded-full border ${rankColors.pill} ${rankColors.border}`}>
                <Text className={`text-xs font-bold ${rankColors.text}`}>{rank.toUpperCase()}</Text>
              </View>
              {stats?.streak > 0 && (
                <View className={`px-2.5 py-1 rounded-full flex-row items-center gap-1 border ${isDark ? "bg-zinc-800 border-zinc-700" : "bg-gray-100 border-gray-200"}`}>
                  <LottieView
                    source={require("../../assets/animations/streak.json")}
                    autoPlay
                    loop
                    style={{ width: 14, height: 14 }}
                  />
                  <Text className={`text-xs font-bold ${isDark ? "text-zinc-100" : "text-gray-700"}`}>{stats.streak}</Text>
                </View>
              )}
            </View>
          </View>

          {/* CHARACTER */}
          <View className="items-center py-1">
            <LottieView source={rankAnimation} autoPlay loop style={{ width: 140, height: 140 }} />
          </View>

          {/* XP BAR */}
          <View>
            <View className="flex-row justify-between mb-1.5">
              <Text className={`text-xs font-bold tracking-wide uppercase ${isDark ? "text-zinc-500" : "text-gray-400"}`}>XP</Text>
              <Text className={`text-xs font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>
                {xpIntoLevel} / {xpMax}
              </Text>
            </View>
            <View className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-zinc-800" : "bg-gray-100"}`}>
              <View
                className="h-full rounded-full"
                style={{ width: `${xpPercent}%`, backgroundColor: isDark ? "#fff" : "#000" }}
              />
            </View>
            <Text className={`text-xs mt-1.5 text-right ${isDark ? "text-zinc-600" : "text-gray-400"}`}>
              {xpMax - xpIntoLevel} XP to next level
            </Text>
          </View>
        </View>

        {/* QUESTS */}
        <View className="px-4 mt-2">
          <SectionHeader
            title="Daily Quests"
            count={dailyQuests.length}
            isDark={isDark}
            right={
              <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full border ${
                urgency
                  ? "bg-red-950 border-red-900"
                  : isDark ? "bg-zinc-800 border-zinc-700" : "bg-gray-100 border-gray-200"
              }`}>
                <Ionicons name="time-outline" size={11} color={urgency ? "#f87171" : isDark ? "#52525b" : "#9ca3af"} />
                <Text className={`text-xs font-bold ${urgency ? "text-red-400" : isDark ? "text-zinc-500" : "text-gray-400"}`}>
                  {formatCountdown(secondsLeft)}
                </Text>
              </View>
            }
          />
          {dailyQuests.length === 0 ? (
            <EmptySection message="No daily quests today." isDark={isDark} />
          ) : (
            dailyQuests.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                onPress={() => toggleQuest(q.id, q.type)}
                accent={{ icon: "sword-cross", iconColor: isDark ? "#ffffff" : "#000000" }}
                isDark={isDark}
              />
            ))
          )}

          <SectionHeader title="Custom Quests" count={customQuests.length} isDark={isDark} />
          {customQuests.length === 0 ? (
            <EmptySection
              message="No custom quests."
              isDark={isDark}
            />
          ) : (
            customQuests.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                onPress={() => toggleQuest(q.id, q.type)}
                accent={{ icon: "sword-cross", iconColor: isDark ? "#ffffff" : "#000000" }}
                isDark={isDark}
              />
            ))
          )}

          <SectionHeader title="Chosen Quests" count={chosenQuests.length} isDark={isDark} />
          {chosenQuests.length === 0 ? (
            <EmptySection
              message="No chosen quests."
              isDark={isDark}
            />
          ) : (
            chosenQuests.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                onPress={() => toggleQuest(q.id, q.type)}
                accent={{ icon: "sword-cross", iconColor: isDark ? "#ffffff" : "#000000" }}
                isDark={isDark}
              />
            ))
          )}

          {hasNoQuests && (
            <View className="items-center mt-12 gap-3">
              <MaterialCommunityIcons name="sword-cross" size={40} color={isDark ? "#3f3f46" : "#d1d5db"} />
              <Text className={`text-sm text-center ${isDark ? "text-zinc-600" : "text-gray-400"}`}>
                No quests available right now.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <LevelUpModal visible={levelUpVisible} level={newLevel} onDismiss={() => setLevelUpVisible(false)} />
    </>
  );
}