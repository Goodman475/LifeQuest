import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, View, useColorScheme } from 'react-native';

export default function Layout() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const tabBarBg        = dark ? '#18181b' : '#ffffff';
  const tabBarBorder    = dark ? '#27272a' : '#f3f4f6';
  const activeTint      = dark ? '#4ade80' : '#000000';
  const inactiveTint    = dark ? '#52525b' : '#999999';
  const fabBg           = dark ? '#4ade80' : '#000000';
  const fabIconColor    = dark ? '#000000' : '#ffffff';
  const shadowColor     = dark ? '#000000' : '#000000';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 24,
          elevation: 0,
          backgroundColor: tabBarBg,
          borderTopWidth: 1,
          borderTopColor: tabBarBorder,
          height: 50,
          paddingBottom: 10,
          paddingTop: 5,
          borderRadius: 28,
          shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: dark ? 0.4 : 0.08,
          shadowRadius: 16,
          margin: 10,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: inactiveTint,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* CENTER FLOATING BUTTON */}
      <Tabs.Screen
        name="createquests"
        options={{
          title: '',
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <TouchableOpacity
              {...(props as any)}
              style={{ top: -25, justifyContent: 'center', alignItems: 'center' }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: "#fff",
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor,
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 5,
                }}
              >
                <MaterialCommunityIcons name="plus" size={28} color={fabIconColor} />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="quests"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="sword-cross" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}