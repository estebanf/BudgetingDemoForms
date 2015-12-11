$(function(){
  var client = new WorkflowClient();
  if(!client.token){
    $("#tokenProblem").modal();
  }  
  var results = client.getTask();

  results.then(function(data){

    var input_data = data['tms:getTaskResponse']['tms:task']['tms:input'].RequirementDefinitionInput;

    $("#department_name").text(input_data.DepartmentInfo.DeparmentName.$)
    $("#fiscal_year").text(input_data.Variables.FiscalYear.$)
    $("#expected_increase").text(input_data.Variables.ExpectedIncrease.$)
    $("#new_investements").text(input_data.Variables.NewInvestments.$)
    $("#target_approval_date").text(input_data.Variables.TargetApproval.$)
    $("#target_expenses").text(input_data.Variables.TargetExpenses.$)
    $("#target_submission").text(input_data.Variables.TargetSubmission.$)
    $.each(input_data.Team.Member, function(index, item){
      $("#projectResponsible")
        .append($('<option>', {value: item.username.$})
        .text(item.DisplayName.$));
    });
  }, function(error){
    console.log(error);
  });
  var projectTemplate = _.template($("#project-template").html());
  $("#addProject").click(function(){
    var data = {
      projectName : $("#projectName").val(),
      projectResponsibleDisplay : $("#projectResponsible option:selected").text(),
      projectResponsibleValue :$("#projectResponsible option:selected").val(),
      targetBudget : $("#targetBudget").val(),
      projectNotes : $("#projectNotes").val()
    };
    $("#projectName").val('');
    $("#targetBudget").val('');
    $("#projectNotes").val('');
    var projectItem= $(projectTemplate({'data':data}));
    projectItem.data(data);
    $("#projects").append(projectItem);
  });
  $("#submit").click(function(){
    var output = {
      "tns:RequirementDefinisionOutput":{
        "@xmlns" : {'tns':'http://budgeting.example.everteam.com/Types/Business'},
        "tns:Projects": _.map($(".projectItem"),function(item){
          var data= $(item).data();
          return {
            "tns:ProjectName":
              {"$":data.projectName},
            "tns:ProjectResponsible":
              {"$":data.projectResponsibleValue},
            "tns:TargetBudget":
              {"$":data.targetBudget},
            "tns:Notes":
              {"$":data.projectNotes}};
        })
      }
    };
    client.completeTask(output);
  });
}); 