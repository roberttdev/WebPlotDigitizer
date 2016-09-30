/*
	iframe_api: Helper that translates sending/receiving messages through an iframe into WPD calls
*/

var wpd = wpd || {};

wpd.iframe_api = (function () {

    //Receives JSON as a string, translates it into WPD-executable call
    function receiveMessage(e) {
        var message = JSON.parse(e.data);

        switch(message.name) {
            case 'loadImage': {
                //Load image in viewer
                //src: image path on remote server
                var local_img = '/images/' + message.src.substr(message.src.lastIndexOf('/') + 1, message.src.length - 1);;
                if( !wpd.imageOps.imageExists(local_img)){
                    //If image doesn't exist, transfer over, then load
                    var ajax = new XMLHttpRequest();
                    ajax.addEventListener('load', function(){
                        if(ajax.status == 200){ wpd.graphicsWidget.loadImageFromURL(local_img); }
                    });
                    ajax.open('HEAD', '/php/transfer_image.php?url=' + message.src);
                    ajax.send();
                }else{
                    wpd.graphicsWidget.loadImageFromURL(local_img);
                }
                break;
            }

            default: {
                alert('Error: iFrame API call not recognized');
            }
        }

    }

    //Send JSON message back to parent
    function sendMessage(message) {
        parent.postMessage(message, document.referrer);
    }

    return {
        receiveMessage: receiveMessage,
        sendMessage: sendMessage
    };
})();

