import React, { useState, useEffect } from 'react';
import { Grid, TextField, MenuItem, List, ListItem, ListItemText, ListItemIcon, Drawer } from '@material-ui/core';
// import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/scatter';
import 'echarts/lib/chart/effectScatter';
import 'echarts-leaflet';
import ReactEcharts from 'echarts-for-react';
import { data } from './data';
import 'leaflet/dist/leaflet.css';
// import XLSX from 'xlsx';
// import { make_cols } from './MakeColumns';
// import { SheetJSFT } from './types';
import { makeStyles } from '@material-ui/core/styles';
import { SketchPicker } from 'react-color';

import EventIcon from '@material-ui/icons/Event';
import PersonIcon from '@material-ui/icons/Person';
import ScheduleIcon from '@material-ui/icons/Schedule';
import MapIcon from '@material-ui/icons/Map';

const useStyles = makeStyles({
  card: {
    minWidth: 275,
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 5,
    marginTop: 5
  },
  button: {
    marginLeft: 10,
    marginRight: 10,
  },
  input: {
    display: 'none'
  }
});

// import EchartsLayer from 'echartslayer';

// var echartslayer = new EchartsLayer(map);
// echartslayer.chart.setOption(option);
// echartslayer.remove();






// var points = [].concat.apply([], data.map(function (track) {
//   return track.map(function (seg) {
//     return seg.coord.concat([1]);
//   });
// }));

// let option = {
//   animation: false,
//   leaflet: {
//     center: [120.13066322374, 30.240018034923],
//     zoom: 3,
//     roam: true,
//     layerControl: {
//       position: 'topleft'
//     },
//     tiles: [{
//       label: 'Open Street Map',
//       urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
//       options: {
//         attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
//       }
//     }, {
//       label: 'Open Street Map Hot',
//       urlTemplate: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
//       options: {
//         attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
//       }
//     }]
//   },
//   visualMap: {
//     show: false,
//     top: 'top',
//     min: 0,
//     max: 5,
//     seriesIndex: 0,
//     calculable: true,
//     inRange: {
//       color: ['blue', 'blue', 'green', 'yellow', 'red']
//     }
//   },
//   series: [{
//     type: 'heatmap',
//     coordinateSystem: 'leaflet',
//     data: points,
//     pointSize: 5,
//     blurSize: 6
//   }]
// };
const shapes = [
  'circle',
  'rect',
  'roundRect',
  'triangle',
  'diamond',
  'pin',
  'arrow',
];


