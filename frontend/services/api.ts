import axios from 'axios';

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

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

export const fetchHomeData = async (userId: number): Promise<HomeData> => {
  const { data } = await api.get(`/home/${userId}`);
  return data;
};

export type ToggleQuestResponse = {
  new_xp: number;
  new_xp_max: number;
  new_level: number;
  completed: boolean;
};

export const toggleQuest = async (
  questId: number,
  userId: number
): Promise<ToggleQuestResponse> => {
  const { data } = await api.patch(`/quests/${questId}/toggle/${userId}`);
  return data;
};

// Daily quests
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

// Custom quests
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

export const createCustomQuest = async (userId: number, title: string, description: string, xp_reward: number) => {
  const { data } = await api.post(`/quests/custom/${userId}`, { title, description, xp_reward });
  return data;
};

export const updateCustomQuest = async (questId: number, userId: number, title: string, description: string, xp_reward: number) => {
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