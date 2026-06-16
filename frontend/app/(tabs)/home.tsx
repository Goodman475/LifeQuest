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

const GREEN = "#4ade80";

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

const RANK_COLORS: Record<string, { bg: string; text: string; border: string; pill: string }> = {
  noob:       { bg: "bg-zinc-800",   text: "text-zinc-400",   border: "border-zinc-700",   pill: "bg-zinc-800" },
  beginner:   { bg: "bg-green-950",  text: "text-green-400",  border: "border-green-900",  pill: "bg-green-950" },
  novice:     { bg: "bg-teal-950",   text: "text-teal-400",   border: "border-teal-900",   pill: "bg-teal-950" },
  apprentice: { bg: "bg-blue-950",   text: "text-blue-400",   border: "border-blue-900",   pill: "bg-blue-950" },
  elite:      { bg: "bg-indigo-950", text: "text-indigo-400", border: "border-indigo-900", pill: "bg-indigo-950" },
  champion:   { bg: "bg-purple-950", text: "text-purple-400", border: "border-purple-900", pill: "bg-purple-950" },
  legend:     { bg: "bg-orange-950", text: "text-orange-400", border: "border-orange-900", pill: "bg-orange-950" },
  wizard:     { bg: "bg-yellow-950", text: "text-yellow-400", border: "border-yellow-900", pill: "bg-yellow-950" },
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

// ── ANIMATED QUEST CARD ──
function QuestCard({
  quest,
  onPress,
  accent,
}: {
  quest: Quest;
  onPress: () => void;
  accent: { bg: string; border: string; icon: string; iconColor: string; xpColor: string };
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [completing, setCompleting] = useState(false);
  const [showLottie, setShowLottie] = useState(false);

  const handlePress = () => {
    if (completing) return;
    setCompleting(true);

    // haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // show lottie burst
    setShowLottie(true);

    // scale up slightly then fade out
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.04,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.92,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
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
        className={`rounded-2xl border ${accent.bg} ${accent.border}`}
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
      >
        <View className="flex-row items-center gap-3 px-4 py-3.5">
          {/* ICON */}
          <View
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: accent.iconColor + "22" }}
          >
            <MaterialCommunityIcons
              name={accent.icon as any}
              size={20}
              color={accent.iconColor}
            />
          </View>

          {/* TEXT */}
          <View className="flex-1">
            <Text className="font-semibold text-zinc-100 text-sm leading-snug">
              {quest.title}
            </Text>
            {quest.description ? (
              <Text className="text-xs text-zinc-500 mt-0.5" numberOfLines={1}>
                {quest.description}
              </Text>
            ) : null}
          </View>

          {/* XP + ARROW */}
          <View className="items-end gap-1">
            <View
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: accent.iconColor + "22" }}
            >
              <Text className="text-xs font-extrabold" style={{ color: accent.iconColor }}>
                +{quest.xp_reward}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={13} color="#52525b" />
          </View>
        </View>
      </TouchableOpacity>

      {/* COMPLETION LOTTIE — overlaid on the card */}
      {showLottie && (
        <View
          className="absolute inset-0 items-center justify-center"
          pointerEvents="none"
        >
          <LottieView
            source={require("../../assets/animations/complete-quest.json")}
            autoPlay
            loop={false}
            style={{ width: 150, height: 150 }}
          />
        </View>
      )}
    </Animated.View>
  );
}

function SectionHeader({
  title,
  count,
  right,
}: {
  title: string;
  count: number;
  right?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between mt-6 mb-3">
      <View className="flex-row items-center gap-2">
        <Text className="text-sm font-extrabold text-zinc-200 tracking-tight">{title}</Text>
        {count > 0 && (
          <View className="bg-zinc-800 rounded-full w-5 h-5 items-center justify-center">
            <Text className="text-xs font-bold text-zinc-400">{count}</Text>
          </View>
        )}
      </View>
      {right}
    </View>
  );
}

function EmptySection({
  message,
  onAction,
  actionLabel,
}: {
  message: string;
  onAction?: () => void;
  actionLabel?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onAction}
      disabled={!onAction}
      activeOpacity={onAction ? 0.7 : 1}
      className="bg-zinc-900 rounded-2xl px-4 py-4 mb-1 border border-zinc-800 flex-row items-center justify-between"
    >
      <Text className="text-sm text-zinc-500">{message}</Text>
      {onAction && actionLabel && (
        <View className="flex-row items-center gap-1">
          <Text className="text-xs font-bold text-green-400">{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={12} color="#4ade80" />
        </View>
      )}
    </TouchableOpacity>
  );
}

