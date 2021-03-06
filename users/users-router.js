const bcrypt = require("bcryptjs")
const express = require("express")
const usersModel = require("./users-model")

const router = express.Router()

function restricted() {
  // put message in a variable so we can reuse it
  const authError = {
    message: "Invalid credentials",
  }

  return async (req, res, next) => {
    try {
      const { username, password } = req.headers
      // make sure the values aren't empty
      if (!username || !password) {
        return res.status(401).json(authError)
      }

      const user = await usersModel.findBy({ username }).first()
      // make sure user exists in the database
      if (!user) {
        return res.status(401).json(authError)
      }

      const passwordValid = await bcrypt.compare(password, user.password)
      // make sure password is correct
      if (!passwordValid) {
        return res.status(401).json(authError)
      }

      // if we reach this point, the user is authenticated!
      next()
    } catch (err) {
      next(err)
    }
  }
}

router.get("/", restricted(), async (req, res, next) => {
  try {
    const users = await usersModel.find()
    
    res.json(users)
  } catch (err) {
    next(err)
  }
})

module.exports = router
