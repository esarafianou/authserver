import React from 'react'
import { Button, Grid, Paper, TextField, Typography } from 'material-ui'
import { withStyles } from 'material-ui/styles'
import axios from 'axios'

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 50
  },
  paper1: {
    marginLeft: 240,
    padding: 16,
    paddingBottom: 70,
    width: 300
  },
  paper2: {
    marginRight: 20,
    padding: 16,
    paddingBottom: 70,
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
  },
  none: {
    float: 'none'
  }
})

class Login extends React.Component {
  constructor () {
    super()
    this.state = {
      login: {
        username: '',
        password: ''
      },
      signup: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      passwordsNotMatch: false
    }
    this.handleLUsername = this.handleLUsername.bind(this)
    this.handleSUsername = this.handleSUsername.bind(this)
    this.handleEmail = this.handleEmail.bind(this)
    this.handleLPassword = this.handleLPassword.bind(this)
    this.handleSPassword = this.handleSPassword.bind(this)
    this.handleConfirmPassword = this.handleConfirmPassword.bind(this)
    this.showPasswordsNotMatch = this.showPasswordsNotMatch.bind(this)
    this.handleSignUp = this.handleSignUp.bind(this)
    this.handleLogin = this.handleLogin.bind(this)
  }

  showPasswordsNotMatch () {
    return (
      <p className='notification'> Passwords do not match </p>
    )
  }

  handleLUsername (event) {
    const login = {...this.state.login}
    login.username = event.target.value
    this.setState({
      login: login
    })
  }

  handleLPassword (event) {
    const login = {...this.state.login}
    login.password = event.target.value
    this.setState({
      login: login
    })
  }

  handleSUsername (event) {
    const signup = {...this.state.signup}
    signup.username = event.target.value
    this.setState({
      signup: signup
    })
  }

  handleEmail (event) {
    const signup = {...this.state.signup}
    signup.email = event.target.value
    this.setState({
      signup: signup
    })
  }

  handleSPassword (event) {
    const signup = {...this.state.signup}
    signup.password = event.target.value
    this.setState({
      signup: signup
    })
  }

  handleConfirmPassword (event) {
    const signup = {...this.state.signup}
    signup.confirmPassword = event.target.value
    this.setState({
      signup: signup
    })
  }

  handleLogin (event) {
    const data = {
      username: this.state.login.username,
      password: this.state.login.password
    }
    const config = {
      validateStatus: function (status) {
        return status === 200 || status === 401
      }
    }
    axios.post('/api/login', data, config)
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

  handleSignUp (event) {
    const data = {
      username: this.state.signup.username,
      email: this.state.signup.email,
      password: this.state.signup.password,
      confirmPassword: this.state.signup.confirmPassword
    }
    const config = {
      validateStatus: function (status) {
        return status === 200 || status === 401
      }
    }
    axios.post('/api/signup', data, config)
      .then((response) => {
        if (response.status === 200) {
          console.log('Signup successful')
        } else {
          console.log(response)
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  render () {
    const {classes} = this.props

    return (
      <div>
        { this.state.passwordsNotMatch ? this.showPasswordsNotMatch() : null }
        <Grid justify='center' spacing={24} container className={classes.root}>
          <Grid item xs={6}>
            <Paper className={classes.paper1}>
              <Typography align='center' variant='headline' > Log in </Typography>
              <form onSubmit={this.handleLogin} className={classes.container}>
                <TextField
                  id='l_username'
                  label='Username'
                  value={this.state.username}
                  onChange={this.handleLUsername}
                  margin='normal'
                />
                <TextField
                  id='l_password'
                  label='Password'
                  type='password'
                  value={this.state.password}
                  onChange={this.handleLPassword}
                  margin='normal'
                />
              </form>
              <Button className={classes.button} type='submit' value='Submit' variant='raised'
                onClick={(event) => { this.handleLogin(event) }}> Login
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper2}>
              <Typography align='left' variant='subheading' > New member? </Typography>
              <Typography align='center' variant='headline' > Sign up! </Typography>
              <form onSubmit={this.handleLogin} className={classes.container}>
                <TextField
                  id='r_username'
                  label='Username'
                  value={this.state.username}
                  onChange={this.handleSUsername}
                  margin='normal'
                />
                <TextField
                  id='email'
                  label='Email'
                  value={this.state.email}
                  onChange={this.handleEmail}
                  margin='normal'
                />
                <TextField
                  id='r_password'
                  label='Password'
                  type='password'
                  value={this.state.password}
                  onChange={this.handleSPassword}
                  margin='normal'
                />
                <TextField
                  id='confirmPassword'
                  label='Confirm Password'
                  type='password'
                  value={this.state.confirmPassword}
                  onChange={this.handleConfirmPassword}
                  margin='normal'
                />
              </form>
              <Button className={classes.button} type='submit' value='Submit' variant='raised'
                color='primary' onClick={(event) => { this.handleSignUp(event) }}> SignUp
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(Login)
