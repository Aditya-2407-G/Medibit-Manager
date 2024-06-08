// ept: appwriteConfig.endpoint,                                 // endpoint -ept
// pf: appwriteConfig.platform,                                 // platform -pf
// pi: appwriteConfig.projectId,                               // projectId -pi

// databaseId -di
// orgCollectionId -oci
// orgFileCollectionId -ofci
// currentOrganizationId - coi
// storageId -si

import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    orgCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID,
    orgFileCollectionId: process.env.EXPO_PUBLIC_APPWRITE_FILE_COLLECTION_ID,
    storageId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID,
};

const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export async function createUser(email, password, username) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if (!newAccount) {
            throw new Error(error);
        }

        const avatarUrl = avatars.getInitials(username);

        await Signin(email, password);

        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.orgCollectionId,
            ID.unique(),
            {
                accountid: newAccount.$id,
                email: email,
                username: username,
                avatar: avatarUrl,
            }
        );

        return newUser;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export async function Signin(email, password) {
    try {
        const session = await account.createEmailPasswordSession(
            email,
            password
        );

        return session;
    } catch (error) {
        throw new Error(error);
    }
}

export async function getAccount() {
    try {
        const currentAccount = await account.get();
        return currentAccount;
    } catch (error) {
        throw new Error(error);
    }
}

export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.orgCollectionId,
            [Query.equal("accountid", currentAccount.$id)]
        );

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function siguOut() {
    try {
        const session = await account.deleteSession("current");

        return session;
    } catch (error) {
        throw new Error(error);
    }
}

export async function getUserDocuments() {
    try {
        const currentOrg = await getCurrentUser();

        const orgId = currentOrg.$id;

        const result = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.orgFileCollectionId,
            [Query.equal("organisation", orgId)]
        );
        if (result.documents.length === 0) {
            return;
        }
        const documents = [];
        result.documents.forEach((document) => {
            documents.push(document.name);
        });

        return result;
    } catch (error) {
        throw new Error(error);
    }
}

export async function getFileUri(fileId) {
  try {
    const response = await storage.getFileDownload(
      appwriteConfig.storageId,
      fileId
    );
    const res = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.orgFileCollectionId,
      fileId
    )

    const fileUrl = response.href;
    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
}


export async function deleteFile(fileId) {
    try {
        const response = await storage.deleteFile(
            appwriteConfig.storageId,
            fileId
        );
        const res = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.orgFileCollectionId,
            fileId
        );
        return { response, res };
    } catch (error) {
        throw new Error(error);
    }
}

export async function getQrData() {
    const org = await getCurrentUser();
    const currOrgId = org.$id;
    const orgName = org.username;
    const data = {
        di: appwriteConfig.databaseId,
        oci: appwriteConfig.orgCollectionId,
        ofci: appwriteConfig.orgFileCollectionId,
        coi: currOrgId,
        si: appwriteConfig.storageId,
        n: orgName,
    };

    return data;
}
