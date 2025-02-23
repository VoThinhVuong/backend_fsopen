const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.static('dist'))
app.use(express.json())
app.use(morgan('tiny'))

morgan.token('content', function (req, res) { return JSON.stringify(res.locals.body)})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

const Person = require('./models/person')
const { console } = require('inspector')



app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    if(result){
      console.log(result)
      return response.json(result)
    }
    else response.status(404).send({error: "no entries in db"})
  })
})

app.get('/api/persons/:id', (request, response,next) => {
  const id = request.params.id
  Person.findById(id)
    .then(result => {
      if(result) {
        response.json(result)
      } else {
        response.status(404).send({error: "id does not exist"})
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/delete/:id', (request, response) => {
  const id = request.params.id
  console.log(id)
  Person.findByIdAndDelete(id)
    .then(result => {
      if(result)
        return response.json(result)
      else
        return response.status(404).send({error: "id does not exist"})
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response,next) => {
  const name = request.body.name
  const number = request.body.number

  //if(name == '' || number == '') return response.status(400).send({error: 'name and number must not be empty'})

  const person = new Person({
    name: name,
    number: number
  })
  
  person.save()
    .then(result =>{
      console.log(`added ${result}`)
      return response.status(201).json(result)
    })
    .catch(error => {
      next(error)
    })
})

app.get('/info', (request, response) => {
  Person.find({}).then(result => {
    if(result){
      //console.log(result)
      let ppl = result.length == 1 ? "person" : "people"
      return response.send(`<p>Phone book has info for ${result.length} ${ppl}</p> <p>${Date()}</p>`)
    }
    else response.status(404).end()
  })
  .catch(error =>{ 
    console.log(error)
    response.status(500).end()
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const newNumber = request.body.number
  console.log(newNumber)

  Person.findByIdAndUpdate(id,{number: newNumber}, { new: true, runValidators: true, context: 'query' })
    .then(result =>{
      if (result) {
        return response.json(result)
      }
      else {
        return response.status(404).send({error: "id does not exist"})
      }
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
