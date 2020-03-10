import React, { useEffect, useContext, useState } from 'react';
import {
  Grid, Typography, TextField, MenuItem, makeStyles, Chip, Button, Tooltip, Drawer, List, Divider, ListItem, ListItemIcon, ListItemText, Collapse, IconButton,
  Stepper, Step, StepButton, FormControlLabel, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText
} from '@material-ui/core';
import { HeaderElements, notify, LoadingScreen } from 'components';
import { LayoutContext } from 'contexts';
import ReactEcharts from 'echarts-for-react';
import { API } from 'helpers/index';
import { SketchPicker } from 'react-color';

import PhotoCamera from '@material-ui/icons/PhotoCamera';
import LabelIcon from '@material-ui/icons/Label';
import CodeIcon from '@material-ui/icons/Code';
import HistoryIcon from '@material-ui/icons/History';
import PersonIcon from '@material-ui/icons/Person';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  input: {
    display: 'none',
  },
  table: {
    minWidth: 650,
  },
  drawer: {
    width: 420,
    flexShrink: 0,
  },
}));

function getSteps() {
  return ['Add visualizations', 'Edit visualization'];
}

const graphType = [
  'Clustered',
  'Organized'
];

const blockType = [
  'Requirement',
  'Action',
  'Scope',
  'Condition'
];

const shapes = [
  'circle',
  'rect',
  'roundRect',
  'triangle',
  'diamond',
  'pin',
  'arrow',
];

