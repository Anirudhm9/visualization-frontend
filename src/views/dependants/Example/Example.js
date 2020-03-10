import React from 'react';
import Iframe from 'react-iframe';
import LanguageIcon from '@material-ui/icons/Language';
import IconButton from '@material-ui/core/IconButton';
export const Example = () => {
  let content = (
    <div>
      <div>
        <Iframe url="http://127.0.0.1:5500/demos/interpreter/async-execution.html"
          width="100%"
          height="680"
          id="myId"
          className="myClassname"
          display="initial"
          position="relative" />
      </div>
      <div style={{position:'absolute', right: 15}}>
        <IconButton target='_blank' href='http://127.0.0.1:5500/demos/interpreter/async-execution.html'><LanguageIcon /></IconButton>
      </div>
    </div>
  );
  return content;
};
