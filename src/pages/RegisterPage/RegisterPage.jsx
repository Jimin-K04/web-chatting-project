import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { createUserWithEmailAndPassword, getAuth, updateProfile} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import app, { db } from '../../firebase'
import md5 from 'md5';
import { setUser } from '../../store/userSlice';
import { useDispatch } from 'react-redux';

function RegisterPage() {

    const dispatch = useDispatch();
    const auth = getAuth(app)
    const [loading, setLoading] = useState(false);
    const [errorFromSubmit, setErrorFromSubmit] = useState(""); //일단 빈 string
    //error 발생시, errorFromSubmit 이 true 가 됨

    const{
        register,
        watch,
        formState: {errors},
        handleSubmit
    } = useForm();

    //전송버튼을 누를시 backend 로 사용자 정보를 전송해 사용자 생성.
    const onSubmit = async(data) => {
        try{
            setLoading(true);
            //firebase 에서 제공하는 함수
            const createdUser = await createUserWithEmailAndPassword(auth, data.email, data.password)
            console.log(createdUser);

            //current user 의 user profile 을 업데이트 해줌,
            await updateProfile(auth.currentUser, {
                displayName: data.name,
                //md5 는 유니크한 값을 반환함, gravatar 에서 유니크한 프로필 아바타를 가져옴
                photoURL: `http://gravatar.com/avatar/${md5(
                 createdUser.user.email)}?d=identicon`  
            })
            
            //회원가입시 프로필이 바로 보이지 않는 이유..? 나중에 에러 잡자자
            const userData = {
                uid: createdUser.user.uid,
                displayName: createdUser.user.displayName,
                photoURL: createdUser.user.photoURL,
            }
            dispatch(setUser(userData))


            
            //database 연결 -ref : 참조 ****??
            set(ref(db, `users/${createdUser.user.uid}`), {
                name: createdUser.user.displayName,
                image: createdUser.user.photoURL
            })
            
            
        } catch(error){
            console.error(error);
            //error 에 대한 메세지를 화면에 띄우고 싶을때 -> 새로운 state 만들기
            setErrorFromSubmit(error.message); //setErrorFromSubmit 부분에 error message 가 들어감,  
            setTimeout(() => {
                setErrorFromSubmit("");
            }, 3000); //3초후 메세지 에러 메세지 지워주기기
        } finally{
            setLoading(false);
        }
        
    } // 이 함수를 handleSubmit 에 넣으면 form 정보를 가져와 data 에 넣는다

    
  return (
    <div className = 'auth-wrapper'>

        <div style={{textAlign: 'center'}}>
            <h3>Register</h3>
        </div>
        {/* 원래 제출버튼 클릭시 form 에있는 데이터를 전송해야하는데 그 역할을 하는 handleSubmit을 react-hook-form 에서 제공해줌 */}
        <form onSubmit={handleSubmit(onSubmit)}> 


            <label htmlFor='email'>Email</label>
            <input
            name='email'
            type='email'
            id='email'
            {...register("email", {required: true, pattern: /^\S+@\S+$/i})} //email 정규식 체크
            />
            {/* 에러이면 경고메세지 */}
            {errors.email && <p>This email field is required</p>}


            <label htmlFor='name'>Name</label>
            <input
            name='text'
            type='name'
            id='name'
            {...register("name", {required: true, maxLength: 10})}
            />
            {/* 두가지 유효성 검사에 대한 에러 모두 체크크 */}
            {errors.name && errors.name.type === "required" && <p>This name field is required</p>}
            {errors.name && errors.name.type === "maxLength" && <p>Your input exceed maximum length</p>}


            <label htmlFor='password'>Password</label>
            <input
            name='password'
            type='password'
            id='password'
            {...register("password", {required: true, minLength: 6})}
            />
            {errors.password && errors.password.type === "required" && <p>This password field is required</p>}
            {errors.password && errors.password.type === "minLength" && <p>Password must have at least 6 characters</p>}


            {errorFromSubmit && 
            <p>{errorFromSubmit}</p>}


            {/*setloading 을 true 로 바꿔서 회원가입 동안은 제출 버튼을 못누르게 함(input 태그 비활성화화) */}
            <input type='submit' disabled={loading}/>
            {/*a 테그를 이용하면 페이지가 refresh 되면서 이동하는데 react-router-dom 에서 제공하는 링크를 이용하면 history api 를 사용하기 때문에 페이지가 리프레쉬 없이 이동하게 됨*/}
            <Link style={{color: 'gray', textDecoration: 'none'}} to={'/login'}>이미 아이디가 있나요?</Link>

        </form>
    </div>
  )
}

export default RegisterPage