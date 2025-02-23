import React, { useEffect, useRef, useState } from 'react'
import MessageHeader from './MessageHeader'
import MessageForm from './MessageForm'
import { child, DataSnapshot, off, onChildAdded, ref as dbRef, onChildRemoved } from 'firebase/database';
import { db } from '../../../firebase';
import { useDispatch, useSelector } from 'react-redux';
import Message from './Message';
import { setUserPosts } from '../../../store/chatRoomSlice';
import Skeleton from '../../../components/Skeleton';

function MainPanel() {

  const messagesRef = dbRef(db, "messages");
  const typingRef = dbRef(db, "typing");
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setmessagesLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([])
  //특정 텍스트 검색
  const [searchResults, setsearchResults] = useState([]);
  const [searchTerm, setsearchTerm] = useState('');
  const [searchLoading, setsearchLoading] = useState(false);

  const {currentUser} = useSelector(state => state.user);
  const {currentChatRoom} = useSelector(state => state.chatRoom);

  const messageEndRef = useRef(null);
  const dispatch = useDispatch();

  //스크롤 효과 추가해주기
  useEffect(() => {
    messageEndRef.current.scrollIntoView({behavior : 'smooth'});
  })

  //이 컴포넌트가 작동할때 효과 ..
  useEffect(() => {
    if(currentChatRoom.id) {
      addMessgesListener(currentChatRoom.id)  //리스너 함수, 전송된 메세지 실시간 받아옴
      addTypingListeners(currentChatRoom.id)
    }
    
    return () => {
      off(messagesRef)
    }
  }, [currentChatRoom.id]) //채팅방 아이디가 바뀌면 다시 호출 될 수 있게..

  //타이핑되는거 실시간 update 함수.
  const addTypingListeners = (chatRoomId) => {
    let typingUsers = [];

    onChildAdded(child(typingRef, chatRoomId), DataSnapshot => {
      if (DataSnapshot.key !== currentUser.uid) { //자신이 입력중일때는 제외
        typingUsers = typingUsers.concat({ //불변성 지켜주기 떄문에 바로 넣어도 됨
          id: DataSnapshot.key,
          name: DataSnapshot.val()
        })
        setTypingUsers(typingUsers);
      }
    })

    onChildRemoved(child(typingRef, chatRoomId), DataSnapshot => {
      const index = typingUsers.findIndex(user => user.id === DataSnapshot.key) //지우려고 하는 사람의 인덱스를 찾는다
      if(index !== -1) { // 지우려는 사람이 있는 경우
        typingUsers = typingUsers.filter(user => user.id !== DataSnapshot.key); //지우려고 하는 사람 빼고 return
        setTypingUsers(typingUsers);
      }
    })
  }
  
  //검색창에 타이핑 할때마다 state 를 update 해줌. 메세지 해더에서 호출됨.
  const handleSearchChange = (event) => {
    setsearchTerm(event.target.value);
    setsearchLoading(true);
    
    handleSearchMessages(event.target.value)
  }

  //이벤트 타겟 값, 찾으려는 텍스트를 찾는 함수.
  const handleSearchMessages = (searchTerm) => {
    const chatRoomMessages = [...messages]; //통으로 복사
    //regexp : 정규표현식, 특정한 문자열 패턴 찾기, searchTerm 문자열로 객체 생성, g : global, i : 소문자 대문자 무시
    const regex = new RegExp(searchTerm, 'gi');
    //reduce 를 순회하면서  초기 [] 빈 배열인 acc 에 축적이 되고 이를 반환하는 함수
    const searchResults = chatRoomMessages.reduce((acc, message) => {
      if((message.content && message.content.match(regex)) || message.user.name.match(regex)){
        acc.push(message);
      }
      return acc;
    }, []) 
    setsearchResults(searchResults); //타이핑할땨는 searchresult  로 데이터 보여주면됨
    setsearchLoading(false);
  }


  // 채팅방 아이디가 바뀔때마다 호출되는데, 해당 채팅방의 대화 내용을 가져옴.
  const addMessgesListener = (chatRoomId) => {
    let messagesArray = [];
    //만약 채팅방의 대화가 없을시 일단 빈 배열을 넣고 시작한다다
    setMessages([])

    //data 가 업데이트 될때마다 콜백 함수 호출
    onChildAdded(child(messagesRef, chatRoomId), DataSnapshot => {
      messagesArray.push(DataSnapshot.val());
      const newMessageArray = [...messagesArray];

      setMessages(newMessageArray);
      setmessagesLoading(false);
      userPostsCount(newMessageArray);
    })
  }

  //사용자가 업로드한 메세지 개수를 세는 객체 만들기
  const userPostsCount = (messages) => {
    const userPosts = messages.reduce((acc, message) => {
      if(message.user.name in acc) { //이미 객체가 있다면 count 만 올려준다
        acc[message.user.name].count += 1; //key = message.user.name
      } else {
        acc[message.user.name] ={ 
          image: message.user.image,
          count: 1
        }
      }
      return acc;
    }, {})
    dispatch(setUserPosts(userPosts)); //이미 정의 되어있음음
  }

  //메세지 보여주기 함수
  const renderMessages = (messages) => {
    return messages.length > 0 && messages.map((message) => (
      <Message
      key = {message.timestamp}
      message = {message}
      user = {currentUser}
      />
    ))
  }

  const renderTypingUsers = (typingUsers) => 
    typingUsers.length > 0 &&
    typingUsers.map(user => (
      <span key = {user.name.userUid}>
        {user.name.userUid}님이 채팅을 입력하고 있습니다...
      </span>
    ))

    const renderMessageSkeleton = (loading) =>
      loading && (
        <>
          {/* 10개의 아이템을 띄우기기 */}
          {[...Array(13)].map((_, i) => (
            <Skeleton key={i}/>
          ))}
        </>
      )
    


  return (
    <div style={{padding: '2rem 2rem 0 2rem'}}>
      <MessageHeader handleSearchChange={handleSearchChange}/>

      <div
      style={{
        width: '100%',
        height: 450,
        border: '0.2rem solid #ececec',
        borderRadius: '4px',
        padding : '1rem',
        marginBottom: '1rem',
        overflow: 'auto'
      }}>
        {/*로딩중일때만 스켈레톤 보여줌*/}
        {renderMessageSkeleton(messagesLoading)} 
        {/* 메세지 보여주기 */}
        {searchLoading && <div>loading...</div>}
        {/* 찾는 텍스트가 있으면 searchResults 에서, 없으면 message 에서 가져오기 */}
        {searchTerm ? renderMessages(searchResults) : renderMessages(messages)} 
        {renderTypingUsers(typingUsers)}

        {/*임의의 div 를 만들어서 채팅을 입력시 스크롤이 항상 이 div로 오게 만든다*/}
        <div ref={messageEndRef}>

        </div>
      </div>

      <MessageForm/>
    </div>
  )
}

export default MainPanel