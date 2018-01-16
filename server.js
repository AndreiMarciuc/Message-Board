var express = require('express');
var app = express();
var path = require('path');
var bp = require('body-parser');
var session = require('express-session');
var port = 8000;
var mongoose = require('mongoose');

app.use(bp.urlencoded());
app.use(express.static(path.join(__dirname, '/views')));
app.use(session({
    secret: "secret key"
}));

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/message_board');
var Schema = mongoose.Schema;

var messageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, {
    timestamps: true
}, {
    usePushEach: true
});
mongoose.model('Message', messageSchema);

var commentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    _message: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
}, {
    timestamps: true
}, {
    usePushEach: true
});
mongoose.model('Comment', commentSchema);

var Message = mongoose.model('Message', messageSchema);
var Comment = mongoose.model('Comment', commentSchema);

app.post('/new_message', function (req, res) {
    var new_message = new Message(req.body);
    new_message.save(function (err) {
        if (err)
            res.json(err);
        else
            res.redirect('/');
    });
});



app.post('/new_comment/:id',function(req,res){
    Message.findOne({_id:req.params.id}, function(err,message){
        if(err)
            res.json(err);
        else{
            var new_comment = new Comment({
                _message: req.params.id,
                name: req.body.name,
                comment: req.body.comment
            });
            console.log(new_comment)
            new_comment.save(function(err){
                if(err)
                    res.json(err);
                else{
                    message.comments.push(new_comment._id);
                    message.save(function(err){
                        if(err)
                            res.json(err);
                        else
                            res.redirect('/');
                    });
                };
            });
        };  
    });
});


app.get('/', function (req, res) {
    Message.find({}).populate('comments').exec(function (err, messages) {
        if (err)
            res.json(err);
        else {
            console.log(messages);
            res.render('index', {
                messages: messages
            });
        }
    });
});



app.listen(port, function () {
    console.log('runing on locallhost 8000');
});