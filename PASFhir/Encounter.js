<% include $repo$\PASFhir\NextOfKin.js %>
<% include $repo$\PASFhir\Diagnosis.js %>
<% include $repo$\PASFhir\AllergyIntolerance.js %>

  function Encounter(oHL7, oFacilityConfig) {

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
    this.DiagnosisList = [];
    this.NextOfKinList = [];
    this.AllergyList = [];


    var oPV1 = oHL7.Segment("PV1", 0)
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

      if (oPV1.Field(3).defined) {
        this.PointOfCare = oHl7Support.Set(oPV1.Field(3).Component(1));
        this.Room = oHl7Support.Set(oPV1.Field(3).Component(2));
        this.Bed = oHl7Support.Set(oPV1.Field(3).Component(3));
        this.Facility = oHl7Support.Set(oPV1.Field(3).Component(4));
        this.LocationDescription = oHl7Support.Set(oPV1.Field(3).Component(9));
      }

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

      var Nk1List = oHL7.SegmentQuery("NK1");
      for (var i = 0; (i < Nk1List.Count); i++) {
        this.NextOfKinList.push(new NextOfKin(Nk1List.Item(i)))
      }

      var DG1List = oHL7.SegmentQuery("DG1");
      for (var i = 0; (i < DG1List.Count); i++) {
        var oDiagnosis = new Diagnosis(DG1List.Item(i));
        this.DiagnosisList.push(oDiagnosis);
      }
      var AL1List = oHL7.SegmentQuery("AL1");
      for (var i = 0; (i < AL1List.Count); i++) {
        var oAllergyIntolerance = new AllergyIntolerance(AL1List.Item(i), oFacilityConfig);
        this.AllergyList.push(oAllergyIntolerance);
      }

    }
  }