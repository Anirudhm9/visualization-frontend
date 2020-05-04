/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';
import ReactEcharts from 'echarts-for-react';
import { LoadingScreen } from 'components/index';

//Config
let config = {
  name: "v1",
  title: 'bar',            //title of the viz
  titlePosition: 'center', //position for title, can choose from "left", "center", "right"
  tooltip: true,           //enable/disable tooltip
};

const BarECharts = ({ title, data, config, setOpValue, xType, yType }) => {
  const [option, setOption] = useState();

  useEffect(() => {
    if (config !== undefined && config !== null) {
      setOption({
        title: {
          text: title ? title : config.title,
          left: config.titlePosition,
        },
        grid: {
          bottom: 90
        },
        dataZoom: data.length > 25 ? [{
          type: 'inside'
        }, {
          type: 'slider'
        }] : false,
        tooltip: config.tooltip && config.tooltip === true ? {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        } : false,
        xAxis: {
          type: xType !== undefined && xType !== null ? xType : 'category',
          data: xType !== undefined && xType !== null ? xType === "category" ? data.map(function (obj) {
            return obj.name;
          }) : null : data.map(function (obj) {
            return obj.name;
          }),
          silent: data.length > 25 ? false : true,
          splitLine: {
            show: true
          },
          splitArea: {
            show: false
          }
        },
        yAxis: {
          type: yType !== undefined && yType !== null ? yType : 'value',
          data: yType !== undefined && yType !== null ? yType === "category" ? data.map(function (obj) {
            return obj.name;
          }) : null : null,
          splitArea: {
            show: false
          }
        },
        series: [
          {
            type: 'bar',
            bottom: 40,
            data: data.map(function (obj) {
              return obj.value;
            }),
            large: data.length > 25 ? true : false
          }
        ]
      });
    }
  }, [config, data, title, xType, yType]);

  const click = (e) => {
    if (config.name === "v1") {
      if (e.name && e.value) {
        let temp = {};
        temp.name = e.name;
        temp.value = e.value;
        temp.color = e.color;
        setOpValue(temp);
      }
      return;
    } else return;
  };

  let onEvents = {
    "click": click
  };

  return option !== undefined && option !== null ? <ReactEcharts option={option} onEvents={onEvents} /> : <LoadingScreen />;
};


export const BarChart = (props) => {
  const [opValue, setOpValue] = useState();
  const [edata, setEdata] = useState();
  const [econfig, setConfig] = useState(config);
  const [title, setTitle] = useState();

  useEffect(() => {
    if (opValue !== undefined && opValue !== null && opValue !== '') {
      props.setFilter(opValue);
      setOpValue();
    }
  }, [opValue, props]);

  useEffect(() => {
    setConfig(config);
  }, []);

  useEffect(() => {
    if (props.data !== null && props.data !== undefined) {
      setTitle(props.title);
      setEdata(props.data);
    }
  }, [props]);

  let content = (
    <>{edata !== undefined && edata !== null && edata.length > 0 ?
      <BarECharts title={title ? title : null} data={edata} config={econfig} setOpValue={setOpValue}
        xType={props.xType ? props.xType : "category"}
        yType={props.yType ? props.yType : "value"} />
      // : <Typography>Not enough data for bar chart!</Typography>
      : <Typography>No Data present!</Typography>}</>
  );

  return content;
};