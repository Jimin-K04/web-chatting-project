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
    <div style={{margin: '16px 0', display: 'flex'}}>
        {/* 메세지 창에서 프로필이미지 */}
        <Image
            roundedCircle
            style={{width: 40, height: 40, margin: 3}}
            src = {message.user.image}
            alt ={message.user.name}
        />
    <div style={{marginLeft: 11}}>

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
                style={{maxWidth: 300, borderRadius: 10}}
                alt = '이미지'
                src={message.image}
            />
            :
            <p>
                {message.content}
            </p>
        }
        </div>
    </div>
  )
}

export default Message