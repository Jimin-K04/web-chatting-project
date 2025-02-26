import React, { useEffect, useState } from 'react'
import { Modal, Form, Button } from 'react-bootstrap';
import { FaPlus, FaRegSmileWink } from 'react-icons/fa'
import { db } from '../../../firebase';
import { useDispatch, useSelector } from 'react-redux';
import {child, ref as dbRef, off, onChildAdded, push, update} from 'firebase/database';
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../store/chatRoomSlice';

function ChatRooms() {
    const [show, setShow] = useState(false); //state 생성, true 일때만 modal 보여줌
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [editRoom, setEditRoom] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const chatRoomsRef = dbRef(db, "chatRooms");
    const [chatRooms, setChatRooms] = useState([]); //여러 chatroom 에 대한 배열을 넣어줘야함
    const [firstLoad, setFirstLoad] = useState(true);
    const [activeChatRoomId, setactiveChatRoomId] = useState("");

    const {currentUser} = useSelector((state) => state.user);
    const dispatch = useDispatch();

    //컴포넌트가 마운트 되면 호출(데이터가 바뀌는지 실시간으로 체크)
    useEffect(() => {
        addChatRoomsListners();
        //이 컴포넌트가 더이상 사용되지 않으면 등록해준 리스너 함수를 없애야함
        return () => {
            off(chatRoomsRef);
        }
    }, [])
    

    //채팅방 정보 firebase 에 전송, 생성 함수
    const handleSubmit = async() => {

        if(isFormValid(name, description)) {
            const key = push(chatRoomsRef).key
            const newChatRoom = {
                id: key, // 채팅방 자동 생성 firebase 함수
                name: name,
                description: description,
                createdBy: {
                    name: currentUser.displayName,
                    image: currentUser.photoURL
                }
            }

            try{
                //데이터 firebase store 에 전송
                await update(child(chatRoomsRef, key), newChatRoom);
                //전송 후 state 초기화
                setName("");
                setDescription("");
                setShow(false);
            }catch (error) {
                alert(error);
            }

        }

    }
    //채팅방 이름과 설명이 모두 들어왔는지 유효성 체크
    const isFormValid = (name, description) => {
        return name && description;
    }



    //채팅룸 생성
    const addChatRoomsListners = () => {
        let chatRoomsArray = []; //채팅방 배열 생성

        //위치 지정, 해당 위치의 db 에 변화가 일어나면 함수(datasnapshot) 실행
        onChildAdded(chatRoomsRef, DataSnapshot => {
            chatRoomsArray.push(DataSnapshot.val()); //db 에 들어온 value 가져옴.
            const newChatRooms = [...chatRoomsArray]; //react state 는 변경을 감지하지 못함, 불변성 유지하기 위해 기존의 배열을 수정하는 것이 아닌 새로운 배열에 담아서 state 바꿔줌
            setChatRooms(newChatRooms); 

            //리프레쉬 되면 해당 채팅방이 활성화 되는 함수
            setFiretChatRoom(newChatRooms);
        })
    }

    const setFiretChatRoom = (charRooms) => {
        const firstCharRoom = charRooms[0]; //가장 위에 있는 채팅 룸이 활성화 됨
        if (firstLoad && charRooms.length > 0) {
            dispatch(setCurrentChatRoom(firstCharRoom)) // 첫번째 로드이고, 채팅이 여러개일 때 first chat room 을 활성화 시킴.
            setactiveChatRoomId(firstCharRoom.id);
        }
        setFirstLoad(false);
    }

    //redux 에 선택한 채팅룸 정보 update
    const changeChatRoom = (room) => {
        dispatch(setCurrentChatRoom(room)); //payload 로 room 객체 데이터 넣음
        dispatch(setPrivateChatRoom(false));
        setactiveChatRoomId(room.id);
    }

    //채팅룸 보여주기
    //map : 배열의 메서드 , chatRooms 배열을 순회하면서 각 항목 room을 기반으로 li 요소 생성
    const renderChatRooms = () => {
        return chatRooms.length > 0 &&
            chatRooms.map(room => (
                <li 
                    //onMouseDown={handleLeftClick}
                    key = {room.id}
                    onClick={() => changeChatRoom(room)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffff45'} // 마우스 오버 시 색 변경
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = room.id === activeChatRoomId ? '#ffffff45' : ''}
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
                        backgroundColor: room.id === activeChatRoomId ? "#7a84eb" : "",
                        boxShadow: room.id === activeChatRoomId ? "0 2px 6px rgba(122, 132, 235, 0.3)" : "none"
                      }}
                >
                    # {room.name}
                </li>
            ))
    }

    // //오른쪽 버튼 클릭시 해당 채팅방 정보 불러오기기
    // const handleEditClick = (room) => {
    //     setEditRoom(room);
    //     setShowEditModal(true);
    // }
    // //입력값을 받아서 변경처리
    // const handleInputChange = (e) => {
    //     setEditRoom({...editRoom, [e.target.name] : e.target.value})
    // }

    // const handleSaveChanges = async() => {
    //     if (!editRoom.name || !editRoom.description) return;

    //     try{
    //         await update(child(dbRef(db, "chatRooms"), editRoom.id))
    //     }
    // }


    return (
        <div style={{marginBottom: 60}}>
            <div style={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: 10
            }}>
            
                <FaRegSmileWink style={{marginRight: 5}}/>
                CHAT ROOMS {" "}

                {/* 클릭하면 state 가 true 로 변한다 */}
                <FaPlus 
                style={{position: 'absolute', right:0, cursor:'pointer'}}
                onClick={() => setShow(!show)}/>
            </div>

            <ul style={{ listStyleType: 'none', padding: 0}}>
                {renderChatRooms()}
            </ul>

            {/* show 의 state 에 따라 모달 보여줌, onHide : 모달의 닫기버튼 또는 배경 클릭시 호출되는 함수, Show 상태를 false 로 변경 */}
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>채팅 방 생성하기</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form> 
                        <Form.Group style={{marginBottom: 13}}>
                            <Form.Label>방 이름</Form.Label>
                            <Form.Control
                                 value = {name}
                                 onChange={(e) => setName(e.target.value)} //이벤트함수로 작성할때마다 state 업데이트
                                 type='text'
                                 placeholder='채팅 방 이름을 입력하세요.'
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>방 설명</Form.Label>
                            <Form.Control
                                 value={description}
                                 onChange={(e) => setDescription(e.target.value)} //이벤트함수로 작성할때마다 state 업데이트
                                 type='text'
                                 placeholder='채팅 방 설명을 입력하세요.'
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    {/* setShow 의 값을 false 로 바꿔서 모달 안보이게 하기기 */}
                    <Button variant='secondary' onClick={() => setShow(false)}> 
                        취소
                    </Button>
                    <Button variant='primary' onClick={handleSubmit}>
                        생성
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* //채팅방 수정
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>채팅 방 수정</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form> 
                        <Form.Group style={{marginBottom: 13}}>
                            <Form.Label>방 이름</Form.Label>
                            <Form.Control
                                 value = {name}
                                 onChange={(e) => setName(e.target.value)} //이벤트함수로 작성할때마다 state 업데이트
                                 type='text'
                                 placeholder='채팅 방 이름을 입력하세요.'
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>방 설명</Form.Label>
                            <Form.Control
                                 value={description}
                                 onChange={(e) => setDescription(e.target.value)} //이벤트함수로 작성할때마다 state 업데이트
                                 type='text'
                                 placeholder='채팅 방 설명을 입력하세요.'
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    setShow 의 값을 false 로 바꿔서 모달 안보이게 하기기 
                    <Button variant='secondary' onClick={() => setShow(false)}> 
                        취소
                    </Button>
                    <Button variant='primary' onClick={handleSubmit}>
                        생성
                    </Button>
                </Modal.Footer>
            </Modal> */}
        </div>
    )
}

export default ChatRooms