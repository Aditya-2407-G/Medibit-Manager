import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import { deleteFile, getFileUri, getUserDocuments } from "@/lib/appwrite";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import { SafeAreaView } from "react-native-safe-area-context";

const Uploads = () => {
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [downloading, setDownloading] = useState(false); // State to track downloading state

  const fetchUserFiles = useCallback(async () => {
    try {
      const result = await getUserDocuments();
      if (!result) {
        throw new Error("No files found! Try Uploading a file first!");
      }
      setUserFiles(result!.documents);
    } catch (error) {
      Alert.alert("Error", "No files found! Try Uploading a file first!");
    }
  }, []);

  useEffect(() => {
    fetchUserFiles();

    // call for file fetch every 2 minutes
    const intervalId = setInterval(fetchUserFiles, 120000);

    return () => clearInterval(intervalId);
  }, [fetchUserFiles]);

  
  const saveFile = async (uri: string, fileName: string, mimeType: any) => {
    if (Platform.OS === "android") {
      const permission =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permission.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.StorageAccessFramework.createFileAsync(
          permission.directoryUri,
          fileName,
          mimeType
        )
          .then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            Alert.alert("File downloaded Succesfully");
          })
          .catch((error) => {
            console.error(error);
          });
      }
    } else {
      shareAsync(uri);
    }
  };

  const handleFileDownload = async (fileName: string, fileId: string) => {
    try {
      setDownloading(true); // Set downloading state to true when download starts

      const fileUri = await getFileUri(fileId);
      const result = await FileSystem.downloadAsync(
        fileUri,
        FileSystem.documentDirectory + fileName
      );
      if (result && result.status === 200) {
        saveFile(result.uri, fileName, result.headers["content-type"]);
      } else {
        throw new Error("Failed to download file");
      }
    } catch (error) {
      console.log("Error downloading File", error);
    } finally {
      setDownloading(false); 
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      fetchUserFiles();
      ToastAndroid.show("File deleted successfully", ToastAndroid.SHORT);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to delete file");
    }
  };

  const truncateFileName = (name:string, maxLength:number) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '....';
  };

  const renderItem = ({ item }:any) => (
    <View className="flex-row items-center justify-between p-2">
      <Text className="text-white font-bold flex-1">{truncateFileName(item.name,15)}</Text>
      <Text className="text-white font-bold flex-1">{item.username}</Text>
      <Text className="text-white font-bold flex-1">{item.useremail}</Text>
      
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => handleFileDownload(item.name, item.$id)}
          disabled={downloading}
          className="bg-pink-200 px-1 py-2 rounded-md ml-6"
        >
          <Text>Do</Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          onPress={() => handleFileDelete(item.$id)}
          disabled={downloading}
          className="bg-pink-200 px-1 py-2 rounded-md ml-2"
        >
          <Text>De</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-row">
      <View className="bg-purple-300 flex mr-60 pt-2 pb-2 rounded-md">
        <Text className="text-blacktext-bold text-2xl text-center">
        Your Uploads
      </Text>

        </View>
      <TouchableOpacity className="" onPress={()=>{fetchUserFiles()}}>
        <Text className="text-white ">Refresh</Text>
        </TouchableOpacity>
      </View>


        <FlatList
      className="mt-3 bg-slate-800 rounded-md p-2"
      data={userFiles}
      renderItem={renderItem}
      keyExtractor={(item) => item.$id}
      ListEmptyComponent={() => (
        <Text className="text-center text-white">No files found</Text>
      )}
    />
      {/* Loading icon */}
      {downloading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,  
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Uploads;
