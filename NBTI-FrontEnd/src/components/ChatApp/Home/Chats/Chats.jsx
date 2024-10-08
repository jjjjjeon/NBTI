import styles from './Chats.module.css';
import { useAuthStore } from '../../../../store/store';
import { ChatsContext } from './../../../../Context/ChatsContext';
import axios from 'axios';
import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { host } from './../../../../config/config';
import avatar from '../../../../images/user.jpg';
import ChatsModal from './ChatsModal/ChatsModal';
import { useCheckList } from './../../../../store/store';
import { format } from 'date-fns';
const Chats = () => {
    const { loginID } = useAuthStore();
    const { setChatSeq, onMessage } = useCheckList();
    const { setChatNavi, chatNaviBody, dragRef } = useContext(ChatsContext);
    const [group_chats, setGroup_chats] = useState([]);

    const [modalDisplay, setModalDisplay] = useState(null);
    const modalRef = useRef([]);
    const [countBookmark, setCountBookmark] = useState(-1);
    const [countTotal, setCountTotal] = useState(0); //unread total
    useEffect(() => {
        axios.get(`${host}/group_chat`).then((resp) => {
            
            if (resp != null) {
                if (resp.data !== '' && resp.data !== 'error') {
                    //   console.log(resp.data);
                    let count = -1;
                    let countUnread = 0;
                    (resp.data).forEach((temp) => {
                        if (temp.bookmark === 'Y') count++;
                        countUnread += temp.unread;
                    })
                    setCountTotal(countUnread);
                    setCountBookmark(count);

                    resp.data.forEach((item,index)=>{ //member_img null이 뒤로가게 정렬
                        const sortedItems = item.list.sort((a, b) => {
                            if (a.member_img === null && b.member_img !== null) {
                                return 1; // b를 위로 이동
                            }
                            if (a.member_img !== null && b.member_img === null) {
                                return -1; // a를 위로 이동
                            }
                            return 0;
                        })
                        item=sortedItems;
                    })
                //    console.log(resp.data);
                    
                    setGroup_chats(resp.data);
                }
                else {
                    setGroup_chats([]);
                }
            }
        })
    }, [onMessage])

    const handleRightClick = (index) => (e) => {
        const rect = dragRef.current.getBoundingClientRect(); //부모요소~ 드래그 되는애
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.preventDefault();
        setModalDisplay((prev) => {
            if (prev != null) {
                prev.style.display = 'none'
            }
            modalRef.current[index].style.display = 'flex';
            modalRef.current[index].style.top = (y) + 'px';
            modalRef.current[index].style.left = (x) + 'px';
            return modalRef.current[index];
        });
    };

    const handleClick = () => {
        setModalDisplay((prev) => {
            if (prev != null) {
                prev.style.display = 'none'
            }
            return null;
        })
    }

    const handleDoubleClick = (seq) => () => {
        if (loginID === null) {
            setChatNavi('');
        }
        else {

            setChatNavi((prev) => {
                setChatSeq(seq);
                return 'chat';
            });
        }
    }

    const handleSort = useCallback(() => {
        const sortedItems = (group_chats).sort((a, b) => {
            // 북마크가 'Y'인 항목을 먼저 오게 하려면
            if (a.bookmark === 'Y' && b.bookmark === 'N') {
                return -1; // a를 위로 이동
            }
            if (a.bookmark === 'N' && b.bookmark === 'Y') {
                return 1; // b를 위로 이동
            }
            // 북마크가 동일한 경우, seq 값에 따라 정렬
            // 둘 다 북마크가 'Y'거나 둘 다 'N'인 경우
            if (a.bookmark === b.bookmark) {
                if (a.dto === null && b.dto === null) {
                    return 0; // 둘 다 null인 경우 순서를 변경하지 않음
                }
                if (a.dto === null) {
                    return 1; // a.dto가 null이면 a를 뒤로 보냄
                }
                if (b.dto === null) {
                    return -1; // b.dto가 null이면 b를 뒤로 보냄
                }
                // 둘 다 dto가 존재하면, seq 값으로 정렬
                return b.dto.seq - a.dto.seq;
            }
            return false;
        });
        // setCount(countBookmark);
        return sortedItems;
    }, [group_chats])

    const truncateHtmlText = (htmlString, maxLength) => {
        // HTML 문자열을 DOM 요소로 파싱
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        
        // 텍스트만 추출
        const textContent = doc.body.textContent || '';
      
        // 텍스트를 자르고 ... 추가
        const truncatedText = textContent.length > maxLength
          ? textContent.slice(0, maxLength) + '...'
          : textContent;
      
        return truncatedText;
      };


    //if(chatNaviBody==='chats')
    return (
        <div className={styles.container} onClick={handleClick}>
            {

                handleSort().map((item, index) => {
                    let formattedTimestamp = '';
                    if (item.dto != null) {
                        formattedTimestamp = format(new Date(item.dto.write_date), 'yyyy-MM-dd');
                    }

                    let truncatedText;
                    if ((item.dto != null) && (item.dto.message.length > 10)) {
                       
                        truncatedText =  truncateHtmlText(item.dto.message,10);
                        //item.dto.message.slice(0, 10) + '...';
                    }
                    else if ((item.dto != null)) {
                        truncatedText = item.dto.message;
                    }
                    return (
                        <React.Fragment key={index}>
                            <div className={styles.room} onContextMenu={handleRightClick(index)} onDoubleClick={handleDoubleClick(item.seq)}>
                                <div className={styles.imgContainer}>
                                    <div className={styles.imgList}>
                                        {
                                            item.list.slice(0, 2).map((member, imgIndex) => {
                                                if (item.list.length === 1) {
                                                    return (
                                                        <React.Fragment key={imgIndex}>
                                                            <img src={(member.member_img === null) ? `${avatar}` : `${host}/images/avatar/${member.id}/${member.member_img}`} alt=''
                                                                className={styles.avatartOne}></img>
                                                        </React.Fragment>
                                                    )
                                                }
                                                else {
                                                    return (
                                                        <React.Fragment key={imgIndex}>
                                                            <img src={(member.member_img === null) ? `${avatar}` : `${host}/images/avatar/${member.id}/${member.member_img}`} alt=''
                                                                className={styles.avatar}></img>
                                                        </React.Fragment>
                                                    )
                                                }

                                            })
                                        }
                                    </div>
                                    <div className={styles.imgList}>
                                        {
                                            item.list.slice(2, 4).map((member, imgIndex) => {

                                                return (
                                                    <React.Fragment key={imgIndex}>
                                                        <img src={(member.member_img === null) ? `${avatar}` : `${host}/images/avatar/${member.id}/${member.member_img}`} alt='' className={styles.avatar}></img>
                                                    </React.Fragment>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                                <div className={styles.message}>
                                    <div className={styles.name}>
                                        <div style={{ flex: 3 }}>
                                            {item.name}
                                        </div>
                                        <div className={styles.bookmark}>
                                            {item.bookmark === 'Y' ? <i className="fa-solid fa-bookmark"></i> : false}
                                        </div>
                                        <div className={styles.size}>
                                            {item.size}
                                        </div>

                                    </div>
                                    <div style={{ display: "flex" }}>
                                        <div className={styles.content} dangerouslySetInnerHTML={{ __html: (item.dto != null) ? truncatedText : '메세지가 없습니다' }}>
                                        </div>
                                        <div className={styles.unread}>
                                            {item.unread > 0 && (<span>{item.unread}+</span>)}
                                        </div>
                                    </div>

                                </div>
                                <div style={{ display: "flex", gap: "10px", paddingRight: "10px" }}>
                                    <div className={styles.write_date}>
                                        {formattedTimestamp}
                                    </div>
                                    <div className={styles.alarm}>
                                        {item.alarm === 'Y' ? (<i className="fa-solid fa-bell"></i>) : (<i className="fa-solid fa-bell-slash"></i>)}
                                    </div>
                                </div>

                            </div>
                            {index === countBookmark && (<div className={styles.line}></div>)}
                            <ChatsModal modalRef={modalRef} index={index} item={item} setGroup_chats={setGroup_chats} setCountBookmark={setCountBookmark} setCountTotal={setCountTotal}></ChatsModal>
                        </React.Fragment>
                    );
                })
            }
            {(countTotal > 0) && (<div className={styles.fixed}>{countTotal}+</div>)}
        </div>
    )
    /*
    else {
        return(
            <React.Fragment>
                 {(countTotal>0)&&(<div className={styles.fixed}>{countTotal}+</div>)}
            </React.Fragment>
        );
    }*/

}
export default Chats;