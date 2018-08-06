const config = require(`./config/config`)

const _ = require(`lodash`)
const express = require(`express`)
const bodyParser = require(`body-parser`)
const {ObjectId} = require(`mongodb`).ObjectId

const {mongoose} = require(`./db/mongoose`)
const {Todo} = require(`./models/todo`)
const {User} = require(`./models/user`)

const app = express()
const port = process.env.PORT

app.use(bodyParser.json())

app.post(`/todos`, (req, res) => {
    const todo = new Todo({
        text: req.body.text
    })
    todo.save()
    .then(doc => {
        res.send(doc)
    })
    .catch(e => {
        res.status(400).send()
    })
})

app.get(`/todos`, (req, res) => {
    Todo.find()
    .then(todos => {
        res.send({todos})
    })
    .catch(e => {
        res.status(400).send()
    })
})

app.get(`/todos/:id`, (req, res) => {
    const id = req.params.id
    if (!ObjectId.isValid(id))
        res.status(404).send()
    else {
        Todo.findById(id)
        .then(todo => {
            if (todo === null)
                res.status(404).send()
            else
                res.send({todo})
        })
        .catch(e => {
            res.status(400).send()
        })
    }
})

app.delete(`/todos/:id`, (req, res) => {
    const id = req.params.id
    if (!ObjectId.isValid(id))
        res.status(404).send()
    else
        Todo.findByIdAndRemove(id)
        .then(todo => {
            if (todo === null)
                res.status(404).send()
            else
                res.send({todo})
        })
        .catch(e => {
            res.status(400).send()
        })
})

app.patch(`/todos/:id`, (req, res) => {
    const id = req.params.id
    const body = _.pick(req.body, [`text`, `completed`])

    if (!ObjectId.isValid(id))
        return res.status(404).send()
    
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime()
    } else {
        body.completed = false
        body.completedAt = null
    }

    Todo.findByIdAndUpdate(id, { $set: body }, {new: true})
    .then(todo => {
        if (todo === null)
            res.status(404).send()
        else
            res.send({todo})
    })
    .catch(e => {
        res.status(400).send()
    })
})

app.listen(port, () => console.log(`Listening on port ${port}`))

module.exports = {app}
