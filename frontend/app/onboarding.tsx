import { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
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
    subtitle:
      "Transform your life into a journey of goals, habits, and personal growth.",
  },
  {
    illustration: <Build width={300} height={300} />,
    title: "Build Strong Habits",
    subtitle:
      "Create daily routines that actually stick and compound over time.",
  },
  {
    illustration: <Connect width={300} height={300} />,
    title: "Connect Your Goals",
    subtitle:
      "Align your habits with what truly matters in your life.",
  },
  {
    illustration: <Achieve width={300} height={300} />,
    title: "Achieve More",
    subtitle:
      "Track progress and turn consistency into real results.",
  },
  {
    illustration: <Innovation width={300} height={300} />,
    title: "Unlock Innovation",
    subtitle:
      "Discover new ways to grow, improve, and push your limits.",
  },
];

export default function OnboardingScreen() {
  const [activeSlide, setActiveSlide] = useState(0);

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

  const handleSkip = () => {
    completeOnboarding();
  };

  const handleNext = () => {
    if (isLastSlide) {
      completeOnboarding();
      return;
    }
    setActiveSlide((value) => value + 1);
  };

  return (
    <View className="flex-1 px-6 pt-12">

      {/* Illustration */}
      <View className="flex-1 items-center justify-center">
        {currentSlide.illustration}
      </View>

      {/* Text */}
      <View className="mb-10">
        <Text className="text-4xl font-bold mb-4">
          {currentSlide.title}
        </Text>

        <Text className=" text-base leading-7">
          {currentSlide.subtitle}
        </Text>
      </View>

      {/* Pagination */}
      <View className="flex-row items-center justify-center mb-8">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`mx-1 h-2 rounded-full ${
              index === activeSlide
                ? "w-8 bg-[#4ca385]"
                : "w-2 bg-black"
            }`}
          />
        ))}
      </View>

      {/* Buttons */}
      <View className="flex-row items-center justify-between mb-8">
        <TouchableOpacity onPress={handleSkip} className="px-5 py-3">
          <Text className="text-base">Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          className="bg-[#4ca385] h-14 px-8 rounded-2xl items-center justify-center"
        >
          <Text className="text-white font-bold text-base">
            {isLastSlide ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}