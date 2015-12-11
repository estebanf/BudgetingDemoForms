$(function(){
  $("#expensesSlider").slider({
    value:0,
    min:0,
    max:100,
    step:1,
    formatter: function(value) {
      return 'Current value: ' + value + '%';
    }
  });
  $("#expensesSlider").on("slide",function(slideEvt){
    $("#expectedIncreaseOnExpenses").val(slideEvt.value + "%");
  });
  var today = moment();
  $("#targetSumissionDate").datetimepicker({
    minDate: today,
    format:'L'
  });
  $("#targetApprovalDate").datetimepicker({
    format:'L',
    useCurrent: false
  });
  $("#targetSumissionDate").on("dp.change", function (e) {
    $('#targetApprovalDate').data("DateTimePicker").minDate(e.date);
  });
  $("#targetApprovalDate").on("dp.change", function (e) {
    $('#targetSumissionDate').data("DateTimePicker").maxDate(e.date);
  });

  var client = new WorkflowClient();
  console.log(client);
  $("#btnInitProcess").click(function(){
    var output = {
      "Variables":{
        "@xmlns":{$:"http://budgeting.example.everteam.com/Types/Business"},
        "fiscal_year":{$:$("#fiscalYear").val()},
        "target_expenses":{$:$("#targetOperationalExpenses").val()},
        "ExpectedIncrease":{$:($("#expensesSlider").val()/100) + ""},
        "new_investements":{$:$("#initForm input[name='newInvestements']:checked").val()},
        "TargetSubmision":{$:$("#targetSumissionDate").val()},
        "TargetApproval":{$:$("#targetSumissionDate").val()}
      }
    }
    client.initProcess("http://www.intalio.com/Budgeting/Webcontents/index.html","index.html",output);
  });

});