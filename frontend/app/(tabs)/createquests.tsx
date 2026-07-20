import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createCustomQuest } from "../../services/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../services/theme";

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
  const { isDark } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xpReward, setXpReward] = useState("25");
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const c = {
    bg:          isDark ? "#0a0a0a" : "#f9fafb",
    header:      isDark ? "#111111" : "#ffffff",
    headerBorder: isDark ? "#1f1f1f" : "#f3f4f6",
    card:        isDark ? "#111111" : "#ffffff",
    cardBorder:  isDark ? "#1f1f1f" : "#f3f4f6",
    focusBorder: isDark ? "#ffffff" : "#111827",
    textPrimary: isDark ? "#f4f4f5" : "#111827",
    textMuted:   isDark ? "#71717a" : "#6b7280",
    textLabel:   isDark ? "#71717a" : "#9ca3af",
    placeholder: isDark ? "#3f3f46" : "#d1d5db",
    xpBarBg:     isDark ? "#1f1f1f" : "#e5e7eb",
    xpBarFill:   isDark ? "#ffffff" : "#111827",
    presetActive: isDark ? "#ffffff" : "#111827",
    presetActiveBorder: isDark ? "#ffffff" : "#111827",
    presetActiveText: isDark ? "#000000" : "#ffffff",
    presetInactive: isDark ? "#0a0a0a" : "#ffffff",
    presetInactiveBorder: isDark ? "#1f1f1f" : "#e5e7eb",
    presetInactiveText: isDark ? "#52525b" : "#9ca3af",
    divider:     isDark ? "#1f1f1f" : "#e5e7eb",
    dividerText: isDark ? "#3f3f46" : "#d1d5db",
    tip:         isDark ? "#000000" : "#f3f4f6",
    tipBorder:   isDark ? "#ffffff" : "#000000",
    tipText:     isDark ? "#ffffff" : "#000000",
    tipIcon:     isDark ? "#ffffff" : "#000000",
    btn:         isDark ? "#ffffff" : "#111827",
    btnText:     isDark ? "#000000" : "#ffffff",
    btnDisabled: isDark ? "#1f1f1f" : "#f3f4f6",
    btnDisabledText: isDark ? "#52525b" : "#9ca3af",
    xpBadgeBg:   isDark ? "#000000" : "#f3f4f6",
    xpBadgeBorder: isDark ? "#ffffff" : "#000000",
    xpBadgeText: isDark ? "#ffffff" : "#000000",
  };

  const resetForm = () => { setTitle(""); setDescription(""); setXpReward("25"); };

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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={{ backgroundColor: c.header, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: c.headerBorder, marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", color: c.textLabel, marginBottom: 6 }}>
            New Quest
          </Text>
          <Text style={{ fontSize: 24, fontWeight: "800", color: c.textPrimary, lineHeight: 32 }}>
            Build your challenge
          </Text>
          <Text style={{ fontSize: 14, color: c.textMuted, marginTop: 4 }}>
            Set a goal and earn XP when you complete it.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 12 }}>

          {/* TITLE */}
          <View style={{ backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: focusedField === "title" ? c.focusBorder : c.cardBorder, padding: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", color: c.textLabel, marginBottom: 8 }}>
              Quest Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Run 5km without stopping"
              placeholderTextColor={c.placeholder}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              style={{ color: c.textPrimary, fontSize: 15 }}
            />
          </View>

          {/* DESCRIPTION */}
          <View style={{ backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: focusedField === "desc" ? c.focusBorder : c.cardBorder, padding: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", color: c.textLabel }}>
                Description
              </Text>
              <Text style={{ fontSize: 11, color: c.dividerText }}>Optional</Text>
            </View>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What does completing this look like?"
              placeholderTextColor={c.placeholder}
              multiline
              numberOfLines={3}
              onFocus={() => setFocusedField("desc")}
              onBlur={() => setFocusedField(null)}
              style={{ color: c.textPrimary, fontSize: 15, height: 80, textAlignVertical: "top" }}
            />
          </View>

          {/* XP SECTION */}
          <View style={{ backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.cardBorder, padding: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", color: c.textLabel }}>
                XP Reward
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: c.xpBadgeBg, borderWidth: 1, borderColor: c.xpBadgeBorder, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                <MaterialCommunityIcons name="star-four-points" size={11} color={c.xpBadgeText} />
                <Text style={{ fontSize: 12, fontWeight: "800", color: c.xpBadgeText }}>+{xpReward} XP</Text>
              </View>
            </View>

            <View style={{ height: 6, backgroundColor: c.xpBarBg, borderRadius: 3, overflow: "hidden", marginBottom: 16 }}>
              <View style={{ width: `${xpPercent}%`, height: "100%", backgroundColor: c.xpBarFill, borderRadius: 3 }} />
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              {XP_PRESETS.map((preset) => {
                const active = xpValue === preset;
                return (
                  <TouchableOpacity
                    key={preset}
                    onPress={() => setXpReward(String(preset))}
                    style={{
                      flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center",
                      borderWidth: 1,
                      backgroundColor: active ? c.presetActive : c.presetInactive,
                      borderColor: active ? c.presetActiveBorder : c.presetInactiveBorder,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "800", color: active ? c.presetActiveText : c.presetInactiveText }}>
                      {preset}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: c.divider }} />
              <Text style={{ fontSize: 11, color: c.dividerText, fontWeight: "600" }}>or custom</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: c.divider }} />
            </View>

            <View style={{ borderRadius: 12, borderWidth: 1, borderColor: focusedField === "xp" ? c.focusBorder : c.cardBorder, paddingHorizontal: 16, paddingVertical: 12 }}>
              <TextInput
                value={xpReward}
                onChangeText={setXpReward}
                keyboardType="numeric"
                placeholder="5 – 200"
                placeholderTextColor={c.placeholder}
                onFocus={() => setFocusedField("xp")}
                onBlur={() => setFocusedField(null)}
                style={{ color: c.textPrimary, fontSize: 15 }}
              />
            </View>
          </View>

          {/* TIP */}
          <View style={{ backgroundColor: c.tip, borderRadius: 16, borderWidth: 1, borderColor: c.tipBorder, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            <Ionicons name="bulb-outline" size={16} color={c.tipIcon} style={{ marginTop: 1 }} />
            <Text style={{ fontSize: 12, color: c.tipText, flex: 1, lineHeight: 20 }}>
              Keep your quest specific and achievable. Good quests have a clear finish line.
            </Text>
          </View>

          {/* SUBMIT */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              borderRadius: 16, paddingVertical: 16, alignItems: "center",
              flexDirection: "row", justifyContent: "center", gap: 8,
              backgroundColor: submitting ? c.btnDisabled : c.btn,
            }}
          >
            {!submitting && <Ionicons name="add-circle" size={20} color={c.btnText} />}
            <Text style={{ fontWeight: "800", fontSize: 16, color: submitting ? c.btnDisabledText : c.btnText }}>
              {submitting ? "Creating..." : "Create Quest"}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}