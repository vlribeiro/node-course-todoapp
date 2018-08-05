const expect = require(`expect`)
const request = require(`supertest`)
const {ObjectId} = require(`mongodb`)

const {app} = require(`./../server`)
const {Todo} = require(`./../models/todo`)

const todosSeed = [{
    _id: new ObjectId(),
    text: `First test todo`
}, {
    _id: new ObjectId(),
    text: `Second test todo`
}]

beforeEach(done => {
    Todo.remove({})
    .then(() => {
        return Todo.insertMany(todosSeed)
        .then(() => done())
    })
})

describe(`POST /todos`, () => {
    it(`should create a new todo`, done => {
        const text = `Test todo text`

        request(app)
        .post(`/todos`)
        .send({text})
        .expect(200)
        .expect(res => {
            expect(res.body.text).toBe(text)
        })
        .end((err, res) => {
            if (err)
                return done(err)
            
            Todo.find({text})
            .then(todos => {
                expect(todos.length).toBe(1)
                expect(todos[0].text).toBe(text)
                done()
            })
            .catch(e => done(e))
        })
    })

    it (`should not create todo with invalid body data`, (done) => {
        request(app)
        .post(`/todos`)
        .send({})
        .expect(400)
        .end((err, res) => {
            if (err)
                return done(err)
            
            Todo.find()
            .then(todos => {
                expect(todos.length).toBe(todosSeed.length)
                done()
            })
            .catch(e => done(e))
        })
    })
})

describe(`GET /todos`, () => {
    it (`should get all todos`, done => {
        request(app)
        .get(`/todos`)
        .expect(200)
        .expect(res => {
            expect(res.body.todos.length).toBe(todosSeed.length)
        })
        .end(done)
    })
})

describe(`GET /todos/:id`, () => {
    it (`should return todo doc`, done => {
        request(app)
        .get(`/todos/${todosSeed[0]._id.toHexString()}`)
        .expect(200)
        .expect(res => {
            expect(res.body.todo.text).toBe(todosSeed[0].text)
            expect(res.body.todo._id).toBe(todosSeed[0]._id.toHexString())
        })
        .end(done)
    })

    it (`should return 404 if todo not found`, done => {
        request(app)
        .get(`/todos/${new ObjectId().toHexString()}`)
        .expect(404)
        .end(done)
    })

    it (`should return 404 for non-object ids`, done => {
        request(app)
        .get(`/todos/1`)
        .expect(404)
        .end(done)
    })
})

describe(`DELTE /todos/:id`, () => {
    it (`should remove a todo`, done => {
        request(app)
        .delete(`/todos/${todosSeed[0]._id.toHexString()}`)
        .expect(200)
        .expect(res => {
            expect(res.body.todo.text).toBe(todosSeed[0].text)
            expect(res.body.todo._id).toBe(todosSeed[0]._id.toHexString())
        })
        .end((err, res) => {
            if (err)
                return done(err)
            
            Todo.findById(todosSeed[0]._id)
            .then(res => {
                expect(res).toBeNull()
                done()
            })
            .catch(e => {
                done(e)
            })
        })
    })

    it (`should return 404 if todo not found`, done => {
        request(app)
        .delete(`/todos/${new ObjectId().toHexString()}`)
        .expect(404)
        .end(done)
    })

    it (`should return for non-object ids`, done => {
        request(app)
        .delete(`/todos/1`)
        .expect(404)
        .end(done)
    })
})
