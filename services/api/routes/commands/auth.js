import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { login, resetPasswordInDB } from '../repositories/auth'
import { fetchUserByEmail } from '../repositories/users'
import { verifyAdmin } from '../repositories/admins'

export async function authinticateLogin(email, password) {
  if (!email || !password) {
    throw new StatusError({ status: 400, msg: 'Must provide username or password' })
  }
  const user = await fetchUserByEmail(email)
  
  const adminObj = await verifyAdmin(user.userHandle)
  let admin = (adminObj && !!adminObj.userHandle)

  const userCreds = await login(user.userHandle)
  const credsMatch = await bcrypt.compare(password, userCreds.passhash)
  if (credsMatch) {
    const token = jwt.sign({
      'iss': 'debtlyllc',
      'sub': 'user-auth',
      'iat': Math.floor(Date.now() / 1000),
      'exp': Math.floor(Date.now() / 1000) + (60 * 240),
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      suffix: user.suffix,
      userHandle: user.userHandle,
      username: user.username,
      email: user.email,
      joinedDate: user.joinedDate,
      admin
    }, process.env.JWT_SECRET)
    return {
      token,
      user,
      admin
    }
  } else {
    throw new StatusError({ status: 400, msg: 'Email or Password not found'})
  }
}

export async function authinticateLoginByJwt(token) {
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err)
      throw new StatusError({ status: 400, msg: 'JWT login problem' })

    const currentTime = (new Date().getTime()) / 1000
    if (decoded.exp < currentTime) {
      return {}
    }

    return
  })
}

export async function recoverPassword(email) {
  //Check to see if user exists, if not, throw an err
  if (!email) {
    throw new StatusError({ status: 400, msg: 'Must provide email' })
  }

  const user = await fetchUserByEmail(email)

  if(!user) {
    throw new StatusError({ status: 400, msg: 'Unsdkfjasldk'})
  }
  //if the user exists reset pass to dev
  //call repo to reset pass

  bcrypt.hash('dev', 10, function(err, hash) {
    // Store hash in database
    await resetPasswordInDB(user.Handle, hash)
  });



  //Do we need to return data?
  return {}
}