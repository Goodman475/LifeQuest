import { useState, useEffect, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchHomeData,
  toggleQuest,
  toggleDailyQuest,
  toggleCustomQuest,
  HomeData,
  setAuthToken,
  ToggleQuestResponse,
} from "../services/api";

function calculateXpCurve(level: number, baseXp: number) {
  const multiplier = 1 + level * 0.08;
  return Math.round(baseXp * multiplier);
}

export function useHomeData() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const load = useCallback(async (showSpinner = false) => {
    try {
      // only show the full loading spinner on first load
      // subsequent focus refreshes update silently in the background
      if (showSpinner || !initialLoadDone.current) {
        setLoading(true);
      }
      setError(null);

      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("user_id");
      if (!token || !userId) throw new Error("Not logged in");

      setAuthToken(token);

      const result = await fetchHomeData(Number(userId));
      setData(result);
      initialLoadDone.current = true;
    } catch (e: any) {
      setError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  // initial load — show spinner
  useEffect(() => {
    load(true);
  }, [load]);

  // focus refresh — silent, no spinner
  useFocusEffect(
    useCallback(() => {
      if (initialLoadDone.current) {
        load(false);
      }
    }, [load])
  );

  const handleToggleQuest = async (questId: number, type?: string) => {
    const userId = await AsyncStorage.getItem("user_id");
    if (!userId || !data) return;

    const uid = Number(userId);
    const previous = data;

    // optimistic update — remove immediately
    setData((prev) =>
      prev
        ? {
            ...prev,
            quests: prev.quests.filter((q) => q.id !== questId),
          }
        : prev
    );

    try {
      let response: ToggleQuestResponse;

      if (type === "daily") {
        response = await toggleDailyQuest(questId, uid);
      } else if (type === "custom" || type === "selected") {
        response = await toggleCustomQuest(questId, uid);
      } else {
        response = await toggleQuest(questId, uid);
      }

      const newXp = response?.new_xp;
      const newLevel = response?.new_level;

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          character: {
            ...prev.character,
            xp_current: newXp ?? prev.character.xp_current,
            xp_max: response?.new_xp_max ?? prev.character.xp_max,
            level: newLevel ?? prev.character.level,
          },
        };
      });
    } catch (e) {
      console.log("Toggle quest failed:", e);
      setData(previous);
    }
  };

  const dedupe = (type: string) =>
    data?.quests
      ? Array.from(
          new Map(
            data.quests
              .filter((q) => q.type === type)
              .map((q) => [q.id, q])
          ).values()
        )
      : [];

  const dailyQuests = dedupe("daily");
  const customQuests = dedupe("custom");
  const selectedQuests = dedupe("selected");

  const getScaledQuests = useCallback(
    (level: number) => {
      if (!data) return [];
      return data.quests.filter((q) => {
        if (level < 5) return q.difficulty !== "hard";
        return true;
      });
    },
    [data]
  );

  return {
    data,
    loading,
    error,
    refresh: () => load(true),
    toggleQuest: handleToggleQuest,
    dailyQuests,
    customQuests,
    selectedQuests,
    getScaledQuests,
    calculateXpCurve,
  };
}