export const Rcm = () => {
  const { setHeaderElements, pageTitle } = useContext(LayoutContext);
  const [dataToDisplay, setDataToDisplay] = useState();
  const [linksToDisplay, setLinksToDisplay] = useState();
  const [requirements, setRequirements] = useState();
  const [open, setOpen] = useState(false);
  const [dialogData, setDialogData] = useState();
  const [option, setOption] = useState();
  const [store, setStore] = useState();
  const [selectedGraph, setSelectedGraph] = useState('Clustered');
  const [type, setType] = useState('Requirement');
  const [shape, setShape] = useState('circle');
  const [color, setColor] = useState('#a5745b');
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState('');
  const [authorTempValue, setAuthorTempValue] = useState('');
  const [reviewTempValue, setReviewTempValue] = useState('');
  const [chipData, setChipData] = React.useState([]);
  const [author, setAuthor] = useState(false);
  const [review, setReview] = useState(false);
  const [parents, setParents] = useState(false);
  const [children, setChildren] = useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();
  const [allBlocks, setAllBlocks] = useState();
  const [selectedViz, setSelectedViz] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState();
  useEffect(() => {
    API.getAllBlocks(setAllBlocks);
  }, []);

  useEffect(() => {
    if (selectedViz.length !== 0) {
      API.getSpecificBlocks({ blockId: selectedViz }, setStore);
    }
  }, [selectedViz]);

  const constructOption = (array) => {
    let data = constructVisualization('data', array);
    let link = constructVisualization('link', array);
    let option = {
      tooltip: { show: true, formatter: '{c}' },
      animationDurationUpdate: 750,
      animationEasingUpdate: 'none',
      series: [
        {
          type: 'graph',
          layout: 'force',
          force: {
            repulsion: 500,
            edgeLength: 150,
          },
          focusNodeAdjacency: true,
          symbolSize: 50,
          roam: true,
          label: {
            show: true,
            color: 'black',
            formatter: '{c}',
            fontFamily: 'sans-serif',
          },
          edgeSymbol: ['circle', 'none'],
          edgeSymbolSize: [4, 10],
          data: data,
          links: link,
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          },
          lineStyle: {
            opacity: 0.9,
            width: 2,
            curveness: 0
          },
          emphasis: {
            lineStyle: {
              width: 10
            }
          }
        }
      ]
    };
    return option;
  };
  const constructVisualization = (type, array) => {
    const uniqueId = [];
    const uniqueParent = [];
    const data = [];
    const link = [
      {
        label: {
          show: false
        },
        lineStyle: {
          curveness: Math.random()
        }
      }
    ];
    array && array.blocks.map(item => {
      const returnColor = (data) => {
        let color = '';
        let color_ = '';
        let found = false;
        chipData.forEach(element => {
          if (element.type === data) {
            found = true;
            color = element.color;
            return element.color;
          }
        });
        if (found === false) {
          switch (data) {
          case 'Requirement': color_ = '#a5745b';
            break;
          case 'Action': color_ = '#74a55b';
            break;
          case 'Condition': color_ = '#5b8ca5';
            break;
          case 'Scope': color_ = '#a55ba5';
            break;
          default: color_ = '#FFFFFF';
            break;
          }
          return color_;
        }
        else {
          return color;
        }
      };

      const returnShape = (data) => {
        let shape = '';
        let shape_ = '';
        let found = false;
        chipData.forEach(element => {
          if (element.type === data) {
            found = true;
            shape = element.shape;
            return element.shape;
          }
        });
        if (found === false) {
          switch (data) {
          case 'Requirement': shape_ = 'circle';
            break;
          case 'Action': shape_ = 'rect';
            break;
          case 'Condition': shape_ = 'diamond';
            break;
          case 'Scope': shape_ = 'triangle';
            break;
          default: shape_ = 'custom';
            break;
          }
          return shape_;
        }
        else {
          return shape;
        }
      };

      const temp = {};
      const temp2 = {};
      if (uniqueId.includes(item.child.id)) {
        // Do nothing
      }
      else {
        let nodeType = '';
        if (item.child.type === 'rcm_requirement') {
          nodeType = 'Requirement';
        }
        else if (item.child.type === 'rcm_condition') {
          nodeType = 'Condition';
        }
        else if (item.child.type === 'rcm_scope') {
          nodeType = 'Scope';
        }
        else {
          nodeType = 'Action';
        }
        uniqueId.push(item.child.id);
        temp.name = item.child.id;
        temp.mongoId = item._id;
        temp.author = item.child.author ? item.child.author : '';
        temp.review = item.child.review ? item.child.review : '';
        temp.itemStyle = { color: returnColor(nodeType) };
        temp.value = item.child.value;
        temp.draggable = true;
        temp.symbol = returnShape(nodeType);
        data.push(temp);
      }
      if (item.parent) {
        if (uniqueParent.includes(item.parent.id)) {
          // Do Nothing
        }
        else {
          uniqueParent.push(item.parent.id);
        }
      }
      temp2.source = item.child.id;
      temp2.target = item.parent ? item.parent.id : null;
      temp2.lineStyle = { curveness: Math.random(), color: item.child.color };
      link.push(temp2);
      return data;
    });
    if (type === 'data') {
      return data;
    }
    else {
      return link;
    }
  };

  useEffect(() => {
    const uniqueId = [];
    const uniqueParent = [];
    const data = [];
    const link = [
      {
        label: {
          show: false
        },
        lineStyle: {
          curveness: Math.random()
        }
      }
    ];
    store && store.blocks.map(item => {
      const returnColor = (data) => {
        let color = '';
        let color_ = '';
        let found = false;
        chipData.forEach(element => {
          if (element.type === data) {
            found = true;
            color = element.color;
            return element.color;
          }
        });
        if (found === false) {
          switch (data) {
          case 'Requirement': color_ = '#a5745b';
            break;
          case 'Action': color_ = '#74a55b';
            break;
          case 'Condition': color_ = '#5b8ca5';
            break;
          case 'Scope': color_ = '#a55ba5';
            break;
          default: color_ = '#FFFFFF';
            break;
          }
          return color_;
        }
        else {
          return color;
        }
      };

      const returnShape = (data) => {
        let shape = '';
        let shape_ = '';
        let found = false;
        chipData.forEach(element => {
          if (element.type === data) {
            found = true;
            shape = element.shape;
            return element.shape;
          }
        });
        if (found === false) {
          switch (data) {
          case 'Requirement': shape_ = 'circle';
            break;
          case 'Action': shape_ = 'rect';
            break;
          case 'Condition': shape_ = 'diamond';
            break;
          case 'Scope': shape_ = 'triangle';
            break;
          default: shape_ = 'custom';
            break;
          }
          return shape_;
        }
        else {
          return shape;
        }
      };
      const temp = {};
      const temp2 = {};
      if (uniqueId.includes(item.child.id)) {
        // Do nothing
      }
      else {
        let nodeType = '';
        if (item.child.type === 'rcm_requirement') {
          nodeType = 'Requirement';
        }
        else if (item.child.type === 'rcm_condition') {
          nodeType = 'Condition';
        }
        else if (item.child.type === 'rcm_scope') {
          nodeType = 'Scope';
        }
        else {
          nodeType = 'Action';
        }
        uniqueId.push(item.child.id);
        temp.name = item.child.id;
        temp.mongoId = item._id;
        temp.author = item.child.author ? item.child.author : '';
        temp.review = item.child.review ? item.child.review : '';
        temp.itemStyle = { color: returnColor(nodeType) };
        temp.value = item.child.value;
        temp.draggable = true;
        temp.symbol = returnShape(nodeType);
        data.push(temp);
      }
      if (item.parent) {
        if (uniqueParent.includes(item.parent.id)) {
          // Do Nothing
        }
        else {
          uniqueParent.push(item.parent.id);
        }
      }
      temp2.source = item.child.id;
      temp2.target = item.parent ? item.parent.id : null;
      temp2.lineStyle = { curveness: Math.random(), color: item.child.color };
      link.push(temp2);
      return data;
    });
    setDataToDisplay(data);
    setLinksToDisplay(link);
    setRequirements(uniqueParent);
  }, [store, chipData, selectedNode]);

  useEffect(() => {
    if (requirements && requirements.length !== 0) {
      setOption(
        {
          tooltip: { show: true, formatter: '{c}' },
          animationDurationUpdate: 750,
          legend: [{ data: requirements.map(function (a) { return a; }) }],
          animation: false,
          series: [
            {
              type: 'graph',
              layout: selectedGraph === 'Organized' ? 'circular' : 'force',
              force: {
                repulsion: 500,
                edgeLength: 150,
              },
              focusNodeAdjacency: true,
              symbolSize: 50,
              roam: true,
              label: {
                show: true,
                color: 'black',
                formatter: '{c}',
                fontFamily: 'sans-serif',
              },
              edgeSymbol: ['circle', 'none'],
              edgeSymbolSize: [4, 10],
              data: dataToDisplay,
              links: linksToDisplay,
              categories: requirements,
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 1,
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              },
              lineStyle: {
                opacity: 0.9,
                width: 2,
                curveness: 0
              },
              emphasis: {
                lineStyle: {
                  width: 10
                }
              }
            }
          ]
        }
      );
    }
  }, [dataToDisplay, requirements, linksToDisplay, selectedGraph]);

  const handleData = (data) => {
    const dialog = {};
    const parents = [];
    const children = [];
    linksToDisplay.map(item => {
      if (item.source !== null) {
        if (item.target === data.data.name) {
          children.push(item.source);
        }
        if (item.source === data.data.name) {
          parents.push(item.target);
        }
      }
      return parents;
    });
    setSelectedNode(data.data.mongoId);
    dialog.name = data.data.name;
    dialog.author = data.data.author;
    dialog.review = data.data.review;
    dialog.mongoId = data.data.mongoId;
    dialog.parents = parents;
    dialog.children = children;
    setDialogData(dialog);
    setOpen(true);
  };

  let onEvents = {
    'click': (e) => { handleData(e); },
  };

  const onChange = () => {
    if (selectedGraph === 'Clustered') {
      setSelectedGraph('Organized');
    }
    else {
      setSelectedGraph('Clustered');
    }
  };

  const onDrag = (e) => {
    setColor(e.hex);
  };

  const handleSubmission = (event) => {
    setLoading(true);
    let formData = new FormData();
    formData.append('imageFile', event.target.files[0]);
    API.uploadImage(formData, (data) => { setLoading(false); setShape('image://' + data); });
  };

  const handleDelete = chipToDelete => () => {
    setChipData(chips => chips.filter(chip => chip.type !== chipToDelete.type));
  };

  const handleChange = () => {
    let data = {
      type: type,
      shape: shape,
      color: color
    };
    let consists = false;
    chipData.map(element => {
      if (element.type === type) {
        consists = true;
      }
      else {
        // Do nothing
      }
      return consists;
    });
    if (!consists) {
      setChipData([...chipData, data]);
    }
    else {
      notify('Type already exists');
    }
  };

  const handleClick = (data) => {
    switch (data) {
    case 'Author': setAuthor(!author);
      break;
    case 'Last Reviewed By': setReview(!review);
      break;
    case 'Parents': setParents(!parents);
      break;
    case 'Children': setChildren(!children);
      break;
    default: //Do Nothing
    }
  };

  useEffect(() => {
    if (open === false) {
      setAuthor(false);
      setReview(false);
      setParents(false);
      setChildren(false);
      setSelectedNode('');
    }
  }, [open]);

  const submitAuthor = () => {
    API.updateBlock({ blockId: store._id, author: authorTempValue, review: '', arrayItemId: selectedNode }, setStore);
    setAuthorTempValue('');
  };

  const submitReview = () => {
    API.updateBlock({ blockId: store._id, author: '', review: reviewTempValue, arrayItemId: selectedNode }, setStore);
    setReviewTempValue('');
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
        {['Author', 'Last Reviewed By', 'Parents', 'Children'].map((text, index) => (
          <ListItem button key={text} onClick={() => handleClick(text)}>
            <ListItemIcon>{index === 0 ? <PersonIcon /> : (index === 1 ? <HistoryIcon /> : index === 2 ? <SettingsEthernetIcon /> : <CodeIcon />)}</ListItemIcon>
            <ListItemText primary={text} />
            {text === 'Parents' ? (parents ? <ExpandLess /> : <ExpandMore />) : text === 'Children' ? (children ? <ExpandLess /> : <ExpandMore />) : text === 'Last Reviewed By' ? (review ? <ExpandLess /> : <ExpandMore />) : (author ? <ExpandLess /> : <ExpandMore />)}
          </ListItem>
        ))}
      </List>
      <Divider />
      <Collapse in={parents} timeout="auto" unmountOnExit>
        <List>
          {dialogData && dialogData.parents[0] !== null ? dialogData.parents.map((text, index) => (
            <ListItem button key={index}>
              <ListItemIcon><LabelIcon /></ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          )) :
            <ListItem button key={Math.random()}>
              <ListItemIcon><LabelIcon /></ListItemIcon>
              <ListItemText primary={'None'} />
            </ListItem>}
        </List>
      </Collapse>
      <Collapse in={children} timeout="auto" unmountOnExit>
        <List>
          {dialogData && dialogData.children.length !== 0 ? dialogData.children.map((text, index) => (
            <ListItem button key={index}>
              <ListItemIcon><LabelIcon /></ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          )) :
            <ListItem button key={Math.random()}>
              <ListItemIcon><LabelIcon /></ListItemIcon>
              <ListItemText primary={'None'} />
            </ListItem>
          }
        </List>
      </Collapse>
      <Collapse in={author} timeout="auto" unmountOnExit>
        <List>
          {dialogData &&
            <>
              <ListItem button>
                <TextField variant='outlined' label='Author' defaultValue={dialogData.author} onChange={(e) => setAuthorTempValue(e.target.value)}></TextField>
              </ListItem>
              <ListItem>
                <Button variant='outlined' color='secondary' onClick={selectedViz.length === 1 ? submitAuthor : () => notify('Select single graph to edit node')}>Submit</Button>
              </ListItem>
            </>
          }
        </List>
      </Collapse>
      <Collapse in={review} timeout="auto" unmountOnExit>
        <List>
          {dialogData &&
            <>
              <ListItem button>
                <TextField variant='outlined' label='Reviewer' defaultValue={dialogData.review} onChange={(e) => setReviewTempValue(e.target.value)} ></TextField>
              </ListItem>
              <ListItem>
                <Button variant='outlined' color='secondary' onClick={selectedViz.length === 1 ? submitReview : () => notify('Select single graph to edit node')}>Submit</Button>
              </ListItem>
            </>
          }
        </List>
      </Collapse>
    </div>
  );

  useEffect(() => {
    setHeaderElements(<HeaderElements>
      <Typography>
        {pageTitle}
      </Typography>
    </HeaderElements>);
  }, [pageTitle, setHeaderElements]);
  const classes = useStyles();

  const handleCheckChange = (id) => {
    if (!selectedViz.includes(id)) {
      setSelectedViz([...selectedViz, id]);
    }
    else {
      let temp = selectedViz;
      temp = temp.filter(y => y !== id);
      setSelectedViz(temp);
    }
  };

  const checkChecked = (id) => {
    if (selectedViz.includes(id)) {
      return true;
    }
    else {
      return false;
    }
  };

  const dialogHandleSubmit = () => {
    API.deleteBlock({ blockId: selectedDelete }, setAllBlocks);
    setDialogOpen(false);
  };
  const step1 =
    <Grid container component='div' direction='row' style={{ marginTop: 10, marginLeft: 10, marginRight: 10 }} spacing={3} >
      {allBlocks ? allBlocks.map((item, i) => (
        <Grid item key={i} xs={3} style={{ 'borderStyle': 'outset' }}>
          {item && <ReactEcharts option={constructOption(item)} />}
          <FormControlLabel
            control={<Checkbox checked={checkChecked(item._id)} onChange={() => handleCheckChange(item._id)} value={item._id} />}
            label={<Typography color='textSecondary'>{item.workSpaceName}</Typography>}
          />
          <IconButton color='primary' onClick={() => { setDialogOpen(true); setSelectedDelete(item._id); }}><DeleteIcon /></IconButton>
        </Grid>
      )) : <LoadingScreen />}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Are you sure you want to delete?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Confirming this will delete this visualization permanently. Do you wish to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Disagree
          </Button>
          <Button onClick={dialogHandleSubmit} color="primary" autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
    ;
  const step2 =
    <Grid container component='div' direction='row' style={{ marginTop: 10, marginLeft: 10 }} spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h3'>
          RCM
        </Typography>
      </Grid>
      <Grid container item direction='column' xs={2} spacing={2}>
        <Grid item >
          <TextField
            id="outlined-select-graph"
            select
            label="Graph type"
            value={selectedGraph}
            onChange={onChange}
            variant="outlined"
          >
            {graphType.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item >
          <TextField
            id="outlined-select-type"
            select
            label="Node Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            variant="outlined"
          >
            {blockType.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid container item spacing={2}>
          <Grid item xs={4}>
            <TextField
              id="outlined-select-shape"
              select
              label="Node shape"
              value={(shape.includes('image') ? 'Custom Icon' : shape)}
              onChange={(e) => setShape(e.target.value)}
              variant="outlined"
            >
              {shapes.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={2} style={{ marginLeft: 30, marginTop: 10 }}>
            <Typography variant='h6'>Or</Typography>
          </Grid>
          <Grid item xs={4}>
            {loading ? <LoadingScreen /> :
              <div>
                <input accept="image/*" className={classes.input} id="icon-button-file" type="file" onChange={handleSubmission} />
                <label htmlFor="icon-button-file">
                  <Tooltip title='Upload custom image'>
                    <IconButton color="primary" aria-label="upload picture" component="span">
                      <PhotoCamera />
                    </IconButton>
                  </Tooltip>
                </label>
              </div>
            }
          </Grid>
        </Grid>
        <Grid item >
          <SketchPicker disableAlpha={true} color={color} onChangeComplete={(e) => onDrag(e)} />
        </Grid>
        <Grid item>
          <Button onClick={handleChange} variant='outlined' color='secondary'>Add Config</Button>
        </Grid>
        <Grid container item spacing={2}>
          {chipData.map((data, i) => {
            return (
              <Grid item key={i} >
                <Chip
                  key={data.type}
                  label={data.type + ' ' + (data.shape.includes('image') ? 'Custom Icon' : data.shape)}
                  onDelete={handleDelete(data)}
                  className={classes.chip}
                  style={{ backgroundColor: (data.shape.includes('image') ? '#BAB4BB' : data.color) }}
                />
              </Grid>
            );
          })}
        </Grid>
      </Grid>
      <Grid container direction='column' item xs={10}>
        <Grid item xs={12} >
          {option && <ReactEcharts option={option} onEvents={selectedGraph === 'Organized' ? onEvents : null} style={{ height: '80vh' }} />}
        </Grid >
        <Drawer className={classes.drawer} anchor="right" open={open} onClose={() => setOpen(false)}>
          {sideList()}
        </Drawer>
      </Grid>
    </Grid >;

  function getStepContent(stepIndex) {
    switch (stepIndex) {
    case 0:
      return step1;
    case 1:
      return step2;
    default:
      return 'Unknown stepIndex';
    }
  }

  const handleStep = step => () => {
    setActiveStep(step);
  };

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} nonLinear alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepButton onClick={handleStep(index)} >
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>
      <div>
        <div>
          {getStepContent(activeStep)}
        </div>
      </div>
    </div>
  );
};
