import axios from 'axios';
import Constants from 'expo-constants';

const expoConfig = Constants.expoConfig || Constants.manifest;
const apiUrl =
  (typeof process !== 'undefined' && process.env?.API_URL)
    || expoConfig?.extra?.API_URL
    || 'http://127.0.0.1:8000';

export type Character = {
  class_name: string;
  level: number;
  xp_current: number;
  xp_max: number;
};

export type Stats = {
  streak: number;
  completed: number;
  rank: number;
};

export type Quest = {
  id: number;
  title: string;
  description?: string;
  xp_reward: number;
  skill_type?: string;
  difficulty?: string;
  done?: boolean;
  type?: "daily" | "custom" | "random" | "general" | "selected";
};

export type FeedItem = {
  id: number;
  name: string;
  action: string;
  time: string;
};

export type HomeData = {
  user_name: string;
  character: Character;
  stats: Stats;
  quests: Quest[];
  feed: FeedItem[];
};

export type ToggleQuestResponse = {
  new_xp: number;
  new_xp_max: number;
  new_level: number;
  completed: boolean;
};

export type LeaderboardEntry = {
  id: number;
  username: string;
  level: number;
  total_completed: number;
  xp: number;
};

export const api = axios.create({
  baseURL: apiUrl,
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

// Home
export const fetchHomeData = async (userId: number): Promise<HomeData> => {
  const { data } = await api.get(`/home/${userId}`);
  return data;
};

// Quests
export const toggleQuest = async (
  questId: number,
  userId: number
): Promise<ToggleQuestResponse> => {
  const { data } = await api.patch(`/quests/${questId}/toggle/${userId}`);
  return data;
};

export const fetchDailyQuests = async (userId: number) => {
  const { data } = await api.get(`/quests/daily/${userId}`);
  return data;
};

export const toggleDailyQuest = async (
  dailyQuestId: number,
  userId: number
): Promise<ToggleQuestResponse> => {
  const { data } = await api.patch(`/quests/daily/${dailyQuestId}/toggle/${userId}`);
  return data;
};

export const fetchCustomQuests = async (userId: number) => {
  const { data } = await api.get(`/quests/custom/${userId}`);
  return data;
};

export const fetchRandomQuests = async (userId: number, count = 10) => {
  const { data } = await api.get(`/quests/random/${userId}?count=${count}`);
  return data;
};

export const saveRandomQuest = async (userId: number, questId: number) => {
  const { data } = await api.post(`/quests/random/${questId}/save/${userId}`);
  return data;
};

export const createCustomQuest = async (
  userId: number,
  title: string,
  description: string,
  xp_reward: number
) => {
  const { data } = await api.post(`/quests/custom/${userId}`, { title, description, xp_reward });
  return data;
};

export const updateCustomQuest = async (
  questId: number,
  userId: number,
  title: string,
  description: string,
  xp_reward: number
) => {
  const { data } = await api.put(`/quests/custom/${questId}/user/${userId}`, { title, description, xp_reward });
  return data;
};

export const deleteCustomQuest = async (questId: number, userId: number) => {
  await api.delete(`/quests/custom/${questId}/user/${userId}`);
};

export const toggleCustomQuest = async (
  questId: number,
  userId: number
): Promise<ToggleQuestResponse> => {
  const { data } = await api.patch(`/quests/custom/${questId}/toggle/${userId}`);
  return data;
};

// Leaderboard
export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const { data } = await api.get('/leaderboard/');
  return data;
};