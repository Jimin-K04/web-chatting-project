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

    const renderUserPosts = (userPosts) => {//object 는 모든 객체들을 반환 , ket 에는 user 이름이, value 에는 이미지와 count 가 들어감감
        return Object.entries(userPosts)
            .sort((a,b) => b[1].count - a[1].count) //count 를 기준으로 내림차순으로 정렬렬
            .map(([key, val], i) => ( //인덱스와 값을 반환환
                <div key={i} style={{display:'flex'}}>
                    <Image
                        style={{width: 45, height: 45, marginRight: 10}}
                        roundedCircle
                        src={val.image}
                        alt={key}
                    />
                    <div>
                        <h6>{key}</h6>
                        <p>
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
                    ? <MdFavorite style={{ marginBottom: 10}}/>
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
            <Image
                roundedCircle
                src = {currentChatRoom?.createdBy.image || null}
                style = {{width:30, height:30, marginRight: 7}}
            />{" "}
            <p>{currentChatRoom?.createdBy.name}</p>
        </div>
        }

        <Row>
            <Col>
            <Accordion>
                <Accordion.Item eventKey='0'>
                    <Accordion.Header>Description</Accordion.Header>
                    <Accordion.Collapse eventKey='0'>
                        <Accordion.Body>
                            {currentChatRoom?.description}
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