function Diagnosis(oDG1) {

  this.CodingMethod = null;
  this.Code = null;
  this.Description = null;
  this.DateTime = null;
  this.Type = null;

  var oHl7Support = new HL7V2Support();
  if (oDG1 !== null) {
    this.CodingMethod = oHl7Support.Set(oDG1.Field(2));



    var oCE = { Identifier: "", Text: "", NameOfCodingSystem: "" };
    if (oDG1.Field(3).Component(1).Defined) {
      oCE.Identifier = oHl7Support.Set(oDG1.Field(3).Component(1));
    }
    if (oDG1.Field(3).Component(2).Defined) {
      oCE.Text = oHl7Support.Set(oDG1.Field(3).Component(2));
    }
    if (oDG1.Field(3).Component(3).Defined) {
      oCE.NameOfCodingSystem = oHl7Support.Set(oDG1.Field(3).Component(3));
    }
    this.Code = oCE;

    this.Description = oHl7Support.Set(oDG1.Field(4));

    if (oDG1.Field(5).Defined) {
      try {
        this.DateTime = DateAndTimeFromHL7(oDG1.Field(5).AsString);
      }
      catch (Exec) {
        throw new Error("Diagnosis Date & Time in DG1-5 can not be parsed as a Date time, vaule was: " + oDG1.Field(5).AsString);
      }
    }

    if (oDG1.Field(6).Defined) {
      this.Type = oHl7Support.Set(oDG1.Field(6));
    }
  }

}
