import { getAuth, signOut, updateProfile } from 'firebase/auth';
import React, { useRef } from 'react'
import { Dropdown, Image } from 'react-bootstrap';
import { IoIosChatboxes } from 'react-icons/io'
import { useDispatch, useSelector } from 'react-redux'
import app, { db, storage } from '../../../firebase';
import { uploadBytesResumable, getDownloadURL, ref as strRef} from "firebase/storage";
import { setPhotoUrl } from '../../../store/userSlice';
import { update, ref as dbRef} from 'firebase/database';
 
function UserPanel() {
    const dispatch = useDispatch();
    //state-user-currentUser(redux store) 에 있는 정보(객체)를 useSelector 함수를 사용해서 가져옴
    const {currentUser} = useSelector(state => state.user);
    //firebase 에서 logout 함수도 제공해줌 -> signOut
    const auth = getAuth(app);
    //state 가 변경되면 component 가 렌더링 되지만 ref 가 변경되면 렌더링 되지 않는다
    const inputOpenImageRef = useRef(null); //ref.current === null 이 할당됨


    //로그아웃 버튼
    const handleLogout = () => {
        signOut(auth) //firebse 함수 사용
        .then(() => {
    
        })
        .catch((err) => {
            console.error(err);
        })
    }

    //프로필이미지 변경
    const handleOpenImageRef = () => {
        inputOpenImageRef.current.click();
    }
   
    //이미지를 업로드하는 함수, database, storage, state...
    const handleUploadImage = (event) => {

        const file = event.target.files[0]; //event 함수는 file 을 가져옴옴
        const user = auth.currentUser; //현재 사용자 정보 가져오기

        // Create the file metadata
        /** @type {any} */
        const metadata = {
        contentType: file.type
        };

        // Upload file and metadata to the object 'images/mountains.jpg'
        const storageRef = strRef(storage, 'user_images/' + user.uid); //경로에 storage 저장
        const uploadTask = uploadBytesResumable(storageRef, file, metadata); //storage, 업로드할 파일

        //파일이 업로드 되는 과정 보여주는 부분
        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on('state_changed',
        (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
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

                //프로필 이미지 수정정
                updateProfile(user, {
                    photoURL: downloadURL
                })
                //리덕스 스토어 이미지 데이터 수정
                dispatch(setPhotoUrl(downloadURL));
                //데이터베이스 유저 이미지 수정
                update(dbRef(db, `users/${user.uid}`), {image: downloadURL}) //firebase
            });
        }
        );
    }
   

    return (

        <div style={{
            marginBottom: "30px",
            padding: "25px 30px 10px 20px",
            borderRadius: "10px",
            backgroundColor: "	#3F1D66"
            }}>

            <h3 style = {{color: 'white'}}>
                <IoIosChatboxes />{" "} Chat App
            </h3>

            <div style={{
                display: 'flex', marginBottom: '0.5rem', marginTop: '1rem'
            }}>
            {/* bootstrap 이용 */}
                <Image
                src={currentUser.photoURL}
                roundedCircle
                style ={{ width: "35px",
                    height: "35px",
                    marginRight: "5px",
                    border: "2px solid white",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)"}}
                />

                <Dropdown>
                    <Dropdown.Toggle 
                    style={{
                            backgroundColor: "transparent",
                            border: "none",
                            fontSize: "16px",
                            color: "white",
                            padding: "5px 10px"
                    }}>
                        {currentUser.displayName}
                    </Dropdown.Toggle>

                    <Dropdown.Menu 
                    style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(73, 29, 29, 0.3)"
                }}>
                        {/* 프로필 사진 변경을 눌렀을때 input file 로 참조가 됨*/}
                        <Dropdown.Item onClick= {handleOpenImageRef}
                        style={{paddingLeft: "15px", transition: "background 0.2s" }} >
                            프로필 사진 변경
                        </Dropdown.Item>

                        <Dropdown.Item onClick={handleLogout}
                        style={{ paddingLeft: "15px", transition: "background 0.2s" }}> 
                            로그아웃
                        </Dropdown.Item>

                        <Dropdown.Item 
                        style={{ paddingLeft: "15px", transition: "background 0.2s" }}> 
                            이름변경
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            
            <input
            onChange={handleUploadImage}
            type='file'
            ref = {inputOpenImageRef}
            style={{display:'none'}}
            accept='image/jpeg, imahe/png' //jpeg 랑 png 파일만 업로드 가능
            />

        
        </div>
    )
}

export default UserPanel