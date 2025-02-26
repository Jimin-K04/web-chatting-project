import React, { useEffect, useState } from 'react'
import { FaRegSmile } from 'react-icons/fa'
import { onChildAdded, ref } from 'firebase/database'
import {db} from '../../../firebase';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../store/chatRoomSlice';

function DirectMessages() {
  const usersRef = ref(db, "users");

  const [users, setUsers] = useState([]);
  const [activeChatRoom, setActiveChatRoom] = useState("");
  const {currentUser} = useSelector(state => state.user)
  const dispatch = useDispatch();

  useEffect(() => {
    if(currentUser?.uid){
      addUsersLisners(currentUser.uid)
    }
  
    return () => {
   
    }
  }, [currentUser?.uid])
  

  //사용자가 추가될때마다 업데이트
  const addUsersLisners = (currentUserId) => {
    let userArray = [];

    onChildAdded(usersRef, DataSnapshot => {
      //본인의 메세지는 빼고 다른 사람들 과의 채팅창만 띄우기
      if(currentUserId !== DataSnapshot.key) {
        let user = DataSnapshot.val();
        user["uid"] = DataSnapshot.key;
        userArray.push(user)

        const newUsersArray = [...userArray];
        setUsers(newUsersArray);
      }
    })

  }

  //두 사람의 채팅방 아이디 만드는 함수, 여기서 userId 는 상대방의 아이디, 내아이디가 123, 상대방 아이다기 234 이면 채팅룸아이디는 234/123
  const getChatRoomId = (userId) => {
    const currentUserId = currentUser.uid;

    return userId > currentUserId
      ? `${userId}/${currentUserId}`
      :`${currentUserId}/${userId}`
  }


  //다이렉트 메세지 창 바꾸기, user 는 상대방.
  const changeChatRoom = (user) => {
    const chatRoomId = getChatRoomId(user.uid);
    const chatRoomData = {
      id: chatRoomId,
      name: user.name,
      
    }

    dispatch(setCurrentChatRoom(chatRoomData));
    dispatch(setPrivateChatRoom(true));
    setActiveChatRoom(user.uid);
  }

  //다리렉트 메세지 창 렌더링 함수
  const renderDirectMessages = users => {
    return users.length > 0 &&
        users.map(user => (
          <li 
          key = {user.uid}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffff45'} // 마우스 오버 시 색 변경
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = user.uid === activeChatRoom ? '#ffffff45' : ''}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 7px",
            marginBottom: "7px",
            borderRadius: "10px",
            transition: "background 0.1s ease-in-out",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            backgroundColor: user.uid === activeChatRoom ? "#7a84eb" : "",
            boxShadow: user.uid === activeChatRoom ? "0 2px 6px rgba(122, 132, 235, 0.3)" : "none"
          }}
          onClick={() => changeChatRoom(user)}
          >
            <img 
                    src= {user.image} 
                    alt="profile"
                    style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        marginRight: "10px",
                        border: user.uid === activeChatRoom ? "2px solid white" : "2px solid #ddd"
                    }}
                />
            {user.name}
          </li>
        ))
  }


  return (
    <div>
      <span style={{display: 'flex', alignItems: 'center', marginBottom: '10px', fontSize: '16px',
                fontWeight: 'bold',}}>
        <FaRegSmile style={{ marginRight: 5}}/>
        DIRECT MESSAGES
      </span>

      <ul style={{listStyleType: 'none', padding: 0}}>
        {renderDirectMessages(users)}
      </ul>
    </div>
  )
}

export default DirectMessages