const { error } = require('console')
const express = require('express')
const { request } = require('http')
const app = express()

let persons = [
    { 
      id: "1",
      name: "Arto Hellas", 
      number: "040-123456"
    },
    { 
      id: "2",
      name: "Ada Lovelace", 
      number: "39-44-5323523"
    },
    { 
      id: "3",
      name: "Dan Abramov", 
      number: "12-43-234345"
    },
    { 
      id: "4",
      name: "Mary Poppendieck", 
      number: "39-23-6423122"
    }
]

let ppl = persons.length == 1 ? "person" : "people"

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)
  if(person){
    response.json(person)
  }
  else {
    response.status(404).send({ error: "Id not found."})
  }
})

app.delete('/api/persons/delete/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)
  if(person){
    persons = persons.filter(p => p.id !== person.id)
    response.status(204).end()
  }
  else {
    response.status(404).send({ error: "Id not found."})
  }
})

app.post('/api/persons', (request, response) => {
  const name = request.body.name
  const number = request.body.id

  const dupName = persons.find(person => person.name = name)
  const dupNum = persons.find(person => person.number = number)

  if(dupName){
    response.status(403).send({ error: 'name must be unique'})
  } else if(dupNum) {
    response.status(403).send({ error: 'number must be unique'})
  }

  let id = parseInt(Math.random() * 1000)
  while (id == persons.find(person => person.id === id).id) {
    id = parseInt(Math.random() * 1000)
  }

  response.status(201)
})

app.get('/info', (request, response) => {
    response.send(`<p>Phone book has info for ${persons.length} ${ppl}</p> <p>${Date()}</p>`)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
