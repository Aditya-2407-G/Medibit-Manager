import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getAccount, getQrData } from '@/lib/appwrite';
import QRCode from 'react-native-qrcode-svg';

const QrCode = () => {


    const [name, setName] = useState("");
    const [qrCodeData, setQrCodeData] = useState<any>();

    useEffect(() => {
        const fetchAccountData = async () => {
          const user = await getAccount();
          if (user) {
            setName(user.name);
    
            let accountData = await getQrData();  
            console.log(accountData); 
            setQrCodeData(accountData)
          }
        };
    
        fetchAccountData();
      }, []);


  return (
    <SafeAreaView className='flex-col h-full justify-evenly'>
      <Text className='text-center mt-10 text-white'>QrCode</Text>

      <View className='flex-row self-center'>
      <QRCode
          value={JSON.stringify({qrCodeData})}// Ensure value is a string
          size={300}  // Adjust the size as needed
          backgroundColor="white"
          color="black"
          
        />
      </View>
    </SafeAreaView>
  )
}

export default QrCode