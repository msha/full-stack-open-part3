const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
const User = require('./models/user')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req, res),
  ].join(' ')
})
)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}


let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-1234567"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendick",
    "number": "39-23-6423122"
  }
]

app.get('/', (request, response, next) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response, next) => {
  User.find({}).then(users => {
    response.json(users)
  })
})

app.get('/info', (request, response, next) => {
  User.find({}).then(users => {
    const personsInfo = `Phonebook has info for ${users.length} people <br><br> ${new Date()}`;
    response.json(personsInfo)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  User.findById(id).then(user => {
    if (user) {
      response.json(user)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  User.findByIdAndDelete(id)
    .then(result => {
      persons = persons.filter(person => person.id !== id)
      response.status(204).end()
    })
    .catch(error => next(error))
})

const generateId = () => {
  const id = Math.floor(Math.random()*1_000_000_000)
  return id
}

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'name or number missing' 
    })
  }

  if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const person = new User({
    name: body.name,
    number: body.number,
    id: generateId(),
  })
  person.save().then(saved => {
    response.json(saved)
  })
  .catch(error => 
    next(error)
  )

  //persons = persons.concat(person)

})

app.put('/api/persons/:id', (request, response,next) => {

  const body = request.body
  if (!body.number) {
    return response.status(400).json({ 
      error: 'number is missing' 
    })
  }

  const person = {
    number: body.number,
  }

  User.findByIdAndUpdate(request.params.id, person, { new: true })
  .then(update => {
    response.json(update)
  })
  .catch(error => next(error))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

app.use(errorHandler)