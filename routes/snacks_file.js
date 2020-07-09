var express = require('express');
var router = express.Router();
const FileController   = require('../controllers/FileController');
const apiConfig         =require('../config/apiConfig');
var fs = require('fs');
const { to, ReE, ReS }  = require('../services/util.service');
router.get('/', function(req, res, next) {
    res.render('file_upload', { title: 'Express File Upload Test' });
});

router.get('/:id', function(req, res, next) {
    var id = req.params.id;
    FileController.get_file(id , req, res).then(function(image){
        if (image != null)
        {
            fs.readFile(__dirname + '/../public/uploads/' + image.path, function (err, content) {
                if (err) {
                    res.writeHead(400, {'Content-type': 'text/html'});
                    console.log(err);
                    res.end("No such image");
                } else {
                    //specify the content type in the response will be an image
                    res.writeHead(200, {'Content-type': 'image/jpg'});
                    res.end(content);
                }
            });
        }

    });

});



router.post('/upload', async function(req, res, next) {
    let imageupload;
    let uploadPath;

    if (req.files == undefined || Object.keys(req.files).length == 0) {
        res.status(400).send('No files were uploaded.');
        return;
    }

    console.log('req.files >>>', req.files); // eslint-disable-line

    imageupload = req.files.imageupload;

    var now_data = getDateTime();

    var orignal_fn = imageupload.name;

    uploadPath = __dirname + '/../public/uploads/' + now_data;

    imageupload.mv(uploadPath,async function(err) {
        if (err) {
            return res.status(500).send(err);
        }

        var err1,val;
        [err1 , val ] = await  to (FileController.save_file(now_data , orignal_fn , req, res));

        if (err1)
            return res.status(500).send(err);

        if ( val != undefined)
        {
            var retval = "{\"success\" : true , \"id\" :" + val.id +"}";
            res.status(200);
            res.setHeader('Content-Type','application/json');
            res.send(retval);
        }

    });
});


function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "_" + month + "_" + day + "_" + hour + "_" + min + "_" + sec;

}


module.exports = router;