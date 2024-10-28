import { Account, Client, ID, Avatars, Databases, Query, Storage } from 'react-native-appwrite';

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.aora',
    projectId: '6710d4e2001299ad18f1',
    databaseId: '6710d5eb002e2ec76a4b',
    userCollectionId: '6710d6000014a7e9d14a',
    videoCollectionId: '6710d623001be9f8023f',
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
const storage = new Storage(client)

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

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.orderDesc('$createdAt')], 
    )
    
    return posts.documents
  } catch (error) {
    throw new Error(error)
  }
}

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.orderDesc('$createdAt')], 
      7 
    )
    
    return posts.documents
  } catch (error) {
    throw new Error(error)
  }
}

export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.search('title', query)], 
     
    )
    
    return posts.documents
  } catch (error) {
    throw new Error(error)
  }
}

export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.equal('creator', userId)],  
      [Query.orderDesc('$createdAt')],
     
    )
    
    return posts.documents
  } catch (error) {
    throw new Error(error)
  }
}

export const signOut = async () => {
  try {
    const session = await account.deleteSession('current')
    return session;
  } catch (error) {
    throw new Error(error)
  }
}

export const getFilePreview = async (fileId, type) => {
  let fileUrl;
  try {
    if(type === 'video'){
      fileUrl = storage.getFileView(appwriteConfig.storageId, fileId)
    }else if(type === 'image'){
      fileUrl = storage.getFilePreview(appwriteConfig.storageId, fileId, 2000, 2000, 'top', 100)
    }else{
      throw new Error('invalid file type')
    }
    if(!fileUrl) throw Error;
    return fileUrl;
  } catch (error) {
    throw new Error(error)
  }
}

export const uploadFile = async (file, type) => {
  if(!file) return;

  const { mimeType, ...rest } = file;
  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri
  }

  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      asset
    )

    const fileUrl = await getFilePreview(uploadedFile.$id, type);

    return fileUrl;
  } catch (error) {
    throw new Error(error)
  }
}

export const createVideo = async (form) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, 'image'),
      uploadFile(form.video, 'video'),
    ])
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId, appwriteConfig.videoCollectionId, ID.unique(), {
        title: form.title,
        description: form.description,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        creator: form.userId,
        prompt: form.prompt
      }
    )
    return newPost;
  } catch (error) {
    throw new Error(error)
  }
}


export const addToBookmark = async (userId, videoId) => {
  try {
    // Fetch document directly using its ID
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      videoId
    );

    const documentId = post.$id;

    // Check if 'liked' array exists and if userId is already in it
    const likedArray = post.liked || [];
    if (!likedArray.includes(userId)) {
      likedArray.push(userId);

      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.videoCollectionId,
        documentId,
        { liked: likedArray }
      );

      console.log(`User ${userId} added to liked array`);
    } else {
      console.log(`User ${userId} is already in the liked array`);
    }
  } catch (error) {
    throw new Error(`Failed to add to bookmark: ${error.message}`);
  }
};

export const getUserBookmarks = async (userId) => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.search('liked', userId)],  
      [Query.orderDesc('$createdAt')],
    )
    
    return posts.documents
  } catch (error) {
    throw new Error(error)
  }
}