import { child, DataSnapshot, off, onChildAdded, onChildRemoved, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { FaRegSmileBeam } from 'react-icons/fa'
import { db } from '../../../firebase';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../store/chatRoomSlice';

function Favorite() {

  const dispatch = useDispatch();
   const [activeChatRoomId, setactiveChatRoomId] = useState("");
  const [favoriteChatRooms, setFavoriteChatRooms] = useState([]);
  const usersRef = ref(db, 'users');

  const {currentUser} = useSelector(state => state.user);

  useEffect(() => {
    if(currentUser?.uid){
      addLisetner(currentUser.uid)
    }  
    return () => { 
      removeListener(currentUser.uid)
    }
  }, [currentUser?.uid])

  const removeListener = (userId) => {
    off(child(usersRef, `${userId}/favorite`));
  }
  
  //favorite 에 추가될때마다 실시간으로 favorite 창 업데이트트
  const addLisetner = (userId) => {
    let favoriteArray = [];
    onChildAdded(child(usersRef, `${userId}/favorite`), DataSnapshot =>{
      favoriteArray.push({id: DataSnapshot.key, ...DataSnapshot.val()});
      const newFavoriteChatRooms = [...favoriteArray];

      setFavoriteChatRooms(newFavoriteChatRooms);
    })

    //좋아요 취소한 채팅창 사라지게, 데이터 변화가 일어난 채팅룸 찾기
    onChildRemoved(child(usersRef, `${userId}/favorite`), DataSnapshot => {
      //필터링해서 없애는 함수 사용용
      const filteredChatRooms = favoriteArray.filter(chatRoom => {
        return chatRoom.id !== DataSnapshot.key;
      })
      favoriteArray = filteredChatRooms;
      setFavoriteChatRooms(filteredChatRooms); //불변성 지키기
    })
  }

  //redux 에 선택한 채팅룸 정보 update
      const changeChatRoom = (room) => {
          dispatch(setCurrentChatRoom(room)); //payload 로 room 객체 데이터 넣음
          dispatch(setPrivateChatRoom(false));
          setactiveChatRoomId(room.id);
      }


  //좋아요누른 채팅창들 렌더링하기, state 에 들어있는 값들,,
  const renderFavoriteChatRooms = (favoriteChatRooms) => {
    return favoriteChatRooms.length > 0 &&
        favoriteChatRooms.map(chatRoom => (
          <li
            key={chatRoom.id}
            onClick={() => changeChatRoom(chatRoom)}
            style={{
                backgroundColor: chatRoom.id === activeChatRoomId ? '#ffffff45' : ''
            }}
          >
            # {chatRoom.name}
          </li>
        ))
  }

  return (
    <div>
      <span style={{display: 'flex', alignItems : 'center'}}>
        <FaRegSmileBeam style={{margin: 3}}/>
        FAVORITE
      </span>
      <ul style={{listStyleType: 'none', padding: 0}}>
        {renderFavoriteChatRooms(favoriteChatRooms)} 
      </ul>
    </div>
  )
}

export default Favorite