export const Maps = () => {
  const classes = useStyles();
  // const [zoom, setZoom] = useState(false);
  // const [file, setFile] = useState({});
  // const [fileSelected, setFileSelected] = useState(true);
  // const [cols, setCols] = useState([]);
  const [dataToDisplay, setDataToDisplay] = useState([]);
  const [selectedYear, setSelectedYear] = useState('All');
  const [color, setColor] = useState('');
  const [option, setOption] = useState();
  const [open, setOpen] = useState(false);
  const [dialogData, setDialogData] = useState();
  const [shape, setShape] = useState('circle');
  useEffect(() => {
    var res = [];
    if (selectedYear === 'All') {
      for (let i = 0; i < data.length; i++) {
        let geoCoord = [data[i].attributes.LONGITUDE, data[i].attributes.LATITUDE];
        if (geoCoord) {
          res.push({
            name: data[i].attributes.ACCIDENT_DATE,
            value: geoCoord.concat(data[i].attributes.ACCIDENT_DATE, data[i].attributes.ACCIDENT_TIME, data[i].attributes.MALES, data[i].attributes.FEMALES),
            id: data[i].attributes.ACCIDENT_DATE
          });
        }
      }
    }
    else {
      for (let i = 0; i < data.length; i++) {
        let geoCoord = [data[i].attributes.LONGITUDE, data[i].attributes.LATITUDE];
        if (geoCoord) {
          if (data[i].attributes.ACCIDENT_DATE.split('/')[2] === String(selectedYear)) {
            res.push({
              name: data[i].attributes.ACCIDENT_DATE,
              value: geoCoord.concat(data[i].attributes.ACCIDENT_DATE, data[i].attributes.ACCIDENT_TIME, data[i].attributes.MALES, data[i].attributes.FEMALES),
              id: data[i].attributes.ACCIDENT_DATE
            });
          }
        }
      }
    }
    console.log(res);
    setDataToDisplay(res);
  }, [selectedYear]);

  // const handleFile = () => {
  //   /* Boilerplate to set up FileReader */
  //   const reader = new FileReader();
  //   const rABS = !!reader.readAsBinaryString;

  //   reader.onload = (e) => {
  //     /* Parse data */
  //     const bstr = e.target.result;
  //     const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });
  //     /* Get first worksheet */
  //     const wsname = wb.SheetNames[0];
  //     const ws = wb.Sheets[wsname];
  //     /* Convert array of arrays */
  //     const xlData = XLSX.utils.sheet_to_json(ws);
  //     /* Update state */
  //     setCols(make_cols(ws['!ref']));
  //     const temp = [];
  //     xlData.forEach(element => {
  //       temp.push({
  //         venueName: element['Venue Name'],
  //         venueType: element['Venue type'],
  //         venueAddress: element['Venue address'],
  //         latitude: element['Latitude'],
  //         longitude: element['Longitude'],
  //       });
  //     });
  //     setDataToDisplay(temp);
  //     setFileSelected(true);
  //     setFile({});
  //     console.log(temp);
  //   };


  //   if (rABS) {
  //     reader.readAsBinaryString(file);
  //   } else {
  //     reader.readAsArrayBuffer(file);
  //   }
  // };

  // useEffect(() => {
  //   console.log(zoom);
  // }, [zoom]);
  useEffect(() => {
    setOption(
      {
        title: {
          text: 'Accidents in Victoria',
          // subtext: 'data from PM25.in',
          // sublink: 'http://www.pm25.in',
          left: 'center'
        },
        animation: false,
        leaflet: {
          center: [144.7852, -37.4713],
          zoom: 9,
          roam: true,
          layerControl: {
            position: 'topleft'
          },
          tiles: [{
            label: 'Open Street Map',
            urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            options: {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            }
          }, {
            label: 'Open Street Map Hot',
            urlTemplate: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
            options: {
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
            }
          }]
        },
        series: [
          {
            name: 'Venue Name',
            type: 'scatter',
            coordinateSystem: 'leaflet',
            data: dataToDisplay,
            // clip: false,
            // animation: false,
            // symbol: shape,
            large: false,
            symbolSize: 5,
            label: {
              formatter: '{b}',
              position: 'right',
              show: false
            },
            itemStyle: {
              color: color !== '' ? color : 'purple'
            },
            emphasis: {
              label: {
                show: true
              }
            }
          },
        ]
      }
    );
  }, [color, dataToDisplay, shape]);

  // const handleChange = (e) => {
  //   const files = e.target.files;
  //   if (files && files[0]) {
  //     setFile(files[0]);
  //     setFileSelected(false);
  //   }
  // };

  const onE = {
    'click': () => console.log('popiopi'),
    'dataZoom': () => console.log('popiopi333')
  };

  const years = [
    'All',
    2014,
    2013,
  ];

  const handleData = (data) => {
    const dialog = {};
    dialog.Date = data.data.name;
    dialog.Lat = data.data.value[0];
    dialog.Long = data.data.value[1];
    dialog.Time = data.data.value[3];
    dialog.Males = data.data.value[4];
    dialog.Females = data.data.value[5];
    setDialogData(dialog);
    setOpen(true);
  };

  let onEvents = {
    'click': (e) => { handleData(e); },
  };

  const returnIcon = (index) => {
    switch (index) {
    case 0: return <EventIcon />;
    case 1: return <MapIcon />;
    case 2: return <MapIcon />;
    case 3: return <ScheduleIcon />;
    case 4: return <PersonIcon />;
    case 5: return <PersonIcon />;
    default: return <EventIcon />;
    }
  };

  let sideList = () => (
    <div
      className={classes.list}
      role="presentation"
    >
      <List>
        <ListItem>
          <ListItemText>{dialogData && dialogData.name}</ListItemText>
        </ListItem>
        {dialogData && Object.keys(dialogData).map((text, index) => (
          <ListItem button key={index} >
            <ListItemIcon>{returnIcon(index)}</ListItemIcon>
            <ListItemText primary={text + ': ' + dialogData[text]} />
          </ListItem>
        ))}
      </List>
    </div>
  );


  let content = (
    <Grid container component='div' direction='row' spacing={3} style={{ marginLeft: 10, marginTop: 10 }}>
      <Grid container item xs={3} direction='column' spacing={2}>
        {/* <Grid item>
          <input
            // accept="file/*"
            className={classes.input}
            accept={SheetJSFT}
            onChange={handleChange}
            id="contained-button-file"
            type="file"
          />
          <label htmlFor="contained-button-file">
            <Button variant="outlined" color="primary" className={classes.button} component="span">
              Upload Excel File
            </Button>
          </label>
          <Button variant="outlined" color="primary" className={classes.button} component="span" disabled={fileSelected} onClick={handleFile}>
            Finalize locations
          </Button>
        </Grid> */}
        <Grid item>
          <TextField
            select
            variant='outlined'
            value={selectedYear}
            label='Year'
            onChange={(e) => setSelectedYear(e.target.value)}
          >{years.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}</TextField>
        </Grid>
        <Grid item>
          <TextField
            select
            variant='outlined'
            value={shape}
            label='Symbol'
            onChange={(e) => setShape(e.target.value)}
          >{shapes.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}</TextField>
        </Grid>
        <Grid item >
          <SketchPicker disableAlpha={true} color={color} onChangeComplete={(e) => setColor(e.hex)} />
        </Grid>
      </Grid>
      <Grid container item xs={9}>
        <Grid item>
          {option &&
            <div><ReactEcharts option={option} style={{ height: '80vh', width: '70vw' }} onEvents={onEvents} onMoveend={onE} /></div>
          }
        </Grid>
      </Grid >
      <Drawer className={classes.drawer} anchor="right" open={open} onClose={() => setOpen(false)}>
        {sideList()}
      </Drawer>
    </Grid>
  );
  return content;
};
