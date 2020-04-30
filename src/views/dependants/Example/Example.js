import React from 'react';
import Iframe from 'react-iframe';
import LanguageIcon from '@material-ui/icons/Language';
import IconButton from '@material-ui/core/IconButton';
export const Example = () => {
  let content = (
    <div>
      <div>
        <Iframe url="https://anirudhm9.github.io/blockly/demos/interpreter/async-execution.html"
          width="100%"
          height="680"
          id="myId"
          className="myClassname"
          display="initial"
          position="relative" />
      </div>
      <div style={{position:'absolute', right: 15}}>
        <IconButton target='_blank' href='https://anirudhm9.github.io/blockly/demos/interpreter/async-execution.html'><LanguageIcon /></IconButton>
      </div>
    </div>
  );
  return content;
};
