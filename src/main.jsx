import { StrictMode } from 'react'
import ReactDom from 'react-dom/client'
import './index.css'
import App from './App'
import {BrowserRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import {store} from './store'
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDom.createRoot(document.getElementById('root')).render(
  <Provider store ={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
  ,
)

//모든 컴포넌트에서 리덕스 스토어에 있는 값을 가져와서 사용하고 업데이트 하기 위해 모든 컴포넌트를 감싸줘야함 -> provider 로 감싸기, store 객체 넣어주기기