import React, { useState, useEffect } from 'react';
import { Grid, TextField, MenuItem, makeStyles, Toolbar, IconButton, useTheme, Typography, Button } from '@material-ui/core/';
import ReactMapGL, { Source, Layer, LinearInterpolator, WebMercatorViewport } from 'react-map-gl';
import { SketchPicker } from 'react-color';
import MenuIcon from '@material-ui/icons/Menu';
import clsx from 'clsx';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
// import { data } from './data';
import Slide from '@material-ui/core/Slide';
import LayersIcon from '@material-ui/icons/Layers';
// import ReactEcharts from 'echarts-for-react';
import bbox from '@turf/bbox';
import MAP_STYLE from './map-style';
import { LoadingScreen } from 'components';
const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    width: 240,
    // background: 'transparent',
    backgroundColor: '#FFF',
    // opacity: .98
    // backgroundColor: theme.palette.background.paper,
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  grid: {
    zIndex: theme.zIndex.drawer + 1
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    marginTop: '65px',
    // zIndex: 99,
    marginLeft: '73px',
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

const layers = [
  
  'mapbox://styles/mapbox/streets-v7',
  'mapbox://styles/mapbox/dark-v9',
];


export const MapGl = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [viewport, setViewport] = useState({
    width: '100%',
    height: '94vh',
    latitude: -37.4713,
    longitude: 144.7852,
    zoom: 2
  });
  const [color, setColor] = useState({
    color1: '#f28cb1',
    color2: '#f1f075',
    color3: '#51bbd6',
  });
  let _sourceRef = React.createRef();
  const [selectedYear, setSelectedYear] = useState('All');
  const years = [
    'All',
    2014,
    2013,
  ];
  const [selectedColor, setSelectedColor] = useState();
  const [open, setOpen] = React.useState(false);
  const [layer, setLayer] = useState(layers[0]);
  const [selectedState, setSelecetedState] = useState();
  // const [clusterLayer, setClusterLayer] = ({
  //   id: 'clusters',
  //   type: 'circle',
  //   source: 'accidents',
  //   filter: ['has', 'point_count'],
  //   paint: {
  //     'circle-color': ['step', ['get', 'point_count'], color.color3, 100, color.color2, 750, color.color1],
  //     'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
  //   }
  // });


  const MakeshiftDrawer = (open) => {
    return (

      <Slide direction="right" in={open} mountOnEnter unmountOnExit >
        <Grid container spacing={2} style={{ marginLeft: 5 }} className={classes.root} justify='flex-end'>
          {/* <div > */}
          <Grid item className={classes.drawerHeader}>
            <IconButton onClick={() => setOpen(false)}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              variant='outlined'
              value={selectedYear}
              label='Year'
              fullWidth
              onChange={(e) => setSelectedYear(e.target.value)}
            >{years.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}</TextField>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              color 1 : <Button style={{ backgroundColor: color.color1 }} onClick={() => setSelectedColor('color1')} />
            </Typography>
            <Typography>
              color 2 : <Button style={{ backgroundColor: color.color2 }} onClick={() => setSelectedColor('color2')} />
            </Typography>
            <Typography>
              color 3 : <Button style={{ backgroundColor: color.color3 }} onClick={() => setSelectedColor('color3')} />
            </Typography>
          </Grid>
          {selectedColor &&
            <Grid item>
              <SketchPicker disableAlpha={true} color={selectedColor ? color[selectedColor] : color.color1} onChangeComplete={(e) => changeColor(e.hex)} />
            </Grid>
          }
          {/* </div> */}
        </Grid>
      </Slide >
    );
  };

  const clusterLayer = {
    id: 'clusters',
    type: 'circle',
    source: 'accidents',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], color.color3, 100, color.color2, 750, color.color1],
      'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
    }
  };

  const clusterCountLayer = {
    id: 'cluster-count',
    type: 'symbol',
    source: 'accidents',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    }
  };

  const unclusteredPointLayer = {
    id: 'unclustered-point',
    type: 'circle',
    source: 'accidents',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': color.color3,
      'circle-radius': 4,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    }
  };

  const changeColor = (c) => {
    setColor({ ...color, [selectedColor]: c });
  };

  const onClick1 = (e) => {
    console.log(e.features[0]);
    if (e.features[0] && e.features[0].layer.id === 'sf-neighborhoods-fill') {
      const feature = e.features[0];
      const [minLng, minLat, maxLng, maxLat] = bbox(feature);
      const port = new WebMercatorViewport(viewport);
      const { longitude, latitude, zoom } = port.fitBounds([[minLng, minLat], [maxLng, maxLat]], {
        padding: 40
      });

      setSelecetedState(e.features[0].properties.STATE_NAME);
      setViewport({
        ...viewport,
        longitude: longitude,
        latitude: latitude,
        zoom,
        transitionDuration: 500,
        transitionInterpolator: new LinearInterpolator({
          around: [e.offsetCenter.x, e.offsetCenter.y]
        }),
      });
    }
  };

  const onClick2 = (e) => {
    if (e.features[0] && e.features[0].layer.id === 'clusters') {
      const feature = e.features[0];
      const clusterId = feature.properties.cluster_id;
      const mapboxSource = _sourceRef.current.getSource();
      // const [minLng, minLat, maxLng, maxLat] = bbox(feature);
      // const port = new WebMercatorViewport(viewport);
      // const {longitude, latitude, zoom} = port.fitBounds([[minLng, minLat], [maxLng, maxLat]], {
      //   padding: 40
      // });
      mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) {
          return;
        }
        setViewport({
          ...viewport,
          longitude: feature.geometry.coordinates[0],
          latitude: feature.geometry.coordinates[1],
          zoom,
          transitionDuration: 500,
          // transitionInterpolator: new LinearInterpolator({
          //   around: [e.offsetCenter.x, e.offsetCenter.y]
          // }),
        });
      });
    }
  };

  // let date = [];
  // const createData = () => {
  //   const formatDate = (data) => {
  //     let tempDateArray = data.split('/');
  //     let date = [tempDateArray[2], tempDateArray[1], tempDateArray[0]].join('/');
  //     return date;
  //   };
  //   if (geoData) {
  //     geoData.features.forEach(item => {
  //       date.push(formatDate(item.properties.ACCIDENT_DATE));
  //       data.push(item.properties.MALES + item.properties.FEMALES);
  //     });
  //   }
  //   return data;
  // };

  const [geoData, setGeoData] = useState([]);

  useEffect(() => {
    console.log(selectedState);
    if (selectedState && selectedState === 'Victoria') {
      fetch('https://opendata.arcgis.com/datasets/c2a69622ebad42e7baaa8167daa72127_0.geojson')
        .then(response => response.json())
        .then(response => setGeoData(response));
    }

  }, [selectedState]);

  // const option = {
  //   tooltip: {
  //     trigger: 'axis',
  //     position: function (pt) {
  //       return [pt[0], '10%'];
  //     }
  //   },
  //   title: {
  //     left: 'center',
  //     text: 'Accidents in Victoria',
  //   },
  //   toolbox: {
  //     feature: {
  //       dataZoom: {
  //         yAxisIndex: 'none'
  //       },
  //       restore: {},
  //       saveAsImage: {}
  //     }
  //   },
  //   xAxis: {
  //     type: 'category',
  //     boundaryGap: false,
  //     data: date
  //   },
  //   yAxis: {
  //     type: 'value',
  //     boundaryGap: [0, '100%']
  //   },
  //   dataZoom: [{
  //     type: 'inside',
  //     start: 0,
  //     end: 10
  //   }, {
  //     start: 0,
  //     end: 10,
  //     handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
  //     handleSize: '80%',
  //     handleStyle: {
  //       color: '#fff',
  //       shadowBlur: 3,
  //       shadowColor: 'rgba(0, 0, 0, 0.6)',
  //       shadowOffsetX: 2,
  //       shadowOffsetY: 2
  //     }
  //   }],
  //   series: [
  //     {
  //       name: 'Accidents in Victoria',
  //       type: 'line',
  //       smooth: true,
  //       symbol: 'none',
  //       sampling: 'average',
  //       itemStyle: {
  //         color: 'rgb(255, 70, 131)'
  //       },
  //       areaStyle: {
  //         color: 'red'
  //       },
  //       data: []
  //     }
  //   ]
  // };



  let content = (
    <Grid container component='div'>
      {/* <Grid item>
        <ReactEcharts option={option} style={{ width: '100vw', height: '80vh' }} />
      </Grid> */}
      <Grid item style={{ zIndex: 2, position: 'absolute' }}>
        {open ? MakeshiftDrawer(open) :
          <Toolbar>
            <IconButton
              color="primary"
              aria-label="open drawer"
              onClick={() => setOpen(true)}
              edge="start"
              className={clsx(classes.menuButton, open && classes.hide)}
              style={{ backgroundColor: 'white' }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        }
        {/* <Grid item style={{ zIndex: 2, position: 'absolute', marginLeft: 23, marginTop:20 }}> */}
        <Toolbar style={{ marginTop: 10 }}>
          <IconButton
            color="primary"
            aria-label="Layers"
            onClick={() => layers[0] === layer ? setLayer(layers[1]) : setLayer(layers[0])}
            edge="start"
            // className={clsx(classes.menuButton, open && classes.hide)}
            style={{ backgroundColor: 'white' }}
          >
            <LayersIcon />
          </IconButton>
        </Toolbar>
        {/* </Grid> */}
      </Grid>
      <Grid item xs={12} style={{ zIndex: 1 }}>
        {geoData === undefined || geoData === null ? <LoadingScreen /> : geoData.length === 0 || viewport.zoom < 4 ? <ReactMapGL
          mapStyle={MAP_STYLE}
          mapboxApiAccessToken={'pk.eyJ1Ijoibm9kZW1haWxlcjAiLCJhIjoiY2s2MDhpazlwMDVleDNtbWc0bzBjYTcwZyJ9.EmELyBASRoBRIvU2J2hKiA'}
          {...viewport}
          onViewportChange={setViewport}
          interactiveLayerIds={['sf-neighborhoods-fill']}
          onClick={onClick1}
        >
          {/* <Source
            type="geojson"
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={50}
            ref={_sourceRef}
          >
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...unclusteredPointLayer} />
          </Source> */}
        </ReactMapGL>
          :

          <ReactMapGL
            mapStyle={layer}
            mapboxApiAccessToken={'pk.eyJ1Ijoibm9kZW1haWxlcjAiLCJhIjoiY2s2MDhpazlwMDVleDNtbWc0bzBjYTcwZyJ9.EmELyBASRoBRIvU2J2hKiA'}
            {...viewport}
            onViewportChange={setViewport}
            interactiveLayerIds={[clusterLayer.id]}
            onClick={onClick2}
          >
            <Source
              type="geojson"
              data={geoData}
              cluster={true}
              clusterMaxZoom={14}
              clusterRadius={50}
              ref={_sourceRef}
            >
              <Layer {...clusterLayer} />
              <Layer {...clusterCountLayer} />
              <Layer {...unclusteredPointLayer} />
            </Source>
          </ReactMapGL>}
      </Grid>

    </Grid>
  );
  return content;
};
