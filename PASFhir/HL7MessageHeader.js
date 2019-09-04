function HL7MessageHeader(oMSH) {

  this.MessageType = null;
  this.MessageEvent = null;
  this.MessageControlID = null;
  this.MessageDateTime = null;
  this.SendingFacility = null;
  this.ReceivingFacility = null;
  this.SendingApplication = null;
  this.ReceivingApplication = null;

  if (oMSH.Code !== "MSH") {
    throw "MessageHeader Hl7 Segment oMSH must have the segment code 'MSH'.";
  }
  var oHl7Support = new HL7V2Support();
  this.MessageType = oHl7Support.Set(oMSH.Field(9).Component(1));
  this.MessageEvent = oHl7Support.Set(oMSH.Field(9).Component(2));
  this.MessageControlID = oHl7Support.Set(oMSH.Field(10));

  try {
    this.MessageDateTime = DateAndTimeFromHL7(oMSH.Field(7).AsString);
  }
  catch (Exec) {
    throw "Message Date & Time in MSH-7 can not be parsed as a Date or Date time, vaule was: " + oMSH.Field(7).AsString;
  }

  this.SendingApplication = oHl7Support.Set(oMSH.Field(3));
  this.SendingFacility = oHl7Support.Set(oMSH.Field(4));

  this.ReceivingFacility = oHl7Support.Set(oMSH.Field(6));
  this.ReceivingApplication = oHl7Support.Set(oMSH.Field(5));
}
