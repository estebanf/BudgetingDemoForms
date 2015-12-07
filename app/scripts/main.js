$(function(){
  var client = new WorkflowClient();
  client.getTask(function(data){
    console.log(data);
  });
});