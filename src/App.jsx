//React-router-dom 활용
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import ChatPage from './pages/ChatPage/ChatPage'
import LoginPage from './pages/LoginPage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import { useEffect } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import app from './firebase'
import { useDispatch } from 'react-redux'
import { clearUser, setUser } from './store/userSlice'

function App() {
  //이미 인증된 사람(로그인) 은 채팅 페이지로 보내주기
  const auth = getAuth(app);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if(user) {
        navigate('/'); //user 정보가 들어온다면 채팅 페이지로 보내기

        //action을 담아준다, type 과 payload
        dispatch(setUser({
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL
        }))
      } else {
        navigate('/login');
        dispatch(clearUser())
      }
    })
    //onAuthStateChanged 가 반환하는 것이 unsubscribe 임, 한번 호출하고 다시 페이지가 렌더링 될때 호출되는 것을 막기 위해
    return () => {
      unsubscribe();
    }
  }, [])
  

  return (
    // Routes: 경로를 찾아서 렌더링 해주는 역할
    <Routes> 
      <Route path = '/' element = {<ChatPage/>}/>
      <Route path = '/login' element = {<LoginPage/>}/>
      <Route path = '/register' element = {<RegisterPage/>}/>
    </Routes>
  )
}

export default App
