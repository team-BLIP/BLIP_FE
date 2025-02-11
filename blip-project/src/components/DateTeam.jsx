import "./CSS/DateTeam.css";
import { color } from "../style/color";
import { typography } from "../fonts/fonts";
import { useState } from "react";

const DateTeamJoinNo = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  //달의 첫 날
  const firstDayOfMonth = new Date(year, month, 1);

  //달력 시작을 일욜로 지정
  const startDay = new Date(firstDayOfMonth);
  startDay.setDate(1 - firstDayOfMonth.getDay());

  //달의 막 날
  const lastDayOfMonth = new Date(year, month + 1, 0);

  //달력 마지막을 토욜로 지정
  const endDay = new Date(lastDayOfMonth);
  endDay.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

  const groupDatesByWeek = (startDay, endDay) => {
    const weeks = []; //주 단위: 최종
    let currentWeek = []; //주 단위 : 현재 주
    let currentDay = new Date(startDay); // 시작 날짜로 초가화

    while (currentDay <= endDay) {
      currentWeek.push(new Date(currentDay)); // 현재 날짜를 현재 주의 추가
      if (currentWeek.length === 7 || currentDate.getDay() === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentDay.setDate(currentDay.getDate() + 1); //현재 날짜를 담날로 변경
    }
    // 마지막 주 처리 (만약 남아있다면)
    if (currentWeek.length > 0) {
      weeks.push(currentWeek); // 남아 있는 날짜가 있다면 마지막 주로 weeks에 추가
    }

    return weeks; // 주 단위로 그룹화된 날짜 배열들을 반환
  };

  const handlePrevMonth = () => {
    //이전 달 이동
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    //담 달 이동
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  return (
    <>
      <div
        className="DateTeamJoinNos"
        style={{
          "--error-400": color.Error[0],
          "--gray-100": color.GrayScale[1],
          "--gray-300": color.GrayScale[3],
          "--gray-800": color.GrayScale[8],
        }}
      >
        <div className="calendar-header">
          <div className="year-month" style={typography.Title3}>
            <h2 className="year">{year}년</h2> {/* 년도 */}
            <h2 className="month">
              {currentDate.toLocaleString("default", { month: "long" })}
            </h2>{" "}
            {/* 월 */}
          </div>
          <div className="month-navigation">
            <button onClick={handlePrevMonth} className="nav-button">
              &lt;
            </button>
            <button onClick={handleNextMonth} className="nav-button">
              &gt;
            </button>
          </div>
        </div>
        <div className="header-divider"></div>
        <div className="calendar-grid" style={typography.Title3}>
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div key={day} className="calendar-day-header">
              {day}
            </div>
          ))}
          {groupDatesByWeek(startDay, endDay).map((week, weekIndex) => (
            <div key={weekIndex} className="calendar-week">
              {week.map((date, dayIndex) => {
                const isSelected =
                  selectedDate &&
                  date.toDateString() === selectedDate.toDateString(); // 선택된 날짜인지 확인
                return (
                  <div style={typography.Title3}
                    key={dayIndex}
                    className={`calendar-day ${
                      date.getMonth() !== month ? "other-month" : ""
                    } ${
                      date.getDay() === 0 && date.getMonth() !== month
                        ? "sunday-other-month"
                        : date.getDay() === 0
                        ? "sunday"
                        : ""
                    } ${isSelected ? "selected" : ""}`} // 선택된 날짜는 "selected" 클래스 추가
                    onClick={() => handleDateClick(date)} // 날짜 클릭 이벤트
                  >
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DateTeamJoinNo;
