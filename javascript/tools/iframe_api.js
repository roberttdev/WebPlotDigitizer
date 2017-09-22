/*
	iframe_api: Helper that translates sending/receiving messages through an iframe into WPD calls
	Expected message format: {name: string, (all other fields optional, but must match DV API expectations)}
*/

var wpd = wpd || {};

wpd.DataChangeEvent = new Event('dataChange');

wpd.iframe_api = (function () {
    var parentMsgFunction = null;

    //Set callback function in parent app
    function setParentMsgFunction(func){
        this.parentMsgFunction = func;
    }

    //Receives JSON as a string, translates it into WPD-executable call
    function receiveMessage(e) {
        var message = JSON.parse(e);

        switch(message.name) {
            case 'loadImage': {
                //Load image in viewer
                var graph_json = message.graph_json == null ? null : JSON.parse(message.graph_json);
                wpd.saveResume.importImageAndJSON(message.src, graph_json);
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
            this.parentMsgFunction(message, document.referrer);
        }
    }

    function sendDataChangeUpdate() {
        var message = {name: 'dataChange'};
        this.sendMessage(message);
    }

    return {
        setParentMsgFunction: setParentMsgFunction,
        receiveMessage: receiveMessage,
        sendMessage: sendMessage,
        sendDataChangeUpdate: sendDataChangeUpdate
    };
})();

