$(function(){
  var callService = function(endpoint,content,callback){
      $.ajax({      
        type: 'POST',
        url: endpoint,
        data: JSON.stringify(content),
        headers: {
          'Content-Type':'application/json/badgerfish'
        },
        error: function(jqxhr,status,errorThrown){
          console.log(errorThrown);
        },
        success: callback
      });    
  }
  var client = new WorkflowClient();
  if(!client.token){
    $("#tokenProblem").modal();
  }  
  var ProjectDepartmentIdentifier = {};

  var results = client.getTask();

  var deparmentTemplate = _.template($("#department-template").html());

  results.then(function(data){
    ProjectDepartmentIdentifier = data['tms:getTaskResponse']['tms:task']['tms:input'];
    var getUpdatedProjectData = function(elem){
      var row = elem.parents("tr");
      update = row.data();
      var new_enabled = (row.find("input[type='checkbox']").is(":checked")) ? "true":"false";
      $("#submit").prop('disabled', true).text("Loading");
      $.ajax({      
        type: 'POST',
        url: '/intalio/ode/processes/Budgeting/Processes/Integrations/ProjectReviewAPI/process/caller',
        data: JSON.stringify({
          'proc:update_projectRequest':{
            '@xmlns':{
              'proc':'http://budgeting.example.everteam.com/Processes/Integrations/ProjectReviewAPI/process',
              'bus':'http://budgeting.example.everteam.com/Types/Business',
              'tec':'http://budgeting.example.everteam.com/Types/Technical'
            },
            'tec:project':{
              'bus:ExcerciseId':{
                $:update.ExcerciseId
              },
              'bus:DepartmentId':{
                $:update.DepartmentId
              },
              'bus:ProjectId':{
                $:update.ProjectId
              }
            },
           'tec:budget':{
                $:update.budget
              },
           'tec:priority':{
                $:update.priority
              },
           'tec:included':{
                $:"true"
              },
           'tec:approved':{
                $: new_enabled + ""
              }
          }
        }),
        headers: {
          'Content-Type':'application/json/badgerfish'
        },
        error: function(jqxhr,status,errorThrown){
          console.log(errorThrown);
        },
        success: function(resp){
          $("#submit").prop('disabled', false).text("Submit")
        }
      });
    }


    var payload = {
      "proc:Recieve_requestRequest":
        {
          "@xmlns":{
            "proc":"http://budgeting.example.everteam.com/Processes/Integrations/GetDepartments/process"
          },
          $:""
        }
      }
    callService('/intalio/ode/processes/Budgeting/Processes/Integrations/GetDepartments/process/Caller',payload, function(response_data,status,jqxhr){
      console.log(response_data);
      _.each(response_data.Recieve_requestResponse["tns:Department"], function(item){
        var projects_payload ={
        'proc:Get_projectsRequest':{
          '@xmlns':{
            'proc':'http://budgeting.example.everteam.com/Processes/Integrations/ProjectReviewAPI/process',
            'bus':'http://budgeting.example.everteam.com/Types/Business'
          },
          'bus:DepartmentId':{
            $:item["tns:DepartmentId"].$
          },
          'bus:ExcerciseId':{
            $:data["tms:getTaskResponse"]["tms:task"]["tms:input"]["ProjectDepartmentIdentifier"]["ExcerciseId"].$
          }}
        }
        callService('/intalio/ode/processes/Budgeting/Processes/Integrations/ProjectReviewAPI/process/caller',projects_payload,function(response){
          response = response.Get_projectsResponse;
          $("#fiscal_year").text(response["Technical:Variables"]["tns:fiscal_year"].$);
          $("#expected_increase").text(response["Technical:Variables"]["tns:ExpectedIncrease"].$);
          $("#new_investements").text(response["Technical:Variables"]["tns:new_investements"].$);
          $("#target_approval_date").text(response["Technical:Variables"]["tns:TargetApproval"].$);
          $("#target_expenses").text(response["Technical:Variables"]["tns:target_expenses"].$);
          $("#target_submission").text(response["Technical:Variables"]["tns:TargetSubmision"].$);

          if(!$.isArray(response["Technical:ReviewProjects"])){
            response["Technical:ReviewProjects"] = [response["Technical:ReviewProjects"]];
          }

          var projects_data = _.map(response["Technical:ReviewProjects"],function(item){
            if(item["Technical:ProjectAttachments"]["Technical:attachment"] && !$.isArray(item["Technical:ProjectAttachments"]["Technical:attachment"])){
              item["Technical:ProjectAttachments"]["Technical:attachment"] =  [item["Technical:ProjectAttachments"]["Technical:attachment"]]
            }
            return {
              projectName : item["Technical:Project"]["tns:ProjectName"].$,
              targetBudget : item["Technical:Project"]["tns:TargetBudget"].$,
              projectNotes : item["Technical:Project"]["tns:Notes"].$,
              requested_budget : item["Technical:Requirements"]["tns:Budget"].$,
              new_project : item["Technical:Requirements"]["tns:NewProject"].$,
              last_year : item["Technical:Requirements"]["tns:LastYearBudget"].$,
              description : item["Technical:Requirements"]["tns:Description"].$,
              justification : item["Technical:Requirements"]["tns:Justification"].$,
              priority : item["Technical:Requirements"]["tns:Priority"].$,
              attachments: _.map(item["Technical:ProjectAttachments"]["Technical:attachment"],function(attach){
                return {
                  url: attach["Technical:payloadUrl"].$,
                  title: attach["Technical:title"].$
                }
              })
            }         
          });
          var deptoItem = $(deparmentTemplate(
            {'data':
              {name:item["tns:DeparmentName"].$, 
              projects:projects_data}
            }));
          deptoItem.find(".projectItem").each(function(index,row){
            var dataUpdate = {
              ExcerciseId:data["tms:getTaskResponse"]["tms:task"]["tms:input"]["ProjectDepartmentIdentifier"]["ExcerciseId"].$,
              DepartmentId:item["tns:DepartmentId"].$,
              ProjectId:response["Technical:ReviewProjects"][index]["Technical:ProjectId"].$,
              budget:response["Technical:ReviewProjects"][index]["Technical:Requirements"]["tns:Budget"].$,
              priority:response["Technical:ReviewProjects"][index]["Technical:Requirements"]["tns:Priority"].$
            } 

            $(row).data(dataUpdate);
          })
          deptoItem.find("input[type='checkbox']").bootstrapSwitch({
            size:'mini',
            onSwitchChange: function(event,state){
              var control = $(this);
              getUpdatedProjectData(control);
              control.parents("tr").toggleClass("success").toggleClass("danger")
            }
          });
          $("#holder").append(deptoItem);
        });
      })

    });

  });
  $("#submit").click(function(){
    client.completeTask(ProjectDepartmentIdentifier);
  });

});