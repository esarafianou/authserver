import React from 'react'
import { Button, Grid, Paper, TextField, Typography } from 'material-ui'
import { withStyles } from 'material-ui/styles'
import axios from 'axios'

const styles = theme => ({
  root: {
    marginTop: 50
  },
  paper: {
    padding: 16,
    width: 300
  },
  container: {
    margin: 'auto',
    width: 230
  },
  button: {
    marginTop: 20,
    clear: 'both',
    float: 'right'
  }
})

class Login extends React.Component {
  constructor () {
    super()
    this.state = {
      username: '',
      password: ''
    }
    this.handleUsername = this.handleUsername.bind(this)
    this.handlePassword = this.handlePassword.bind(this)
  }

  handleUsername (event) {
    this.setState({
      username: event.target.value
    })
  }

  handlePassword (event) {
    this.setState({
      password: event.target.value
    })
  }

  handleSubmit (event) {
    const data = {
      username: this.state.username,
      password: this.state.password
    }
    const config = {
      validateStatus: function (status) {
        return status === 200 || status === 401
      }
    }
    axios.post('/login', data, config)
      .then((response) => {
        if (response.status === 200) {
          console.log('logged in')
        } else {
          console.log('Invalid username or password')
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  render () {
    const {classes} = this.props

    return (
      <Grid justify='center' spacing={24} container className={classes.root}>
        <Paper className={classes.paper}>
          <Typography align='center' variant='headline' > Log in </Typography>
          <form onSubmit={this.handleSubmit} className={classes.container}>
            <TextField
              id='username'
              label='Username'
              value={this.state.username}
              onChange={this.handleUsername}
              margin='normal'
            />
            <TextField
              id='password'
              label='Password'
              type='password'
              value={this.state.password}
              onChange={this.handlePassword}
              margin='normal'
            />
          </form>
          <Button className={classes.button} type='submit' value='Submit'
            onClick={(event) => { this.handleSubmit(event) }}> Login
          </Button>
        </Paper>
      </Grid>
    )
  }
}

export default withStyles(styles)(Login)
