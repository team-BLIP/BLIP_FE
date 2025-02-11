import "./CSS/StartTeam.css";
import { typography } from "../fonts/fonts";
import { color } from "../style/color";
import Member from "./Member";
import Feedback from "../svg/feedback.svg";
import Graph from "../svg/Graph.svg"
import React from "react";
import ReactApexChart from "react-apexcharts";

const StartTeam = () => {
  const [state, setState] = React.useState({
    series: [44],
    options: {
      chart: {
        type: "donut",
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  });

  return (
    <div className="start-main">
      <Member />
      <div className="council">
        <div className="council-keyword">
          <div className="council-keyword-main">
            <div style={{ ...typography.Body2 }}>
              회의 일정 및 키워드 요약 확인하기
            </div>
            <p
              style={{ ...typography.Body3Regular, color: color.GrayScale[6] }}
            >
              진행한 회의를 바탕으로 캘린더에 키워드를 추가했어요!
            </p>
            <button
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
              style={{ ...typography.Button3, "--main-400": color.Main[4] }}
            >
              확인하기
            </button>
          </div>
          <img src={Feedback} />
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
    </div>
  );
  
};

export default StartTeam;

