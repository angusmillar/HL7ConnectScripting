function Encounter(oPV1) {

  this.EcounterNumber = null;
  this.ClassCode = null;
  this.PointOfCare = null;
  this.Room = null;
  this.Bed = null;
  this.Facility = null;
  this.LocationDescription = null;
  this.PreadmitNumber = null;
  this.AdmissionDateTime = null;
  this.DischargeDateTime = null;
  this.FinancialClass = null;

  if (oPV1.Code == "PV1") {
    var oHl7Support = new HL7V2Support();
    var oHL7Table = new HL7Table();
    if (oPV1.Field(19).AsString != "") {
      this.EcounterNumber = oHl7Support.Set(oPV1.Field(19));
    } else {
      throw "The encounter number / patient visti number in PV1-19 must not be empty.";
    }

    if (oPV1.Field(2).AsString != "") {
      var ClassCodeSystem = "http://terminology.hl7.org/CodeSystem/v3-ActCode";
      switch (oPV1.Field(2).AsString) {
        case oHL7Table.PatientClass.Emergency:
          this.Class = { Code: "EMER", Display: "emergency", System: ClassCodeSystem };
          break;
        case oHL7Table.PatientClass.Inpatient:
          this.Class = { Code: "IMP", Display: "inpatient encounter", System: ClassCodeSystem };
          break;
        case oHL7Table.PatientClass.Outpatient:
          this.Class = { Code: "SS", Display: "short stay", System: ClassCodeSystem };
        default:
          throw "The Patient Class  found in PV1-2 was not an expected, value is : " + oPV1.Field(2).AsString + ", allowed values are (E,I,O).";
      }
    } else {
      throw "Patient Class in PV1-2 can not be empty."
    }

    this.PointOfCare = oHl7Support.Set(oPV1.Field(3).Component(1));
    this.Room = oHl7Support.Set(oPV1.Field(3).Component(2));
    this.Bed = oHl7Support.Set(oPV1.Field(3).Component(3));
    this.Facility = oHl7Support.Set(oPV1.Field(3).Component(4));
    this.LocationDescription = oHl7Support.Set(oPV1.Field(3).Component(9));
    this.PreadmitNumber = oHl7Support.Set(oPV1.Field(5));
    this.FinancialClass = oHl7Support.Set(oPV1.Field(20).Component(1));

    if (oPV1.Field(44).AsString != "") {
      try {
        this.AdmissionDateTime = DateAndTimeFromHL7(oPV1.Field(44).AsString);
      }
      catch (Exec) {
        throw "Admission Date & Time in PV1-44 can not be parsed as a Date time, vaule was: " + oPV1.Field(44).AsString;
      }
    }

    if (oPV1.Field(45).AsString != "") {
      try {
        this.DischargeDateTime = DateAndTimeFromHL7(oPV1.Field(45).AsString);
      }
      catch (Exec) {
        throw "Discharge Date & Time in PV1-45 can not be parsed as a Date time, vaule was: " + oPV1.Field(45).AsString;
      }
    }
  }
}