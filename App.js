import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Button, View } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [pushToken, setPushToken] = useState();

  useEffect(() => {
    Notifications.getPermissionsAsync()
      .then((statusObj) => {
        if (statusObj.status !== 'granted') {
          return Notifications.requestPermissionsAsync();
        }
        return statusObj;
      })
      .then(({ status }) => {
        if (status !== 'granted') {
          return new Error('Permission not granted!');
        }
      })
      .then(() => {
        return Notifications.getExpoPushTokenAsync({});
      })
      .then((response) => {
        const { data } = response;
        setPushToken(data);
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
  }, []);

  useEffect(() => {
    const backGrSubscr = Notifications.addNotificationResponseReceivedListener(
      (response) => console.log('response: ', response)
    );

    const foreGrSubscr = Notifications.addNotificationReceivedListener(
      (notification) => console.log('notification: ', notification)
    );
    return () => {
      backGrSubscr.remove();
      foreGrSubscr.remove();
    };
  }, []);

  const localNotificationHandler = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'My First Local Notification',
        body: 'This is the first local notification we are sending!',
      },
      trigger: {
        seconds: 5,
      },
    });
  };

  const pushNotificationHandler = async () => {
    await fetch('https://exp.host/--/api/v2/push/send/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        data: { extraData: 'Some Data' },
        title: 'Sent via the app',
        body: 'This push notification was sent via the app',
      }),
    });
  };

  return (
    <View style={styles.container}>
      <Button title="Local Notification" onPress={localNotificationHandler} />
      <Button title="Push Notification" onPress={pushNotificationHandler} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
