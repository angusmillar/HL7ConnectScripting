
//Set Annotation
function Main(aEvent) {
  BreakPoint;
  var oHL7 = aEvent.Message.HL7;

  //The Annotation type name
  var SendingApplicationAnnotationName = "SendingApp";

  //The Theater message's MSH-3 Code and Value to record as the Annotation
  var TheaterSendingApplicationCode = "SANAPPS";
  var TheaterSendingApplicationAnnotationValue = "Theatre";

  //The CareZone message's MSH-3 Code and Value to record as the Annotation
  var CareZoneSendingApplicationCode = "CareZone";
  var CareZoneSendingApplicationAnnotationValue = "CareZone";

  //The Value to record as the Annotation when no match
  var UnknownSendingApplicationAnnotationValue = "Unknown";

  var SendingApplication = oHL7.Segment("MSH", 0).Field(3).Component(1).AsString.toUpperCase()
  if (SendingApplication == CareZoneSendingApplicationCode.toUpperCase()) {
    aEvent.Message.SetAnnotation(SendingApplicationAnnotationName, CareZoneSendingApplicationAnnotationValue);
  } else if (SendingApplication == TheaterSendingApplicationCode.toUpperCase()) {
    aEvent.Message.SetAnnotation(SendingApplicationAnnotationName, TheaterSendingApplicationAnnotationValue);
  } else {
    aEvent.Message.SetAnnotation(SendingApplicationAnnotationName, UnknownSendingApplicationAnnotationValue);
  }

}