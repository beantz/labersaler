// app/index.js
import { Redirect } from 'expo-router';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'NOBRIDGE',
  'AxiosError',
  // 'A props object containing a "key" prop is being spread into JSX',
  // 'initialScrollIndex "-1" is not valid'
]);

export default function Index() {
  return <Redirect href="/login" />;
}