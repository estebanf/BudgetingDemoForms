'use strict';

var WorkflowClient = function (){
  window.GetQueryString = function(q) {
    return (function(a) {
      console.log(a);
      if (a == '') return {};
      var b = {};
      for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=');
        console.log(p);
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

  var base_url = window.location.protocol + '//' + window.location.host + '/intalio/ode/processes/';

  var caller = function(service_url,data_content){
    var deferred = $.Deferred();
    var args = {
      type: 'POST',
      url: service_url,
      data: JSON.stringify(data_content),
      headers: {
        'Content-Type':'application/json/badgerfish'
      },
      success: function(response_data,status,jqxhr){
        deferred.resolve(response_data);
      },
      error: function(jqxhr,status,errorThrown){
        deferred.reject(errorThrown);
      }

    };
    console.log(args);
    $.ajax(args);
    return deferred.promise();
  }
  var tms_caller = function (data_content) {
    return caller(base_url + 'TaskManagementServices.TaskManagementServicesSOAP/',data_content);
  }
  var complete_task_caller = function(data_content){
    return caller(base_url + 'completeTask',data_content);
  }
  var action_caller = function(caller,content){
    var deferred = $.Deferred();
    caller(content).then(
      function(data){
        window.location.assign('/intalio/workflow/script/empty.jsp');
        deferred.resolve(data);
      },
      function(err){
        deferred.reject(err);
      });

  }
 
  var client = {};

  for(var arg in args){
    client[arg] = args[arg];
  }


  client.getTask = function(){
    var data = {"tms:getTaskRequest":{
      '@xmlns' : {'tms':'http://www.intalio.com/BPMS/Workflow/TaskManagementServices-20051109/'},
      "tms:taskId":{'$':client.id},
      "tms:participantToken":{'$':client.token}
    }};
    return tms_caller(data);
  }
  client.completeTask = function(output){
    var content = {
      completeTaskRequest:{
        '@xmlns':{$:'http://www.intalio.com/bpms/workflow/ib4p_20051115'},
        taskMetaData:{
          taskId:{$:client.id}
        },
        participantToken:{$:client.token},
        user:{$:client.user},
        taskOutput:output
      }
    };
    action_caller(complete_task_caller,content);
  }
  client.initProcess = function(form_url,output){
    var deferred = $.Deferred();
    var content = {
      "initProcessRequest":{
        "@xmlns": {$:'http://www.intalio.com/BPMS/Workflow/TaskManagementServices-20051109/'},
        "taskId":{$:client.id},
        "input":{$:output},
        "participantToken":{$:client.token},
        "formUrl":{$:form_url},
      }
    };
    action_caller(tms_caller,content)
  }
  return client;
  
}