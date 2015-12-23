$(function(){
  var client = new WorkflowClient();
  if(!client.token){
    $("#tokenProblem").modal();
  }  
  var projectTemplate = _.template($("#project-template").html());
  var results = client.getTask();
  var ProjectDepartmentIdentifier = {};

  results.then(function(data){
    ProjectDepartmentIdentifier = data['tms:getTaskResponse']['tms:task']['tms:input'];
    var input_data = ProjectDepartmentIdentifier.ProjectDepartmentIdentifier;
    var departmentId= input_data.DepartmentId.$;
    var exerciseId = input_data.ExcerciseId.$;
    var updateProject = function(projectId,budget,priority,enabled, callback){
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
                $:exerciseId
              },
              'bus:DepartmentId':{
                $:departmentId
              },
              'bus:ProjectId':{
                $:projectId
              }
            },
           'tec:budget':{
                $:budget
              },
           'tec:priority':{
                $:priority
              },
           'tec:included':{
                $:enabled + ""
              },
           'tec:approved':{
                $:"true"
              }
          }
        }),
        headers: {
          'Content-Type':'application/json/badgerfish'
        },
        error: function(jqxhr,status,errorThrown){
          console.log(errorThrown);
        },
        success: callback
      });
    };
    var getUpdatedProjectData = function(elem){
      var row = elem.parents("tr");
      var pid = row.data()["Technical:ProjectId"].$;
      var new_budget = row.find("input[type='text']").val();
      var new_priority = row.find("select").val();
      var new_enabled = (row.find("input[type='checkbox']").is(":checked")) ? "true":"false";
      $("#submit").prop('disabled', true).text("Loading");
      updateProject(pid,new_budget,new_priority,new_enabled,function(response_data,status,jqxhr){
        $("#submit").prop('disabled', false).text("Submit")
      })
    }
    $.ajax({
      type: 'POST',
      url: '/intalio/ode/processes/Budgeting/Processes/Integrations/ProjectReviewAPI/process/caller',
      data: JSON.stringify({
        'proc:Get_projectsRequest':{
          '@xmlns':{
            'proc':'http://budgeting.example.everteam.com/Processes/Integrations/ProjectReviewAPI/process',
            'bus':'http://budgeting.example.everteam.com/Types/Business'
          },
          'bus:DepartmentId':{
            $:departmentId
          },
          'bus:ExcerciseId':{
            $:exerciseId
          }
        }
      }),
      headers: {
        'Content-Type':'application/json/badgerfish'
      },
      success: function(response_data,status,jqxhr){
        response = response_data.Get_projectsResponse;
        $("#department_name").text(response["Technical:Dapartment"]["tns:DeparmentName"].$);;
        $("#fiscal_year").text(response["Technical:Variables"]["tns:fiscal_year"].$);
        $("#expected_increase").text(response["Technical:Variables"]["tns:ExpectedIncrease"].$);
        $("#new_investements").text(response["Technical:Variables"]["tns:new_investements"].$);
        $("#target_approval_date").text(response["Technical:Variables"]["tns:TargetApproval"].$);
        $("#target_expenses").text(response["Technical:Variables"]["tns:target_expenses"].$);
        $("#target_submission").text(response["Technical:Variables"]["tns:TargetSubmision"].$);

        if(!$.isArray(response["Technical:ReviewProjects"])){
          response["Technical:ReviewProjects"] = [response["Technical:ReviewProjects"]];
        }

        $.each(response["Technical:ReviewProjects"],function(index,item){
          if(item["Technical:ProjectAttachments"]["Technical:attachment"] && !$.isArray(item["Technical:ProjectAttachments"]["Technical:attachment"])){
            item["Technical:ProjectAttachments"]["Technical:attachment"] =  [item["Technical:ProjectAttachments"]["Technical:attachment"]]
          }
          var template_data ={
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
          var projectItem= $(projectTemplate({'data':template_data}));
          projectItem.data(item);
          projectItem.find("input[type='checkbox']").bootstrapSwitch({
            size:'mini',
            onSwitchChange: function(event,state){
              var control = $(this);
              getUpdatedProjectData(control);
              control.parents("tr").toggleClass("success").toggleClass("danger")
            }
          });
          projectItem.find("input[type='text']").change(function(e){
              var control = $(this);
              getUpdatedProjectData(control);
          });
          projectItem.find("select").change(function(e){
              var control = $(this);
              getUpdatedProjectData(control);
          });
          $("#projects").append(projectItem);
        });
      },
      error: function(jqxhr,status,errorThrown){
        console.log(errorThrown);
      }
    })

  }, function(error){
    console.log(error);
  });
  $("#submit").click(function(){
    client.completeTask(ProjectDepartmentIdentifier);
  });
}); 