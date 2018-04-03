import React from 'react'
import { Button, Grid, Paper, TextField, Typography } from 'material-ui'
import { withStyles } from 'material-ui/styles'
import axios from 'axios'

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 50
  },
  paper: {
    padding: 16,
    paddingBottom: 30,
    width: 300
  },
  container: {
    margin: 'auto',
    width: 230
  },
  buttons: {
    marginTop: 20,
    float: 'right',
    clear: 'none'
  },
  pad: {
    margin: 10
  }
})

class Authorization extends React.Component {
  constructor() {
    super()
    this.state = {transactionID: ''}
  }

  componentDidMount () {
    const params = {
      client_id: this.props.location.query.clientID,
      redirect_uri: this.props.location.query.redirectURI,
      response_type: this.props.location.query.response_type,
      scope: this.props.location.query.scope,
      state: this.props.location.query.state
    } 
    axios.get('/api/oauth/authorization', {
      params: params, 
      validateStatus: function (status) {
        return status === 200 || status === 401 || status === 403
      }
    })
    .then((response) => {
      if (response.status === 200) {
        console.log('authorized')
        this.setState({
          transactionID: response.data.transactionID,
          state: response.data.state,
          username: response.data.user,
          client: response.data.client,
          authorized: response.data.authorized
        })
      } else if (response.status === 401) {
        console.log('not loggedin')
        const next = encodeURIComponent(location.pathname + location.search) 
        this.props.router.push('/?next=' + next)
      } else if (response.status === 403) {
        console.log('client does not exist')
        this.props.router.push('/')
      }
    })
    .catch(error => {
      console.log(error)
    })
  }

  componentDidUpdate() {
    if (this.state.authorized) {
      document.getElementById('authform').submit()
    }
  }

  renderHTML () {
    const {classes} = this.props
    if (this.state.authorized) {
      return(
        <form id='authform' action='/api/decision' method='post'>
          <input type='hidden' name='transaction_id' value={this.state.transactionID} />
          <input type='hidden' name='state' value={this.state.state} />
        </form>
      )
    }
    else {
      return(
        <Grid justify='center' spacing={24} container className={classes.root}>
          <Paper className={classes.paper}>
            <Typography align='center' variant='title' > Hello {this.state.username}, </Typography>
            <Typography align='center' variant='title' > {this.state.client} wants to access your data </Typography>
            <div className={classes.buttons}>
              <form action='/api/decision' method='post' >
                <input type='hidden' name='transaction_id' value={this.state.transactionID} />
                <input type='hidden' name='state' value={this.state.state} />
                <Button type='submit' value='deny' name='cancel' variant='raised' color='secondary' className={classes.pad}> Deny
                </Button>
                <Button type='submit' value='accept' variant='raised' color='primary'> Accept
                </Button>
              </form>
            </div>
          </Paper>
        </Grid>
      )
    }
  }
  render () {
    return (
      <div>
        {this.renderHTML()}
      </div>
    )
  }
}


export default withStyles(styles)(Authorization)
