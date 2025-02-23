//redux store 생성, chatRoom 과 user slice 에서 생성한 reducer 이용
import { configureStore } from "@reduxjs/toolkit";
import userReducer from './userSlice';
import chatRoomReducer from './chatRoomSlice';

export const store = configureStore({
    reducer:{
        user: userReducer,
        chatRoom: chatRoomReducer
    }
})