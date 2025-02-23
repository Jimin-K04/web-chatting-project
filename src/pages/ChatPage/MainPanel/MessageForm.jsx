import React, { useRef, useState } from 'react'
import { db, storage } from '../../../firebase';
import { child, push, serverTimestamp, set, ref as dbRef, remove} from 'firebase/database';
import { useSelector } from 'react-redux';
import { getDownloadURL, ref as strRef, uploadBytesResumable } from 'firebase/storage';
import { ProgressBar } from 'react-bootstrap';

function MessageForm() {

    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [percentage, setPercentage] = useState(0);
    const messageRef = dbRef(db, "messages");
    const inputOpenImageRef = useRef(null);
    const {currentChatRoom} = useSelector(state => state.chatRoom);
    const {currentUser} = useSelector(state => state.user);
    const {isPrivateChatRoom} = useSelector(state => state.chatRoom);

    //메세지 전송 버튼
    const handleSubmit = async(e) => {
        e.preventDefault();
        //메세지 요소가 없을 경우
        if (!content) {
            //concat 는 push 와 다르게 기존 배열이 아닌 새로운 배열을 반환하여  react 를 업데이트 함, 불변성 유지
            setErrors(prev => prev.concat("Type Contents First")); //상태 업데이트, 이전 error 배열인 prev에 새로운 메시지 추가.
            return;
        }
        setLoading(true); //메세지 값이 있을 경우 로딩을 true 로 만들어서 전송 버튼을 못누르게 함.
        try{
            //메세지 firebase에 전송
            await set(push(child(messageRef, currentChatRoom.id)), createMessage());
            setLoading(false);
            setContent("");
            setErrors([]);
        } catch(error){
            setErrors(prev => prev.concat(error.message));
            setLoading(false);
            setTimeout(() => {
                setErrors([]);
            }, 5000)
        }
    }

    //메세지 객체 함수
    const createMessage = (fileUrl = null) => {
        const message = {
            timestamp: serverTimestamp(), //firebse 제공함수
            user: {
                id: currentUser.uid,
                name: currentUser.displayName,
                image: currentUser.photoURL
            }
        }
        //fileUrl 이 있다는건 이미지 업로드, 아니면 텍스트
        if(fileUrl !== null) {
            message["image"] = fileUrl;
        } else {
            message["content"] = content;
        }
        return message
    }

    //이미지 버튼을 누르면 파일 열게하는 함수수
    const handleOpenImageRef = () => {
        inputOpenImageRef.current.click(); //참조된 input 을 클릭한것
    }

    const getPath = () => {
        if(isPrivateChatRoom) {
            return `/message/private/${currentChatRoom.id}`
        } else {
            return `/message/public`;
        }
    }

    //이미지 업로드 함수
    const handleUploadImage = (event) => {
            const file = event.target.files[0]; //event 함수는 file 을 가져옴
    
            // Create the file metadata
            /** @type {any} */
            const metadata = {
            contentType: file.type
            };
    
            // Upload file and metadata to the object 'images/mountains.jpg'
            const storageRef = strRef(storage, `${getPath()}/${file.name}`); //경로에 storage 저장
            const uploadTask = uploadBytesResumable(storageRef, file, metadata); //storage, 업로드할 파일
    
            //파일이 업로드 되는 과정 보여주는 부분
            // Listen for state changes, errors, and completion of the upload.
            uploadTask.on('state_changed',
            (snapshot) => {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                setPercentage(Math.round(progress));

                switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
                }
            }, 
            (error) => {
                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                case 'storage/unauthorized':
                    // User doesn't have permission to access the object
                    break;
                case 'storage/canceled':
                    // User canceled the upload
                    break;
    
                // ...
    
                case 'storage/unknown':
                    // Unknown error occurred, inspect error.serverResponse
                    break;
                }
            }, 
            //다 처리 된 후
            () => {
                // Upload completed successfully, now we can get the download URL
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    
                    set(push(child(messageRef, currentChatRoom.id)), createMessage(downloadURL));
                    setLoading(false);
                });
            }
            );

    }

    //메세지 창에 입력할때 입력중임을 표시하는 이벤트 함수.
    const handleChange = (event) => {
        setContent(event.target.value);

        //데이터 베이스에 채팅이 입력되고 있으면 입력중인 유저의 이름을 넣는다.
        if (event.target.value) {
            set(dbRef(db, `typing/${currentChatRoom.id}/${currentUser.uid}`), {
                userUid: currentUser.displayName
            })
        }else {
            remove(dbRef(db, `typing/${currentChatRoom.id}/${currentUser.uid}`))
        }
    }



  return (
    <div>
        <form onSubmit={handleSubmit}>
            <textarea
                style={{
                    width: '100%', height: 90,
                    border: '0.2rem solid rgb(235,236,236)', borderRadius: 4
                }}
                value={content}
                onChange={handleChange}
            />

            {/* 퍼센트 바 설정 */}
            {
                !(percentage === 100) &&
                <ProgressBar variant='warning' label={`${percentage}%`} now = {percentage} />
            }

            {/* 메세지 요소가 없을 경우 에러 메세지 띄우기 */}
            <div>
                {errors.map((errorMsg, i) => <p style={{color: 'red'}} key={i}>
                    {errorMsg}
                </p>)}
            </div>

            <div style={{display: 'flex', gap: 16}}>

                <div style={{flexGrow: 1}}>
                    <button 
                    className = 'message-form-button'
                    type='submit'
                    style={{
                        width: '100%',
                        fontSize: 20,
                        fontWeight: 'bold'
                    }}
                    > 보내기 
                    </button>
                </div>

                <div style={{flexGrow: 1}}>
                    <button 
                    className = 'message-form-button'
                    type='button'
                    onClick={handleOpenImageRef} //이버튼을 클릭하면 아래 파일 이 실행되도록록
                    style={{
                        width: '100%',
                        fontSize: 20,
                        fontWeight: 'bold'
                    }}
                    disabled = {loading} //로딩되는 동안 버튼 비활성화화
                    > 이미지
                    </button>
                </div>

            </div>
        </form>

        <input
        type='file'
        accept='image/jpeg, image/png'
        style={{display:'none'}}
        ref = {inputOpenImageRef}
        onChange={handleUploadImage}
        />
        
    </div>
  )
}

export default MessageForm