import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentChatRoom: {
        //채팅 생성자 정보
        createdBy: {
            image: '',
            name:''
        },
    //채팅룸 정보
    description: '',
    id: '',
    name: ''
    }, 
    isPrivateChatRoom: false,
    userPosts: null //누가 몇개의 채팅을 생성했는지에 관한 데이터
}

export const chatRoomSlice = createSlice({
    name: 'ChatRoom',
    initialState,
    reducers: {
        setCurrentChatRoom: (state, action) => {
            state.currentChatRoom = action.payload;
        },
        setPrivateChatRoom: (state, action) => {
            state.isPrivateChatRoom = action.payload;
        },
        setUserPosts: (state, action) => {
            state.userPosts = action.payload;
        }

    }
})

export const { setCurrentChatRoom, setPrivateChatRoom, setUserPosts} = chatRoomSlice.actions;
export default chatRoomSlice.reducer; //객체에서 reducer 을 export, reducer 들을 이용해서 store 을 생성하게 됨