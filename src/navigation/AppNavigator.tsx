import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import PlayerScreen from '../screens/PlayerScreen';
import QueueScreen from '../screens/QueueScreen';

export type RootStackParamList = {
  Home: undefined;
  Player: undefined;
  Queue: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#F8FAFC',
        contentStyle: { backgroundColor: '#080A12' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Lokal Music' }} />
      <Stack.Screen name="Player" component={PlayerScreen} options={{ title: 'Now Playing' }} />
      <Stack.Screen name="Queue" component={QueueScreen} options={{ title: 'Queue' }} />
    </Stack.Navigator>
  );
}