function LevelUpModal({
  visible,
  level,
  onDismiss,
}: {
  visible: boolean;
  level: number;
  onDismiss: () => void;
}) {
  const rank = getRank(level);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      >
        <LottieView
          source={require("../../assets/animations/level-up.json")}
          autoPlay
          loop={false}
          style={{ width: 300, height: 300, position: "absolute" }}
        />

        <View className="items-center px-8">
          <Text className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-2">
            Level Up!
          </Text>
          <Text
            className="text-7xl font-extrabold text-white mb-1"
            style={{ letterSpacing: -2 }}
          >
            {level}
          </Text>
          <Text className="text-lg font-bold text-zinc-300 mb-1">
            {rank.toUpperCase()}
          </Text>
          <Text className="text-sm text-zinc-500 text-center mb-10">
            You've grown stronger. Keep pushing.
          </Text>
          <TouchableOpacity
            onPress={onDismiss}
            className="bg-white rounded-2xl px-10 py-4"
          >
            <Text className="text-zinc-950 font-extrabold text-base">
              Let's Go 
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function Home() {
  const { data, loading, error, refresh, toggleQuest } = useHomeData();
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

  if (loading) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center px-6">
        <MaterialCommunityIcons name="alert-circle-outline" size={44} color="#f87171" />
        <Text className="text-zinc-400 text-sm text-center mt-3 mb-5">
          {error || "Failed to load"}
        </Text>
        <TouchableOpacity
          onPress={refresh}
          className="bg-green-600 px-8 py-3.5 rounded-2xl"
        >
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
  const rankColors = RANK_COLORS[rank];
  const rankAnimation = RANK_ANIMATIONS[rank] || require("../../assets/animations/wizard.json");
  const urgency = secondsLeft < 3600;

  const hasNoQuests =
    dailyQuests.length === 0 &&
    customQuests.length === 0 &&
    chosenQuests.length === 0;

  return (
    <>
      <ScrollView
        className="flex-1 bg-zinc-950"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER CARD ── */}
        <View
          className="bg-zinc-900 mx-4 mt-17 rounded-3xl px-5 pt-5 pb-5 border border-zinc-800"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.5,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 6 },
            elevation: 5,
          }}
        >
          {/* TOP ROW */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              className="flex-row items-center gap-2.5"
            >
              <View className="w-10 h-10 rounded-full items-center justify-center border border-white">
                <Ionicons name="person" size={20} color="#fff" />
              </View>
              <View>
                <Text className="font-extrabold text-zinc-100 text-sm">
                  {data.user_name}
                </Text>
                <Text className="text-xs text-zinc-500">Level {level}</Text>
              </View>
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
              <View className={`px-2.5 py-1 rounded-full border ${rankColors.pill} ${rankColors.border}`}>
                <Text className={`text-xs font-bold ${rankColors.text}`}>
                  {rank.toUpperCase()}
                </Text>
              </View>

              {stats?.streak > 0 && (
                <View className="bg-zinc-800 px-2.5 py-1 rounded-full flex-row items-center gap-1 border border-zinc-700">
                  <LottieView
                    source={require("../../assets/animations/streak.json")}
                    autoPlay
                    loop
                    style={{ width: 14, height: 14 }}
                  />
                  <Text className="text-zinc-100 text-xs font-bold">{stats.streak}</Text>
                </View>
              )}
            </View>
          </View>

          {/* CHARACTER */}
          <View className="items-center py-1">
            <LottieView
              source={rankAnimation}
              autoPlay
              loop
              style={{ width: 140, height: 140 }}
            />
          </View>

          {/* XP BAR */}
          <View>
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs font-bold text-zinc-500 tracking-wide uppercase">
                XP
              </Text>
              <Text className="text-xs font-extrabold text-white">
                {xpIntoLevel} / {xpMax}
              </Text>
            </View>
            <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{ width: `${xpPercent}%`, backgroundColor: "#fff" }}
              />
            </View>
            <Text className="text-xs text-zinc-600 mt-1.5 text-right">
              {xpMax - xpIntoLevel} XP to next level
            </Text>
          </View>
        </View>

        {/* ── QUESTS ── */}
        <View className="px-4 mt-2">

          {/* DAILY */}
          <SectionHeader
            title="Daily Quests"
            count={dailyQuests.length}
            right={
              <View
                className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full border ${
                  urgency ? "bg-red-950 border-red-900" : "bg-zinc-800 border-zinc-700"
                }`}
              >
                <Ionicons
                  name="time-outline"
                  size={11}
                  color={urgency ? "#f87171" : "#52525b"}
                />
                <Text className={`text-xs font-bold ${urgency ? "text-red-400" : "text-zinc-500"}`}>
                  {formatCountdown(secondsLeft)}
                </Text>
              </View>
            }
          />
          {dailyQuests.length === 0 ? (
            <EmptySection message="No daily quests today." />
          ) : (
            dailyQuests.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                onPress={() => toggleQuest(q.id, q.type)}
                accent={{
                  bg: "bg-zinc-900",
                  border: "border-white",
                  icon: "sword",
                  iconColor: "white",
                  xpColor: "white",
                }}
              />
            ))
          )}

          {/* CUSTOM */}
          <SectionHeader title="Custom Quests" count={customQuests.length} />
          {customQuests.length === 0 ? (
            <EmptySection
              message="No custom quests."
            />
          ) : (
            customQuests.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                onPress={() => toggleQuest(q.id, q.type)}
                accent={{
                  bg: "bg-zinc-900",
                  border: "border-white",
                  icon: "sword-cross",
                  iconColor: "white",
                  xpColor: "white",
                }}
              />
            ))
          )}

          {/* CHOSEN */}
          <SectionHeader title="Chosen Quests" count={chosenQuests.length} />
          {chosenQuests.length === 0 ? (
            <EmptySection
              message="No chosen quests."
            />
          ) : (
            chosenQuests.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                onPress={() => toggleQuest(q.id, q.type)}
                accent={{
                  bg: "bg-zinc-900",
                  border: "border-white",
                  icon: "sword-cross",
                  iconColor: "white",
                  xpColor: "white",
                }}
              />
            ))
          )}

          {hasNoQuests && (
            <View className="items-center mt-12 gap-3">
              <MaterialCommunityIcons name="sword-cross" size={40} color="#3f3f46" />
              <Text className="text-zinc-600 text-sm text-center">
                No quests available right now.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* LEVEL UP MODAL */}
      <LevelUpModal
        visible={levelUpVisible}
        level={newLevel}
        onDismiss={() => setLevelUpVisible(false)}
      />
    </>
  );
}