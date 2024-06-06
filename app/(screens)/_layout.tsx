import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const ScreenLayout = () => {
  return (
    <>
      <StatusBar backgroundColor="#161622" style="light" />

      <Stack>
          <Stack.Screen
          name="QrCode"
          options={{
            headerShown: false,
          }}
          />
      </Stack>
    </>
  );
};

export default ScreenLayout;
