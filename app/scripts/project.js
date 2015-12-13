$(function(){
  var client = new WorkflowClient();
  if(!client.token){
    $("#tokenProblem").modal();
  }
  var output = {
    ProjectDefinitionOutput:{
      "@xmlns":{$:"http://budgeting.example.everteam.com/Types/Business"},
      Id:{
        ExcerciseId:{$:"0"},
        DepartmentId:{$:"0"},
        ProjectId:{$:"0"}
      },
      Requirements:{
        LastYearBudget:{$:"0.0"},
        Budget:{$:"0.0"},
        Priority:{$:"Low"},
        StartExecution:{$:"2001-01-01"},
        EndExecution:{$:"2001-01-01"},
        NewProject:{$:true},
        Description:{$:"Description"},
        Justification:{$:"Justification"}
        }
      }
    }
  $("#startExecution").datetimepicker({
    format:'MM-DD-YYYY'
  });
  $("#endExecution").datetimepicker({
    format:'MM-DD-YYYY'
  });


  var results = client.getTask();

  results.then(function(data){
    var input_data = data['tms:getTaskResponse']['tms:task']['tms:input'].ProjectDefinitionInput;
    $("#ProjectName").text(input_data.Project.ProjectName.$);
    $("#target_budget").text(input_data.Project.TargetBudget.$);
    $("#notes").text(input_data.Project.Notes.$);
    output.ProjectDefinitionOutput.Id = input_data.id; 

    $("#submit").click(function(){
      output.ProjectDefinitionOutput. Requirements.LastYearBudget.$ = $("#lastYearBudget").val();
      output.ProjectDefinitionOutput. Requirements.Budget.$ = $("#budget").val();
      output.ProjectDefinitionOutput. Requirements.Priority.$ = $("#priority").val();
      output.ProjectDefinitionOutput. Requirements.StartExecution.$ = $("#startExecution").val();
      output.ProjectDefinitionOutput. Requirements.EndExecution.$ = $("#endExecution").val();
      output.ProjectDefinitionOutput. Requirements.NewProject.$ = ($("input[name='newProject']:checked").val() == "Yes") + "";
      output.ProjectDefinitionOutput. Requirements.Description.$ = $("#description").val();
      output.ProjectDefinitionOutput. Requirements.Justification.$ = $("#justification").val();
      client.completeTask(output);

    });
  });
});