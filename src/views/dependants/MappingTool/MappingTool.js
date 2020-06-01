/* eslint-disable no-empty */
import React, { useEffect, useContext, useState } from 'react';
import { Grid, Container, Typography, Divider, Paper, Chip, FormControlLabel, makeStyles, Checkbox, CircularProgress, withStyles, Slide, Toolbar, useTheme, IconButton, TextField, MenuItem, Tabs, Tab, Button, useMediaQuery, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { HeaderElements, LoadingScreen } from 'components';
import { LayoutContext } from 'contexts';
import { API } from 'helpers';
// import { Redirect } from 'react-router-dom';
// import { SketchPicker } from 'react-color';
import Dropzone from 'react-dropzone';
// import moment from 'moment-timezone';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import clsx from 'clsx';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker, } from '@material-ui/pickers';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import LayersIcon from '@material-ui/icons/Layers';
import MapIcon from '@material-ui/icons/Map';
import AddIcon from '@material-ui/icons/Add';
// import PieChartIcon from '@material-ui/icons/PieChart';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ReplayIcon from '@material-ui/icons/Replay';
import TimerIcon from '@material-ui/icons/Timer';
import BuildIcon from '@material-ui/icons/Build';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
// import { CSVLink } from 'react-csv';
import { notify } from 'components/index';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import AntPath from 'react-leaflet-ant-path';
import 'react-leaflet-markercluster/dist/styles.min.css';
// import { HeatmapLayer } from 'react-leaflet-heatmap-layer';
import HeatmapLayer from './assets/HeatmapLayer';
import { PieChart, BarChart } from 'views';
import randomColor from 'randomcolor';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});




