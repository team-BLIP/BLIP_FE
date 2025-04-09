import "../../CSS/DateTeam.css";
import { color } from "../../../style/color";
import { typography } from "../../../fonts/fonts";
import { useState } from "react";

const DateTeamJoinNo = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);

  const startDay = new Date(firstDayOfMonth);
  startDay.setDate(1 - firstDayOfMonth.getDay());

  const lastDayOfMonth = new Date(year, month + 1, 0);

  const endDay = new Date(lastDayOfMonth);
  endDay.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

  const groupDatesByWeek = (startDay, endDay) => {
    const weeks = []; 
    let currentWeek = []; 
    let currentDay = new Date(startDay); 

    while (currentDay <= endDay) {
      currentWeek.push(new Date(currentDay)); 
      if (currentWeek.length === 7 || currentDate.getDay() === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentDay.setDate(currentDay.getDate() + 1); 
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek); 
    }

    return weeks; 
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
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
            </h2>
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
