import { StatusBar } from "expo-status-bar";
import { Button, Platform, StyleSheet, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useState, useEffect } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowAlert: true,
    };
  },
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");

  // PUSH NOTIFICATION

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.Android.importance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF03004B",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }

      token = await Notifications.getExpoPushTokenAsync({
        projectId: "5760c46a-c20c-4731-b916-48dde1b7f9bf",
      });
      console.log(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }
    return token.data;
  }

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        console.log("token: ", token);
        setExpoPushToken(token);
      })
      .catch((error) => console.log(error));
  }, []);

  // LOCAL NOTIFICATION
  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("NOTIFICATION RECEIVED");
        console.log(notification);
        const userName = notification.request.content.data.userName;
        console.log(userName);
      }
    );

    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("NOTIFICATION RESPONSE RECEIVED");
        console.log(response);
        const userName = response.notification.request.content.data.userName;
        console.log(userName);
      }
    );

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  function scheduleLocalNotificationHandler() {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "My first local notification",
        body: "This is the body of the notification.",
        data: { userName: "Stephen" },
      },
      trigger: {
        seconds: 1,
      },
    });
  }

  const schedulePushNotificationHandler = async () => {
    console.log("running schedulePushNotificationHandler");

    // NOTIFICATION MESSAGE
    const message = [
      {
        to: expoPushToken,
        sound: "default",
        body: "Hello world!",
      },
      {
        to: expoPushToken,
        badge: 1,
        body: "You've got mail",
      },
      {
        to: [expoPushToken],
        body: "Breaking news!",
      },
    ];

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        host: "exp.host",
        accept: "application/json",
        "accept-encoding": " gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  };

  return (
    <View style={styles.container}>
      <Button
        title="Schedule Notification"
        onPress={scheduleLocalNotificationHandler}
      />
      <Button
        title="Schedule Notification"
        onPress={schedulePushNotificationHandler}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
