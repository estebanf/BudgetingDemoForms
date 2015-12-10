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
  
  $("#btnInitProcess").click(function(){
    var output = {
      "bus:Variables":{
        "@xmlns":{"bus":"http://budgeting.example.everteam.com/Types/Business"},
        "bus:fiscal_year":{$:$("#fiscalYear").val()},
        "bus:target_expenses":{$:$("#targetOperationalExpenses").val()},
        "bus:ExpectedIncrease":{$:($("#expensesSlider").val()/100) + ""},
        "bus:new_investements":{$:$("#initForm input[name='newInvestements']:checked").val()},
        "bus:TargetSubmision":{$:$("#targetSumissionDate").val()},
        "bus:TargetApproval":{$:$("#targetSumissionDate").val()}
      }
    }
    client.initProcess("http://www.intalio.com/Budgeting/Webcontents/index.html","index.html",output);
  });

});