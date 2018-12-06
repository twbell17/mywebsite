import React from 'react'
import { Redirect } from 'react-router-dom'

import * as recoveryActions from './actions'
import connected from '../../../setup/connect'
import { selector as users } from '../../../entities/users/reducer'

export const recoverProcess = WrappedComponent => {
  class Login extends React.Component {
    handleClick = (email, password) => {
      this.props.recoveryActions.recover(email)
    }

    render() {
      const { recover } = this.props.users
      if (recover)
        return <Redirect to={{ pathname: '/password-reset', state: { from: this.props.location } }} />

      return <WrappedComponent recoverProcess={this.handleClick} {...this.props} />
    }
  }

  return connected([users], [recoveryActions])(Login)
}

export default recoverProcess