const useStyles = makeStyles((theme) => ({
  root: {
    width: 240,
    backgroundColor: theme.palette.background.paper,
  },
  container: {
    padding: '3vw',
  },
  input: {
    display: 'none',
  },
  card: {
    padding: '1vw',
  },
  map: {
    padding: '10px',
    width: 'inherit',
    height: '74vh',
  },
  desktopMap: {
    padding: '10px',
    width: 'inherit',
    height: '84vh',
  },
  color: {
    color: 'white',
    backgroundColor: '#37A69D'
  },
  secondaryColor: {
    color: '#133E5B',
    backgroundColor: '#F0B644'
  },
  paddingTop: {
    paddingTop: '5vh'
  },
  title: {
    margin: theme.spacing(2),
    marginLeft: '5vw',
    paddingTop: '5vh',
  },
  toolbar: {
    paddingRight: 24,
  },
  large: {
    width: theme.spacing(10),
    height: theme.spacing(10)
  },
  selectedCard: {
    padding: '1vw',
    color: 'white',
    backgroundColor: '#133E5B'
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  option: {
    fontSize: 15,
    '& > span': {
      marginRight: 10,
      fontSize: 18,
    },
  },
}));

const layers = [
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
];
const attribution = [
  '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors <br> Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>',
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> <br> Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>'
];

export const MappingTool = (props) => {
  let isItDesktop = useMediaQuery('(min-width:600px) and (min-height:600px)');
  const theme = useTheme();
  const { setHeaderElements, pageTitle } = useContext(LayoutContext);
  const [mapZoom] = useState(10);
  const mapCentre = [39.16, -86.53];
  const [selectedVisualization, setSelectedVisualization] = useState({
    Clusters: false,
    Heatmap: false,
    Trajectory: false,
    '2D chart': false
  });
  const [mergedVisualization, setMergedVisualization] = useState({
    Clusters: false,
    Heatmap: false,
    Trajectory: false,
    '2D chart': false
  });

  const [selectedFilterVisualization, setSelectedFilterVisualization] = useState({
    Clusters: false,
    Heatmap: false,
    Trajectory: false,
    '2D chart': false
  });
  const classes = useStyles();
  // const [suggestedLocations, setSuggestedLocations] = useState([]);
  // const [valueLocation, setValueLocation] = useState('');
  // const [latitude, setLatitude] = useState('');
  // const [longitude, setLongitude] = useState('');
  const [selectedDateStart, setSelectedDateStart] = useState();
  const [selectedDateEnd, setSelectedDateEnd] = useState(new Date('2020-01-01'));
  const [selectedPeriod, setSelectedPeriod] = useState(0);
  const [layer, setLayer] = useState(layers[0]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);
  // const [redirect, setRedirect] = useState(false);
  // const [chipData, setChipData] = useState([]);
  const [trajectoryData, setTrajectoryData] = useState([]);
  const [timelineStatus, setTimelineStatus] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [data, setData] = useState();
  const [visualizations, setVisualizations] = useState(['None']);
  const [entities, setEntities] = useState();
  const [elevation, setElevation] = useState('');
  const [elevations, setElevations] = useState();
  // const [trajectories, setTrajectories] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [entityValue, setEntityValue] = useState('');
  // const [color, setColor] = useState('red');
  const [uniqueEntity, setUniqueEntity] = useState('');
  const [file, setFile] = useState();
  const [trajectoryOptions, setTrajectoryOptions] = React.useState({
    reverse: false,
    paused: false,
  });
  const [pieData, setPieData] = useState();
  let propsValue = (props && props.location && props.location.state) && props.location.state.value;
  const [initialLocation, setInitialLocation] = useState([]);
  const [initialLat, setInitialLat] = useState('');
  const [initialLong, setInitialLong] = useState('');
  const [initialDate, setInitialDate] = useState('');
  const [initialEntity, setInitialEntity] = useState('');
  const [initialEntities, setInitialEntities] = useState([]);
  const [csvUrl, setCsvUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [heatMapPoints, setHeatMapPoints] = useState([]);
  const [fieldValues, setFieldValues] = useState([]);
  const [clusterData, setClusterData] = useState([]);
  const [heatMapData, setHeatMapData] = useState([]);
  const [trajectoriesData, setTrajectoriesData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState({ state: false, type: '', data: {} });
  const [dateKey, setDateKey] = useState('');
  const [dataName, setDataName] = useState('');
  const [uniqueUpdate, setUniqueUpdate] = useState(false);
  // const [uniqueEntitiyVisualization, setUniqueEntityVisualization] = useState({
  //   Clusters: false,
  //   Heatmap: false,
  //   Trajectory: false,
  //   '2D chart': false
  // });
  const getDataFromFile = () => {
    if (csvUrl !== '') {
      let temp = {
        csvLink: csvUrl,
        workspace: dataName,
        allKeys: [],
        config: {
          location: initialLocation,
          type: 'point',
          date: initialDate,
          entities: initialEntities,
          order: [
            'location',
            'entity',
            'time'
          ]
        }
      };
      initialDate !== '' && temp.allKeys.push(initialDate);
      initialLocation.length > 0 && initialLocation.map(loc => { temp.allKeys.push(loc.lat); temp.allKeys.push(loc.long); return temp; });
      initialEntities.length > 0 && initialEntities.map(entity => { temp.allKeys.push(entity); return temp; });

      API.getDataFromFile(temp, (response) => {
        setData(response.data);
        initialDate && initialDate !== '' && setDateKey(response.data.config.date);
        response.startDate && !timelineStatus && setSelectedDateStart(new Date(response.startDate));
        setEntities(response.data.config.entities);
        let tempElevation = [];
        response.data.config && response.data.config.entities.length > 0 && response.data.data.length > 0 && response.data.config.entities.map(element => {
          if (!isNaN(parseFloat(response.data.data[0][element]))) {
            tempElevation.push(element);
          }
          return tempElevation;
        });
        setElevations(tempElevation);
        if (response.data.visualizations) {
          let tempVisualizations = [];
          let keys = Object.keys(response.data.visualizations);
          keys.map(item => {
            if (response.data.visualizations[item]) {
              if (item === 'Heatmap') {
                if (tempElevation.length) {
                  tempVisualizations.push(item);
                }
              }
              else {
                tempVisualizations.push(item);
              }
            }
            return tempVisualizations;
          });
          setVisualizations(tempVisualizations);
        }
      });
      setValue(1);
      setClusterData([]);
      setHeatMapData([]);
      setTrajectoriesData([]);
      setChartData([]);
      setPieData([]);
      setHeatMapPoints([]);
      setUniqueUpdate(false);
      setSelectedVisualization({
        Clusters: false,
        Heatmap: false,
        Trajectory: false,
        '2D chart': false
      });
    }
  };

  useEffect(() => {
    if (data) {
      let payload = {
        csvLink: csvUrl,
        workspace: dataName,
        uniqueEntity: uniqueEntity,
        entities: trajectoryData,
      };
      if (timelineStatus) {
        payload.date = dateKey;
        payload.startDate = selectedDateStart;
        payload.endDate = selectedDateEnd;
      }
      else {
        delete payload.date;
        delete payload.startDate;
        delete payload.endDate;
      }
      payload.selectedVisualizations = selectedVisualization;
      // let tempTrajectoryLatLongs = [];
      API.getFilteredData(payload, (response) => {

        if (uniqueEntity === '' && trajectoryData.length === 0) {
          setClusterData(response.Clusters && response.Clusters[0] && response.Clusters[0].data && response.Clusters[0].data);
          setHeatMapData(response.Heatmap && response.Heatmap[0] && response.Heatmap[0].data && response.Heatmap[0].data);
          setTrajectoriesData(response.Trajectory && response.Trajectory[0] && response.Trajectory[0].data && response.Trajectory[0].data);
          setChartData(response['2D chart'] && response['2D chart'][0] && response['2D chart'][0].data && response['2D chart'][0].data);
          setUniqueUpdate(true);
        }
        else {
          setClusterData(response.Clusters && response.Clusters);
          setHeatMapData(response.Heatmap && response.Heatmap);
          setTrajectoriesData(response.Trajectory && response.Trajectory);
          setChartData(response['2D chart'] && response['2D chart']);
          setUniqueUpdate(true);
        }
      });
    }

  }, [csvUrl, uniqueEntity, trajectoryData, dateKey, selectedDateStart, selectedDateEnd, timelineStatus, data, selectedVisualization, dataName]);


  useEffect(() => {
    if (chartData && chartData.length > 0 && uniqueEntity !== '' && selectedVisualization['2D chart']) {
      let tempPie = [];
      chartData.map((item) => {
        item && item._id && item.data &&
          tempPie.push({
            name: item._id,
            value: item.data.length
          });
        return item;
      });
      setPieData(tempPie);
    }
    else {
      setPieData([]);
    }
  }, [chartData, uniqueEntity, selectedVisualization]);

  useEffect(() => {
    if (propsValue === 1) {
      setValue(1);
    }
  }, [propsValue]);

  useEffect(() => {
    if (uniqueUpdate && heatMapData !== undefined && heatMapData && heatMapData.length > 0 && selectedVisualization.Heatmap) {
      let temp = [];
      heatMapData.map(item => (
        item && item.data && item.data.map(element => (
          temp.push({ lat: element[data.config.location[0].lat], long: element[data.config.location[0].long], elevation: element[elevation !== '' ? elevations.length > 0 && elevations[0] : elevation] })
        ))
      ));
      setHeatMapPoints(temp);
    }
  }, [heatMapData, elevation, data, elevations, selectedVisualization, uniqueUpdate]);


  const addFile = (doc) => {
    setLoading(true);
    let formData = new FormData();
    formData.append('documentFile', doc[0]);
    API.uploadDocument(formData, (data) => { setLoading(false); setCsvUrl(data); setFile(doc); API.getFieldNames({ csvLink: data }, setFieldValues); });
  };
  // const addLocation = () => {
  //   if (valueLocation !== '' && latitude !== '' && longitude !== '') {
  //     let temp = {};
  //     temp.suburb = valueLocation;
  //     temp.lat = latitude;
  //     temp.long = longitude;
  //     // temp.color = randomColor();

  //     let consists = false;
  //     chipData.map(element => {
  //       if (element.suburb === valueLocation && element.lat === latitude && element.long === longitude) {
  //         consists = true;
  //       }
  //       else {
  //         // Do nothing
  //       }
  //       return consists;
  //     });
  //     if (!consists) {
  //       setChipData([...chipData, temp]);
  //       setValueLocation('');
  //       setLatitude('');
  //       setLongitude('');
  //     }
  //     else {
  //       notify('Suburb already exists');
  //     }
  //   }
  //   else {
  //     notify('Invalid Input');
  //   }
  // };

  // useEffect(() => {
  //   if (valueLocation === '') {
  //     setLatitude('');
  //     setLongitude('');
  //   }
  // }, [valueLocation]);

  // const getLocation = async input => {
  //   const locationSuggestionsResp = await API.getAddress(input);
  //   if (locationSuggestionsResp) {
  //     setSuggestedLocations(locationSuggestionsResp.suggestions);
  //   }
  // };

  const handleTrajectory = () => {
    if (data && selectedEntity !== '' && entityValue !== '') {
      let consists = false;
      trajectoryData.map(element => {
        if (element.value === entityValue && element.entity === selectedEntity) {
          consists = true;
        }
        else {
          // Do nothing
        }
        return consists;
      });
      if (!consists) {
        let tempTrajectory = { visualizations: selectedFilterVisualization };
        tempTrajectory.entityName = selectedEntity;
        tempTrajectory.entityValue = entityValue;
        setTrajectoryData([...trajectoryData, tempTrajectory]);
        setEntityValue('');
        setSelectedEntity('');
      }
      else {
        notify('Config already exists');
      }
    }
    else {
      notify('Required fields can not be empty');
    }
  };

  const handleTrajectoryForPie = (selectedEntity1, entityValue1) => {
    if (data && selectedEntity1 !== '' && entityValue1 !== '') {
      let consists = false;
      trajectoryData.map(element => {
        if (element.value === entityValue1 && element.entity === selectedEntity1) {
          consists = true;
        }
        else {
          // Do nothing
        }
        return consists;
      });
      if (!consists) {
        let tempTrajectory = { visualizations: selectedFilterVisualization };
        tempTrajectory.entityName = selectedEntity1;
        tempTrajectory.entityValue = entityValue1;
        setTrajectoryData([...trajectoryData, tempTrajectory]);
      }
      else {
        notify('Config already exists');
      }
    }
    else {
      notify('Required fields can not be empty');
    }
  };

  // const getLatLong = async input => {
  //   const longLatResp = await API.getLatLong(input);
  //   if (longLatResp) {
  //     setLatitude(longLatResp.response.latitude);
  //     setLongitude(longLatResp.response.longitude);
  //   }
  // };

  useEffect(() => {
    setHeaderElements(<HeaderElements>
      <Typography>
        {pageTitle}
      </Typography>
    </HeaderElements>);
  }, [pageTitle, setHeaderElements]);

  // const handleDelete = chipToDelete => () => {
  //   setChipData(chips => chips.filter(chip => (chip.lat !== chipToDelete.lat && chip.long !== chipToDelete.long)));
  // };

  const handleDeleteTrajectoryData = chipToDelete => () => {
    setTrajectoryData(chips => chips.filter(chip => (chip.entityValue !== chipToDelete.entityValue || chip.entityName !== chipToDelete.entityName)));
  };

  const handleConfigData = (type, chipToDelete) => () => {
    if (type === 'Location') {
      setInitialLocation(chips => chips.filter(chip => (chip.lat !== chipToDelete.lat || chip.long !== chipToDelete.long)));
    }
    else {
      setInitialEntities(chips => chips.filter(chip => (chip !== chipToDelete)));
    }
  };

  const addDays = (date, days) => {
    let temp = date;
    temp.setDate(temp.getDate() + parseInt(days));
    return temp;
  };


  const initiateTimeline = () => {
    setTimelineStatus(true);
    let temp = new Date(selectedDateStart);
    temp = temp.setDate(selectedDateStart.getDate() + parseInt(selectedPeriod));
    setSelectedDateEnd(new Date(temp));
    // getDataFromFile();
  };

  const autoPlayTimeline = () => {
    setIsActive(true);
    // getDataFromFile();
  };

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSelectedDateStart(new Date(selectedDateEnd));
        let tempEnd = addDays(selectedDateEnd, selectedPeriod);
        setSelectedDateEnd(new Date(tempEnd));
      }, 5000);
    } else if (!isActive) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, selectedDateEnd, selectedPeriod]);


  const nextTimeline = () => {
    setSelectedDateStart(new Date(selectedDateEnd));
    let tempEnd = addDays(selectedDateEnd, selectedPeriod);
    setSelectedDateEnd(new Date(tempEnd));
    // getDataFromFile();
  };


  const resetTimeline = () => {
    setSelectedDateStart(data.startDate ? data.startDate : new Date('2020-01-01T00:00:00'));
    setSelectedPeriod(0);
    setTimelineStatus(false);
    setIsActive(false);
    // getDataFromFile();
  };

  // useEffect(() => {
  //   if (timelineStatus) {
  //     getDataFromFile();
  //   }
  // }, [timelineStatus, selectedDateStart]);
  useEffect(() => {
    function progress() {
      setCompleted((prevCompleted) => (prevCompleted >= 100 ? 0 : prevCompleted + 25));
    }
    if (isActive) {
      const timer = setInterval(progress, 1000);
      return () => {
        clearInterval(timer);
      };
    }
    else {
      setCompleted(0);
    }
  }, [isActive]);

  const ColorCircularProgress = withStyles({
    root: {
      color: '#D64161',
    },
  })(CircularProgress);

  const handleCheckboxChange = (event) => {
    setTrajectoryOptions({ ...trajectoryOptions, [event.target.name]: event.target.checked });
  };

  const MakeshiftDrawer = (open) => {
    return (
      <Slide direction="right" in={open} mountOnEnter unmountOnExit style={{ overflowY: 'scroll', overflowX: 'hidden', height: '50vh' }}>
        <Grid container spacing={2} className={classes.root} alignItems='flex-start'>
          <Grid container item direction='row' justify='flex-end'>
            <IconButton onClick={() => setOpen(false)}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Grid>
          <Grid container item xs={12} spacing={2} direction='row'>
            <Grid item>
              <Typography variant='h6'>Visualizations</Typography>
            </Grid>
            <Grid container alignItems='flex-start' justify='flex-start'>
              {visualizations.map(option => (
                <Grid item key={option}>
                  <FormControlLabel
                    control={<Checkbox checked={selectedVisualization[option]} color="primary" onChange={() => setSelectedVisualization({ ...selectedVisualization, [option]: !selectedVisualization[option] })} name={option} />}
                    label={option}
                    labelPlacement="start"
                  />
                </Grid>
              ))}
            </Grid>
            {selectedVisualization.Heatmap &&
              <Grid container item>
                <Grid item>
                  <Typography variant='h6'>Heatmap configuration</Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    variant='outlined'
                    value={elevation}
                    label='Elevation'
                    fullWidth
                    onChange={(e) => setElevation(e.target.value)}
                  >
                    {elevations.map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            }
            {selectedVisualization.Trajectory &&
              <Grid container spacing={2}>
                <Grid item>
                  <Typography variant='h6'>Trajectory configuration</Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Checkbox checked={trajectoryOptions.Reverse} color="primary" onChange={handleCheckboxChange} name='reverse' />}
                    label="Reverse"
                    labelPlacement="start"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Checkbox checked={trajectoryOptions.Paused} color="primary" onChange={handleCheckboxChange} name='paused' />}
                    label="Paused"
                    labelPlacement="start"
                  />
                </Grid>
              </Grid>
            }
            {entities && entities.length > 0 &&
              < Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    variant='outlined'
                    value={uniqueEntity}
                    label='Unique Entity'
                    fullWidth
                    onChange={(e) => setUniqueEntity(e.target.value)}
                  >
                    {entities && entities.length > 0 && entities.map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                {uniqueEntity && uniqueEntity !== '' &&
                  <Grid container item xs={12} justify='flex-end'>
                    <Button onClick={() => { setUniqueEntity(''); setUniqueUpdate(false); }}>Reset</Button>
                  </Grid>
                }
                <Grid item xs={12}>
                  <TextField
                    select
                    variant='outlined'
                    value={selectedEntity}
                    label='Entity'
                    fullWidth
                    onChange={(e) => setSelectedEntity(e.target.value)}
                  >
                    {entities.map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                {selectedEntity &&
                  <Grid container item spacing={2}>
                    <Grid item xs={12}>
                      <TextField variant='outlined' label='Value' value={entityValue} onChange={(e) => setEntityValue(e.target.value)} />
                    </Grid>
                    {/* <Grid item xs={12}>
                      <SketchPicker disableAlpha={true} color={trajectoryOptions.color} onChangeComplete={onDrag} name='color' />
                    </Grid> */}
                    <Grid item xs={12}>
                      <IconButton variant='outlined' color='secondary' onClick={() => { setDialogOpen({ ...dialogOpen, state: true, type: 'map' }); }} ><AddIcon /></IconButton>
                    </Grid>
                  </Grid>
                }
                <Grid container item spacing={2}>
                  {trajectoryData.length !== 0 && trajectoryData.map((data, i) => {
                    return (
                      <Grid item key={i} >
                        <Chip
                          key={i}
                          label={data.entityName + ' ' + data.entityValue}
                          onDelete={handleDeleteTrajectoryData(data)}
                          className={classes.chip}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>
            }
            {initialDate && data && data.config && data.config.date && dateKey &&
              <>
                <Grid container justify='center' spacing={2}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Grid item xs={11}>
                      <KeyboardDatePicker
                        disableToolbar
                        variant="inline"
                        format="MM/dd/yyyy"
                        margin="normal"
                        disabled={timelineStatus}
                        id="date-picker-inline1"
                        label="Start Date"
                        value={selectedDateStart}
                        onChange={(e) => setSelectedDateStart(e)}
                        KeyboardButtonProps={{
                          'aria-label': 'change date',
                        }}
                      />
                    </Grid>
                  </MuiPickersUtilsProvider>
                  {timelineStatus &&
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <Grid item xs={11}>
                        <KeyboardDatePicker
                          disableToolbar
                          variant="inline"
                          format="MM/dd/yyyy"
                          margin="normal"
                          disabled={true}
                          id="date-picker-inline2"
                          label="To"
                          value={selectedDateEnd}
                          KeyboardButtonProps={{
                            'aria-label': 'change date',
                          }}
                        />
                      </Grid>
                    </MuiPickersUtilsProvider>
                  }
                  <Grid item xs={11}>
                    <TextField
                      variant='outlined'
                      value={selectedPeriod}
                      disabled={timelineStatus}
                      label='Period (Days)'
                      fullWidth
                      onChange={(e) => { !isNaN(e.target.value) ? setSelectedPeriod(Math.floor(e.target.value)) : notify('Wrong input for period'); }}
                    />
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid item xs={3}>
                    <Tooltip title='Add' leaveDelay={0}><span><IconButton onClick={initiateTimeline} variant='outlined' color='secondary' disabled={timelineStatus}><AddIcon /></IconButton></span></Tooltip>
                  </Grid>
                  <Grid item xs={3}>
                    {isActive ?
                      <Grid container item justify='center' alignItems='center'>
                        <Grid item style={{ marginTop: 10, color: '#D64161' }}>
                          <ColorCircularProgress size={30} variant="static" value={completed} />
                        </Grid>
                      </Grid>
                      :
                      <Tooltip title='Auto Play' leaveDelay={0}><span><IconButton onClick={autoPlayTimeline} variant='outlined' color='secondary' disabled={!timelineStatus || isActive}><TimerIcon /></IconButton></span></Tooltip>
                    }
                  </Grid>
                  <Grid item xs={3}>
                    <Tooltip title='Next' leaveDelay={0}><span><IconButton onClick={nextTimeline} variant='outlined' color='secondary' disabled={!timelineStatus || isActive}><PlayArrowIcon /></IconButton></span></Tooltip>
                  </Grid>
                  <Grid item xs={3}>
                    <Tooltip title='Reset' leaveDelay={0}><span><IconButton onClick={resetTimeline} variant='outlined' color='secondary' disabled={!timelineStatus}><ReplayIcon /></IconButton></span></Tooltip>
                  </Grid>
                </Grid>
              </>
            }
          </Grid>
        </Grid>
      </Slide >
    );
  };


  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function a11yProps(index) {
    return {
      id: `scrollable-force-tab-${index}`,
      'aria-controls': `scrollable-force-tabpanel-${index}`,
    };
  }

  // const handleClick = (row) => {
  //   setRedirect(
  //     <Redirect to={{ pathname: `/patient/${row._id}` }} />
  //   );
  // };

  const initializeData = (type) => {
    if (type === 'Location') {
      if (initialLat !== '' && initialLong !== '') {
        let consists = false;
        initialLocation.map(element => {
          if (element.lat === initialLat || element.long === initialLong) {
            consists = true;
          }
          else {
            // Do nothing
          }
          return consists;
        });
        if (!consists) {
          setInitialLocation([...initialLocation, { lat: initialLat, long: initialLong }]);
          setInitialLat('');
          setInitialLong('');
        }
        else {
          notify('Duplicacy not allowed');
        }

      }
      else {
        notify('Required fields cannot be empty!');
      }
    }
    else {
      if (initialEntity !== '') {
        let consists = false;
        initialEntities.map(element => {
          if (element === initialEntity) {
            consists = true;
          }
          else {
            // Do nothing
          }
          return consists;
        });
        if (!consists) {
          setInitialEntities([...initialEntities, initialEntity]);
          setInitialEntity('');
        }
        else {
          notify('Duplicacy not allowed');
        }
      }
      else {
        notify('Required fields cannot be empty!');
      }
    }
  };

  const returnVisualization = () => {
    if (data) {
      let visualizationJSX = [{ name: 'Merged', jsx: [] }];
      if (selectedVisualization.Clusters === true) {
        visualizationJSX.push(
          {
            name: 'Clusters',
            jsx:
              <MarkerClusterGroup >
                {uniqueEntity === '' && trajectoryData.length === 0 ?
                  uniqueUpdate && clusterData !== undefined && clusterData && clusterData.length > 0 && clusterData.map((item, index) => {
                    return (
                      <Marker key={index} position={[item[(data.config.location[0].lat)], item[(data.config.location[0].long)]]} >
                        {/* icon={image[(item.user.covidStatus)] === '' ? createIcon(item.user.covidStatus) : createIconViaLink(image[(item.user.covidStatus)])}> */}
                        <Popup>
                          {data.config.entities.map((entity) => (
                            <Typography key={Math.random()}>{`${entity} : ${item[entity]}`}</Typography>
                          ))}
                        </Popup>
                      </Marker>
                    );
                  }) :
                  uniqueUpdate && clusterData !== undefined && clusterData && clusterData.length > 0 && clusterData.map((item) => (
                    item && item.data && item.data.map((element) => (
                      <Marker key={Math.random()} position={[element[(data.config.location[0].lat)], element[(data.config.location[0].long)]]} >
                        {/* icon={image[(item.user.covidStatus)] === '' ? createIcon(item.user.covidStatus) : createIconViaLink(image[(item.user.covidStatus)])}> */}
                        <Popup>
                          {data.config.entities.map((entity) => (
                            <Typography key={Math.random()}>{`${entity} : ${element[entity]}`}</Typography>
                          ))}
                        </Popup>
                      </Marker>
                    )
                    )
                  ))
                }
              </MarkerClusterGroup>
          }
        );
      }
      if (selectedVisualization.Heatmap === true) {
        visualizationJSX.push(
          {
            name: 'Heatmap',
            jsx: (
              <>
                {uniqueEntity === '' && trajectoryData.length === 0 ?
                  uniqueUpdate && heatMapData && heatMapData !== undefined && heatMapData.length > 0 &&
                  < HeatmapLayer
                    fitBoundsOnLoad
                    fitBoundsOnUpdate
                    points={heatMapData}
                    longitudeExtractor={m => m[(data.config.location[0].long)]}
                    latitudeExtractor={m => m[(data.config.location[0].lat)]}
                    intensityExtractor={m => parseFloat(m[elevation] ? m[elevation] : m[elevations[0]])} />
                  :
                  <>
                    {uniqueUpdate && heatMapPoints && heatMapPoints !== undefined && heatMapPoints.length > 0 &&
                      <HeatmapLayer
                        key={Math.random()}
                        fitBoundsOnLoad
                        fitBoundsOnUpdate
                        points={heatMapPoints}
                        longitudeExtractor={m => m[1]}
                        latitudeExtractor={m => m[0]}
                        intensityExtractor={m => m[2]} />
                    }
                    ))
                  </>
                }
              </>
            )
          }
        );
      }
      if (selectedVisualization.Trajectory === true) {
        visualizationJSX.push(
          {
            name: 'Trajectory',
            jsx:
              <>
                {uniqueUpdate && uniqueEntity !== '' && trajectoriesData !== undefined && trajectoriesData && trajectoriesData.length > 0 && trajectoriesData.map((item, i) => (
                  item && item.latLongs &&
                  <AntPath key={i} positions={item.latLongs} options={{ color: randomColor(), reverse: trajectoryOptions.reverse, paused: trajectoryOptions.paused, delay: 800 }} >
                    <Popup>
                      <Typography key={Math.random()}>{`${uniqueEntity} : ${item[uniqueEntity]}`}</Typography>
                    </Popup>
                  </AntPath>
                ))
                }
              </>
          }
        );
      }
      Object.keys(mergedVisualization).map(data => (
        mergedVisualization[data] &&
        visualizationJSX.find(obj => (
          obj.name === data && visualizationJSX[0].jsx.push(obj.jsx)
        ))
      ));
      return visualizationJSX;
    }
  };

  // if (redirect) {
  //   return redirect;
  // }
  let content = (
    <Grid container component='div'>
      <Grid container item justify='center' style={{ backgroundColor: '#B0B8B4' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="on"
          indicatorColor="secondary"
          textColor="primary"
          aria-label="scrollable force tabs example"
        >
          <Tab label="Config" icon={<BuildIcon />} {...a11yProps(0)} />
          <Tab label="Map" icon={<MapIcon />} {...a11yProps(1)} />
          {/* <Tab label="Analysis" icon={<PieChartIcon />} {...a11yProps(2)} /> */}
        </Tabs>
      </Grid>
      {value === 0 ?
        <Grid container spacing={2} sytle={{ marginTop: 10, marginLeft: 20 }}>
          <Grid item xs={12}>
            <Typography variant='h4'>Build your configuration</Typography>
          </Grid>
          {loading ? <LoadingScreen /> : !file ?
            <Grid container item direction='column' alignItems='center' justify='center'>
              <Dropzone accept=".csv" onDrop={addFile}>
                {({ getRootProps, getInputProps }) => (
                  <section>
                    <div {...getRootProps()} style={{ border: '1px dashed black', color: 'black', padding: 20, cursor: 'pointer', display: 'inline-block' }}>
                      <input {...getInputProps()} />
                      <p style={{ textAlign: 'center' }}>{<CloudUploadIcon />}</p>
                      <p>Drag {'n'} drop some files here, or click to select files</p>
                    </div>
                  </section>
                )}
              </Dropzone>
            </Grid>
            :
            <Grid container item xs={12}>
              <Grid container item xs={4} spacing={2}>
                <Grid item xs={4}>
                  <Typography>Workspace Name</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField variant='outlined' value={dataName} onChange={(e) => setDataName(e.target.value)} />
                </Grid>
                <Grid item xs={4}>
                  <Typography>Latitude</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField variant='outlined' value={initialLat} onChange={(e) => setInitialLat(e.target.value)} select >
                    {fieldValues.map((option) => (
                      <MenuItem key={Math.random()} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>

                </Grid>
                <Grid item xs={4}>
                  <Typography>Longitude</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField variant='outlined' value={initialLong} onChange={(e) => setInitialLong(e.target.value)} select >
                    {fieldValues.map((option) => (
                      <MenuItem key={Math.random()} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <IconButton onClick={() => initializeData('Location')}><AddIcon /></IconButton>
                </Grid>
                <Grid item xs={4}>
                  <Typography>Date</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField variant='outlined' value={initialDate} onChange={(e) => setInitialDate(e.target.value)} select >
                    {fieldValues.map((option) => (
                      <MenuItem key={Math.random()} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <Typography>Entities</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField variant='outlined' value={initialEntity} onChange={(e) => setInitialEntity(e.target.value)} select >
                    {fieldValues.map((option) => (
                      <MenuItem key={Math.random()} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid container item alignItems='flex-end' xs={12}>
                  <IconButton onClick={() => initializeData('Entity')}><AddIcon /></IconButton>
                </Grid>
              </Grid>
              <Grid container item xs={4} spacing={2}>
                <Grid container item spacing={1}>
                  <Typography>Location: </Typography>
                  {initialLocation.length !== 0 ? initialLocation.map((data, i) => {
                    return (
                      <Grid item key={i} >
                        <Chip
                          key={i}
                          label={'lat: ' + data.lat + ' | long: ' + data.long}
                          onDelete={handleConfigData('Location', data)}
                          className={classes.chip}
                        />
                      </Grid>
                    );
                  })
                    :
                    <Typography>Empty</Typography>
                  }
                </Grid>
                <Grid item>
                  <Typography>Date: {initialDate !== '' ? initialDate : 'None'}</Typography>
                </Grid>
                <Grid container item spacing={1}>
                  <Typography>Entities: </Typography>
                  {initialEntities.length !== 0 ? initialEntities.map((data, i) => {
                    return (
                      <Grid item key={i} >
                        <Chip
                          key={i}
                          label={data}
                          onDelete={handleConfigData('Entity', data)}
                          className={classes.chip}
                        />
                      </Grid>
                    );
                  })
                    :
                    <Typography>Empty</Typography>
                  }
                </Grid>
                <Grid item>
                  <Button color='secondary' variant='outlined' onClick={() => {
                    setFile(); setInitialLocation([]); setInitialEntities([]);
                    setInitialDate('');
                  }}>Reset Data</Button>
                </Grid>

                <Grid item>
                  <Button color='primary' variant='outlined' onClick={() => {
                    getDataFromFile();
                    setSelectedVisualization({
                      Clusters: false,
                      Heatmap: false,
                      Trajectory: false,
                      '2D chart': false
                    });
                    setMergedVisualization({
                      Clusters: false,
                      Heatmap: false,
                      Trajectory: false,
                      '2D chart': false
                    });
                    setOpen(false);
                  }}>Submit</Button>
                </Grid>
              </Grid>
            </Grid>

          }
        </Grid>
        :
        value === 1 ?
          <Grid container>
            <Grid item style={{ zIndex: 99, position: 'relative', marginTop: 0, marginLeft: 5 }}>
              {open ? MakeshiftDrawer(open) :
                <Toolbar>
                  <IconButton
                    color={layers[0] !== layer ? 'secondary' : 'primary'}
                    aria-label="open drawer"
                    onClick={() => setOpen(true)}
                    edge="start"
                    className={clsx(classes.menuButton, open && classes.hide)}
                    style={{ backgroundColor: value === 0 ? layers[0] === layer ? 'white' : 'grey' : 'grey' }}
                  >
                    <MenuIcon />
                  </IconButton>
                </Toolbar>
              }
              <Toolbar style={{ marginTop: 10 }}>
                <IconButton
                  color={layers[0] !== layer ? 'secondary' : 'primary'}
                  aria-label="Layers"
                  onClick={() => layers[0] === layer ? setLayer(layers[1]) : setLayer(layers[0])}
                  edge="start"
                  style={{ backgroundColor: layers[0] === layer ? 'white' : 'grey' }}
                >
                  <LayersIcon />
                </IconButton>
              </Toolbar>
              <Dialog open={dialogOpen.state} onClose={() => { setDialogOpen({ ...dialogOpen, state: false, type: '' }); }} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Visualizations to filter</DialogTitle>
                <DialogContent>
                  <Grid container alignItems='flex-start' justify='flex-start'>
                    {visualizations.map(option => (
                      <Grid item key={option}>
                        <FormControlLabel
                          control={<Checkbox checked={selectedFilterVisualization[option]} color="primary" onChange={() => setSelectedFilterVisualization({ ...selectedFilterVisualization, [option]: !selectedFilterVisualization[option] })} name={option} />}
                          label={option}
                          labelPlacement="start"
                        />
                      </Grid>
                    ))}
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => { setDialogOpen({ ...dialogOpen, state: false, type: '' }); }} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={dialogOpen.type === 'map' ? () => { handleTrajectory(); setDialogOpen({ ...dialogOpen, state: false, type: '' }); } : () => { handleTrajectoryForPie(dialogOpen.data[0], dialogOpen.data[1]); setDialogOpen({ ...dialogOpen, state: false, type: '' }); }} color="primary">
                    Submit
                  </Button>
                </DialogActions>
              </Dialog>
            </Grid>
            {isItDesktop ?
              returnVisualization() && returnVisualization().map(element => (
                element.name !== 'Merged' ?

                  <Grid item key={Math.random()} xs={(12 / (returnVisualization().length))} style={{ zIndex: 2 }}>
                    <Paper className={classes.desktopMap}>
                      <Map center={mapCentre} zoom={mapZoom} style={{ height: '78vh', width: '100%' }}>
                        <TileLayer
                          url={layer}
                          attribution={layer === layers[0] ? attribution[0] : attribution[1]}
                        />
                        {/* 
                        {chipData.length !== 0 && chipData.map((item, i) => (
                          <FeatureGroup key={i}>
                            <Popup>{item.suburb}</Popup>
                            <Circle center={[item.lat, item.long]} color={item.color} fillColor={item.color} radius={2000} />
                          </FeatureGroup>
                        ))
                        } */}
                        {element.jsx}
                      </Map>
                      <FormControlLabel
                        key={element.name}
                        control={<Checkbox checked={mergedVisualization[element.name]} color="primary" onChange={() => setMergedVisualization({ ...mergedVisualization, [element.name]: !mergedVisualization[element.name] })} name={element.name} />}
                        label={element.name}
                        labelPlacement="start"
                      />
                    </Paper>
                  </Grid>
                  :
                  element.jsx.length > 0 &&
                  <Grid item key={Math.random()} xs={(12 / (returnVisualization().length))} style={{ zIndex: 2 }}>
                    <Paper className={classes.desktopMap}>
                      <Map center={mapCentre} zoom={mapZoom} style={{ height: '78vh', width: '100%' }}>
                        <TileLayer
                          url={layer}
                          attribution={layer === layers[0] ? attribution[0] : attribution[1]}
                        />
                        {/* {chipData.length !== 0 && chipData.map((item, i) => (
                          <FeatureGroup key={i}>
                            <Popup>{item.suburb}</Popup>
                            <Circle center={[item.lat, item.long]} color={item.color} fillColor={item.color} radius={2000} />
                          </FeatureGroup>
                        ))
                        } */}
                        {element.jsx.map(merged => (
                          merged
                        ))}
                      </Map>
                      <Typography variant='h5'>Merged</Typography>
                    </Paper>
                  </Grid>
              ))
              :
              returnVisualization() && returnVisualization().map(element => (
                element.name !== 'Merged' ?
                  <Grid item key={Math.random()} xs={12 / (returnVisualization().length - 1)} style={{ zIndex: 2 }}>
                    <Paper className={classes.desktopMap}>
                      <Map center={mapCentre} zoom={mapZoom} style={{ height: '68vh', width: '100%' }}>
                        <TileLayer
                          url={layer}
                          attribution={layer === layers[0] ? attribution[0] : attribution[1]}
                        />
                        {/* 
                        {chipData.length !== 0 && chipData.map((item, i) => (
                          <FeatureGroup key={i}>
                            <Popup>{item.suburb}</Popup>
                            <Circle center={[item.lat, item.long]} color={item.color} fillColor={item.color} radius={2000} />
                          </FeatureGroup>
                        ))
                        } */}
                        {element.jsx}
                      </Map>
                      <FormControlLabel
                        key={element.name}
                        control={<Checkbox checked={mergedVisualization[element.name]} color="primary" onChange={() => setMergedVisualization({ ...mergedVisualization, [element.name]: !mergedVisualization[element.name] })} name={element.name} />}
                        label={element.name}
                        labelPlacement="start"
                      />
                    </Paper>
                  </Grid>
                  :
                  element.jsx.length > 0 &&
                  <Grid item key={Math.random()} xs={12} style={{ zIndex: 2 }}>
                    <Paper className={classes.desktopMap}>
                      <Map center={mapCentre} zoom={mapZoom} style={{ height: '68vh', width: '100%' }}>
                        <TileLayer
                          url={layer}
                          attribution={layer === layers[0] ? attribution[0] : attribution[1]}
                        />
                        {/* {chipData.length !== 0 && chipData.map((item, i) => (
                          <FeatureGroup key={i}>
                            <Popup>{item.suburb}</Popup>
                            <Circle center={[item.lat, item.long]} color={item.color} fillColor={item.color} radius={2000} />
                          </FeatureGroup>
                        ))
                        } */}
                        {element.jsx.map(merged => (
                          merged
                        ))}
                      </Map>
                      <Typography variant='h5'>Merged</Typography>
                    </Paper>
                  </Grid>
              ))
            }
            {selectedVisualization['2D chart'] &&

              <Grid item xs={3}>
                <Grid item>
                  <TextField
                    select
                    variant='outlined'
                    value={uniqueEntity}
                    label='Unique Entity'
                    fullWidth
                    onChange={(e) => setUniqueEntity(e.target.value)}
                  >
                    {entities.map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                {uniqueEntity === undefined || uniqueEntity === null || uniqueEntity === '' ? <Typography>No unique entity selected</Typography> :
                  <Container maxWidth="sm" style={{ marginTop: '1vh' }}>
                    <Grid container direction="row" alignItems="center" spacing={2}>
                      <Grid item>
                        <Button variant="contained" color="primary"
                          onClick={() => {
                            setTrajectoryData([]);
                            setUniqueEntity('');
                            setUniqueUpdate(false);
                          }} >Reset</Button>
                      </Grid>
                    </Grid>
                    <Typography>Pie Chart:</Typography>
                    {chartData.length > 10 ? <Typography>Too much data for pie chart!</Typography> :
                      <PieChart title={uniqueEntity} data={pieData}
                        setFilter={(filterObj) => {
                          setDialogOpen({ ...dialogOpen, state: true, type: 'chart', data: [uniqueEntity, filterObj.name, filterObj.color] });
                        }}
                      />}
                    <Divider style={{ marginTop: '1vh', marginBottom: '1vh' }} />
                    <Typography>Bar Chart:</Typography>
                    <BarChart title={uniqueEntity} data={pieData} xType="category" yType="value"
                      setFilter={(filterObj) => {
                        setDialogOpen({ ...dialogOpen, state: true, type: 'chart', data: [uniqueEntity, filterObj.name, filterObj.color] });
                      }}
                    />
                  </Container>
                }
              </Grid>
            }
          </Grid>
          : null
        // <Grid container>
        //   <EnhancedTable title='Patients' data={[]} options={{
        //     disablePagination: true,
        //     maxHeight: '70vh',
        //     selector: false,
        //     search: true,
        //     ignoreKeys: ['_id', 'countryCode'],
        //     actionLocation: 'end',
        //     actions: [{
        //       name: 'Action',
        //       function: (e, data) => handleClick(data),
        //       type: 'button',
        //       label: 'details'
        //     }]
        //   }} />
        //   <Grid item>
        //     <CSVLink data={[]} headers={headers} separator={','} filename={'User-List.csv'} onClick={() => { notify('Generating File..'); }} ><Button variant='outlined' color='primary'>Download CSV</Button></CSVLink>
        //   </Grid>
        // </Grid>
      }
    </Grid >
  );
  return content;
};