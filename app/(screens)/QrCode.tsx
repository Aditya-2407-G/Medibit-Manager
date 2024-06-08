import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getAccount, getQrData } from '@/lib/appwrite';
import QRCode from 'react-native-qrcode-svg';

const QrCode = () => {


    const [name, setName] = useState("");
    const [qrCodeData, setQrCodeData] = useState<any>("");

    useEffect(() => {
        const fetchAccountData = async () => {
          const user = await getAccount();
          if (user) {
            setName(user.name);
    
            let accountData = await getQrData();  
            setQrCodeData(accountData)
          }
        };
    
        fetchAccountData();
      }, []);


  return (
    <SafeAreaView className='flex-col h-full justify-around'>
      <Text className='text-center text-3xl mt-10 text-black'>Get files from users seamlessly using QR </Text>
      <Text className='text-center text-2xl mb-20 text-black'>Scan the QR code below to start recieving the files</Text>

      <View className='flex-row self-center'>
      <QRCode
          value={JSON.stringify({qrCodeData})}
          size={350} 
          backgroundColor="white"
          color="black"
          
        />
      </View>
    </SafeAreaView>
  )
}

export default QrCode