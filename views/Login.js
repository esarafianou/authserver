import React from 'react'
import { Button, Grid, Paper, TextField, Typography } from 'material-ui'
import { withStyles } from 'material-ui/styles'
import axios from 'axios'

const styles = theme => ({
  root: {
    maxWidth: 1250,
    flexGrow: 1,
    marginTop: 20
  },
  paper1: {
    marginLeft: 240,
    padding: 16,
    paddingBottom: 160,
    width: 320
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
    marginTop: 10,
    marginBottom: 20,
    float: 'right',
    clear: 'both',
    justify: 'center'
  },
  notification: {
		position: 'fixed',
    zIndex:101,
    top: 15,
    left: '38%',
    right: '38%',
    background: '#f2f2f2',
    height: 35,
    textAlign:'center',
    lineHeight: 2.5,
    overflow: 'hidden',
    webkitBoxShadow: '0 0 5px #a6a6a6',
    mozBoxShadow: '0 0 5px #a6a6a6',
    boxShadow: '0 0 5px #a6a6a6'
  },
  google: {
    marginBottom: 10,
    float: 'right',
    clear: 'both',
    background: '#d34836',
    color: 'white',
    width: 200
  },
  github: {
    float: 'right',
    clear: 'both',
    background: 'black',
    color: 'white',
    width: 200
  },
})

class Login extends React.Component {
  constructor () {
    super()
    this.state = {
      login: {
        lUsername: '',
        lPassword: ''
      },
      signup: {
        familyName: '',
        givenName: '',
        sUsername: '',
        email: '',
        sPassword: '',
        confirmPassword: ''
      },
      passwordsNotMatch: false
    }
    this.handleLoginInput = this.handleLoginInput.bind(this)
    this.handleSignUpInput = this.handleSignUpInput.bind(this)
    this.showNotification = this.showNotification.bind(this)
    this.handleSignUp = this.handleSignUp.bind(this)
    this.handleLogin = this.handleLogin.bind(this)
  }

  showNotification (message) {
    return (<p className={this.props.classes.notification}> {message} </p>)
  }

  handleLoginInput (event) {
    const login = {...this.state.login}
    login[event.target.id] = event.target.value
    this.setState({
      login: login
    })
  }

  handleSignUpInput (event) {
    const signup = {...this.state.signup}
    signup[event.target.id] = event.target.value
    this.setState({
      signup: signup
    })
  }

  handleGitHubLogin () {
    if (typeof this.props.location.query.next !== 'undefined') {
      sessionStorage.setItem('next', this.props.location.query.next)
    }
    window.location.replace('/api/auth/github')
  }

  handleGoogleLogin () {
    if (typeof this.props.location.query.next !== 'undefined') {
      sessionStorage.setItem('next', this.props.location.query.next)
    }
    window.location.replace('/api/auth/google')
  }

  handleLogin (event) {
    const data = {
      username: this.state.login.lUsername,
      password: this.state.login.lPassword
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
          if (typeof this.props.location.query.next !== 'undefined') {
            this.props.router.push(this.props.location.query.next)
          } else {
            this.setState({loggedIn: true})
          }
        } else {
          console.log('Invalid username or password')
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  handleSignUp (event) {
    if (this.state.signup.sPassword !== this.state.signup.confirmPassword) {
      this.setState({passwordsNotMatch: true})
    } else {
      const data = {
        username: this.state.signup.sUsername,
        familyName: this.state.signup.familyName,
        givenName: this.state.signup.givenName,
        email: this.state.signup.email,
        password: this.state.signup.sPassword,
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
          this.setState({signedUp: true})
        } else {
          console.log(response)
        }
      })
      .catch(error => {
        console.log(error)
      })
    }
  }

  componentDidMount () {
    let next = sessionStorage.getItem('next')
    console.log(next)
    if (next !== null) {
      sessionStorage.removeItem('next')
      this.props.router.push(next)
    }
  }

  render () {
    const {classes} = this.props

    return (
      <div>
        { this.state.passwordsNotMatch ? this.showNotification('Passwords do not match') : null }
        { this.state.signedUp ? this.showNotification('You have successfully signed up') : null }
        { this.state.loggedIn ? this.showNotification('You are now loggedIn') : null }
        <Grid justify='center' spacing={24} container className={classes.root}>
          <Grid item xs={6}>
            <Paper className={classes.paper1}>
              <Typography align='center' variant='headline' > Log in </Typography>
              <form className={classes.container}>
                <TextField
                  id='lUsername'
                  label='Username'
                  value={this.state.login.username}
                  onChange={this.handleLoginInput}
                  margin='normal'
                />
                <TextField
                  id='lPassword'
                  label='Password'
                  type='password'
                  value={this.state.login.password}
                  onChange={this.handleLoginInput}
                  margin='normal'
                />
              </form>
              <Button className={classes.button} type='submit' value='Submit' variant='raised'
                onClick={(event) => { this.handleLogin(event) }}> Login
              </Button>
              <Button className={classes.google} type='submit' value='Submit' variant='raised'
                onClick={(event) => { this.handleGoogleLogin(event) }}> Login with Google
              </Button>
              <Button className={classes.github} type='submit' value='Submit' variant='raised'
                onClick={(event) => { this.handleGitHubLogin(event) }}> Login with Github
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper2}>
              <Typography align='left' variant='subheading' > New member? </Typography>
              <Typography align='center' variant='headline' > Sign up! </Typography>
              <form className={classes.container}>
                <TextField
                  id='familyName'
                  label='Family Name'
                  value={this.state.signup.familyName}
                  onChange={this.handleSignUpInput}
                  margin='normal'
                />
                <TextField
                  id='givenName'
                  label='Given Name'
                  value={this.state.signup.givenName}
                  onChange={this.handleSignUpInput}
                  margin='normal'
                />
                <TextField
                  id='sUsername'
                  label='Username'
                  value={this.state.signup.username}
                  onChange={this.handleSignUpInput}
                  margin='normal'
                />
                <TextField
                  id='email'
                  label='Email'
                  value={this.state.signup.email}
                  onChange={this.handleSignUpInput}
                  margin='normal'
                />
                <TextField
                  id='sPassword'
                  label='Password'
                  type='password'
                  value={this.state.signup.password}
                  onChange={this.handleSignUpInput}
                  margin='normal'
                />
                <TextField
                  id='confirmPassword'
                  label='Confirm Password'
                  type='password'
                  value={this.state.signup.confirmPassword}
                  onChange={this.handleSignUpInput}
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
