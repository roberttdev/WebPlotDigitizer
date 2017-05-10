/*
	iframe_api: Helper that translates sending/receiving messages through an iframe into WPD calls
	Expected message format: {name: string, (all other fields optional, but must match DV API expectations)}
*/

var wpd = wpd || {};

wpd.DataChangeEvent = new Event('dataChange');

wpd.iframe_api = (function () {

    //Receives JSON as a string, translates it into WPD-executable call
    function receiveMessage(e) {
        var message = JSON.parse(e.data);

        switch(message.name) {
            case 'loadImage': {
                //Load image in viewer
                //src: image path on remote server
                var local_img = '/images/' + message.src.substr(message.src.lastIndexOf('/') + 1, message.src.length - 1);
                if( !wpd.imageOps.imageExists(local_img)){
                    //If image doesn't exist, transfer over, then load
                    var ajax = new XMLHttpRequest();
                    ajax.addEventListener('load', function(){
                        if(ajax.status == 200){
                            wpd.saveResume.importImageAndJSON(local_img, JSON.parse(message.graph_json));
                        }
                    });
                    ajax.open('HEAD', '/php/transfer_image.php?url=' + message.src);
                    ajax.send();
                }else{
                    wpd.saveResume.importImageAndJSON(local_img, JSON.parse(message.graph_json));
                }

                break;
            }

            default: {
                alert('Error: iFrame API call not recognized');
            }
        }

    }

    //Send JSON message back to parent.
    function sendMessage(message) {
        //If WPD is embedded, send message
        if (document.referrer != ''){
            parent.postMessage(message, document.referrer);
        }
    }

    function sendDataChangeUpdate() {
        var message = {name: 'dataChange'};
        this.sendMessage(message);
    }

    return {
        receiveMessage: receiveMessage,
        sendMessage: sendMessage,
        sendDataChangeUpdate: sendDataChangeUpdate
    };
})();

