import CustomButton from "@/components/CustomButton";
import { getAccount, getQrData} from "@/lib/appwrite";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { Account } from "react-native-appwrite";
import QRCode from 'react-native-qrcode-svg'
import QrCode from "../(screens)/QrCode";

const Home = () => {
  const [name, setName] = useState("");
  // const [qrCodeData, setQrCodeData] = useState("");

  useEffect(() => {
    const fetchAccountData = async () => {
      const user = await getAccount();
      if (user) {
        setName(user.name);

      }
    };

    fetchAccountData();
  }, []);

  const handleQr = async () => {
    router.push("/QrCode");
  }
  const DocumentRoute = async () => {
    router.push("DisplayDocuments");
  };

  return (
    <SafeAreaView className="bg-primary h-full flex justify-center p-4">
      <Text className="text-white text-2xl font-bold mb-5 text-center">
        Hello, {name}!
      </Text>

      <View className="mt-20">
        <CustomButton
          title="GENERATE QR CODE"
          handlePress= {handleQr}
          containerStyles="w-full mb-10"
          textStyles={undefined}
          isLoading={undefined}
        />
        <CustomButton
          title="View Files"
          handlePress= {DocumentRoute}
          containerStyles="w-full"
          textStyles={undefined}
          isLoading={undefined}
          />

      </View>
    </SafeAreaView>
  );
};

export default Home;
