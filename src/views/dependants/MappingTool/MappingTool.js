/* eslint-disable no-empty */
import React, { useEffect, useContext, useState } from 'react';
import { Grid, Container, Typography, Divider, Paper, withStyles, Chip, FormControlLabel, makeStyles, Checkbox, Slide, Toolbar, useTheme, IconButton, CircularProgress, TextField, MenuItem, Tabs, Tab, Button, useMediaQuery, Tooltip } from '@material-ui/core';
import { HeaderElements, EnhancedTable, LoadingScreen } from 'components';
import { LayoutContext } from 'contexts';
import { API } from 'helpers';
import { Redirect } from 'react-router-dom';
import { SketchPicker } from 'react-color';
import Dropzone from 'react-dropzone';
// import moment from 'moment-timezone';
import { Map, TileLayer, Marker, Popup, Circle, FeatureGroup } from 'react-leaflet';
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
import PieChartIcon from '@material-ui/icons/PieChart';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ReplayIcon from '@material-ui/icons/Replay';
import TimerIcon from '@material-ui/icons/Timer';
import BuildIcon from '@material-ui/icons/Build';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { CSVLink } from 'react-csv';
import { notify } from 'components/index';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import AntPath from 'react-leaflet-ant-path';
import 'react-leaflet-markercluster/dist/styles.min.css';
// import { HeatmapLayer } from 'react-leaflet-heatmap-layer';
import HeatmapLayer from './assets/HeatmapLayer';
import { PieChart, BarChart } from 'views';
// import randomColor from 'randomcolor';
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
  const [selectedVisualization, setSelectedVisualization] = useState('');
  const classes = useStyles();
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [valueLocation, setValueLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [selectedDateStart, setSelectedDateStart] = useState(new Date('2020-01-01T00:00:00'));
  const [selectedDateEnd, setSelectedDateEnd] = useState(new Date('2020-01-01T00:00:00'));
  const [selectedPeriod, setSelectedPeriod] = useState(0);
  const [layer, setLayer] = useState(layers[0]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [redirect, setRedirect] = useState(false);
  const [chipData, setChipData] = useState([]);
  const [trajectoryData, setTrajectoryData] = useState([]);
  const [timelineStatus, setTimelineStatus] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [data, setData] = useState();
  const [visualizations, setVisualizations] = useState(['None']);
  const [entities, setEntities] = useState();
  const [elevation, setElevation] = useState('');
  const [elevations, setElevations] = useState();
  const [trajectories, setTrajectories] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [entityValue, setEntityValue] = useState('');
  const [color, setColor] = useState('red');
  const [uniqueEntity, setUniqueEntity] = useState('');
  const [file, setFile] = useState();
  const [trajectoryOptions, setTrajectoryOptions] = React.useState({
    reverse: false,
    paused: false,
  });
  const [pieData, setPieData] = useState();
  const headers = [
    { label: '_id', key: '_id' },
    { label: 'First Name', key: 'firstName' },
    { label: 'Last Name', key: 'lastName' },
    { label: 'Email', key: 'emailId' },
    { label: 'Status', key: 'covidStatus' },
    { label: 'Code', key: 'countryCode' },
    { label: 'Phone', key: 'phoneNumber' },
  ];
  let propsValue = (props && props.location && props.location.state) && props.location.state.value;
  const [initialLocation, setInitialLocation] = useState([]);
  const [initialLat, setInitialLat] = useState('');
  const [initialLong, setInitialLong] = useState('');
  const [initialDate, setInitialDate] = useState('');
  const [initialEntity, setInitialEntity] = useState('');
  const [initialEntities, setInitialEntities] = useState([]);
  const [csvUrl, setCsvUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const getDataFromFile = () => {
    if (csvUrl !== '') {
      let temp = {
        csvLink: csvUrl,
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
      console.log(temp);
      API.getDataFromFile(temp, setData);
      setValue(1);
    }
  };

  useEffect(() => {
    if (data) {
      setEntities(data.config.entities);
      let tempElevation = [];
      data.config.entities.map(element => {
        if (!isNaN(parseFloat(data.data[0][element]))) {
          tempElevation.push(element);
        }
        return tempElevation;
      });
      let tempData = [];
      let tempTrajectories = { latLongs: [] };
      if (trajectoryData.length === 0) {
        if (uniqueEntity && uniqueEntity !== '') {
          data.data.forEach(datum => {
            // tempTrajectories[uniqueEntity] = datum[uniqueEntity];
            entities && entities.map(entity => { return (tempTrajectories[entity] = datum[entity]); });
            let pos = tempData.map(temp => { return temp[uniqueEntity]; }).indexOf(datum[uniqueEntity]);
            if (pos !== -1) {
              data.config.location.forEach(loc => (
                tempData[pos].latLongs.push([datum[loc.lat], datum[loc.long]])
              ));
            }
            else {
              data.config.location.forEach(loc => (
                tempTrajectories.latLongs.push([datum[loc.lat], datum[loc.long]])
              ));
              tempData.push(tempTrajectories);
            }
            tempTrajectories = { latLongs: [] };
          }
          );
        }
        else {
          data.data.forEach(datum => {
            // tempTrajectories[uniqueEntity] = datum[uniqueEntity];
            entities && entities.map(entity => { return (tempTrajectories[entity] = datum[entity]); });
            data.config.location.forEach(loc => (
              tempTrajectories.latLongs.push([datum[loc.lat], datum[loc.long]])
            ));
            tempData.push(tempTrajectories);
            tempTrajectories = { latLongs: [] };
          }
          );
        }
      }
      else {
        if (uniqueEntity && uniqueEntity !== '') {
          data.data.forEach(datum => {
            // tempTrajectories[uniqueEntity] = datum[uniqueEntity];
            entities && entities.map(entity => { return (tempTrajectories[entity] = datum[entity]); });
            let pos = tempData.map(temp => { return temp[uniqueEntity]; }).indexOf(datum[uniqueEntity]);
            trajectoryData.forEach(element => {
              if (datum[element.entity] === element.value) {
                if (pos !== -1) {
                  data.config.location.forEach(loc => (
                    tempData[pos].latLongs.push([datum[loc.lat], datum[loc.long]])
                  ));
                  tempData[pos].color = element.color;
                }
                else {
                  data.config.location.map(loc => (
                    tempTrajectories.latLongs.push([datum[loc.lat], datum[loc.long]])
                  ));
                  tempTrajectories.color = element.color;
                  tempData.push(tempTrajectories);
                }
                tempTrajectories = { latLongs: [] };
              }
            });
          }
          );
        }
        else {
          data.data.map(datum => {
            entities && entities.map(entity => { return (tempTrajectories[entity] = datum[entity]); });
            trajectoryData.forEach(element => {
              if (datum[element.entity] === element.value) {
                data.config.location.map(loc => (
                  tempTrajectories.latLongs.push([datum[loc.lat], datum[loc.long]])
                ));
                tempTrajectories.color = element.color;
                tempData.push(tempTrajectories);
                tempTrajectories = { latLongs: [] };
              }
            });
            return tempData;
          }
          );
        }
      }
      console.log(tempData);
      setTrajectories(tempData);
      if (tempData !== undefined && tempData !== null
      // && tempData.length <= 10
      ) {
        let tempPie = [];
        tempData.map((item) => {
          tempPie.push({
            name: item[uniqueEntity],
            value: item.latLongs.length
          });
          return item;
        });
        setPieData(tempPie);
      }
      setElevations(tempElevation);
      if (data.visualizations) {
        let keys = Object.keys(data.visualizations);
        let temp = [];
        keys.forEach(item => {
          if (data.visualizations[item] === true) {
            temp.push(item);
          }
        });
        setVisualizations(temp);
      }
    }
  }, [data, trajectoryData, uniqueEntity, entities]);

  useEffect(() => {
    if (propsValue === 1) {
      setValue(1);
    }
  }, [propsValue]);

  const addFile = (doc) => {
    setLoading(true);
    let formData = new FormData();
    formData.append('documentFile', doc[0]);
    API.uploadDocument(formData, (data) => { setLoading(false); setCsvUrl(data); setFile(doc); });

  };
  const addLocation = () => {
    if (valueLocation !== '' && latitude !== '' && longitude !== '') {
      let temp = {};
      temp.suburb = valueLocation;
      temp.lat = latitude;
      temp.long = longitude;
      // temp.color = randomColor();

      let consists = false;
      chipData.map(element => {
        if (element.suburb === valueLocation && element.lat === latitude && element.long === longitude) {
          consists = true;
        }
        else {
          // Do nothing
        }
        return consists;
      });
      if (!consists) {
        setChipData([...chipData, temp]);
        setValueLocation('');
        setLatitude('');
        setLongitude('');
      }
      else {
        notify('Suburb already exists');
      }
    }
    else {
      notify('Invalid Input');
    }
  };

  useEffect(() => {
    if (valueLocation === '') {
      setLatitude('');
      setLongitude('');
    }
  }, [valueLocation]);

  const getLocation = async input => {
    const locationSuggestionsResp = await API.getAddress(input);
    if (locationSuggestionsResp) {
      setSuggestedLocations(locationSuggestionsResp.suggestions);
    }
  };

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
        let tempData = { latLongs: [], color: '' };
        let tempTrajectory = {};
        tempTrajectory.color = color;
        tempTrajectory.entity = selectedEntity;
        tempTrajectory.value = entityValue;
        tempData.color = color;
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

  const handleTrajectoryForPie = (selectedEntity1, entityValue1, color) => {
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
        let tempData = { latLongs: [], color: '' };
        let tempTrajectory = {};
        tempTrajectory.color = color;
        tempTrajectory.entity = selectedEntity1;
        tempTrajectory.value = entityValue1;
        tempData.color = color;
        setTrajectoryData([...trajectoryData, tempTrajectory]);
      }
      else {
        notify('Config already exists1');
      }
    }
    else {
      notify('Required fields can not be empty');
    }
  };

  const getLatLong = async input => {
    const longLatResp = await API.getLatLong(input);
    if (longLatResp) {
      setLatitude(longLatResp.response.latitude);
      setLongitude(longLatResp.response.longitude);
    }
  };

  useEffect(() => {
    setHeaderElements(<HeaderElements>
      <Typography>
        {pageTitle}
      </Typography>
    </HeaderElements>);
  }, [pageTitle, setHeaderElements]);

  const handleDelete = chipToDelete => () => {
    setChipData(chips => chips.filter(chip => (chip.lat !== chipToDelete.lat && chip.long !== chipToDelete.long)));
  };

  const handleDeleteTrajectoryData = chipToDelete => () => {
    setTrajectoryData(chips => chips.filter(chip => (chip.value !== chipToDelete.value || chip.entity !== chipToDelete.entity)));
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
  };

  const autoPlayTimeline = () => {
    setIsActive(true);
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
  };

  const resetTimeline = () => {
    setSelectedDateStart(new Date('2020-01-01T00:00:00'));
    setSelectedPeriod(0);
    setTimelineStatus(false);
    setIsActive(false);
  };

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

  const onDrag = (e) => {
    setColor(e.hex);
    setTrajectoryOptions({ ...trajectoryOptions, 'color': e.hex });
  };

  const MakeshiftDrawer = (open) => {
    return (
      <Slide direction="right" in={open} mountOnEnter unmountOnExit style={{ overflowY: 'scroll', overflowX: 'hidden', height: '50vh' }}>
        <Grid container spacing={1} className={classes.root} justify='center'>
          {/* <div > */}
          <Grid container item className={classes.drawerHeader} justify='flex-end'>
            <IconButton onClick={() => setOpen(false)}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Grid>
          <Grid container item xs={12} spacing={2} direction='row'>
            <Grid container item alignItems='center'>
              <Grid item xs={10}>
                <TextField
                  id="getLocation "
                  labeltext="Location *"
                  required
                  variant='outlined'
                  inputProps={{
                    placeholder: 'Suburb ',
                    name: 'location ',
                    autoComplete: 'hidden',
                    value: valueLocation !== '' ? valueLocation : '',
                    onChange: e => {
                      getLocation(e.target.value);
                      setValueLocation(e.target.value);
                    }
                  }}
                />
                {suggestedLocations !== undefined ? (
                  <Grid container>
                    {suggestedLocations.map((location, key) => {
                      return (
                        <Grid item key={key} xs={12}>
                          <Typography
                            variant="caption"
                            onClick={e => {
                              getLatLong(location.locationId);
                              setValueLocation(e.target.innerText);
                              setSuggestedLocations([]);
                            }}
                          >
                            {location.address.district}
                          </Typography>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : ('')}
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={addLocation} variant='outlined' color='secondary'><AddIcon /></IconButton>
              </Grid>
            </Grid>
            <Grid container item spacing={2}>
              {chipData.length !== 0 && chipData.map((data, i) => {
                return (
                  <Grid item key={i} >
                    <Chip
                      key={data.suburb}
                      label={data.suburb}
                      onDelete={handleDelete(data)}
                      className={classes.chip}
                      style={{ backgroundColor: data.color }}
                    />
                  </Grid>
                );
              })}
            </Grid>
            {/* <Grid item xs={12}>
              <TextField
                select
                variant='outlined'
                value={selectedStatus}
                label='Status'
                fullWidth
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statuses.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid> */}
            <Grid item xs={12}>
              <TextField
                select
                variant='outlined'
                value={selectedVisualization}
                label='Visualizations'
                fullWidth
                onChange={(e) => setSelectedVisualization(e.target.value)}
              >
                {visualizations.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {selectedVisualization === 'Heatmap' &&
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
            }
            {selectedVisualization === 'Trajectory' &&
              <Grid container spacing={2}>
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
                <Grid item xs={12}>
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
                {uniqueEntity && uniqueEntity !== '' &&
                  <Grid container item xs={12} justify='flex-end'>
                    <Button onClick={() => setUniqueEntity('')}>Reset</Button>
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
                    <Grid item xs={12}>
                      <SketchPicker disableAlpha={true} color={trajectoryOptions.color} onChangeComplete={onDrag} name='color' />
                    </Grid>
                    <Grid item xs={12}>
                      <IconButton variant='outlined' color='secondary' onClick={handleTrajectory} ><AddIcon /></IconButton>
                    </Grid>
                  </Grid>
                }
                <Grid container item spacing={2}>
                  {trajectoryData.length !== 0 && trajectoryData.map((data, i) => {
                    return (
                      <Grid item key={i} >
                        <Chip
                          key={i}
                          label={data.entity + ' ' + data.value}
                          onDelete={handleDeleteTrajectoryData(data)}
                          className={classes.chip}
                          style={{ backgroundColor: data.color }}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>
            }
            <Grid container justify='center' spacing={2}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid item xs={11}>
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="dd/MM/yyyy"
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
                      format="dd/MM/yyyy"
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

  const handleClick = (row) => {
    setRedirect(
      <Redirect to={{ pathname: `/patient/${row._id}` }} />
    );
  };

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

  const returnVisualization = (viz) => {
    if (data) {
      switch (viz) {
      case 'Clusters': return (
        <MarkerClusterGroup >
          {data && data.data.map((item, index) => {
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
          })}
        </MarkerClusterGroup>);
      case 'Heatmap': return (
        <HeatmapLayer
          fitBoundsOnLoad
          fitBoundsOnUpdate
          points={data.data}
          longitudeExtractor={m => m[(data.config.location[0].long)]}
          latitudeExtractor={m => m[(data.config.location[0].lat)]}
          intensityExtractor={m => parseFloat(m[elevation] ? m[elevation] : m[data.config.entities[0]])} />
      );
      case 'Trajectory': return (
          <>
            {trajectories.map((item, i) => (
              <AntPath key={i} positions={item.latLongs} options={{ color: item.color && item.color !== '' ? item.color : 'red', reverse: trajectoryOptions.reverse, paused: trajectoryOptions.paused, delay: 800 }} >
                <Popup>
                  {data.config.entities.map((entity) => (
                    <Typography key={Math.random()}>{`${entity} : ${item[entity]}`}</Typography>
                  ))}
                </Popup>
              </AntPath>
            ))}
          </>
      );
      default: return null;
      }
    }
  };

  if (redirect) {
    return redirect;
  }
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
          <Tab label="Map" icon={<BuildIcon />} {...a11yProps(0)} />
          <Tab label="Map" icon={<MapIcon />} {...a11yProps(1)} />
          <Tab label="Analysis" icon={<PieChartIcon />} {...a11yProps(2)} />
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
                      <p>Drag 'n' drop some files here, or click to select files</p>
                    </div>
                  </section>
                )}
              </Dropzone>
            </Grid>
            :
            <Grid container item xs={12}>
              <Grid container item xs={8} spacing={2}>
                <Grid item xs={4}>
                  <Typography>Latitude</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField variant='outlined' value={initialLat} onChange={(e) => setInitialLat(e.target.value)} />
                </Grid>
                <Grid item xs={4}>
                  <Typography>Longitude</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField variant='outlined' value={initialLong} onChange={(e) => setInitialLong(e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <IconButton onClick={() => initializeData('Location')}><AddIcon /></IconButton>
                </Grid>
                <Grid item xs={4}>
                  <Typography>Date</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField variant='outlined' value={initialDate} onChange={(e) => setInitialDate(e.target.value)} />
                </Grid>
                <Grid item xs={4}>
                  <Typography>Entities</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField variant='outlined' value={initialEntity} onChange={(e) => setInitialEntity(e.target.value)} />
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
                  <Button color='secondary' variant='outlined' onClick={() => { setFile(); setData(); }}>Reset Data</Button>
                </Grid>

                <Grid item>
                  <Button color='primary' variant='outlined' onClick={() => { getDataFromFile(); }}>Submit</Button>
                </Grid>
              </Grid>
            </Grid>

          }
        </Grid>
        :
        value === 1 ?
          <Grid container>
            <Grid item style={{ zIndex: 99, position: 'absolute', marginTop: 90, marginLeft: 5 }}>
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
            </Grid>
            {isItDesktop ?
              <Grid item xs={7} style={{ zIndex: 2 }}>
                <Paper className={classes.desktopMap}>
                  <Map center={mapCentre} zoom={mapZoom} style={{ height: '82vh', width: '100%' }}>
                    <TileLayer
                      url={layer}
                      attribution={layer === layers[0] ? attribution[0] : attribution[1]}
                    />

                    {chipData.length !== 0 && chipData.map((item, i) => (
                      <FeatureGroup key={i}>
                        <Popup>{item.suburb}</Popup>
                        <Circle center={[item.lat, item.long]} color={item.color} fillColor={item.color} radius={2000} />
                      </FeatureGroup>
                    ))
                    }
                    {returnVisualization(selectedVisualization)}
                  </Map>
                </Paper>
              </Grid>
              :
              <Grid item xs={7} style={{ zIndex: 2 }}>
                <Paper className={classes.map}>
                  <Map center={mapCentre} zoom={mapZoom} style={{ height: '72vh', width: '100%' }}>
                    <TileLayer
                      url={layer}
                      attribution={layer === layers[0] ? attribution[0] : attribution[1]}
                    />

                    {chipData.length !== 0 && chipData.map((item, i) => (
                      <FeatureGroup key={i}>
                        <Popup>{item.suburb}</Popup>
                        <Circle center={[item.lat, item.long]} color={item.color} fillColor={item.color} radius={2000} />
                      </FeatureGroup>
                    ))
                    }
                    {returnVisualization(selectedVisualization)}
                  </Map>
                </Paper>
              </Grid>
            }
            <Grid item xs={4}>
              {uniqueEntity === undefined || uniqueEntity === null || uniqueEntity === '' ? <Typography>No unique entity selected</Typography> :
                <Container maxWidth="sm" style={{ marginTop: '1vh' }}>
                  <Grid container direction="row" alignItems="center" spacing={2}>
                    <Grid item>
                      <Button variant="contained" color="primary"
                        onClick={() => {
                          setTrajectoryData([]);
                        }} >Reset</Button>
                    </Grid>
                  </Grid>
                  <Typography>Pie Chart:</Typography>
                  {trajectories.length > 10 ? <Typography>Too much data for pie chart!</Typography> :
                    <PieChart title={uniqueEntity} data={pieData}
                      setFilter={(filterObj) => {
                        console.log(filterObj);
                        handleTrajectoryForPie(uniqueEntity, filterObj.name, filterObj.color);
                      }}
                    />}
                  <Divider style={{ marginTop: '1vh', marginBottom: '1vh' }} />
                  <Typography>Bar Chart:</Typography>
                  <BarChart title={uniqueEntity} data={pieData} xType="category" yType="value"
                    setFilter={(filterObj) => {
                      handleTrajectoryForPie(uniqueEntity, filterObj.name, filterObj.color);
                    }}
                  />
                </Container>
              }
            </Grid>
          </Grid>
          :
          <Grid container>
            <EnhancedTable title='Patients' data={[]} options={{
              disablePagination: true,
              maxHeight: '70vh',
              selector: false,
              search: true,
              ignoreKeys: ['_id', 'countryCode'],
              actionLocation: 'end',
              actions: [{
                name: 'Action',
                function: (e, data) => handleClick(data),
                type: 'button',
                label: 'details'
              }]
            }} />
            <Grid item>
              <CSVLink data={[]} headers={headers} separator={','} filename={'User-List.csv'} onClick={() => { notify('Generating File..'); }} ><Button variant='outlined' color='primary'>Download CSV</Button></CSVLink>
            </Grid>
          </Grid>
      }
    </Grid >
  );
  return content;
};