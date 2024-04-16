const dotenv = require('dotenv')
const mongoose = require('mongoose')
dotenv.config({ path: './.env.local' })


if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const dbName = process.env.MONGODB_ATLAS_NAME


const url =
  `mongodb+srv://${dbName}:${password}@cluster0.clxf3jp.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const userSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const User = mongoose.model('User', userSchema)



const addUser = (name,number) => {
  const user = new User({
    name: name,
    number: number,
  })
  user.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}

const getUsers = () => {
  User.find({}).then(result => {
    console.log('phonebook')
    result.forEach(user => {
      console.log(user.name,user.number)
    })
    mongoose.connection.close()
  })
}


if (process.argv.length<4) {
  getUsers()
} else {
  const name = process.argv[3]
  const number = process.argv[4]
  addUser(name,number)
}