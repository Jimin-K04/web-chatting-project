import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { getAuth, signInWithEmailAndPassword} from 'firebase/auth';
import app from '../../firebase'


function LoginPage() {
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
            //firebase 에서 제공해주는 login 함수
            await signInWithEmailAndPassword(auth, data.email, data.password);
            
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
                <h3>Login</h3>
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
                <Link style={{color: 'gray', textDecoration: 'none'}} to={'/register'}>아직 아이디가 없다면...</Link>
    
            </form>
        </div>
      )
}

export default LoginPage