import moment from 'moment'
import React from 'react'
import { Image } from 'react-bootstrap'

//메세지 와 유저를 인자로 받아온다.
function Message({message, user}) {

    //메세지 전송시간 라이브러리 : moment
    const timeFromNow = timestamp => moment(timestamp).fromNow();
    //화면에 보이고자하는 데이터가 이미지인지 아닌지
    const isImage = message => {
        if(message.image) {
            return true;
        }
        return false;
    }

    //본인 메세지 인지 확인
    const isMessageMine = (messsage, user) => {
        if(user) {
            return message.user.id === user.uid
        }
    }


  return (
    <div style={{
        margin: '16px 0', 
        display: 'flex',
        flexDirection: isMessageMine(message, user) ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        
    }}>
        {/* 메세지 창에서 프로필이미지 */}
        <Image
            roundedCircle
            style={{width: 40, height: 40, margin: 3, border: '2px solid #ddd'}}
            src = {message.user.image}
            alt ={message.user.name}
        />
    <div  style={{
                marginRight : isMessageMine(message, user) ? 10 : 0,
                marginLeft : isMessageMine(message, user) ? 0 : 10,
                maxWidth: '60%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMessageMine(message, user) ? 'flex-end' : 'flex-start'
            }}>

            {/* 이름 */}
            <h6
                style={{color: isMessageMine(message, user) ? "rgb(123,131,235)": ""}}
            >
                {message.user.name}{" "}

                {/* 현재로부터 시간 */}
                <span
                    style={{fontSize: 10, color: 'gray'}}
                >
                    {timeFromNow(message.timestamp)}
                </span>
            </h6>

            {/* 채팅창 내용 이미지, 텍스트 */}
            { isImage(message) ? 
            <img
                style={{maxWidth: 300, borderRadius: 10,  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}
                alt = '이미지'
                src={message.image}
            />
            :
            <p style={{
                backgroundColor: isMessageMine(message, user) ? '#959AF3' : '#f1f1f1',
                color: isMessageMine(message, user) ? 'white' : '#333',
                padding: '10px 15px',
                borderRadius: '18px',
                margin: 0,
                maxWidth: '100%',
                wordBreak: 'break-word',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
                {message.content}
            </p>
        }
        </div>
    </div>
  )
}

export default Message