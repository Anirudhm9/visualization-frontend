import React, { useEffect, useContext, useState } from 'react';
import { Grid, Typography, Dialog, DialogTitle, DialogContent, TextField, MenuItem, makeStyles, Chip, Button, Tooltip } from '@material-ui/core';
import { HeaderElements, notify, LoadingScreen } from 'components';
import { LayoutContext } from 'contexts';
import ReactEcharts from 'echarts-for-react';
import { API } from 'helpers/index';
import { SketchPicker } from 'react-color';
import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';

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
}));

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
  const [store, setStore] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState('Clustered');
  const [type, setType] = useState('Requirement');
  const [shape, setShape] = useState('circle');
  const [color, setColor] = useState('#a5745b');
  const [loading, setLoading] = useState(false);
  const [chipData, setChipData] = React.useState([
  ]);

  useEffect(() => {
    API.getBlocks(setStore);
  }, []);

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
    store.map(item => {
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
  }, [store, chipData]);

  useEffect(() => {
    if (requirements && requirements.length !== 0) {
      setOption(
        {
          tooltip: { show: true, formatter: '{c}' },
          animationDurationUpdate: 750,
          legend: [{ data: requirements.map(function (a) { return a; }) }],
          animationEasingUpdate: 'quinticInOut',
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
    dialog.name = data.data.name;
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

  useEffect(() => {
    setHeaderElements(<HeaderElements>
      <Typography>
        {pageTitle}
      </Typography>
    </HeaderElements>);
  }, [pageTitle, setHeaderElements]);
  const classes = useStyles();
  return (
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
          {dialogData &&
            <Dialog onClose={() => setOpen(false)} aria-labelledby="simple-dialog-title" open={open}>
              <DialogTitle id="simple-dialog-title">{'Name: ' + dialogData.name}</DialogTitle>
              <DialogContent>
                <Typography>
                  Parents:
                </Typography>
                <Typography color='textSecondary'>
                  {dialogData.parents[0] === null ? 'None' : dialogData.parents.map((item) => { return item + ' | '; })}
                </Typography>
                <Typography>
                  Children:
                </Typography>
                <Typography color='textSecondary'>
                  {dialogData.children.length !== 0 ? dialogData.children.map((item) => { return item + ' | '; }) : 'None'}
                </Typography>
              </DialogContent>
            </Dialog>
          }
        </Grid >
      </Grid>
    </Grid >
  );
};
