import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../services/theme';

export function ThemeToggle() {
  const { theme, setMode, c } = useTheme();

  const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];

  return (
    <View
      style={{ backgroundColor: c.card }}
      className="flex-row gap-2 p-2 rounded-lg"
    >
      {modes.map((m) => (
        <TouchableOpacity
          key={m}
          onPress={() => setMode(m)}
          style={{
            backgroundColor: theme === m ? c.btnBg : c.card,
            borderColor: c.border,
          }}
          className="flex-1 py-2 px-3 border rounded-lg items-center"
        >
          <Text
            style={{
              color: theme === m ? '#FFFFFF' : c.textPrimary,
            }}
            className="text-sm font-medium capitalize"
          >
            {m}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
