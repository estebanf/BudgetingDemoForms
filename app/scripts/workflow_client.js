'use strict';

var WorkflowClient = function (){
	window.GetQueryString = function(q) {
   return (function(a) {
    if (a == '') return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
     var p = a[i].split('=');
     if (p.length != 2) continue;
     b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '));
    }
    return b;
   })(q.split('&'));
  };

  var query_string = window.location.search;
  
  if(query_string.indexOf('?') == 0){
    query_string = query_string.slice(1);
  };

  var args = window.GetQueryString(query_string);

  var base_url = window.location.protocol + '//' + window.location.host + '/intalio';

  var caller = function(service_url,data_content,success_callback){
    var args = {
      type: 'POST',
      url: service_url,
      data: JSON.stringify(data_content),
      headers: {
        'Content-Type':'application/json/badgerfish'
      },
      success: success_callback
    };
    $.ajax(args); 
  }
  var tms_caller = function (data_content,success_callback) {
    return caller(base_url + '/ode/processes/TaskManagementServices.TaskManagementServicesSOAP/',data_content,success_callback);
  }
 
  var client = {};

  for(var arg in args){
    client[arg] = args[arg];
  }


  client.getTask = function(callback){
    var data = {"tms:getTaskRequest":{
      '@xmlns' : {'tms':'http://www.intalio.com/BPMS/Workflow/TaskManagementServices-20051109/'},
      "tms:taskId":{'$':client.id},
      "tms:participantToken":{'$':client.token}
    }};
    tms_caller(data,callback);
  }
  return client;
  
}