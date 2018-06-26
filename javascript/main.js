/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2016 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

var wpd = wpd || {};

wpd.initApp = function(isWindowed, image_ref, initial_graph_json, parent_ref, read_only) {// This is run when the page loads.

    wpd.isWindowed = isWindowed;
    wpd.image_ref = image_ref == null ? 'start.png' : image_ref;
    wpd.initial_graph_json = initial_graph_json;
    wpd.parent_ref = parent_ref ? parent_ref : document;
    wpd.read_only = read_only;

    //Load CSS if it's not loaded.  If it is, skip to display
    if( !$("link[href='/viewer/WPD/css/styles.css']").length ){
        wpd.css_loaded = [];
        wpd.css_loaded['/viewer/WPD/css/styles.css'] = false;
        wpd.css_loaded['/viewer/WPD/css/widgets.css'] = false;
        wpd.includeCss('/viewer/WPD/css/styles.css');
        wpd.includeCss('/viewer/WPD/css/widgets.css');
    }else{
        wpd.initDisplay();
    }


    //Set up frame API
    window.addEventListener('message', $.proxy(wpd.iframe_api.receiveMessage, wpd.iframe_api));
    window.addEventListener('dataChange', $.proxy(wpd.iframe_api.sendDataChangeUpdate, wpd.iframe_api));

};


wpd.initIfAllCSSLoaded = function(){
    if( wpd.css_loaded['/viewer/WPD/css/styles.css'] && wpd.css_loaded['/viewer/WPD/css/widgets.css'] ){
        wpd.initDisplay();
    }
};


wpd.initDisplay = function(){
    wpd.browserInfo.checkBrowser();
    wpd.layoutManager.initialLayout();

    //Hide toolbar if read only
    if(wpd.read_only){ $(this.findElement('menuButtonsContainer')).hide(); }

    var curtain = this.findElement('loadingCurtain');

    if(curtain) curtain.style.display = 'none';

    if(!wpd.loadRemoteData()) {
        wpd.saveResume.importImageAndJSON(wpd.image_ref, wpd.initial_graph_json);
        //wpd.graphicsWidget.loadImageFromURL(wpd.image_ref);
        //wpd.messagePopup.show(wpd.gettext('unstable-version-warning'), wpd.gettext('unstable-version-warning-text'));
    }
};


wpd.includeCss = function(filename) {
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = filename;
    link.media = 'all';
    link.onload = function(){
        wpd.css_loaded[filename] = true;
        wpd.initIfAllCSSLoaded();
    };
    head.appendChild(link);
};

wpd.loadRemoteData = function() {

    if(typeof wpdremote === "undefined") { 
        return false; 
    }
    if(wpdremote.status != null && wpdremote.status === 'fail') {
        wpd.messagePopup.show('Remote Upload Failed!', 'Remote Upload Failed!');
        return false;
    }
    if(wpdremote.status === 'success' && wpdremote.localUrl != null) {
        wpd.graphicsWidget.loadImageFromURL(wpdremote.localUrl);
        wpd.popup.show('axesList');
        return true;
    }
    return false;
};


wpd.findElement = function(elementId) {
    return (this.parent_ref) ? wpd.parent_ref.find('#' + elementId)[0] : document.getElementById(elementId);
};


wpd.findElementsByClass = function(className) {
    return (this.parent_ref) ? wpd.parent_ref.find('.' + className) : document.getElementsByClassName(className)
};


document.addEventListener("DOMContentLoaded", wpd.initApp, true);

