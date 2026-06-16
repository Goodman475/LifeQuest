import { useState } from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Welcome from "../assets/onboarding/Welcome.svg";
import Build from "../assets/onboarding/Build.svg";
import Connect from "../assets/onboarding/Connect.svg";
import Achieve from "../assets/onboarding/Achieve.svg";
import Innovation from "../assets/onboarding/Innovation.svg";

const slides = [
  {
    illustration: <Welcome width={300} height={300} />,
    title: "Welcome to Life Quest",
    subtitle: "Transform your life into a journey of goals, habits, and personal growth.",
  },
  {
    illustration: <Build width={300} height={300} />,
    title: "Build Strong Habits",
    subtitle: "Create daily routines that actually stick and compound over time.",
  },
  {
    illustration: <Connect width={300} height={300} />,
    title: "Connect Your Goals",
    subtitle: "Align your habits with what truly matters in your life.",
  },
  {
    illustration: <Achieve width={300} height={300} />,
    title: "Achieve More",
    subtitle: "Track progress and turn consistency into real results.",
  },
  {
    illustration: <Innovation width={300} height={300} />,
    title: "Unlock Innovation",
    subtitle: "Discover new ways to grow, improve, and push your limits.",
  },
];

export default function OnboardingScreen() {
  const [activeSlide, setActiveSlide] = useState(0);
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const c = {
    bg:          dark ? "#09090b" : "#ffffff",
    textPrimary: dark ? "#f4f4f5" : "#111827",
    textMuted:   dark ? "#71717a" : "#6b7280",
    dotInactive: dark ? "#3f3f46" : "#d1d5db",
    skipText:    dark ? "#71717a" : "#6b7280",
    green:       "#4ca385",
  };

  const currentSlide = slides[activeSlide];
  const isLastSlide = activeSlide === slides.length - 1;

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("onboarding_completed", "true");
    } catch (error) {
      console.warn("Could not save onboarding status:", error);
    } finally {
      router.replace("/(auth)/login");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingHorizontal: 24, paddingTop: 48 }}>

      {/* Illustration */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {currentSlide.illustration}
      </View>

      {/* Text */}
      <View style={{ marginBottom: 40 }}>
        <Text style={{ fontSize: 32, fontWeight: "800", color: c.textPrimary, marginBottom: 12, lineHeight: 40 }}>
          {currentSlide.title}
        </Text>
        <Text style={{ fontSize: 15, lineHeight: 26, color: c.textMuted }}>
          {currentSlide.subtitle}
        </Text>
      </View>

      {/* Pagination */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={{
              marginHorizontal: 4,
              height: 8,
              borderRadius: 99,
              width: index === activeSlide ? 32 : 8,
              backgroundColor: index === activeSlide ? c.green : c.dotInactive,
            }}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <TouchableOpacity onPress={completeOnboarding} style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
          <Text style={{ fontSize: 15, color: c.skipText, fontWeight: "500" }}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => isLastSlide ? completeOnboarding() : setActiveSlide((v) => v + 1)}
          style={{
            backgroundColor: c.green,
            height: 56,
            paddingHorizontal: 32,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 15 }}>
            {isLastSlide ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}