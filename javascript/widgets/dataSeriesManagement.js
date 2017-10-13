/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2016 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
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

wpd.dataSeriesManagement = (function () {

    var nameIndex = 1;
    var pointFieldSelect = null;
    var activeDataSeries = null;
    var lockedVars = null;

    function manage() {
        if (lockedVars == null) { lockedVars = ['X Value','Y Value']; }

        if(!wpd.appData.isAligned()) {
            wpd.messagePopup.show(wpd.gettext('manage-datasets'), wpd.gettext('manage-datasets-text'));
        } else {
            var $nameField = document.getElementById('manage-data-series-name'),
                $pointCount = document.getElementById('manage-data-series-point-count'),
                //$datasetList = document.getElementById('manage-data-series-list'),
                plotData = wpd.appData.getPlotData(),
                seriesList = plotData.getDataSeriesNames(),
                activeSeriesIndex = plotData.getActiveDataSeriesIndex(),
                listHtml = '',
                i;

            this.activeDataSeries = plotData.getActiveDataSeries();

            //Populate point fields; pull measurement fields first if blank
            if( wpd.dataSeriesManagement.pointFieldSelect == null ){
                pullMeasurementFields(populatePointFields);
            }else{
                populatePointFields();
            }

            $nameField.value = this.activeDataSeries.name;
            $pointCount.innerHTML = this.activeDataSeries.getCount();
            /*for(i = 0; i < seriesList.length; i++) {
                listHtml += '<option value="'+ i + '">' + seriesList[i] + '</option>';
            }
            $datasetList.innerHTML = listHtml;
            $datasetList.selectedIndex = activeSeriesIndex; */

            // TODO: disable delete button if only one series is present
            wpd.popup.show('manage-data-series-window');
        }
    }

    function addSeries() {
        var plotData = wpd.appData.getPlotData(),
            seriesName = 'Dataset ' + nameIndex,
            index = plotData.dataSeriesColl.length;
        
        close();
        plotData.dataSeriesColl[index] = new wpd.DataSeries();
        plotData.dataSeriesColl[index].name = seriesName;
        plotData.setActiveDataSeriesIndex(index);
        updateApp();
        nameIndex++;
        manage();
    }

    function deleteSeries() {
        // if this is the only dataset, then disallow delete!
        close();

        if(wpd.appData.getPlotData().dataSeriesColl.length === 1) {
            wpd.messagePopup.show(wpd.gettext('can-not-delete-dataset'), wpd.gettext('can-not-delete-dataset-text'), manage);
            return;
        }

        wpd.okCancelPopup.show(wpd.gettext('delete-dataset'), wpd.gettext('delete-dataset-text'), function() {
            // delete the dataset
            var plotData = wpd.appData.getPlotData(),
                index = plotData.getActiveDataSeriesIndex();
            plotData.dataSeriesColl.splice(index,1);
            plotData.setActiveDataSeriesIndex(0);
            manage();
        }, function() {
            // 'cancel'
            manage();
        });
    }

    function viewData() {
        validateAndClose();
        wpd.dataTable.showTable();
    }

    function changeSelectedSeries() {
        var $list = document.getElementById('manage-data-series-list'),
            plotData = wpd.appData.getPlotData();

        close();
        plotData.setActiveDataSeriesIndex($list.selectedIndex);
        updateApp();
        manage();
    }

    function updateApp() {
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.autoExtraction.updateDatasetControl();
        wpd.acquireData.updateDatasetControl();
        wpd.dataPointCounter.setCount();
    }

    function editSeriesName() {
        var activeSeries = wpd.appData.getPlotData().getActiveDataSeries(),
            $name = document.getElementById('manage-data-series-name');
        close();
        activeSeries.name = $name.value;
        updateApp(); // overkill, but not too bad.
        manage();
    }

    function close() {
        wpd.popup.close('manage-data-series-window');
    }

    function pullMeasurementFields(success) {
        $.ajax({
            url         : '/api/measurement_fields',
            type        : 'get',
            contentType : 'application/json; charset=utf-8',
            success     : function(data){
                //Create select template
                var select = '<select onchange="wpd.dataSeriesManagement.updateField(this);"><option value="0">Select..</option>';
                for(var i=0; i < data.length; i++){
                    select += '<option value="' + data[i].id + '">' + data[i].field_name + '</option>';
                }
                select += '</select>';
                wpd.dataSeriesManagement.pointFieldSelect = select;
                success.call();
             }
        });
    }

    function populatePointFields() {
        //If field list is blank, Populate X and Y values
        if( wpd.dataSeriesManagement.activeDataSeries.variableNames.length == 0 ) {
            addPointField();
            addPointField();
        }else{
            redrawPointFields();
        }
    }

    function addPointField(name) {
        wpd.dataSeriesManagement.activeDataSeries.variableNames.push(null);
        wpd.dataSeriesManagement.activeDataSeries.variableIds.push(null);
        if(wpd.dataSeriesManagement.activeDataSeries.getCount() > 0){ alert('You have existing points which don\'t contain your new variable.  For consistent data, clear the existing points.'); }
        redrawPointFields();
    }

    function updatePointField(fieldDom){
        //Get ID from DOM element passed
        id = parseInt(fieldDom.id.substr(fieldDom.id.lastIndexOf("_") + 1));
        wpd.dataSeriesManagement.activeDataSeries.variableNames[id] = $('#point_field_value_' + id).find(':selected').text();
        wpd.dataSeriesManagement.activeDataSeries.variableIds[id] = $('#point_field_value_' + id).find(':selected').val();
    }

    function deleteField(fieldDom) {
        //Get ID from DOM element passed
        id = parseInt(fieldDom.id.substr(fieldDom.id.lastIndexOf("_") + 1));

        //If data points already exist, confirm that user wants to wipe entered data, then do it
        if( this.activeDataSeries.getCount() > 0 ){
            if( confirm('You have data using this variable.  Removing it will erase the variable from that data.  Do you wish to continue?') ){
                var data = wpd.dataSeriesManagement.activeDataSeries.removeExtraVariableFromData(id - lockedVars.length);
                wpd.dataSeriesManagement.activeDataSeries.variableNames.splice(id, 1);
                wpd.dataSeriesManagement.activeDataSeries.variableIds.splice(id, 1);
                redrawPointFields();
            }
        }else{
            //Remove from variable list and redraw screen
            wpd.dataSeriesManagement.activeDataSeries.removeExtraVariableFromData(id - lockedVars.length);
            wpd.dataSeriesManagement.activeDataSeries.variableNames.splice(id, 1);
            wpd.dataSeriesManagement.activeDataSeries.variableIds.splice(id, 1);
            redrawPointFields();
        }
    }

    function redrawPointFields() {
        $('table[name=point_field_table] tbody tr').remove();
        for(var i=0; i < wpd.dataSeriesManagement.activeDataSeries.variableNames.length; i++) {
            if( i < lockedVars.length ){
                label = lockedVars[i] + ':';
                delButton = '';
            }else{
                label = '';
                delButton = '<input type="button" value="X" id="delete_point_field_' + i + '" onClick="wpd.dataSeriesManagement.deleteField(this);">'
            }

            var new_row = '<tr><td align="right">' + label + '</td>' +
                '<td>' + $(wpd.dataSeriesManagement.pointFieldSelect).clone().attr('id', 'point_field_value_' + i).prop('outerHTML') + '</td>' +
                '<td>' + delButton + '</td></tr>';
            $('table[name=point_field_table]').find('tbody').append(new_row);
            $('#point_field_value_' + i).val(wpd.dataSeriesManagement.activeDataSeries.variableIds[i] == null ? 0 : wpd.dataSeriesManagement.activeDataSeries.variableIds[i]);
        }
    }

    function redrawExtraVariables() {
        //Redraw table for user to enter extra variable info
        $("table[name=extra_var_table] tbody tr").remove();
        for(var i=2; i < wpd.dataSeriesManagement.activeDataSeries.variableNames.length; i++) {
            var new_row = '<tr><td align="right">' + wpd.dataSeriesManagement.activeDataSeries.variableNames[i] + '</td>' +
                '<td><input type="text" id="extra_var_' + wpd.dataSeriesManagement.activeDataSeries.variableIds[i] + '"></td></tr>';
            $('table[name=extra_var_table]').find('tbody').append(new_row);
        }
    }

    function validateAndClose() {
        //Check that all defined fields have selected values, and no value is used twice
        var duped = false;
        var unselected = false;
        var selectedVals = [];
        for(var i=0; i < wpd.dataSeriesManagement.activeDataSeries.variableNames.length; i++){
            var val = $('#point_field_value_' + i).find(':selected').val();
            if( val == "0" ){
                unselected = true;
                break;
            }
            if( $.inArray(val, selectedVals) != -1 ){
                duped = true;
                break;
            }
            selectedVals.push(val);
        }

        if( duped ){
            alert('Each data point must be assigned a unique measurement value.  Please assign each data point a unique value.');
        }else if( unselected ){
            alert('All data points must be assigned a measurement value.  Please assign all points a value, or remove unassigned points.');
        }else{
            //Recreate extra data screen and close window
            redrawExtraVariables();
            wpd.popup.close('manage-data-series-window');
        }
    }

    return {
        manage: manage,
        addField: addPointField,
        updateField: updatePointField,
        deleteField: deleteField,
        addSeries: addSeries,
        deleteSeries: deleteSeries,
        viewData: viewData,
        changeSelectedSeries: changeSelectedSeries,
        editSeriesName: editSeriesName.apply,
        validateAndClose: validateAndClose
    };
})();
