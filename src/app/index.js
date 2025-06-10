// app/index.js
import { Redirect } from 'expo-router';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'NOBRIDGE',
  'AxiosError',
]);

export default function Index() {
  return <Redirect href="/login" />;
}