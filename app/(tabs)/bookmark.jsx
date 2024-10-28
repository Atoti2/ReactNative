import { View, Text, SafeAreaView, FlatList, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { getUserBookmarks } from '../../lib/appwrite'
import useAppwrite from '../../lib/useAppwrite'
import EmptyState from '../../components/EmptyState'
import SearchInput from '../../components/SearchInput'
import VideoCard from '../../components/VideoCard'
import { useGlobalContext } from '../../context/GlobalProvider'

const Bookmark = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext()

  const {data: posts, refetch } = useAppwrite(() =>getUserBookmarks(user.$id))
  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = async () => {
    setRefreshing(true)
    await refetch();
    setRefreshing(false)
  }
  
  return (
    <SafeAreaView className="bg-primary h-full">
        <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({item}) => (
          <VideoCard
          showLike={false}
          video={item}
          />
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-2xl text-white">Saved Videos</Text>
              </View>
            </View>
            <SearchInput/>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
          title="No Videos Found"
          subtitle="Be the first one to upload a video"
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
      />
    </SafeAreaView>
  )
}

export default Bookmark