import { createSlice } from "@reduxjs/toolkit";
//여기서 redux action 을 정의해 준다
const initialState ={
    currentUser: {
        uid:'',
        photoURL: '',
        displayName: ''
    }
}

export const userSlice = createSlice({
    name:'user',
    initialState,
    //action 에 따른 redux reducers 정의
    reducers: {
        //action 생성 함수 호출 -redux toolkit, 인자로 이전 state 와 action을 받아옴, action 안에는 type 과 payload 가 있을것.
        setUser: (state, action) => {
            state.currentUser.uid = action.payload.uid;
            state.currentUser.photoURL = action.payload.photoURL;
            state.currentUser.displayName = action.payload.displayName;

        },
        clearUser: (state) =>{
            state.currentUser = {};
        },
        setPhotoUrl: (state, action) => {
            state.currentUser = {
                ...state.currentUser, //원래있던 데이터 나열
                photoURL: action.payload //이부분만 변경해줌
            }
        }
    }
})

export const {setPhotoUrl, clearUser, setUser} = userSlice.actions; //각 reducers 들을 내보내줌
export default userSlice.reducer;