import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import {icons} from '../constants'
const SearchInput = ({ title, value, placeholder, handleChangeText, otherStyles, keyboardType, ...props }) => {
  return (
    
      <View className="w-full h-16 px-4 bg-black-100 border-2 border-black-200 rounded-2xl focus:border-secondary flex-row items-center space-x-4">
        <TextInput
          className="flex-1 mt-0.5 text-white font-pregular text-base pb-5"
          value={value}
          placeholder="Search for a video topic"
          placeholderTextColor="#7b7b8b"
          onChangeText={handleChangeText}
          secureTextEntry={title === 'Password' && !showPassword}
          keyboardType={keyboardType || 'default'}
          {...props}
        />
        <TouchableOpacity>
            <Image
            source={icons.search}
            className="w-5 h-5"
            resizeMode="contain"
            />
        </TouchableOpacity>
      </View>
  );
}

export default SearchInput;