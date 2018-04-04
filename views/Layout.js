import React from 'react'
import { Typography } from 'material-ui'

export default class Layout extends React.Component {
  render () {
    return (
      <div>
        <Typography align='center' variant='headline' > Sample Authorization Server </Typography>
        {this.props.children}
      </div>
    )
  }
}
