import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarShowLabel: true,

        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          elevation: 5,
          backgroundColor: '#fff',
          height:70,
          paddingBottom: 10,
          paddingTop: 10,
        },

        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="community"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-group"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* CENTER FLOATING BUTTON */}
      <Tabs.Screen
        name="createquests"
        options={{
          title: '',
          tabBarIcon: () => (
            <MaterialCommunityIcons
              name="plus"
              size={28}
              color="#fff"
            />
          ),

          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={{
                top: -25,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#111',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 5,
                }}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={28}
                  color="#fff"
                />
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
            <MaterialCommunityIcons
              name="layers-triple"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}