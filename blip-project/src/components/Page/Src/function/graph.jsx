import { color } from "../../../../style/color";
import { typography } from "../../../../fonts/fonts";
import React from "react";
import ReactApexChart from "react-apexcharts";
import GraphImg from "../../../../svg/Graph.svg";

const Graph = () => {
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
      colors: [color.Main[0], color.Main[4]],
    },
  });
  return (
    <div className="council-graph" style={{ "--gray-200": color.GrayScale[2] }}>
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
      <img src={GraphImg} />
    </div>
  );
};

export default Graph;
