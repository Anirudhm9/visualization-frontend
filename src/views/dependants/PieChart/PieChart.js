/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Button } from '@material-ui/core';
import ReactEcharts from 'echarts-for-react';
import { LoadingScreen } from 'components/index';

//Config
let config = {
  name: "v1",
  type: "pie",             //can choose from "pie", "donut"
  roseType: false,         //to make slices look like rose petals
  title: 'V1',      //title of the viz
  titlePosition: 'center', //position for title, can choose from "left", "center", "right"
  tooltip: true,           //enable/disable tooltip
  legend: true,            //show/hide legend
  animation: false,        //enable/disable hover animation
  selected: 5,              //default number of selected items
  // data: _data,
  filter: "HAVING",    //greater, less, having, equal
  vc: [{
    name: "v2",
    operations: [
      {
        opName: "having",
        opValue: "name"
      }
    ]
  }]
};

const PieECharts = ({ title, data, config, setOpValue }) => {
  const [option, setOption] = useState();

  useEffect(() => {
    if (config !== undefined && config !== null) {
      setOption({
        title: {
          text: title ? title : config.title,
          left: config.titlePosition,
        },
        tooltip: config.tooltip && config.tooltip === true ? {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        } : false,
        legend: config.legend && config.legend === true ? {
          // orient: 'vertical',
          bottom: 20,
          left: 'right',
          data: data.map(function (obj) {
            return obj.name;
          }),
          selected: data.map(function (obj) {
            return obj.name;
          }).reduce(function (acc, curr, index) {
            acc[curr] = index > (config.selected ? config.selected : 5) - 1 ? false : true;
            return acc;
          }, {})
        } : false,
        animation: config.animation && config.animation ? config.animation : false,
        series: [
          {
            type: 'pie',
            roseType: config.roseType && config.roseType === true ? "radius" : false,
            radius: config.type && config.type === "donut" ? ['45%', '65%'] : '65%',
            center: ['50%', '50%'],
            bottom: 40,
            selectedMode: 'single',
            data: data,
            label: {
              position: 'outer',
              alignTo: 'labelLine',
              margin: 20
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      });
    }
  }, [config, data, title]);

  const click = (e) => {
    if (config.name === "v1") {
      if (e.data && e.data.name) {
        let temp = e.data;
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


export const PieChart = (props) => {
  const [opValue, setOpValue] = useState();
  const [edata, setEdata] = useState();
  const [econfig, setConfig] = useState(config);
  const [title, setTitle] = useState();

  useEffect(() => {
    if (opValue !== undefined && opValue !== null && opValue !== '') {
      props.setFilter(opValue);
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
    <>{edata !== undefined && edata !== null ? <Container maxWidth="sm" style={{ marginTop: '1vh' }}>
      <Grid container direction="row" alignItems="center" spacing={2}>
        <Grid item>
          <Button variant="contained" color="primary"
            onClick={() => {
              props.reset();
            }} >Reset</Button>
        </Grid>
      </Grid>
      <PieECharts title={title ? title : null} data={edata} config={econfig} setOpValue={setOpValue} />
    </Container> : <Typography>No Data present!</Typography>}</>
  );

  return content;
};