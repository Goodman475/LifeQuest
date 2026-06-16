import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Dimensions,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchRandomQuests, saveRandomQuest, Quest } from "../../services/api";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { height: windowHeight } = Dimensions.get("window");
const CARD_HEIGHT = windowHeight * 0.42;

type QuestItem = Quest & { type: "random" };

const CATEGORY_ICONS: Record<string, string> = {
  all: "apps",
  health: "heart-pulse",
  strength: "weight-lifter",
  endurance: "run",
  knowledge: "book-open-variant",
  mindfulness: "brain",
  productivity: "lightning-bolt",
  social: "account-group",
  creativity: "palette",
  finance: "cash",
};

export default function Quests() {
  const [randomQuests, setRandomQuests] = useState<QuestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [savingQuestId, setSavingQuestId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    "all", "health", "strength", "endurance", "knowledge",
    "mindfulness", "productivity", "social", "creativity", "finance",
  ];

  const loadRandomQuests = useCallback(async (append = false) => {
    try {
      if (append) setFetchingMore(true);
      else if (!refreshing) { setLoading(true); setError(null); }
      const userIdRaw = await AsyncStorage.getItem("user_id");
      if (!userIdRaw) throw new Error("User not logged in");
      const newQuests = await fetchRandomQuests(Number(userIdRaw), 12);
      setRandomQuests((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const unique = newQuests.filter((q: QuestItem) => !existingIds.has(q.id));
        return append ? [...prev, ...unique] : unique;
      });
    } catch (err: any) {
      setError(err.message || "Unable to load quests");
    } finally {
      setLoading(false);
      setFetchingMore(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => { loadRandomQuests(false); }, [loadRandomQuests]);

  const handleChooseQuest = async (quest: QuestItem) => {
    const userIdRaw = await AsyncStorage.getItem("user_id");
    if (!userIdRaw) { setError("Please log in."); return; }
    setSavingQuestId(quest.id);
    try {
      await saveRandomQuest(Number(userIdRaw), quest.id);
      setRandomQuests((prev) => prev.filter((item) => item.id !== quest.id));
      router.push("/home");
    } catch (err: any) {
      setError(err?.message || "Could not save quest.");
    } finally {
      setSavingQuestId(null);
    }
  };

  const filteredQuests = selectedCategory === "all"
    ? randomQuests
    : randomQuests.filter((q) => q.skill_type === selectedCategory);

  const renderQuest = ({ item }: { item: QuestItem }) => {
    const saving = savingQuestId === item.id;

    return (
      <View style={{ height: CARD_HEIGHT, paddingHorizontal: 20, paddingVertical: 8 }}>
        <View
          className="flex-1 rounded-3xl bg-[#111111] border border-[#1f1f1f] p-5 justify-between"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.4,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
          }}
        >
          {/* TOP */}
          <View>
            {/* BADGES ROW */}
            <View className="flex-row items-center justify-between mb-4">
              {/* LEFT: SKILL + DIFFICULTY */}
              <View className="flex-row items-center gap-2 flex-1 flex-wrap">
                {item.skill_type ? (
                  <View className="px-2.5 py-1 rounded-full border border-zinc-700 bg-zinc-800">
                    <Text className="text-xs font-bold capitalize text-zinc-300">
                      {item.skill_type}
                    </Text>
                  </View>
                ) : null}
                {item.difficulty ? (
                  <View className="px-2.5 py-1 rounded-full border border-zinc-700 bg-zinc-800">
                    <Text className="text-xs font-bold uppercase text-zinc-400">
                      {item.difficulty}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* RIGHT: XP */}
              <View className="bg-white px-3 py-1.5 rounded-xl ml-2">
                <Text className="text-xs font-extrabold text-black">
                  +{item.xp_reward} XP
                </Text>
              </View>
            </View>

            {/* TITLE */}
            <Text className="text-xl font-extrabold text-zinc-100 leading-tight mb-2">
              {item.title}
            </Text>

            {/* DESCRIPTION */}
            {item.description ? (
              <Text className="text-sm text-zinc-500 leading-5" numberOfLines={3}>
                {item.description}
              </Text>
            ) : null}
          </View>

          {/* BOTTOM */}
          <View>
            {/* HINT */}
            <View className="flex-row items-center gap-2 bg-[#0a0a0a] rounded-2xl px-3 py-2.5 mb-4 border border-[#1f1f1f]">
              <Ionicons name="information-circle-outline" size={14} color="#52525b" />
              <Text className="text-xs text-zinc-600 flex-1">
                Tap "Choose" to add this to your quest list
              </Text>
            </View>

            {/* BUTTON */}
            <TouchableOpacity
              onPress={() => handleChooseQuest(item)}
              disabled={saving}
              className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 ${
                saving ? "bg-[#1f1f1f]" : "bg-white"
              }`}
            >
              {!saving && (
                <Ionicons name="add-circle-outline" size={18} color="#000" />
              )}
              <Text className={`font-bold text-sm ${saving ? "text-zinc-600" : "text-black"}`}>
                {saving ? "Saving..." : "Choose Quest"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#0a0a0a]">

      {/* HEADER */}
      <View className="bg-[#111111] px-6 pt-16 pb-4 border-b border-[#1f1f1f]">
        <Text className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-1">
          Quest Explorer
        </Text>
        <Text className="text-2xl font-extrabold text-zinc-100">
          Discover challenges
        </Text>
        <Text className="text-sm text-zinc-500 mt-1">
          Scroll through and pick what fits your goals.
        </Text>
      </View>

      {/* CATEGORY PILLS */}
      <View className="bg-[#111111] border-b border-[#1f1f1f] py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const icon = CATEGORY_ICONS[cat] ?? "help-circle";
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
                className={`flex-row items-center gap-1.5 px-4 h-9 rounded-full border ${
                  isActive
                    ? "bg-white border-white"
                    : "bg-[#0a0a0a] border-[#1f1f1f]"
                }`}
              >
                <MaterialCommunityIcons
                  name={icon as any}
                  size={13}
                  color={isActive ? "#000" : "#52525b"}
                />
                <Text className={`text-xs font-semibold capitalize ${
                  isActive ? "text-black" : "text-zinc-600"
                }`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* CONTENT */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-zinc-600 text-sm mt-3">Loading quests...</Text>
        </View>
      ) : error ? (
        <View className="px-6 pt-8 items-center">
          <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#3f3f46" />
          <Text className="text-zinc-500 text-sm text-center mt-3 mb-5">{error}</Text>
          <TouchableOpacity
            onPress={() => loadRandomQuests(false)}
            className="rounded-2xl bg-white px-8 py-4"
          >
            <Text className="text-black font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredQuests}
          renderItem={renderQuest}
          keyExtractor={(item) => String(item.id)}
          onEndReached={() => !fetchingMore && loadRandomQuests(true)}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          snapToInterval={CARD_HEIGHT + 16}
          snapToAlignment="start"
          decelerationRate="fast"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadRandomQuests(false); }}
              tintColor="#ffffff"
            />
          }
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 80 }}
          ListEmptyComponent={
            <View className="items-center py-16 px-6 gap-3">
              <MaterialCommunityIcons name="compass-off-outline" size={44} color="#3f3f46" />
              <Text className="text-zinc-600 text-sm text-center">
                No quests in this category.{"\n"}Try a different filter.
              </Text>
            </View>
          }
          ListFooterComponent={
            fetchingMore ? (
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#ffffff" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}