const express = require('express')
const colors = require('colors')
const app = express()

const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/crud-api', {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false
})
    .then(() => console.log(colors.yellow('------ MongoDb connected ------ ')))
    .catch((err) => console.error(err))

const Todo = mongoose.model('Todo', new mongoose.Schema({
    name: { type: String, min: 5 },
    status: { type: String, default: 'active' },
    date: { type: Date, default: Date.now() }
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res, next) => {
    Todo
        .find(req.query).sort('-date')
        .then(todos => {
            res.status(200).json({
                message: 'succes',
                data: todos
            })
        })
})

app.post('/', (req, res, next) => {
    Todo
        .create({ name: req.body.name })
        .then(todo => {
            res.status(201).json({
                message: 'succes',
                data: todo
            })
        })
})

app.put('/:id', (req, res, next) => {
    const { id } = req.params
    Todo.findById(id)
        .then(result => {
            const status = result.status === 'active' ? 'completed' : 'active'
            Todo.findByIdAndUpdate(id, { status: status })
                .then(result => {
                    res.json({ message: 'succes', data: result })
                })
        })
})

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

const PORT = process.env.PORT || 1000
app.listen(PORT, () => console.log(colors.red(`\n------ http://localhost:${PORT} is running ------ `)))