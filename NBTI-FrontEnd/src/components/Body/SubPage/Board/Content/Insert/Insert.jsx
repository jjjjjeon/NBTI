import axios from "axios";
import BoardEditor from "../../../../BoardEditor/BoardEditor";
import styles from "./Insert.module.css";
import { useState, useEffect } from "react";
import { host } from "../../../../../../config/config";
import { useNavigate } from "react-router-dom";

export const Insert = () => {

  const navi = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false); // 팝업 창 열림/닫힘 상태 관리
  const [isAdmin, setIsAdmin] = useState(false); // 권한 여부 상태
  const [currentUser, setCurrentUser] = useState(null); // 로그인된 사용자 정보 상태

  // 팝업 창을 여는 함수
  const openPopup = () => {
    setIsPopupOpen(true);
  };
  // 팝업 창을 닫는 함수
  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const [board, setBoard] = useState({
    title: "",
    contents: "",
    board_code: 1,
  });

  // 글 입력
  const handleInput = (e) => {
    const { name, value } = e.target;
    setBoard((prev) => {
      return { ...prev, [name]: value };
    });
  };

  // 글 입력 추가버튼
  const handleAddBtn = () => {
    if (board.title.trim() === "" || board.contents.trim() === "") {
      alert("제목, 내용을 작성해주세요");
      return; // 유효성 검사 통과하지 못하면 함수 종료
    }
    axios.post(`${host}/board`, board).then((resp) => {
      alert("글이 작성되었습니다.");
      navi("/board/free");
    });
  };


  // 로그인 한 사용자 정보 및 HR 권한 확인
  useEffect(() => {
    axios.get(`${host}/members`).then((resp) => {

      // HR 권한 확인
      axios.get(`${host}/members/selectLevel`).then((resp1) => {
        const hrStatus = resp1.data[parseInt(resp.data.member_level) - 1]?.hr; // 배열의 n번째 요소에서 hr 확인

        if (hrStatus === "Y") {
          setIsAdmin(true); // Y일 때 true
        }
      });
    });
  }, []);


  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div>
          {/* 관리자일 때 보이는 공지게시판 글쓰기용 체크박스 */}
          {isAdmin && (
            <label>
              <input type="checkbox" />
              <p>공지 게시판</p>
            </label>
          )}
        </div>
        <div>
          <p onClick={openPopup}>임시보관 된 게시물 ( 0 )</p>
        </div>
      </div>
      <div className={styles.top}>
        <div className={styles.left}>
          <p>제목</p>
          <input
            type="text"
            name="title"
            value={board.title}
            maxLength={30}
            placeholder="30자 이하의 제목을 입력하세요."
            onChange={handleInput}
          />
          <p className={styles.tempSave}>임시저장 : 2024-07-26-17:13</p>
        </div>
        <div className={styles.right}>
          <div className={styles.btns}>
            <button>임시저장</button>
            <button onClick={handleAddBtn}>작성완료</button>
          </div>
        </div>
      </div>
      <div className={styles.files}>
        <div>
          <input type="file" />
        </div>
      </div>
      <div className={styles.contents}>
        <BoardEditor setBoard={setBoard} />
      </div>

      {/* 팝업 창 */}
      {isPopupOpen && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h3>임시 저장된 글 목록</h3>
            <div className={styles.tempSaveList}>
              <div>
                <div className={styles.tempSaveTitle}>임시저장 예시 111</div>
                <div className={styles.tempSaveTime}>2024-07-20 14:20</div>
                <div className={styles.tempSaveBtns}>
                  <button className={styles.mod}>수정</button>
                  <button className={styles.del}>삭제</button>
                </div>
              </div>
            </div>
            <span>
              저장된 글은 최대 10개까지 저장되며, 가장 오래된 순서대로
              삭제됩니다. <br />
              첨부한 이미지나 파일은 저장되지 않습니다.
            </span>
            <button onClick={closePopup}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};
