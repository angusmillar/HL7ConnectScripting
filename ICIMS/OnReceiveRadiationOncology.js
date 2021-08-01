
  function Main(aEvent) {
    var oHL7 = aEvent.Message.HL7;
    SetSendingApplication(oHL7);

    function SetSendingApplication(oHL7) {
        oHL7.Segment("MSH", 0).Field(3).Component(1).AsString = "RadiationOncology";
    }
  }