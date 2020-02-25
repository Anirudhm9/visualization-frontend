import React, { useEffect, useContext, useState } from 'react';
import { Grid, Typography, Dialog, DialogTitle, DialogContent, Switch } from '@material-ui/core';
import { HeaderElements } from 'components';
import { LayoutContext } from 'contexts';
import ReactEcharts from 'echarts-for-react';

const rcmData = [
  {
    child: {
      id: 'action1',
      value: '1',
      type: 'rcm_action',
      color: '#74a55b'
    },
    parent: {
      id: 'req1',
      value: 'Action: 1, Condition: 1',
      type: 'rcm_requirement',
      color: '#a5745b'
    }
  },
  {
    child: {
      id: 'condition1',
      value: '1',
      type: 'rcm_condition',
      color: '#5b8ca5'
    },
    parent: {
      id: 'req1',
      value: 'Action: 1, Condition: 1',
      type: 'rcm_requirement',
      color: '#a5745b'
    }
  },
  {
    child: {
      id: 'req1',
      value: 'Action: 1, Condition: 1',
      type: 'rcm_requirement',
      color: '#a5745b'
    },
    parent: null
  },
  {
    child: {
      id: 'req2',
      value: 'Action: 2, Condition: 1',
      type: 'rcm_requirement',
      color: '#a5745b'
    },
    parent: null
  },
  {
    child: {
      id: 'condition1',
      value: '1',
      type: 'rcm_condition',
      color: '#5b8ca5'
    },
    parent: {
      id: 'req2',
      value: 'Action: 2, Condition: 1',
      type: 'rcm_requirement',
      color: '#a5745b'
    }
  },
  {
    child: {
      id: 'action2',
      value: '2',
      type: 'rcm_action',
      color: '#74a55b'
    },
    parent: {
      id: 'req2',
      value: 'Action: 2, Condition: 1',
      type: 'rcm_requirement',
      color: '#a5745b'
    }
  }
];

export const Rcm = () => {
  const { setHeaderElements, pageTitle } = useContext(LayoutContext);
  const [dataToDisplay, setDataToDisplay] = useState();
  const [linksToDisplay, setLinksToDisplay] = useState();
  const [requirements, setRequirements] = useState();
  const [open, setOpen] = useState(false);
  const [dialogData, setDialogData] = useState();
  const [state, setState] = useState(false);

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
    rcmData.map(item => {
      const temp = {};
      const temp2 = {};
      if (uniqueId.includes(item.child.id)) {
        // Do nothing
      }
      else {
        if (item.child.type === 'rcm_requirement') {
          uniqueId.push(item.child.id);
          temp.name = item.child.id;
          temp.itemStyle = { color: item.child.color };
          temp.value = item.child.value;
          temp.draggable = true;
          temp.symbol = 'circle';
          data.push(temp);
        }
        else if (item.child.type === 'rcm_condition') {
          uniqueId.push(item.child.id);
          temp.name = item.child.id;
          temp.itemStyle = { color: item.child.color };
          temp.value = item.child.value;
          temp.draggable = true;
          temp.symbol = 'diamond';
          data.push(temp);
        }
        else {
          uniqueId.push(item.child.id);
          temp.name = item.child.id;
          temp.itemStyle = { color: item.child.color };
          temp.value = item.child.value;
          temp.draggable = true;
          temp.symbol = 'rect';
          data.push(temp);
        }
      }
      if (item.parent !== null) {
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
  }, []);


  const option = {
    title: {
      text: 'RCM',
      top: 'auto'
    },
    tooltip: { show: true, formatter: '{c}' },
    animationDurationUpdate: 750,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        layout: state ? 'circular' : 'force',
        force: {
          repulsion: 1000,
          initLayout: 'circular',
          edgeLength: 150
        },
        focusNodeAdjacency: true,
        symbolSize: 50,
        roam: true,
        label: {
          show: true,
          formatter: '{b}'
        },
        edgeSymbol: ['circle', 'none'],
        edgeSymbolSize: [4, 10],
        edgeLabel: {
          fontSize: 20
        },
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
  };

  const handleData = (data) => {
    const dialog = {};
    const parents = [];
    const childeren = [];
    linksToDisplay.map(item => {
      if (item.source !== null) {
        if (item.target === data.data.name) {
          childeren.push(item.source);
        }
        if (item.source === data.data.name) {
          parents.push(item.target);
        }
      }
      return parents;
    });
    dialog.name = data.data.name;
    dialog.parents = parents;
    dialog.childeren = childeren;
    setDialogData(dialog);
    setOpen(true);
  };
  let onEvents = {
    'click': (e) => { handleData(e); },
    // 'legendselectchanged': this.onChartLegendselectchanged
  };

  const handleChange = (data) => {
    setState(data);
  };
  useEffect(() => {
    setHeaderElements(<HeaderElements>
      <Typography>
        {pageTitle}
      </Typography>
    </HeaderElements>);
  }, [pageTitle, setHeaderElements]);
  return (
    <Grid container component='div' style={{ marginTop: 10 }}>
      <Grid item xs={12} >
        <Switch
          checked={state.checkedA}
          onChange={() => handleChange(!state)}
          value={state}
          inputProps={{ 'aria-label': 'secondary checkbox' }}
        />
        <ReactEcharts option={option} onEvents={onEvents} style={{ height: '80vh' }} />

        {dialogData &&
          <Dialog onClose={() => setOpen(false)} aria-labelledby="simple-dialog-title" open={open}>
            <DialogTitle id="simple-dialog-title">{'Name: ' + dialogData.name}</DialogTitle>
            <DialogContent>
              <Typography>
                Parents:
              </Typography>
              <Typography color='textSecondary'>
                {dialogData.parents.length !== 0 && dialogData.parents !== null ? dialogData.parents.map((item) => { return item + ' '; }) : 'No parents'}
              </Typography>
              <Typography>
                Childeren:
              </Typography>
              <Typography color='textSecondary'>
                {dialogData.childeren.length !== 0 ? dialogData.childeren.map((item) => { return item + '  '; }) : 'No childeren'}
              </Typography>
            </DialogContent>
          </Dialog>
        }
      </Grid >
    </Grid >
  );
};
