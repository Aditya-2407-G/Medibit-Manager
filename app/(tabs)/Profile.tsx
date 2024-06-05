import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, FlatList, TouchableOpacity, Text } from "react-native";

import { icons } from "../../constants";
// import useAppwrite from "../../lib/appwrite";
import { siguOut } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalContextProvider";



const Profile = () => {

  const { user, setUser, setIsLogged } = useGlobalContext();

  const logout = async () => {
    await siguOut();
    setUser(null);
    setIsLogged(false); 

    router.replace("/Signin");
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="flex items-center justify-center">
        <View className="flex items-center justify-center gap-2">

          <Text className="font-psemibold text-lg">{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
        <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
          {/* <Text className="text-red-500">Logout</Text> */}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    
  );
};

export default Profile;
