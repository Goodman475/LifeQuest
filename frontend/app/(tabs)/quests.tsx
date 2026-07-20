import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  FlatList, RefreshControl, Dimensions, ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchRandomQuests, saveRandomQuest, Quest } from "../../services/api";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../services/theme";

const { height: windowHeight } = Dimensions.get("window");
const CARD_HEIGHT = windowHeight * 0.42;

type QuestItem = Quest & { type: "random" };

const CATEGORY_ICONS: Record<string, string> = {
  all: "apps", health: "heart-pulse", strength: "weight-lifter",
  endurance: "run", knowledge: "book-open-variant", mindfulness: "brain",
  productivity: "lightning-bolt", social: "account-group",
  creativity: "palette", finance: "cash",
};

export default function Quests() {
  const { isDark } = useTheme();
  const [randomQuests, setRandomQuests] = useState<QuestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [savingQuestId, setSavingQuestId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const flatListRef = useRef<FlatList<QuestItem>>(null);

  const categories = [
    "all", "health", "strength", "endurance", "knowledge",
    "mindfulness", "productivity", "social", "creativity", "finance",
  ];

  const c = {
    bg:         isDark ? "#0a0a0a" : "#f9fafb",
    header:     isDark ? "#111111" : "#ffffff",
    headerBorder: isDark ? "#1f1f1f" : "#f3f4f6",
    card:       isDark ? "#111111" : "#ffffff",
    cardBorder: isDark ? "#1f1f1f" : "#f3f4f6",
    textPrimary: isDark ? "#f4f4f5" : "#111827",
    textMuted:  isDark ? "#71717a" : "#6b7280",
    textLabel:  isDark ? "#52525b" : "#9ca3af",
    pillActive: isDark ? "#ffffff" : "#111827",
    pillActiveBorder: isDark ? "#ffffff" : "#111827",
    pillActiveText: isDark ? "#000000" : "#ffffff",
    pillInactive: isDark ? "#0a0a0a" : "#ffffff",
    pillInactiveBorder: isDark ? "#1f1f1f" : "#e5e7eb",
    pillInactiveText: isDark ? "#52525b" : "#6b7280",
    badge:      isDark ? "#1f1f1f" : "#f3f4f6",
    badgeBorder: isDark ? "#3f3f46" : "#e5e7eb",
    badgeText:  isDark ? "#a1a1aa" : "#6b7280",
    xpBg:       isDark ? "#ffffff" : "#111827",
    xpText:     isDark ? "#000000" : "#ffffff",
    hint:       isDark ? "#0a0a0a" : "#f9fafb",
    hintBorder: isDark ? "#1f1f1f" : "#f3f4f6",
    hintText:   isDark ? "#52525b" : "#9ca3af",
    btn:        isDark ? "#ffffff" : "#111827",
    btnText:    isDark ? "#000000" : "#ffffff",
    btnDisabled: isDark ? "#1f1f1f" : "#f3f4f6",
    btnDisabledText: isDark ? "#52525b" : "#9ca3af",
    emptyIcon:  isDark ? "#3f3f46" : "#d1d5db",
    emptyText:  isDark ? "#52525b" : "#9ca3af",
    tint:       isDark ? "#ffffff" : "#111827",
  };

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

  const filteredQuests = useMemo(() => {
    if (selectedCategory === "all") return randomQuests;
    return randomQuests.filter((q) => q.skill_type === selectedCategory);
  }, [randomQuests, selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  };

  const renderQuest = ({ item }: { item: QuestItem }) => {
    const saving = savingQuestId === item.id;
    return (
      <View style={{ height: CARD_HEIGHT, paddingHorizontal: 20, paddingVertical: 8 }}>
        <View
          style={{
            flex: 1, borderRadius: 24, backgroundColor: c.card,
            borderWidth: 1, borderColor: c.cardBorder, padding: 20,
            justifyContent: "space-between",
            shadowColor: "#000", shadowOpacity: isDark ? 0.4 : 0.06,
            shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3,
          }}
        >
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1, flexWrap: "wrap" }}>
                {item.skill_type ? (
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1, backgroundColor: c.badge, borderColor: c.badgeBorder }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: c.badgeText, textTransform: "capitalize" }}>
                      {item.skill_type}
                    </Text>
                  </View>
                ) : null}
                {item.difficulty ? (
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1, backgroundColor: c.badge, borderColor: c.badgeBorder }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: c.badgeText, textTransform: "uppercase" }}>
                      {item.difficulty}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={{ backgroundColor: c.xpBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginLeft: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: "800", color: c.xpText }}>+{item.xp_reward} XP</Text>
              </View>
            </View>

            <Text style={{ fontSize: 20, fontWeight: "800", color: c.textPrimary, lineHeight: 28, marginBottom: 8 }}>
              {item.title}
            </Text>
            {item.description ? (
              <Text style={{ fontSize: 14, color: c.textMuted, lineHeight: 20 }} numberOfLines={3}>
                {item.description}
              </Text>
            ) : null}
          </View>

          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.hint, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, borderWidth: 1, borderColor: c.hintBorder }}>
              <Ionicons name="information-circle-outline" size={14} color={c.hintText} />
              <Text style={{ fontSize: 12, color: c.hintText, flex: 1 }}>
                Tap "Choose" to add this to your quest list
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => handleChooseQuest(item)}
              disabled={saving}
              style={{
                borderRadius: 16, paddingVertical: 16, alignItems: "center",
                flexDirection: "row", justifyContent: "center", gap: 8,
                backgroundColor: saving ? c.btnDisabled : c.btn,
              }}
            >
              {!saving && <Ionicons name="add-circle-outline" size={18} color={c.btnText} />}
              <Text style={{ fontWeight: "700", fontSize: 14, color: saving ? c.btnDisabledText : c.btnText }}>
                {saving ? "Saving..." : "Choose Quest"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ backgroundColor: c.header, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: c.headerBorder }}>
        <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", color: c.textLabel, marginBottom: 4 }}>
          Quest Explorer
        </Text>
        <Text style={{ fontSize: 24, fontWeight: "800", color: c.textPrimary }}>Discover challenges</Text>
        <Text style={{ fontSize: 14, color: c.textMuted, marginTop: 4 }}>Scroll through and pick what fits your goals.</Text>
      </View>

      <View style={{ backgroundColor: c.header, borderBottomWidth: 1, borderBottomColor: c.headerBorder, paddingVertical: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const icon = CATEGORY_ICONS[cat] ?? "help-circle";
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => handleCategoryChange(cat)}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 6,
                  paddingHorizontal: 16, height: 36, borderRadius: 99, borderWidth: 1,
                  backgroundColor: isActive ? c.pillActive : c.pillInactive,
                  borderColor: isActive ? c.pillActiveBorder : c.pillInactiveBorder,
                }}
              >
                <MaterialCommunityIcons name={icon as any} size={13} color={isActive ? c.pillActiveText : c.pillInactiveText} />
                <Text style={{ fontSize: 12, fontWeight: "600", textTransform: "capitalize", color: isActive ? c.pillActiveText : c.pillInactiveText }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={c.tint} />
          <Text style={{ color: c.textMuted, fontSize: 14, marginTop: 12 }}>Loading quests...</Text>
        </View>
      ) : error ? (
        <View style={{ paddingHorizontal: 24, paddingTop: 32, alignItems: "center" }}>
          <MaterialCommunityIcons name="alert-circle-outline" size={40} color={c.emptyIcon} />
          <Text style={{ color: c.textMuted, fontSize: 14, textAlign: "center", marginTop: 12, marginBottom: 20 }}>{error}</Text>
          <TouchableOpacity onPress={() => loadRandomQuests(false)} style={{ backgroundColor: c.btn, borderRadius: 16, paddingHorizontal: 32, paddingVertical: 16 }}>
            <Text style={{ color: c.btnText, fontWeight: "700" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
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
              tintColor={c.tint}
            />
          }
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 80 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingVertical: 64, paddingHorizontal: 24, gap: 12 }}>
              <MaterialCommunityIcons name="compass-off-outline" size={44} color={c.emptyIcon} />
              <Text style={{ color: c.emptyText, fontSize: 14, textAlign: "center" }}>
                No quests in this category.{"\n"}Try a different filter.
              </Text>
            </View>
          }
          ListFooterComponent={
            fetchingMore ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <ActivityIndicator size="small" color={c.tint} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}