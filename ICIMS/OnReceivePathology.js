<% include $newserver$\ICIMS\SetReportAnnotation.js %>

  //Set Annotation
  function OnReceivePathology(aEvent) {
    BreakPoint;
    var oHL7 = aEvent.Message.HL7;
    RemovePDFContent(oHL7);
    SetReportAnnotation(aEvent);


    function RemovePDFContent(oHL7) {
      var OBXList = oHL7.SegmentQuery("OBX");
      for (var i = 0; (i < OBXList.Count); i++) {
        var oOBX = OBXList.Item(i);
        var DataType = "";
        if (oOBX.Field(2).defined) {
          DataType = oOBX.Field(2).AsString;
        }
        var Code = "";
        if (oOBX.Field(3).Component(1).defined) {
          Code = oOBX.Field(3).Component(1).AsString;
        }

        if (DataType.toUpperCase() == "ED" && Code.toUpperCase() == "PDF") {
          oOBX.Field(5).ClearAll();
        }
      }
    }

  }