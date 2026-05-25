import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../services/theme';

export function ThemeToggle() {
  const { mode, setMode, colors } = useTheme();

  const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];

  return (
    <View
      style={{ backgroundColor: colors.surface }}
      className="flex-row gap-2 p-2 rounded-lg"
    >
      {modes.map((m) => (
        <TouchableOpacity
          key={m}
          onPress={() => setMode(m)}
          style={{
            backgroundColor: mode === m ? colors.primary : colors.surface,
            borderColor: colors.border,
          }}
          className="flex-1 py-2 px-3 border rounded-lg items-center"
        >
          <Text
            style={{
              color: mode === m ? '#FFFFFF' : colors.text,
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
