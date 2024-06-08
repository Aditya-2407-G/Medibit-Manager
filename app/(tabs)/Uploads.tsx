import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, TextInput, Platform, ToastAndroid } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabIcon } from "@/components/TabIcon";
import { icons } from "@/constants";
import * as FileSystem from "expo-file-system";
import { deleteFile, getFileUri, getUserDocuments } from "@/lib/appwrite";
import { shareAsync } from "expo-sharing";

const Uploads = () => {
    const [userFiles, setUserFiles] = useState<any[]>([]);
    const [downloading, setDownloading] = useState(false); // State to track downloading state
    const [isRefreshing, setIsRefreshing] = useState(false); 
    const [searchQuery, setSearchQuery] = useState(""); // State for search query
    const [filteredFiles, setFilteredFiles] = useState<any[]>([]); // State for filtered files


    const fetchUserFiles = useCallback(async () => {
        try {
            const result = await getUserDocuments();
            if (!result) {
                throw new Error("No files found! Try Uploading a file first!");
            }
            setUserFiles(result!.documents);
            setFilteredFiles(result!.documents); // Initialize filtered files
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

    useEffect(() => {
        // Filter files based on the search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            setFilteredFiles(
                userFiles.filter(
                    (file) =>
                        file.name.toLowerCase().includes(query) ||
                        file.username.toLowerCase().includes(query) ||  // Exact match for username
                        file.useremail.toLowerCase().includes(query)
                )
            );
            
        } else {
            setFilteredFiles(userFiles);
        }
    }, [searchQuery, userFiles]);

    
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchUserFiles();
        setIsRefreshing(false);
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
        setDownloading(true);

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


    const truncateFileName = (name: string, maxLength: number) => {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength) + "....";
    };



    const renderItem = ({ item }: any) => (


        <View className="flex-row items-center justify-between p-1">
            <Text className="text-white font-bold ">
                {truncateFileName(item.name, 15)}
            </Text>
            <Text className="text-white font-bold ">{item.username}</Text>
            <Text className="text-white font-bold">
                {item.useremail}
            </Text>

            <View className="flex-row">
                <TouchableOpacity
                    onPress={() =>
                        handleFileDownload(
                            item.name,
                            item.$id,
                        )
                    }
                    disabled={downloading}
                    className="px-1 py-2 rounded-md ml-6"
                >

                    <TabIcon
                        icon={icons.download}
                        color="white"
                        containerStyle="w-5 h-6"
                      />

                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleFileDelete(item.$id)}
                    disabled={downloading}
                    className="px-1 py-2 rounded-md ml-2"
                >
                    <TabIcon
                    icon={icons.cross}
                    color="white"
                    containerStyle="w-4 h-6"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-primary">
            <View >
                <View className="mt-3 w-full flex-row justify-around bg-black rounded-lg">
                    <TabIcon
                        icon={icons.search}
                        color="white"
                        containerStyle="w-5 h-6 mt-3 mr-3 ml-2"
                    />
                    <TextInput
                        className="flex-1 text-white"
                        placeholder="Search User"
                        placeholderTextColor="gray"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity
                        className="ml-2"
                        onPress={handleRefresh}
                    >
                        {isRefreshing ? (
                            <ActivityIndicator className="mt-2" size="large" color="white" />
                        ) : (
                            <TabIcon
                                icon={icons.refresh}
                                color="white"
                                containerStyle="w-8 h-7 mt-2"
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                className="mt-3 bg-slate-800 rounded-md p-2"
                data={filteredFiles}
                renderItem={renderItem}
                keyExtractor={(item) => item.$id}
                ListEmptyComponent={() => (
                    <Text className="text-center text-white">
                        No files found
                    </Text>
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
