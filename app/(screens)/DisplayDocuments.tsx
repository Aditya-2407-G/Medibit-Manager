import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import { deleteFile, getFileUri, viewDocument } from "@/lib/appwrite";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";

const DisplayDocuments = () => {
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [downloading, setDownloading] = useState(false); // State to track downloading state

  useEffect(() => {
    fetchUserFiles();
  }, []);

  const fetchUserFiles = async () => {
    try {
      const result = await viewDocument();
      if (!result) {
        throw new Error("No files found! Try Uploading a file first!");
      }
      setUserFiles(result!.documents);
    } catch (error) {
      Alert.alert("Error", "No files found! Try Uploading a file first!");
    }
  };

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
      } else {
        shareAsync(uri);
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
      setDownloading(false); // Reset downloading state after download completion or failure
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
      <Text className="text-white font-bold flex-1">{truncateFileName(item.name, 20)}</Text>
      
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => handleFileDownload(item.name, item.$id)}
          disabled={downloading}
          className="bg-secondary-200 px-4 py-2 rounded-md ml-6"
        >
          <Text>Download</Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          onPress={() => handleFileDelete(item.$id)}
          disabled={downloading}
          className="bg-secondary-200 px-4 py-2 rounded-md ml-2"
        >
          <Text>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary">
        <View className="bg-secondary-100 flex mr-60 pt-2 pb-2 rounded-md">
        <Text className="text-blacktext-bold text-2xl text-center">
        Your Uploads
      </Text>

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
        <ActivityIndicator
          style={{ marginTop: 10 }}
          size="large"
          color="#0000ff"
        />
      )}
    </SafeAreaView>
  );
};

export default DisplayDocuments;
