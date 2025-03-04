import "./CSS/UserStart.css";
import { typography } from "../fonts/fonts";
import { color } from "../style/color";
import FeedbackSvg from "../svg/feedback.svg";
import Graph from "../svg/Graph.svg";
import React from "react";
import ReactApexChart from "react-apexcharts";
import { useContext } from "react";
import { UseStateContext } from "../Router";
import Feedback from "./Feedback";
import Keyword from "./keyword";

const UserStart = () => {
  const [state, setState] = React.useState({
    series: [5, 95], // 두 개의 값을 사용
    options: {
      chart: {
        type: "donut",
      },
      labels: [], // 레이블을 빈 배열로 설정하여 외부 레이블 제거
      plotOptions: {
        pie: {
          donut: {
            size: "60%", // 도넛 크기 설정
            labels: {
              show: true, // 가운데 값 표시
              name: {
                show: false, // 이름은 숨김
              },
              value: {
                show: true, // 값 표시
                fontSize: "22px", // 값의 폰트 크기
                fontWeight: "bold", // 값의 폰트 굵기
                color: color.Main[4], // 값의 색상
              },
              total: {
                show: true, // 총합 표시하지 않음
                label: "Total", // 이 부분은 총합 레이블 설정
                formatter: function (w) {
                  return `${w.globals.series[1]}%`; // 첫 번째 값만 표시
                },
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: false, // 데이터 라벨을 비활성화하여 값만 나타나게 함
      },
      legend: {
        show: false,
      },
      colors: [color.Main[1], color.Main[4]],
    },
  });

  const {
    setting,
    setSetting,
    isAlarm,
    setIsAlarm,
    isLetter,
    setIsLetter,
    isFeedback,
    setIsFeedback,
    isKeyword,
    setIsKeyword,
  } = useContext(UseStateContext);

  const onClickFeedback = () => {
    setIsFeedback((preState) => !preState);
    if (isLetter === true) {
      setIsLetter((preState) => !preState);
    } else if (setting === true) {
      setSetting((preState) => !preState);
    } else if (isAlarm === true) {
      setIsAlarm((preState) => !preState);
    } else if (isKeyword === true) {
      setIsKeyword((preState) => !preState);
    }
  };

  const onClickKeyword = () => {
    setIsKeyword((preState) => !preState);
    if (isLetter === true) {
      setIsLetter((preState) => !preState);
    } else if (setting === true) {
      setSetting((preState) => !preState);
    } else if (isAlarm === true) {
      setIsAlarm((preState) => !preState);
    } else if (isFeedback === true) {
      setIsFeedback((preState) => !preState);
    }
  };

  return (
    <>
      {isFeedback ? (
        <Feedback />
      ) : isKeyword ? (
        <Keyword />
      ) : (
        <div className="council">
          <div className="council-keyword">
            <div className="council-keyword-main">
              <div style={{ ...typography.Body2 }}>
                회의 일정 및 키워드 요약 확인하기
              </div>
              <p
                style={{
                  ...typography.Body3Regular,
                  color: color.GrayScale[6],
                }}
              >
                진행한 회의를 바탕으로 캘린더에 키워드를 추가했어요!
              </p>
              <button
                onClick={onClickKeyword}
                style={{ ...typography.Button3, "--main-400": color.Main[4] }}
              >
                확인하기
              </button>
            </div>
          </div>
          <div
            className="council-feedback"
            style={{ "--gray-200": color.GrayScale[2] }}
          >
            <div className="council-feedback-main">
              <div>
                <div style={{ ...typography.Body2 }}>회의 피드백 확인하기</div>
                <p
                  style={{
                    ...typography.Body3Regular,
                    color: color.GrayScale[6],
                  }}
                >
                  진행한 회의를 피드백 해드릴게요!
                </p>
              </div>
              <button
                onClick={onClickFeedback}
                style={{ ...typography.Button3, "--main-400": color.Main[4] }}
              >
                확인하기
              </button>
            </div>
            <img src={FeedbackSvg} />
          </div>
          <div
            className="council-graph"
            style={{ "--gray-200": color.GrayScale[2] }}
          >
            <div className="council-graph-main">
              <div className="council-graph-font">
                <div style={{ ...typography.Body2 }}>회의 참여율 확인하기</div>
                <p
                  style={{
                    ...typography.Body3Regular,
                    color: color.GrayScale[6],
                  }}
                >
                  가장 최근 회의율은 <strong>95%</strong>입니다
                </p>
              </div>
              <div className="council-graph-graph">
                <ReactApexChart
                  options={state.options}
                  series={state.series}
                  type="donut"
                />
              </div>
              <div className="council-graph-dist"></div>
            </div>
            <img src={Graph} />
          </div>
        </div>
      )}
    </>
  );
};

export default UserStart;
