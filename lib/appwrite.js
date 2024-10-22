import { Account, Client, ID, Avatars, Databases, Query,} from 'react-native-appwrite';

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.aora',
    projectId: '6710d4e2001299ad18f1',
    databaseId: '6710d5eb002e2ec76a4b',
    userCollectionId: '6710d6000014a7e9d14a',
    videCollectionId: '6710d623001be9f8023f',
    storageId: '6710d7180006c6a6ff15'
}


// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId) 
    .setPlatform(appwriteConfig.platform)
;

const account = new Account(client);
const avatars = new Avatars(client)
const databases = new Databases(client)

export const  createUser = async (email, password, username) => {
    try{
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        username
      )
      if(!newAccount) throw new Error
      const avatarUrl = avatars.getInitials(username)

      await signIn(email, password)

      const newUser = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        ID.unique(),
        {
          accountId: newAccount.$id,
          username,
          email,
          avatar: avatarUrl
        }
      )
      return newUser;
    }catch(err){
      console.error('err ', err);
      throw new Error(err)
    }
}

export async function signIn(email, password) {
    try{
      const session = await account.createEmailPasswordSession(email, password)
      return session;
    }catch(err){
      console.error('err ', err);
      throw new Error(err)
    }   
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get()

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )
        if(!currentUser) throw Error;
        return currentUser.documents[0]
    } catch (error) {
        console.log(error);
        
    }
}