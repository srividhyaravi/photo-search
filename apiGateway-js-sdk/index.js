var apigClient = apigClientFactory.newClient({apiKey: "aABGiAiHfW5sYOpOejBFQCtOnhWJ1iw3oTQrgpi0"});
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition

function textSearch() {
    var searchboxtext = document.getElementById('searchterm');
    if (!searchboxtext.value) {
        alert('Please enter some text or voice input');
    } 
    else {
        searchboxtext = searchboxtext.value.trim().toLowerCase();
        searchPhotos(searchboxtext);
    }
}

function speechRecognize() {    
    var searchboxtext = document.getElementById("searchterm");
    var recognition = new window.SpeechRecognition();
    recognition.onstart = function() {
        searchboxtext.value = "Listening ...";
    };
    recognition.onspeechend = function() {
        recognition.stop();
    }
    recognition.onresult = function(event) {
        var transcript = event.results[0][0].transcript;
        searchboxtext.value = transcript;
        console.log("transcript : ", transcript)
    };
    recognition.start();
}

function searchPhotos(searchboxtext) {
    document.getElementById('upload-message').innerHTML = "";
    document.getElementById('searchterm').value = searchboxtext;
    var params = {'q' : searchboxtext, "x-api-key": "aABGiAiHfW5sYOpOejBFQCtOnhWJ1iw3oTQrgpi0"};
    console.log("Params: ", params);
    apigClient.searchGet(params)
        .then(function(result) {
            var photosresults = document.getElementById("photos-results-list");
            photosresults.innerHTML = "";
            if (result["data"] == "No Results found") {
                photosresults.innerHTML = "No Results Found!"
            }
            else {
                imgpaths = result["data"]["imagePaths"];
                for (let i = 0; i < imgpaths.length; i++) {
                    imglist = imgpaths[i].split('/');
                    imgname = imglist[imglist.length - 1];
                    let result = $("<div></div>").addClass("col-md-3")
                    result.append('<figure><img src="' + imgpaths[i] + '" style="height:200px; width:250px;"><figcaption style="text-align:center;">' + imgname + '</figcaption></figure>')
                    photosresults.innerHTML += result.html()
                }
            }
        }).catch(function(result) {
            console.log(result);
        });
}

function uploadPhoto() {
    var fpath = (document.getElementById('uploadedfile').value).split("\\");
    var fname = fpath[fpath.length - 1];
    var reader = new FileReader();
    var file = document.getElementById('uploadedfile').files[0];

    document.getElementById('uploadedfile').value = "";
    document.getElementById('upload-message').innerHTML = "";

    if ((fpath == "") || (!['png', 'jpg', 'jpeg'].includes(fname.split(".")[1]))) {
        alert("Invalid file type! Please upload a png/jpg/jpeg file!");
    }
    else {
        file.constructor = () => file;
        var params = {'filename': fname, 'bucket': 'b2-bucket-photoalbum', 'x-amz-meta-customLabels': customlabels.value, 'Content-Type': file.type, "x-api-key": "aABGiAiHfW5sYOpOejBFQCtOnhWJ1iw3oTQrgpi0"};
        var additionalparams = {headers: {'x-amz-meta-customLabels': customlabels.value, 'Content-Type': file.type}};
        reader.onload = function (event) {
            return apigClient.uploadBucketFilenamePut(params, file, additionalparams)
            .then(function(result) {
                document.getElementById('upload-message').innerHTML = "File uploaded successfully!";
                document.getElementById('customlabels').value = "";
            })
            .catch(function(error) {
                console.log(error);
            })
        }
        reader.readAsBinaryString(file);
    }
}