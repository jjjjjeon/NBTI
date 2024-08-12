import { useEffect, useState } from 'react';
import styles from './Home.module.css';
import axios from 'axios';
import { host } from '../../../../../../config/config';
import { format } from 'date-fns';
import { ApprovalModal } from '../ApprovalModal/ApprovalModal';
import { HomeApprovalModal } from '../HomeApprovalModal/HomeApprovalModal';
import { ListDoc } from '../ListDoc/ListDoc';
import { useNavigate } from 'react-router-dom';


export const Home = ()=>{

    const [showModal, setShowModal] = useState(false);
    const [approvalData, setApprovalData] = useState([]);  
    const [lists, setLists] = useState([]);
    const [listss, setListss] = useState([]);
    const navi = useNavigate();
    
    useEffect(()=>{
        axios.get(`${host}/approval/getApprovalWait`)
        .then((resp)=>{
            setApprovalData(resp.data);
            console.log("홈 목록출력",resp.data);
        })
    },[])

    useEffect(()=>{
        axios.get(`${host}/approval/getWriterIsMe`)
        .then((resp)=>{
            setLists(resp.data);
            console.log("홈 기안문서출력",resp.data);
        })
    },[])

    useEffect(()=>{
        axios.get(`${host}/approval/getReferIsMe`)
        .then((resp)=>{
            setListss(resp.data);
            console.log("홈 참조문서출력",resp.data);
        })
    },[])


    const HandleSubmit = (e) =>{
        setShowModal(true);
    }

    const handleCloseModal = () => {
        setShowModal(false); // 모달 닫기
        window.location.reload();
    };

    const renderDocStateBadge = (docState) => {
        switch (docState) {
            case 'p':
                return <div className={styles.state_badge_gray}>결재 완료</div>;
            case 'r':
                return <div className={styles.state_badge_red}>결재 반려</div>;
            default:
                return <div className={styles.state_badge_green}>결재진행중</div>;
        }
    };

    const handleMove = (tempSeq, docSubName) => {
        navi("/approval/detail", {state:{seq:tempSeq, setlist:docSubName, list:"doc"}});
    };

    console.log("approvalData length:", approvalData.length);


    return(
        <div className={styles.container}>
            <div className={styles.title}>전자결재</div>
            <div className={styles.bubble_box}>
                {
                    approvalData.length !== 0 ?
                    approvalData.map((approval)=>{
                        return(
                            <div className={styles.bubble}>
                                <div className={styles.bubble_state}>
                                    {
                                        approval.emergency == "Y  " ?  <div className={styles.emergency_badge_bubble}>긴급</div> :"" 
                                    }
                                </div>
                                <div className={styles.bubble_title}>
                                    {approval.title != null ? approval.title : approval.doc_sub_name}
                                </div>
                                <div className={styles.approvaler}>
                                    <div className={styles.approvaler_title}>작성자</div>
                                    <div className={styles.approvaler_content}>{approval.name}</div>
                                </div>
                                <div className={styles.approval_date}>
                                    <div className={styles.date_title}>작성일</div>
                                    <div className={styles.date_content}>
                                    {
                                        format(new Date(approval.approval_date), 'yyyy-MM-dd')
                                    }
                                    </div>     
                                </div>
                                <div className={styles.btn}>
                                    <button onClick={HandleSubmit}>결재하기</button>
                                </div>
                                {showModal && <HomeApprovalModal onClose={handleCloseModal} seq={approval.temp_seq} setlist={approval.doc_sub_name} />}
                            </div>
                        );
                    })
                    :
                    <div className={styles.bubble_empty}> 결재할 문서가 없습니다.</div>
                }

            </div>
            <hr></hr>
            <div className={styles.draft_box}>
                <div className={styles.sub_title}>
                    최근 기안 문서
                </div>
                <div className={styles.sub_content}>
                    <div className={styles.head}> 
                        <div className={styles.date}>기안일</div>
                        <div className={styles.form}> 결재양식</div>
                        <div className={styles.emergency}> 긴급</div>
                        <div className={styles.content_title}> 제목</div>
                        <div className={styles.file}> 첨부</div>
                        <div className={styles.writer}> 기안자</div>
                        <div className={styles.doc_number}> 문서번호</div>
                        <div className={styles.doc_state}> 문서상태</div>
                    </div>
                    <div className={styles.body}>
                    { 
                        lists.map((list)=>{
                            return(
                                <div className={styles.list}>
                                    <div className={styles.date}>
                                    {
                                        format(new Date(list.approval_date),'yyyy-MM-dd')
                                    }
                                    </div>
                                    <div className={styles.form}>{list.doc_sub_name}</div>
                                    <div className={styles.emergency}>
                                            {
                                                list.emergency == "Y  " ?  <div className={styles.emergency_badge}>긴급</div> :"" 
                                            }
                                    </div>
                                    <div className={styles.content_title} onClick={() => handleMove(list.temp_seq, list.doc_sub_name)}>
                                        {
                                            list.title !== null ? list.title : list.doc_sub_name 
                                        }
                                        <input type='hidden' value={list.temp_seq}></input>
                                        <input type='hidden' value={list.doc_sub_name}></input>
                                    </div>
                                    <div className={styles.file}>Y</div>
                                    <div className={styles.writer}> {list.name}</div>
                                    <div className={styles.doc_number}>{list.approval_seq}</div>
                                    <div className={styles.doc_state}>
                                        {renderDocStateBadge(list.doc_state)}
                                    </div>
                                </div>
                            );

                        }) 
                    } 
                    </div>
                </div>
            </div>
            <hr></hr>
            <div className={styles.doc_box}>
                <div className={styles.sub_title}>
                    참조/ 열람 대기
                </div>
                <div className={styles.sub_content}>
                        <div className={styles.head}> 
                            <div className={styles.date}>기안일</div>
                            <div className={styles.form}> 결재양식</div>
                            <div className={styles.emergency}> 긴급</div>
                            <div className={styles.content_title}> 제목</div>
                            <div className={styles.file}> 첨부</div>
                            <div className={styles.writer}> 기안자</div>
                            <div className={styles.doc_number}> 문서번호</div>
                            <div className={styles.doc_state}> 문서상태</div>
                        </div>
                        <div className={styles.body}>
                        { 
                            listss.map((list)=>{
                                return(
                                    <div className={styles.list}>
                                        <div className={styles.date}>
                                        {
                                            format(new Date(list.approval_date),'yyyy-MM-dd')
                                        }
                                        </div>
                                        <div className={styles.form}>{list.doc_sub_name}</div>
                                        <div className={styles.emergency}>
                                                {
                                                    list.emergency == "Y  " ?  <div className={styles.emergency_badge}>긴급</div> :"" 
                                                }
                                        </div>
                                        <div className={styles.content_title} onClick={() => handleMove(list.temp_seq, list.doc_sub_name)}>
                                        {
                                            list.title !== null ? list.title : list.doc_sub_name 
                                        }
                                        <input type='hidden' value={list.temp_seq}></input>
                                        <input type='hidden' value={list.doc_sub_name}></input>
                                        </div>
                                        <div className={styles.file}>Y</div>
                                        <div className={styles.writer}> {list.name}</div>
                                        <div className={styles.doc_number}>{list.approval_seq}</div>
                                        <div className={styles.doc_state}> {renderDocStateBadge(list.doc_state)}</div>
                                        
                                    </div>
                                );

                            }) 
                        } 
                        </div>
                </div>
            </div>
        </div>
    );
}