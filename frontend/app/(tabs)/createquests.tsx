import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createCustomQuest } from "../../services/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const BAD_WORDS = [
  "kill","murder","suicide","selfharm","hurt","die","stab","shoot",
  "attack","hate","nazi","hitler","terror","terrorist","genocide",
  "racist","racism","drugs","cocaine","heroin","meth","porn","nsfw",
  "nude","sex","explicit","bomb","gun","explosive","hack","scam","fraud","steal",
];

function containsUnsafeContent(text: string) {
  const lower = text.toLowerCase();
  if (text.length > 1200) return true;
  if (/(.)\1{8,}/.test(text)) return true;
  return BAD_WORDS.some((w) => lower.includes(w));
}

function validateXp(xp: number) {
  if (isNaN(xp)) return "Invalid XP value.";
  if (xp < 5) return "XP must be at least 5.";
  if (xp > 200) return "XP cannot exceed 200.";
  return null;
}

const XP_PRESETS = [10, 25, 50, 100, 200];

export default function CreateQuests() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xpReward, setXpReward] = useState("25");
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setXpReward("25");
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const userIdRaw = await AsyncStorage.getItem("user_id");
    if (!userIdRaw) { Alert.alert("Not logged in", "Please log in again."); return; }
    const xpValue = Number(xpReward);
    if (!title.trim()) { Alert.alert("Missing title", "Give your quest a name."); return; }
    if (containsUnsafeContent(title) || containsUnsafeContent(description)) {
      Alert.alert("Blocked", "Unsafe content detected."); return;
    }
    const xpError = validateXp(xpValue);
    if (xpError) { Alert.alert("XP Error", xpError); return; }
    try {
      setSubmitting(true);
      const safeXp = Math.min(Math.max(xpValue || 50, 5), 200);
      await createCustomQuest(Number(userIdRaw), title.trim(), description.trim(), safeXp);
      resetForm();
      Alert.alert("Quest Created", "Your quest has been added to your list.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create quest.");
    } finally {
      setSubmitting(false);
    }
  };

  const xpValue = Number(xpReward);
  const xpPercent = Math.min((xpValue / 200) * 100, 100);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0a0a0a]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View className="bg-[#111111] px-6 pt-16 pb-6 border-b border-[#1f1f1f] mb-4">
          <Text className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-1.5">
            New Quest
          </Text>
          <Text className="text-2xl font-extrabold text-zinc-100 leading-tight">
            Build your challenge
          </Text>
          <Text className="text-sm text-zinc-500 mt-1">
            Set a goal and earn XP when you complete it.
          </Text>
        </View>

        <View className="px-5 gap-3">

          {/* TITLE */}
          <View
            className="bg-[#111111] rounded-2xl border p-4"
            style={{ borderColor: focusedField === "title" ? "#ffffff" : "#1f1f1f" }}
          >
            <Text className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-2">
              Quest Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Run 5km without stopping"
              placeholderTextColor="#3f3f46"
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              className="text-zinc-100 text-base"
            />
          </View>

          {/* DESCRIPTION */}
          <View
            className="bg-[#111111] rounded-2xl border p-4"
            style={{ borderColor: focusedField === "desc" ? "#ffffff" : "#1f1f1f" }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-bold tracking-widest uppercase text-zinc-500">
                Description
              </Text>
              <Text className="text-xs text-zinc-700">Optional</Text>
            </View>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What does completing this look like?"
              placeholderTextColor="#3f3f46"
              multiline
              numberOfLines={3}
              onFocus={() => setFocusedField("desc")}
              onBlur={() => setFocusedField(null)}
              className="text-zinc-100 text-base h-20"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          {/* XP SECTION */}
          <View className="bg-[#111111] rounded-2xl border border-[#1f1f1f] p-4">

            {/* XP HEADER */}
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xs font-bold tracking-widest uppercase text-zinc-500">
                XP Reward
              </Text>
              <View className="flex-row items-center gap-1.5 bg-black border border-white px-3 py-1.5 rounded-xl">
                <MaterialCommunityIcons name="star-four-points" size={11} color="#ffffff" />
                <Text className="text-xs font-extrabold text-white">
                  +{xpReward} XP
                </Text>
              </View>
            </View>

            {/* XP BAR */}
            <View className="h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden mb-4">
              <View
                className="h-full rounded-full bg-white"
                style={{ width: `${xpPercent}%` }}
              />
            </View>

            {/* PRESETS */}
            <View className="flex-row gap-2 mb-4">
              {XP_PRESETS.map((preset) => {
                const active = xpValue === preset;
                return (
                  <TouchableOpacity
                    key={preset}
                    onPress={() => setXpReward(String(preset))}
                    className={`flex-1 py-2.5 rounded-xl items-center border ${
                      active
                        ? "bg-white border-white"
                        : "bg-[#0a0a0a] border-[#1f1f1f]"
                    }`}
                  >
                    <Text className={`text-xs font-extrabold ${
                      active ? "text-black" : "text-zinc-600"
                    }`}>
                      {preset}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* DIVIDER */}
            <View className="flex-row items-center gap-3 mb-3">
              <View className="flex-1 h-px bg-[#1f1f1f]" />
              <Text className="text-xs text-zinc-700 font-semibold">or custom</Text>
              <View className="flex-1 h-px bg-[#1f1f1f]" />
            </View>

            {/* CUSTOM INPUT */}
            <View
              className="rounded-xl border px-4 py-3"
              style={{ borderColor: focusedField === "xp" ? "#ffffff" : "#1f1f1f" }}
            >
              <TextInput
                value={xpReward}
                onChangeText={setXpReward}
                keyboardType="numeric"
                placeholder="5 – 200"
                placeholderTextColor="#3f3f46"
                onFocus={() => setFocusedField("xp")}
                onBlur={() => setFocusedField(null)}
                className="text-zinc-100 text-base"
              />
            </View>
          </View>

          {/* TIPS CARD */}
          <View className="bg-black rounded-2xl border border-white px-4 py-3 flex-row items-start gap-3">
            <Ionicons name="bulb-outline" size={16} color="#fff" style={{ marginTop: 1 }} />
            <Text className="text-xs text-[#ffffff] flex-1 leading-5">
              Keep your quest specific and achievable. Good quests have a clear finish line.
            </Text>
          </View>

          {/* SUBMIT */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 ${
              submitting ? "bg-[#1f1f1f]" : "bg-[#ffff]"
            }`}
            style={
              !submitting
                ? {
                    shadowColor: "#4ade80",
                    shadowOpacity: 0.25,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 4,
                  }
                : undefined
            }
          >
            {!submitting && (
              <Ionicons name="add-circle" size={20} color="#000000" />
            )}
            <Text className={`font-extrabold text-base ${
              submitting ? "text-zinc-600" : "text-black"
            }`}>
              {submitting ? "Creating..." : "Create Quest"}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}