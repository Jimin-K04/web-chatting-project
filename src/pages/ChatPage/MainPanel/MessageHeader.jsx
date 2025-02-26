import { child, onValue, ref, remove, update } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { Col, InputGroup, Row, Image, FormControl, Accordion } from 'react-bootstrap';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaLock, FaLockOpen } from 'react-icons/fa';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { useSelector } from 'react-redux'
import { db } from '../../../firebase';



function MessageHeader({handleSearchChange}) {
    const {currentChatRoom} = useSelector(state => state.chatRoom); //redux 객체 가져오기
    const {isPrivateChatRoom} = useSelector(state => state.chatRoom);
    const [isFavorite, setIsFavorite] = useState(false);
    const usersRef = ref(db, 'users');
    const {currentUser} = useSelector(state => state.user);
    const {userPosts} = useSelector(state => state.chatRoom);

    useEffect(() => {
      if(currentChatRoom?.id && currentUser.uid) {
        addFavoriteListner(currentChatRoom.id, currentUser.uid);
      }
    }, [currentChatRoom?.id, currentUser.uid])
    

    //리프레쉬할때 좋아요 데이터에 따라 렌더링, 현재 채팅방 아이디, 유저아이디를 받음.
    const addFavoriteListner = (chatRoomId, userId) => {
        //해당 경로의 데이터가 바뀌면 data 부분이 항상 호출됨
        onValue(child(usersRef, `${userId}/favorite`), data => {
            if(data.val() !== null) {
                const chatRoomIds = Object.keys(data.val()); //key 값, 아이디만 가져옴.
                const isAlreadyFavorite = chatRoomIds.includes(chatRoomId); // favorite 데이터 베이스에 현재 채팅방 아이디가 포함되어 있다면..true
                setIsFavorite(isAlreadyFavorite);
            }
            
        })
    }

    //좋아요를 눌렀을때 데이터 베이스에 좋아요 목록 추가, 삭제함수.
    const handleFavorite = () => {
        if(isFavorite) {
            setIsFavorite(false);
            remove(child(usersRef, `${currentUser.uid}/favorite/${currentChatRoom.id}`))
        } else{
            setIsFavorite(true);
            update(child(usersRef, `${currentUser.uid}/favorite`), {
                [currentChatRoom.id] : { 
                    name: currentChatRoom.name,
                    description: currentChatRoom.description,
                    createdBy: {
                        name: currentChatRoom.createdBy.name,
                        image: currentChatRoom.createdBy.image
                    }

                }
            })
        }
    }

    const renderUserPosts = (userPosts) => {//object 는 모든 객체들을 반환 , ket 에는 user 이름이, value 에는 이미지와 count 가 들어감
        if (!userPosts || Object.keys(userPosts).length === 0) {
            return <p style={{ textAlign: 'center', color: '#999', fontSize: '14px', margin: 0}}>No Chatting</p>;
        }
        return Object.entries(userPosts)
            .sort((a,b) => b[1].count - a[1].count) //count 를 기준으로 내림차순으로 정렬렬
            .map(([key, val], i) => ( //인덱스와 값을 반환환
                <div key={i} 
                style={{display:'flex',
                    borderBottom: '1px solid #eee',
                    marginBottom: 10
                }}>
                    <Image
                        style={{width: 45, height: 45, marginRight: 10}}
                        roundedCircle
                        src={val.image}
                        alt={key}
                    />
                    <div>
                        <h6 style={{margin:0}}>{key}</h6>
                        <p style={{margin: 5}}>
                            {val.count} 개
                        </p>
                    </div>
                </div>
            ))
    }

  return (
    <div 
        style={{
            width: '100%',
            border: '0.2rem solid #ececec',
            borderRadius: '4px',
            height: '190px',
            padding: '1rem',
            marginBottom: '1rem'

        }}>
        <Row>
            <Col>
                <h2>
                    {isPrivateChatRoom?
                        <FaLock style={{marginBottom: 10}}/>
                    :
                    <FaLockOpen style={{marginBottom : 10}} />
                }
                {" "}
                <span>{currentChatRoom?.name}</span>
                {" "}
                {!isPrivateChatRoom &&
                <span style={{cursor: 'pointer'}} onClick={handleFavorite}>
                    {isFavorite 
                    ? <MdFavorite style={{ marginBottom: 10, color: 'red'}}/>
                    :<MdFavoriteBorder style={{marginBottom : 10}}/>
                }
                </span>
                }
                </h2>
            </Col>
            <Col style={{marginBottom: 8}}>
                <InputGroup>
                    <InputGroup.Text>
                        <AiOutlineSearch/> 
                    </InputGroup.Text>
                <FormControl
                    onChange = {handleSearchChange}// 타이핑에 맞는 메세지만 보여주게 하는 함수
                    placeholder='Search Messages'
                />
                 </InputGroup>
            </Col>
        </Row>

        {!isPrivateChatRoom && <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <p  style={{
                    fontSize: '13px', 
                    fontWeight: 'lighter', 
                    color: '#333',
                    marginRight: 10,
                    marginTop: 10,
                    marginBottom: 0
                }}
            >채팅방 생성자</p>
            <Image
                roundedCircle
                src = {currentChatRoom?.createdBy.image || null}
                style = {{width:30, height:30, marginRight: 5}}
            />{" "}
            <p style={{marginTop: 2, marginRight:4}}>{currentChatRoom?.createdBy.name}</p>
        </div>
        }

        <Row>
            <Col>
            <Accordion>
                <Accordion.Item eventKey='0'>
                    <Accordion.Header>Description</Accordion.Header>
                    <Accordion.Collapse eventKey='0'>
                        <Accordion.Body style={{ position: "relative", zIndex: 2000 }}>
                            { !isPrivateChatRoom ? currentChatRoom?.description : <>Chatting with <span style={{ color: '#8A90F0', fontWeight: 'bold' }}>{currentChatRoom.name}</span></> }
                        </Accordion.Body>
                    </Accordion.Collapse>
                </Accordion.Item>
            </Accordion>
            </Col>

            <Col>
            <Accordion>
                <Accordion.Item eventKey='1'>
                    <Accordion.Header>Posts Count</Accordion.Header>
                    <Accordion.Collapse eventKey='1'>
                        <Accordion.Body>
                            {userPosts && renderUserPosts(userPosts)}
                        </Accordion.Body>
                    </Accordion.Collapse>
                </Accordion.Item>
            </Accordion>
            </Col>
        </Row>
    </div>
  )
}

export default MessageHeader